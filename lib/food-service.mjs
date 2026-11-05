import { createHash, createHmac } from 'node:crypto';
import { fail, publicSettings, validateSettings, validateOrderInput, checkSchedule, priceLine, foodId, validateTransition, bangkokParts, validateMenu } from './food-domain.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
// Thai domestic numbers or +66 only; normalization is not ownership/SMS verification.
const normalizePhone=value=>{
  const compact=value.replace(/[ ()-]/g,'');
  if (/^0[1-9]\d{7,8}$/.test(compact)) return `+66${compact.slice(1)}`;
  if (/^\+66[1-9]\d{7,8}$/.test(compact)) return compact;
  fail('Invalid Thai phone');
};
const canonical=value=>JSON.stringify(value); // Input validation reconstructs a stable key order.
export function publicOrder(o) {
  return {id:String(o.id),status:o.status,pending_expires_at:o.pending_expires_at??null,cancellation_reason:o.cancellation_reason??null,payment_status:o.payment_status,method:o.method,scheduled_at:new Date(o.scheduled_at).toISOString(),subtotal:o.subtotal_satang/100,delivery_fee:o.delivery_satang/100,total:o.total_satang/100,items:o.items.map(i=>({menu_id:String(i.menu_id),name:i.name,quantity:i.quantity,unit_price:i.unit_satang/100,options:i.options}))};
}
const staffOrder=(order,actor)=>({...publicOrder(order),notes:order.notes,...(actor.role==='kitchen'?{}:{customer_name:order.customer_name,phone:order.phone,address:order.address,zone_id:order.zone_id})});
const staff = (actor,roles=['owner','manager']) => {if (!actor||!roles.includes(actor.role)) fail('Forbidden','FORBIDDEN',403);};
export function createFoodService(store,{clock=()=>new Date(),trackingSecret=process.env.FOOD_TRACKING_SECRET}={}) {
  const settingsView=value=>{const settings=publicSettings(value,clock());return {...settings,accepting_now:settings.accepting_now&&typeof trackingSecret==='string'&&trackingSecret.length>=32};};
  // Cleanup commits separately so an ensuing rate/capacity/transition error cannot undo expiry.
  const cleanup=()=>store.withTransaction(async tx=>tx.expirePending(await tx.utcNow()));
  return {
    async createOrder(value) {
      const input=validateOrderInput(value);
      input.phone=normalizePhone(input.phone);
      if (typeof trackingSecret!=='string'||trackingSecret.length<32) fail('Ordering is not configured','CLOSED',409);
      const client_request_hash=hash(input.client_request_id),request_hash=hash(canonical(input));
      // PRF over a client-generated random nonce: retry works without storing the bearer plaintext.
      const tracking_token=createHmac('sha256',trackingSecret).update(`food-tracking-v1:${input.client_request_id}`).digest('hex');
      await cleanup();
      return store.withTransaction(async tx=>{
        const previous=await tx.getOrderByRequestHash(client_request_hash);
        if (previous) {
          if (previous.request_hash!==request_hash) fail('Idempotency key reused with different request','IDEMPOTENCY_CONFLICT',409);
          if (previous.tracking_hash!==hash(tracking_token)) fail('Order exists but tracking configuration changed; contact restaurant','CLOSED',409);
          return {order:publicOrder(previous),tracking_token,replayed:true};
        }
        const now=await tx.utcNow();
        const since=new Date(new Date(now).getTime()-15*60000).toISOString();
        if(await tx.recentPhoneRequests(input.phone,since)>=3) fail('Too many recent requests; try again later','RATE_LIMITED',429);
        const pending_expires_at=new Date(new Date(now).getTime()+20*60000).toISOString();
        const settings=await tx.getSettings(),schedule=checkSchedule(settings,input,clock());
        const items=[];
        for (const line of input.lines) {
          const menu=await tx.getMenu(line.menu_id);
          if (!menu) fail('Menu unavailable','UNAVAILABLE',409);
          items.push(priceLine(menu,line));
        }
        // A guest submits a request, not a physical reservation.
        const quantity=items.reduce((n,l)=>n+l.quantity,0);
        const subtotal_satang=items.reduce((n,l)=>n+l.total_satang,0);
        const {client_request_id,...customer}=input;
        delete customer.lines;
        const order=await tx.insertOrder({...customer,...schedule,pending_expires_at,reservation_held:false,client_request_hash,request_hash,tracking_hash:hash(tracking_token),subtotal_satang,total_satang:subtotal_satang+schedule.delivery_satang,quantity,items});
        return {order:publicOrder(order),tracking_token,replayed:false};
      });
    },
    async trackOrder(token) {
      if (typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)) fail('Order not found','NOT_FOUND',404);
      await cleanup();
      const order=await store.getOrderByTokenHash(hash(token));
      if (!order) fail('Order not found','NOT_FOUND',404);
      return publicOrder(order);
    },
    async listOrders(date,actor) {
      staff(actor,['owner','manager','kitchen']);
      date=date??bangkokParts(clock()).date;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(`${date}T00:00:00Z`))||new Date(`${date}T00:00:00Z`).toISOString().slice(0,10)!==date) fail('Invalid date');
      await cleanup();
      const orders=await store.listOrders(date);
      return {orders:orders.slice(0,500).map(o=>staffOrder(o,actor)),truncated:orders.length>500};
    },
    async updateOrder(id,patch,actor) {
      staff(actor,['owner','manager','kitchen']); id=foodId(id);
      await cleanup();
      const result=await store.withTransaction(async tx=>{
        const order=await tx.getOrder(id);
        if (!order) fail('Order not found','NOT_FOUND',404);
        // Recheck after acquiring the mutex: expiry may cross while waiting for it.
        if(order.status==='pending'&&new Date(order.pending_expires_at)<=new Date(await tx.utcNow())) {
          await tx.updateOrder(id,{status:'cancelled',cancellation_reason:'expired'});
          return {expired:true};
        }
        if(order.cancellation_reason==='expired'&&patch?.status==='accepted')return {expired:true};
        const next=validateTransition(order,patch,actor.role);
        const updates={status:next.status,payment_status:next.payment_status,last_actor_id:foodId(actor.id)};
        if (next.payment_status==='paid'&&order.payment_status!=='paid') {updates.payment_confirmed_by=foodId(actor.id);updates.payment_confirmed_at=clock().toISOString();}
        if (order.status==='pending'&&next.status==='accepted') {
          const settings=await tx.getSettings();
          if (await tx.quantityForDate(order.service_date)+order.quantity>settings.daily_capacity) fail('Restaurant daily capacity reached','CAPACITY',409);
          const counts=new Map();
          for (const item of order.items) counts.set(item.menu_id,(counts.get(item.menu_id)||0)+item.quantity);
          for (const [menuId,count] of counts) {
            const menu=await tx.getMenu(menuId);
            // A changed fulfilment source needs a fresh request; release must follow its snapshot.
            if (!menu||menu.deleted||!menu.available||order.items.some(i=>i.menu_id===menuId&&i.source_type!==menu.source_type)) fail('Menu unavailable','UNAVAILABLE',409);
            if (menu.daily_limit!==null&&await tx.quantityForMenuDate(menuId,order.service_date)+count>menu.daily_limit) fail('Menu daily limit reached','CAPACITY',409);
            if (menu.source_type==='resale'&&!await tx.reserveStock(menuId,count)) fail('Insufficient resale stock','CAPACITY',409);
          }
          updates.reservation_held=true;
        }
        if (next.release&&order.reservation_held&&!order.reservation_released) {await tx.releaseStock(order);updates.reservation_released=true;updates.reservation_held=false;}
        await tx.updateOrder(id,updates);
        return staffOrder(await tx.getOrder(id),actor);
      });
      if(result.expired)fail('Pending request expired; submit a new request','EXPIRED',409);
      return result;
    },
    async listMenu(includeInactive=false,actor) {if(includeInactive)staff(actor);return store.listMenus(includeInactive);},
    async saveMenu(value,id,actor) {
      staff(actor); const menu=validateMenu(value); if(id!==null)id=foodId(id);
      return store.withTransaction(async tx=>{
        if(id) {
          const previous=await tx.getMenu(id);
          if(!previous||previous.deleted)fail('Menu not found','NOT_FOUND',404);
          if(menu.stock!==previous.stock && value.expected_stock!==previous.stock)fail('Stock changed; reload menu before adjusting','CAPACITY',409);
        }
        if(menu.image_url&&!await tx.imageExists(menu.image_url.slice('/api/images/'.length)))fail('Invalid image_url: image not found');
        return tx.saveMenu(menu,id);
      });
    },
    async deleteMenu(id,actor) {
      staff(actor);id=foodId(id);
      return store.withTransaction(async tx=>{if(!await tx.getMenu(id))fail('Menu not found','NOT_FOUND',404);await tx.deleteMenu(id);return {ok:true};});
    },
    async getSettings(){return settingsView(await store.getSettings());},
    async putSettings(value,actor){staff(actor);const settings=validateSettings(value);return store.withTransaction(async tx=>{await tx.setSettings(settings);return settingsView(settings);});},
  };
}
