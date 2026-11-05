import test from 'node:test';
import assert from 'node:assert/strict';
const serviceModule=await import('../lib/food-service.mjs').catch(()=>({}));
const closed={timezone:'Asia/Bangkok',weekdays:[1,2,3,4,5],order_accepting:false,pickup_enabled:true,delivery_enabled:true,hours:{},pickup_address:'',delivery_zones:[],prep_minutes:0,daily_capacity:0};
const open={...closed,order_accepting:true,hours:Object.fromEntries([1,2,3,4,5].map(d=>[d,{open:'09:00',close:'17:00'}])),pickup_address:'ร้าน',delivery_zones:[{id:'local',name:'พื้นที่บริการ',fee:20,enabled:true}],prep_minutes:30,daily_capacity:5};
const menu={id:'1',name:'อาหาร',description:'',category:'อาหาร',price:60.10,image_url:null,source_type:'resale',available:true,stock:5,daily_limit:null,allergens:'',allergens_confirmed:false,options:[],deleted:false};
const request={customer_name:'ผู้รับ',phone:'0812345678',method:'pickup',scheduled_at:'2026-11-05T12:00:00+07:00',lines:[{menu_id:'1',quantity:2,options:[]}],client_request_id:'0123456789abcdef0123456789abcdef'};
// Transactional in-memory store tests business logic; real SQL is verified separately.
function memoryStore(initialSettings=closed) {
 let state={now:'2026-11-05T03:00:00.000Z',settings:structuredClone(initialSettings),menus:[structuredClone(menu)],orders:[]},tail=Promise.resolve();
 const store={
  get state(){return state;},
  async getSettings(){return structuredClone(state.settings);},
  async setSettings(s){state.settings=structuredClone(s);},
  async listMenus(inactive){return structuredClone(state.menus.filter(m=>inactive||!m.deleted));},
  async getMenu(id){return structuredClone(state.menus.find(m=>m.id===id)??null);},
  async imageExists(id){return id==='42';},
  async saveMenu(m,id){if(id){const i=state.menus.findIndex(m=>m.id===id);state.menus[i]={...m,id,deleted:false};return structuredClone(state.menus[i]);}const saved={...m,id:String(state.menus.length+1),deleted:false};state.menus.push(saved);return structuredClone(saved);},
  async deleteMenu(id){state.menus.find(m=>m.id===id).deleted=true;},
  async getOrderByRequestHash(hash){return structuredClone(state.orders.find(o=>o.client_request_hash===hash)??null);},
  async getOrderByTokenHash(hash){return structuredClone(state.orders.find(o=>o.tracking_hash===hash)??null);},
  async getOrder(id){return structuredClone(state.orders.find(o=>o.id===id)??null);},
  async quantityForDate(date){return state.orders.filter(o=>o.service_date===date&&o.reservation_held&&!o.reservation_released).reduce((n,o)=>n+o.quantity,0);},
  async quantityForMenuDate(id,date){return state.orders.filter(o=>o.service_date===date&&o.reservation_held&&!o.reservation_released).flatMap(o=>o.items).filter(i=>i.menu_id===id).reduce((n,i)=>n+i.quantity,0);},
  async reserveStock(id,qty){const m=state.menus.find(m=>m.id===id); if (m.stock<qty) return false; m.stock-=qty; return true;},
  async utcNow(){return state.now;},
  async expirePending(now){for(const o of state.orders)if(o.status==='pending'&&o.pending_expires_at<=now){o.status='cancelled';o.cancellation_reason='expired';}},
  async recentPhoneRequests(phone,since){return state.orders.filter(o=>o.phone===phone&&o.created_at>=since).length;},
  async insertOrder(o){const order={...structuredClone(o),created_at:state.now,id:String(state.orders.length+1),status:'pending',payment_status:'unpaid',reservation_released:false}; state.orders.push(order); return order;},
  async releaseStock(o){for(const l of o.items) if(l.source_type==='resale') state.menus.find(m=>m.id===l.menu_id).stock+=l.quantity;},
  async updateOrder(id,p){Object.assign(state.orders.find(o=>o.id===id),p);},
  async listOrders(date){return state.orders.filter(o=>o.service_date===date).map(o=>structuredClone(o));},
  async withTransaction(fn){let unlock;const prior=tail;tail=new Promise(r=>{unlock=r;});await prior;const before=structuredClone(state);try{return await fn(store);}catch(e){state=before;throw e;}finally{unlock();}},
 };
 return store;
}
const make=(store,secret='s'.repeat(64))=>serviceModule.createFoodService(store,{clock:()=>new Date('2026-11-05T03:00:00Z'),trackingSecret:secret});
test('pending requests never reserve under concurrent idempotent retries and tracking contains no PII',async()=>{
 const store=memoryStore(open), service=make(store);
 assert.equal(typeof service.createOrder,'function');
 const [first,second]=await Promise.all([service.createOrder(request),service.createOrder(request)]);
 assert.equal(first.order.id,second.order.id);
 assert.equal(first.tracking_token,second.tracking_token);
 assert.match(first.tracking_token,/^[a-f0-9]{64}$/);
 assert.equal([first,second].filter(o=>o.replayed).length,1);
 assert.equal(store.state.menus[0].stock,5);
 assert.equal(store.state.orders[0].reservation_held,false);
 assert.equal(store.state.orders.length,1);
 assert.equal(first.order.total,120.2);
 assert.equal(first.order.payment_status,'unpaid');
 assert.equal('phone' in first.order,false);
 assert.notEqual(store.state.orders[0].tracking_hash,first.tracking_token);
 assert.equal(JSON.stringify(store.state.orders).includes(request.client_request_id),false);
 const track=await service.trackOrder(first.tracking_token);
 assert.deepEqual(track,first.order);
 for (const k of ['phone','address','notes','customer_name','tracking_hash','client_request_hash']) assert.equal(k in track,false);
 await assert.rejects(service.trackOrder('1'),e=>e.status===404);
 await assert.rejects(service.trackOrder('a'.repeat(64)),e=>e.status===404);
 await assert.rejects(service.createOrder({...request,notes:'changed'}),e=>e.code==='IDEMPOTENCY_CONFLICT');
 await assert.rejects(make(store,'rotated-secret-'.repeat(4)).createOrder(request),e=>e.code==='CLOSED');
 // Retry after closure still returns original success, no fresh reservation.
 store.state.settings.order_accepting=false;
 assert.equal((await service.createOrder(request)).replayed,true);
});
const owner={id:'3',role:'owner'};
const accept=(service,order)=>service.updateOrder(order.order.id,{status:'accepted'},owner);
test('staff acceptance atomically checks daily capacity and never oversells concurrent requests',async()=>{
 const store=memoryStore(open),service=make(store);store.state.settings.daily_capacity=3;
 const pending=await Promise.all([service.createOrder(request),service.createOrder({...request,client_request_id:'f'.repeat(32)})]);
 assert.equal(store.state.menus[0].stock,5);
 const results=await Promise.allSettled(pending.map(o=>accept(service,o)));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(results.find(r=>r.status==='rejected').reason.code,'CAPACITY');
 assert.equal(store.state.menus[0].stock,3);
 assert.equal(await store.quantityForDate('2026-11-05'),2);
 const accepted=store.state.orders.find(o=>o.status==='accepted');
 await service.updateOrder(accepted.id,{status:'accepted'},owner);
 assert.equal(store.state.menus[0].stock,3);
});
for(const source_type of ['made_to_order','resale'])test(`${source_type} daily limit aggregates duplicate lines at acceptance`,async()=>{
 const store=memoryStore(open),service=make(store);store.state.menus[0].source_type=source_type;store.state.menus[0].daily_limit=3;
 const pending=await service.createOrder({...request,lines:[...request.lines,...request.lines]});
 await assert.rejects(accept(service,pending),e=>e.code==='CAPACITY');
 assert.equal(store.state.orders[0].status,'pending');assert.equal(store.state.menus[0].stock,5);
 const valid=await service.createOrder({...request,client_request_id:'f'.repeat(32)});await accept(service,valid);
 await assert.rejects(accept(service,pending),e=>e.code==='CAPACITY');
});
test('acceptance rolls back earlier stock writes after later insufficient stock and preserves snapshots',async()=>{
 const store=memoryStore(open),service=make(store);store.state.settings.daily_capacity=100;store.state.menus.push({...menu,id:'2',stock:0});
 const pending=await service.createOrder({...request,lines:[...request.lines,{menu_id:'2',quantity:1,options:[]}]});
 await assert.rejects(accept(service,pending),e=>e.code==='CAPACITY');
 assert.equal(store.state.menus[0].stock,5);assert.equal(store.state.orders[0].reservation_held,false);
 store.state.menus[1].stock=1;store.state.menus[0].price=99;store.state.menus[0].name='Changed';
 const accepted=await accept(service,pending);assert.equal(accepted.items[0].unit_price,60.1);assert.equal(accepted.items[0].name,'อาหาร');
 await Promise.all(Array.from({length:4},()=>service.updateOrder(pending.order.id,{status:'cancelled'},owner)));
 assert.equal(store.state.menus[0].stock,5);assert.equal(store.state.menus[1].stock,1);
 assert.equal(await store.quantityForDate('2026-11-05'),0);
 const missing=memoryStore(open);
 await assert.rejects(make(missing).createOrder({...request,lines:[...request.lines,{menu_id:'2',quantity:1,options:[]}]}),e=>e.code==='UNAVAILABLE');
 assert.equal(missing.state.menus[0].stock,5);
 await assert.rejects(make(memoryStore(open),'').createOrder(request),e=>e.code==='CLOSED');
});
test('persistent normalized phone admission allows only three new requests per rolling fifteen minutes',async()=>{
 const store=memoryStore(open),service=make(store);
 const phones=['081-234-5678','+66 81 234 5678','(081) 234 5678','0812345678'];
 const results=await Promise.allSettled(phones.map((phone,i)=>service.createOrder({...request,phone,client_request_id:String(i).repeat(32)})));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,3);
 const error=results.find(r=>r.status==='rejected').reason;assert.equal(error.code,'RATE_LIMITED');assert.equal(error.status,429);assert.equal(error.message.includes('081'),false);
 assert.equal(store.state.orders.every(o=>o.phone==='+66812345678'),true);
 const first=results[0].value;await service.updateOrder(first.order.id,{status:'rejected'},owner);
 // New service instance and terminal status cannot reset persistent admission.
 await assert.rejects(make(store).createOrder({...request,client_request_id:'e'.repeat(32)}),e=>e.status===429);
 assert.equal((await service.createOrder({...request,phone:phones[0],client_request_id:'0'.repeat(32)})).replayed,true);
 store.state.now='2026-11-05T03:15:00.001Z';await make(store).createOrder({...request,client_request_id:'e'.repeat(32)});
 assert.equal(store.state.menus[0].stock,5);
});
for(const phone of ['1234567','1234567890','+1 2025550123','+660812345678','++66812345678','081234567890'])test(`reject invalid Thai phone ${phone}`,async()=>{
 await assert.rejects(make(memoryStore(open)).createOrder({...request,phone}),e=>e.status===400);
});
for(const trigger of ['list','create','accept'])test(`pending expires exactly twenty minutes by server UTC during ${trigger}`,async()=>{
 const store=memoryStore(open),service=make(store),pending=await service.createOrder(request);
 assert.equal(pending.order.pending_expires_at,'2026-11-05T03:20:00.000Z');
 store.state.now='2026-11-05T03:20:00.000Z';
 if(trigger==='list')await service.listOrders('2026-11-05',owner);
 if(trigger==='create')await service.createOrder({...request,client_request_id:'f'.repeat(32)});
 if(trigger==='accept')await assert.rejects(accept(service,pending),e=>e.status===409&&e.code==='EXPIRED');
 assert.equal(store.state.orders[0].status,'cancelled');assert.equal(store.state.orders[0].cancellation_reason,'expired');
 assert.equal(store.state.menus[0].stock,5);
 const replay=await service.createOrder(request);assert.equal(replay.replayed,true);assert.equal(replay.order.status,'cancelled');assert.equal(replay.order.cancellation_reason,'expired');
 await assert.rejects(accept(service,pending),e=>e.code==='EXPIRED');
});
test('acceptance rejects unavailable, removed or changed fulfilment sources without touching stock',async()=>{
 for(const change of [{available:false},{deleted:true},{source_type:'made_to_order'}]) {
  const store=memoryStore(open),service=make(store),pending=await service.createOrder(request);
  Object.assign(store.state.menus[0],change);
  await assert.rejects(accept(service,pending),e=>e.code==='UNAVAILABLE'&&e.status===409);
  assert.equal(store.state.orders[0].status,'pending');assert.equal(store.state.orders[0].reservation_held,false);assert.equal(store.state.menus[0].stock,5);
 }
});
test('stock alone limits concurrent acceptances and duplicate acceptance reserves once',async()=>{
 const store=memoryStore(open),service=make(store);store.state.settings.daily_capacity=100;store.state.menus[0].stock=3;
 const pending=await Promise.all([service.createOrder(request),service.createOrder({...request,client_request_id:'f'.repeat(32)})]);
 const outcomes=await Promise.allSettled(pending.map(o=>accept(service,o)));
 assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);assert.equal(outcomes.find(r=>r.status==='rejected').reason.code,'CAPACITY');
 const accepted=outcomes.find(r=>r.status==='fulfilled').value;
 await Promise.all(Array.from({length:4},()=>service.updateOrder(accepted.id,{status:'accepted'},owner)));
 assert.equal(store.state.menus[0].stock,1);
});
test('expiry crossing between cleanup and locked acceptance commits cancellation before returning 409',async()=>{
 const store=memoryStore(open),service=make(store),pending=await service.createOrder(request);
 const original=store.getOrder;
 store.getOrder=async id=>{store.state.now='2026-11-05T03:20:00.000Z';return original(id);};
 await assert.rejects(accept(service,pending),e=>e.code==='EXPIRED');
 assert.equal(store.state.orders[0].status,'cancelled');assert.equal(store.state.orders[0].cancellation_reason,'expired');assert.equal(store.state.menus[0].stock,5);
});
test('accepted requests do not expire and cancellation returns reservation once',async()=>{
 const store=memoryStore(open),service=make(store),pending=await service.createOrder(request);await accept(service,pending);
 store.state.now='2026-11-05T04:00:00.000Z';await service.listOrders('2026-11-05',owner);
 assert.equal(store.state.orders[0].status,'accepted');assert.equal(store.state.menus[0].stock,3);
 await service.updateOrder(pending.order.id,{status:'cancelled'},owner);await service.updateOrder(pending.order.id,{status:'cancelled'},owner);
 assert.equal(store.state.menus[0].stock,5);
});
test('kitchen lifecycle releases reservations exactly once and restricts customer details and payment',async()=>{
 const store=memoryStore(open),service=make(store),kitchen={id:'2',role:'kitchen'},owner={id:'3',role:'owner'};
 assert.equal(typeof service.updateOrder,'function');
 const made=await service.createOrder({...request,notes:'ไม่เผ็ด'});
 await assert.rejects(service.updateOrder(made.order.id,{payment_status:'paid'},kitchen),e=>e.status===403);
 const admin=await service.listOrders('2026-11-05',owner),cook=await service.listOrders('2026-11-05',kitchen);
 assert.equal(admin.orders[0].phone,'+66812345678');
 assert.equal(cook.orders[0].notes,'ไม่เผ็ด');
 assert.equal('phone' in cook.orders[0],false);
 await assert.rejects(service.listOrders('2026-11-05',{role:'customer'}),e=>e.status===403);
 await service.updateOrder(made.order.id,{status:'rejected'},kitchen);
 await service.updateOrder(made.order.id,{status:'rejected'},kitchen);
 assert.equal(store.state.menus[0].stock,5);
 assert.equal(await store.quantityForDate('2026-11-05'),0);
 await assert.rejects(service.updateOrder(made.order.id,{status:'accepted'},owner),e=>e.code==='INVALID_TRANSITION');
 const next=await service.createOrder({...request,client_request_id:'f'.repeat(32)});
 for(const status of ['accepted','preparing','ready','completed']) await service.updateOrder(next.order.id,{status},kitchen);
 const paid=await service.updateOrder(next.order.id,{payment_status:'paid'},owner);
 assert.equal(paid.payment_status,'paid');
 assert.equal(store.state.orders[1].payment_confirmed_by,'3');
 assert.equal(store.state.menus[0].stock,3);
 await assert.rejects(service.updateOrder(next.order.id,{status:'cancelled'},owner),e=>e.code==='INVALID_TRANSITION');
});
test('menu management requires owner or manager, local image existence, optimistic stock and soft delete',async()=>{
 const store=memoryStore(open),service=make(store),owner={id:'3',role:'owner'};
 assert.equal(typeof service.saveMenu,'function');
 await assert.rejects(service.saveMenu(menu,null,{role:'kitchen'}),e=>e.status===403);
 await assert.rejects(service.saveMenu({...menu,image_url:'/api/images/99'},null,owner),/image/);
 const item=await service.saveMenu({...menu,image_url:'/api/images/42'},null,owner);
 assert.equal(item.id,'2');
 await accept(service,await service.createOrder(request));
 await assert.rejects(service.saveMenu(menu,'1',owner),e=>e.code==='CAPACITY');
 await service.saveMenu({...menu,expected_stock:3},'1',owner);
 assert.equal(store.state.menus[0].stock,5);
 await service.deleteMenu('1',owner);
 assert.equal((await service.listMenu(false)).length,1);
 await assert.rejects(service.listMenu(true,{role:'kitchen'}),e=>e.status===403);
 assert.equal((await service.listMenu(true,owner)).length,2);
 await assert.rejects(service.createOrder({...request,client_request_id:'f'.repeat(32)}),e=>e.code==='UNAVAILABLE');
});
test('food delivery fee is server-derived, disabled zones and option choices fail without reservations',async()=>{
 const store=memoryStore(open),service=make(store);
 const delivered=await service.createOrder({...request,method:'delivery',zone_id:'local',address:'ที่อยู่ผู้รับ'});
 assert.equal(delivered.order.delivery_fee,20);assert.equal(delivered.order.total,140.2);
 store.state.settings.delivery_zones[0].enabled=false;
 await assert.rejects(service.createOrder({...request,method:'delivery',zone_id:'local',address:'ที่อยู่ผู้รับ',client_request_id:'f'.repeat(32)}),/zone/);
 assert.equal(store.state.menus[0].stock,5);
 const optionStore=memoryStore(open);optionStore.state.menus[0].options=[{id:'egg',name:'ไข่',min:0,max:1,choices:[{id:'yes',name:'ไข่ดาว',available:false,price_adjustment:10}]}];
 await assert.rejects(make(optionStore).createOrder({...request,lines:[{menu_id:'1',quantity:2,options:[{group_id:'egg',choice_ids:['yes']}]}]}),/options/);
 assert.equal(optionStore.state.menus[0].stock,5);
});
test('partial weekday settings persist while closed and incomplete hours cannot enable ordering',async()=>{
 const store=memoryStore(),service=make(store),owner={id:'3',role:'owner'};
 const partial={...closed,hours:Object.fromEntries([1,2,3,4,5].map(d=>[d,{open:'',close:'18:00'}])),prep_minutes:20,pickup_address:'บ้าน ทุ่งประดู่'};
 const saved=await service.putSettings(partial,owner);
 assert.deepEqual(store.state.settings,partial);
 assert.deepEqual((await service.getSettings()).hours,partial.hours);
 assert.equal(saved.configured,false);assert.equal(saved.accepting_now,false);
 await assert.rejects(service.createOrder(request),e=>e.code==='CLOSED');
 // Count alone is insufficient, even if every other prerequisite is configured.
 await assert.rejects(service.putSettings({...open,hours:partial.hours},owner),/hours/);
 assert.deepEqual(store.state.settings,partial);
 assert.equal(store.state.orders.length,0);assert.equal(store.state.menus[0].stock,5);
});
test('missing delivery fees never become free delivery and failed enabling preserves settings',async()=>{
 const store=memoryStore(),service=make(store),owner={id:'3',role:'owner'};
 for(const fee of ['',null,undefined,' ',false,-1]){
  const candidate={...open,delivery_zones:[{id:'local',name:'พื้นที่',fee,enabled:true}]};
  await assert.rejects(service.putSettings(candidate,owner),/fee/);
  assert.deepEqual(store.state.settings,closed);
 }
 await assert.rejects(service.putSettings({...open,delivery_zones:[]},owner),/delivery_zones/);
 assert.deepEqual(store.state.settings,closed);
 await assert.rejects(service.createOrder(request),e=>e.code==='CLOSED');
 assert.equal(store.state.orders.length,0);
 // Explicit zero is a deliberate owner fee, not an inferred missing fee.
 assert.equal((await service.putSettings({...open,delivery_zones:[{...open.delivery_zones[0],fee:0}]},owner)).configured,true);
});
test('food service settings begin closed and owner validation controls opening',async()=>{
 assert.equal(typeof serviceModule.createFoodService,'function');
 const store=memoryStore(); const service=make(store);
 assert.equal((await service.getSettings()).configured,false);
 await assert.rejects(service.putSettings(open,{id:'3',role:'kitchen'}),e=>e.status===403);
 assert.equal((await service.putSettings(open,{id:'3',role:'owner'})).configured,true);
 assert.equal((await service.getSettings()).accepting_now,true);
 assert.equal((await make(memoryStore(open),'').getSettings()).accepting_now,false);
 await assert.rejects(service.putSettings({...open,hours:{}},{id:'3',role:'manager'}),e=>e.status===400);
});
