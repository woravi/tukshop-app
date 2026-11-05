import { toSatang } from './food-domain.mjs';
const menuSelect='SELECT m.*,c.name AS category FROM food_menu_items m JOIN food_categories c ON c.id=m.category_id';
const orderSelect="SELECT o.*,DATE_FORMAT(o.scheduled_at,'%Y-%m-%dT%H:%i:%s.%fZ') AS scheduled_utc,DATE_FORMAT(o.pending_expires_at,'%Y-%m-%dT%H:%i:%s.%fZ') AS pending_expiry_utc,DATE_FORMAT(o.service_date,'%Y-%m-%d') AS service_day FROM food_orders o";
const utcSql=value=>new Date(value).toISOString().slice(0,23).replace('T',' ');
const json=value=>typeof value==='string'?JSON.parse(value):value;
// Every writer takes this shared InnoDB mutex first. Serializing requests is intentional:
// it protects date-based aggregate capacities, idempotency and settings edits from phantoms.
export function createFoodStore(pool,connection=null) {
  const db=connection??pool;
  const rows=async(sql,args=[])=>{const [rows]=await db.execute(sql,args);return rows;};
  const menuFromRow=async row=>{
    const options=await rows('SELECT definition FROM food_menu_options WHERE menu_id=? ORDER BY position,id',[row.id]);
    return {id:String(row.id),name:row.name,description:row.description,category:row.category,image_url:row.image_id?`/api/images/${row.image_id}`:null,price:Number(row.price_satang)/100,source_type:row.source_type,available:Boolean(row.available),daily_limit:row.daily_limit===null?null:Number(row.daily_limit),stock:Number(row.stock),allergens:row.allergens,allergens_confirmed:Boolean(row.allergens_confirmed),deleted:Boolean(row.deleted),options:options.map(o=>json(o.definition))};
  };
  const orderFromRow=async row=>{
    const items=await rows('SELECT menu_id,name,quantity,unit_satang,source_type,options_json FROM food_order_items WHERE order_id=? ORDER BY id',[row.id]);
    return {...row,id:String(row.id),scheduled_at:new Date(row.scheduled_utc??row.scheduled_at).toISOString(),service_date:row.service_day??row.service_date,subtotal_satang:Number(row.subtotal_satang),delivery_satang:Number(row.delivery_satang),total_satang:Number(row.total_satang),quantity:Number(row.quantity),reservation_held:Boolean(row.reservation_held),pending_expires_at:row.pending_expiry_utc?new Date(row.pending_expiry_utc).toISOString():null,reservation_released:Boolean(row.reservation_released),items:items.map(i=>({menu_id:String(i.menu_id),name:i.name,quantity:Number(i.quantity),unit_satang:Number(i.unit_satang),source_type:i.source_type,options:json(i.options_json)}))};
  };
  const findOrder=async(field,value)=>{
    const result=await rows(`${orderSelect} WHERE o.${field}=?${connection?' FOR UPDATE':''}`,[value]);
    return result.length?orderFromRow(result[0]):null;
  };
  const store={
    async getOrder(id){return findOrder('id',id);},
    async getOrderByRequestHash(hash){return findOrder('client_request_hash',hash);},
    async getOrderByTokenHash(hash){return findOrder('tracking_hash',hash);},
    async listOrders(date){const result=await rows(`${orderSelect} WHERE o.service_date=? ORDER BY o.scheduled_at,o.id LIMIT 501`,[date]);return Promise.all(result.map(orderFromRow));},
    async quantityForDate(date){const [result]=await rows('SELECT COALESCE(SUM(quantity),0) AS quantity FROM food_orders WHERE service_date=? AND reservation_held=1 AND reservation_released=0',[date]);return Number(result.quantity);},
    async quantityForMenuDate(id,date){const [result]=await rows('SELECT COALESCE(SUM(i.quantity),0) AS quantity FROM food_order_items i JOIN food_orders o ON o.id=i.order_id WHERE i.menu_id=? AND o.service_date=? AND o.reservation_held=1 AND o.reservation_released=0',[id,date]);return Number(result.quantity);},
    async reserveStock(id,quantity){const result=await rows('UPDATE food_menu_items SET stock=stock-? WHERE id=? AND deleted=0 AND available=1 AND source_type=\'resale\' AND stock>=?',[quantity,id,quantity]);return result.affectedRows===1;},
    async releaseStock(order){for(const item of order.items)if(item.source_type==='resale')await rows('UPDATE food_menu_items SET stock=stock+? WHERE id=?',[item.quantity,item.menu_id]);},
    async utcNow(){const [result]=await rows("SELECT DATE_FORMAT(UTC_TIMESTAMP(3),'%Y-%m-%dT%H:%i:%s.%fZ') AS now");return new Date(result.now).toISOString();},
    async recentPhoneRequests(phone,since){const [result]=await rows('SELECT COUNT(*) AS count FROM food_orders WHERE phone=? AND created_at>=FROM_UNIXTIME(?)',[phone,new Date(since).getTime()/1000]);return Number(result.count);},
    async expirePending(now){await rows("UPDATE food_orders SET status='cancelled',cancellation_reason='expired' WHERE status='pending' AND pending_expires_at<=? AND reservation_held=0",[utcSql(now)]);},
    async insertOrder(order) {
      const fields=['client_request_hash','request_hash','tracking_hash','customer_name','phone','method','scheduled_at','service_date','address','zone_id','notes','subtotal_satang','delivery_satang','total_satang','quantity','reservation_held','pending_expires_at'];
      const values=fields.map(f=>['scheduled_at','pending_expires_at'].includes(f)?(order[f]?utcSql(order[f]):null):(order[f]??(f==='reservation_held'?false:null)));
      const result=await rows(`INSERT INTO food_orders (${fields.join(',')}) VALUES (${fields.map(()=>'?').join(',')})`,values);
      const id=String(result.insertId);
      for(const item of order.items)await rows('INSERT INTO food_order_items (order_id,menu_id,name,quantity,unit_satang,source_type,options_json) VALUES (?,?,?,?,?,?,?)',[id,item.menu_id,item.name,item.quantity,item.unit_satang,item.source_type,JSON.stringify(item.options)]);
      return store.getOrder(id);
    },
    async updateOrder(id,patch) {
      const allowed=new Set(['status','payment_status','last_actor_id','payment_confirmed_by','payment_confirmed_at','reservation_released','reservation_held','cancellation_reason']);
      const keys=Object.keys(patch);
      if(!keys.length||keys.some(k=>!allowed.has(k)))throw Error('Invalid food order update');
      await rows(`UPDATE food_orders SET ${keys.map(k=>`${k}=?`).join(',')} WHERE id=?`,[...keys.map(k=>k==='payment_confirmed_at'?utcSql(patch[k]):patch[k]),id]);
    },
    async listMenus(includeInactive=false){const result=await rows(`${menuSelect}${includeInactive?'':' WHERE m.deleted=0'} ORDER BY c.name,m.id`);return Promise.all(result.map(menuFromRow));},
    async getMenu(id){const result=await rows(`${menuSelect} WHERE m.id=?${connection?' FOR UPDATE':''}`,[id]);return result.length?menuFromRow(result[0]):null;},
    async imageExists(id){return (await rows('SELECT id FROM product_images WHERE id=?',[id])).length>0;},
    async saveMenu(menu,id) {
      await rows('INSERT INTO food_categories (name) VALUES (?) ON DUPLICATE KEY UPDATE name=VALUES(name)',[menu.category]);
      const [category]=await rows('SELECT id FROM food_categories WHERE name=?',[menu.category]);
      const fields=['category_id','name','description','image_id','price_satang','source_type','available','daily_limit','stock','allergens','allergens_confirmed'];
      const args=[category.id,menu.name,menu.description,menu.image_url?menu.image_url.slice('/api/images/'.length):null,toSatang(menu.price),menu.source_type,menu.available,menu.daily_limit,menu.stock,menu.allergens,menu.allergens_confirmed];
      if(id)await rows(`UPDATE food_menu_items SET ${fields.map(f=>`${f}=?`).join(',')} WHERE id=?`,[...args,id]);
      else {const result=await rows(`INSERT INTO food_menu_items (${fields.join(',')}) VALUES (${fields.map(()=>'?').join(',')})`,args);id=String(result.insertId);}
      await rows('DELETE FROM food_menu_options WHERE menu_id=?',[id]);
      for(const [position,group] of menu.options.entries())await rows('INSERT INTO food_menu_options (menu_id,group_key,definition,position) VALUES (?,?,?,?)',[id,group.id,JSON.stringify(group),position]);
      return store.getMenu(id);
    },
    async deleteMenu(id){await rows('UPDATE food_menu_items SET deleted=1,available=0 WHERE id=?',[id]);},
    async setSettings(settings){await rows('UPDATE food_settings SET config=? WHERE id=1',[JSON.stringify(settings)]);},
    async getSettings(){const result=await rows('SELECT config FROM food_settings WHERE id=1');if(!result.length)throw Error('Food settings migration required');return json(result[0].config);},
    async withTransaction(fn) {
      if(connection)throw Error('Nested food transaction');
      const conn=await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [settings]=await conn.execute('SELECT id FROM food_settings WHERE id=1 FOR UPDATE');
        if(!settings.length)throw Error('Food settings migration required');
        const result=await fn(createFoodStore(pool,conn));
        await conn.commit();
        return result;
      } catch(error) {await conn.rollback();throw error;}
      finally {conn.release();}
    },
  };
  return store;
}
