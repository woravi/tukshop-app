// Explicit opt-in, EMPTY disposable MariaDB database ending _food_test only.
// DB_NAME=..._food_test FOOD_TEST_ALLOW_WRITES=yes node --test tests/food-mariadb.integration.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import mysql from 'mysql2/promise';
import {databaseConfig} from '../lib/mysql-config.mjs';
import {createFoodStore} from '../lib/food-store.mjs';
import {createFoodService} from '../lib/food-service.mjs';
import {createFoodHandlers} from '../lib/food-http.mjs';

test('MariaDB actual migrations, non-reserving pending, atomic acceptance, expiry, admission and PII', {skip:process.env.FOOD_TEST_ALLOW_WRITES!=='yes'}, async()=>{
 assert.match(process.env.DB_NAME??'',/_food_test$/,'Use an EMPTY disposable database named *_food_test');
 const pool=mysql.createPool({...databaseConfig(),multipleStatements:true,connectionLimit:8});
 let provisioned=false;
 try {
  const [existing]=await pool.query('SHOW TABLES');assert.equal(existing.length,0,'Integration database must be empty');
  await pool.query(await readFile(new URL('../sql/001_initial.sql',import.meta.url),'utf8'));provisioned=true;
  await pool.query(await readFile(new URL('../sql/006_food.sql',import.meta.url),'utf8'));
  const migration=await readFile(new URL('../sql/007_food_pending_safeguards.sql',import.meta.url),'utf8');
  // Legacy predeploy pending fixtures reserved two units. Convert once, not on every rerun.
  await pool.query("INSERT INTO food_categories (name) VALUES ('Legacy')");
  await pool.query("INSERT INTO food_menu_items (category_id,name,description,price_satang,source_type,stock,allergens) VALUES (1,'Legacy','',100,'resale',3,'')");
  await pool.query("INSERT INTO food_orders (client_request_hash,request_hash,tracking_hash,customer_name,phone,method,scheduled_at,service_date,address,notes,subtotal_satang,delivery_satang,total_satang,quantity) VALUES (REPEAT('a',64),REPEAT('b',64),REPEAT('c',64),'Legacy','0811111111','pickup','2020-01-01','2020-01-01','','',200,0,200,2)");
  await pool.query("INSERT INTO food_order_items (order_id,menu_id,name,quantity,unit_satang,source_type,options_json) VALUES (1,1,'Legacy',2,100,'resale','[]')");
  await pool.query(migration);
  assert.equal(Number((await pool.query('SELECT stock FROM food_menu_items WHERE id=1'))[0][0].stock),5);
  assert.equal(Number((await pool.query('SELECT reservation_held FROM food_orders WHERE id=1'))[0][0].reservation_held),0);
  const snapshot=async()=>JSON.stringify(await Promise.all(['food_settings','food_menu_items','food_orders','food_order_items'].map(async table=>(await pool.query(`SELECT * FROM ${table} ORDER BY id`))[0])));
  const migrated=await snapshot();await pool.query(migration);assert.equal(await snapshot(),migrated);
  const store=createFoodStore(pool),service=createFoodService(store,{clock:()=>new Date('2026-11-05T03:00:00Z'),trackingSecret:'integration-only-secret-'.repeat(3)});
  assert.equal((await service.getSettings()).order_accepting,false);
  const [actorResult]=await pool.execute('INSERT INTO users (name,email,admin) VALUES (?,?,1)',['owner','food-owner@example.test']);
  const owner={id:String(actorResult.insertId),role:'owner'},kitchen={...owner,role:'kitchen'};
  const menu=await service.saveMenu({name:'อาหาร',description:'',category:'อาหารจานเดียว',image_url:null,price:60.10,source_type:'resale',available:true,daily_limit:null,stock:5,allergens:'',allergens_confirmed:false,options:[{id:'egg',name:'ไข่',min:0,max:1,choices:[{id:'yes',name:'ไข่ดาว',price_adjustment:10.20,available:true}]}]},null,owner);
  const settings={timezone:'Asia/Bangkok',weekdays:[1,2,3,4,5],order_accepting:true,pickup_enabled:true,delivery_enabled:true,hours:Object.fromEntries([1,2,3,4,5].map(d=>[d,{open:'09:00',close:'17:00'}])),pickup_address:'Integration fixture only',delivery_zones:[{id:'fixture',name:'Fixture only',fee:20,enabled:true}],prep_minutes:30,daily_capacity:3};
  await service.putSettings(settings,owner);
  const body={customer_name:'Customer fixture',phone:'0812345678',method:'pickup',scheduled_at:'2026-11-05T12:00:00+07:00',lines:[{menu_id:menu.id,quantity:2,options:[{group_id:'egg',choice_ids:['yes']}]}],notes:'ไม่เผ็ด',client_request_id:randomUUID()};
  const duplicate=await Promise.all(Array.from({length:6},()=>service.createOrder(body)));
  assert.equal(new Set(duplicate.map(o=>o.order.id)).size,1);assert.equal(duplicate.filter(o=>!o.replayed).length,1);
  assert.equal(duplicate[0].order.total,140.6);assert.equal((await store.getMenu(menu.id)).stock,5);
  const tracked=await service.trackOrder(duplicate[0].tracking_token);assert.equal(tracked.scheduled_at,'2026-11-05T05:00:00.000Z');assert.equal('phone' in tracked,false);
  const competitor=await service.createOrder({...body,client_request_id:randomUUID()});
  const acceptance=await Promise.allSettled([tracked.id,competitor.order.id].map(id=>service.updateOrder(id,{status:'accepted'},kitchen)));
  assert.equal(acceptance.filter(r=>r.status==='fulfilled').length,1);assert.equal(acceptance.find(r=>r.status==='rejected').reason.code,'CAPACITY');
  assert.equal((await store.getMenu(menu.id)).stock,3);assert.equal(await store.quantityForDate('2026-11-05'),2);
  await assert.rejects(service.createOrder({...body,notes:'changed'}),e=>e.code==='IDEMPOTENCY_CONFLICT');
  await assert.rejects(service.updateOrder(tracked.id,{payment_status:'paid'},kitchen),e=>e.status===403);
  const cook=await service.listOrders('2026-11-05',kitchen);assert.equal('phone' in cook.orders[0],false);
  const accepted=acceptance.find(r=>r.status==='fulfilled').value;
  await service.updateOrder(accepted.id,{status:'accepted'},kitchen);assert.equal((await store.getMenu(menu.id)).stock,3);
  await Promise.all(Array.from({length:4},()=>service.updateOrder(accepted.id,{status:'cancelled'},owner)));
  const pendingId=[tracked.id,competitor.order.id].find(id=>id!==accepted.id);
  await Promise.all(Array.from({length:4},()=>service.updateOrder(pendingId,{status:'rejected'},kitchen)));
  assert.equal((await store.getMenu(menu.id)).stock,5);assert.equal(await store.quantityForDate('2026-11-05'),0);
  const made=await service.saveMenu({...menu,source_type:'made_to_order',daily_limit:1,stock:5},null,owner);
  const over=await service.createOrder({...body,phone:'0822345678',client_request_id:randomUUID(),lines:[{menu_id:made.id,quantity:1,options:[]},{menu_id:made.id,quantity:1,options:[]}]});
  await assert.rejects(service.updateOrder(over.order.id,{status:'accepted'},kitchen),e=>e.code==='CAPACITY');
  const delivery=await service.createOrder({...body,method:'delivery',zone_id:'fixture',address:'Fixture private address',client_request_id:randomUUID()});
  assert.equal(delivery.order.delivery_fee,20);assert.equal(delivery.order.total,160.6);
  for(const status of ['accepted','preparing','ready','completed'])await service.updateOrder(delivery.order.id,{status},kitchen);
  await service.updateOrder(delivery.order.id,{payment_status:'paid'},owner);
  assert.equal((await service.trackOrder(delivery.tracking_token)).payment_status,'paid');
  assert.equal((await store.getMenu(menu.id)).stock,3);
  await assert.rejects(service.updateOrder(delivery.order.id,{status:'cancelled'},owner),e=>e.code==='INVALID_TRANSITION');
  const [dbOrders]=await pool.execute('SELECT tracking_hash,client_request_hash FROM food_orders');
  assert.equal(dbOrders.some(o=>o.tracking_hash===delivery.tracking_token),false);

  // Both source types enforce menu-specific limits with duplicate lines and concurrency.
  await service.putSettings({...settings,daily_capacity:100},owner);
  for(const [index,source_type] of ['resale','made_to_order'].entries()) {
   const limited=await service.saveMenu({...menu,source_type,daily_limit:3,stock:20},null,owner);
   const candidates=await Promise.all([1,2].map(()=>service.createOrder({...body,phone:`083234567${index}`,client_request_id:randomUUID(),lines:[{menu_id:limited.id,quantity:1,options:[]},{menu_id:limited.id,quantity:1,options:[]}]})));
   const outcome=await Promise.allSettled(candidates.map(o=>service.updateOrder(o.order.id,{status:'accepted'},kitchen)));
   assert.equal(outcome.filter(r=>r.status==='fulfilled').length,1);assert.equal(outcome.find(r=>r.status==='rejected').reason.code,'CAPACITY');
   assert.equal(await store.quantityForMenuDate(limited.id,'2026-11-05'),2);
   assert.equal((await store.getMenu(limited.id)).stock,source_type==='resale'?18:20);
  }
  // Partial stock writes roll back on a later unavailable quantity.
  const empty=await service.saveMenu({...menu,stock:0},null,owner);
  const rollback=await service.createOrder({...body,phone:'0842345678',client_request_id:randomUUID(),lines:[...body.lines,{menu_id:empty.id,quantity:1,options:[]}]});
  await assert.rejects(service.updateOrder(rollback.order.id,{status:'accepted'},kitchen),e=>e.code==='CAPACITY');
  assert.equal((await store.getMenu(menu.id)).stock,3);assert.equal((await store.getOrder(rollback.order.id)).reservation_held,false);
  // Persistence and normalized phone variants, not a process-local limiter.
  const phones=['085-234-5678','+66 85 234 5678','(085) 2345678','0852345678'];
  const admissions=await Promise.allSettled(phones.map(phone=>service.createOrder({...body,phone,client_request_id:randomUUID()})));
  assert.equal(admissions.filter(r=>r.status==='fulfilled').length,3);
  assert.equal(admissions.find(r=>r.status==='rejected').reason.status,429);
  const restarted=createFoodService(createFoodStore(pool),{clock:()=>new Date('2026-11-05T03:00:00Z'),trackingSecret:'integration-only-secret-'.repeat(3)});
  await assert.rejects(restarted.createOrder({...body,phone:'0852345678',client_request_id:randomUUID()}),e=>e.code==='RATE_LIMITED');
  await pool.execute('UPDATE food_orders SET created_at=DATE_SUB(NOW(),INTERVAL 16 MINUTE) WHERE phone=?',['+66852345678']);
  await restarted.createOrder({...body,phone:'0852345678',client_request_id:randomUUID()});
  // Real SQL server clock sets expiry even though schedule tests inject a fixed business clock.
  const expiringBody={...body,phone:'0862345678',client_request_id:randomUUID()};
  const expiring=await service.createOrder(expiringBody);
  const expiry=new Date(expiring.order.pending_expires_at).getTime(),now=new Date(await store.utcNow()).getTime();
  assert.ok(expiry-now>19*60000&&expiry-now<=20*60000);
  await pool.execute('UPDATE food_orders SET pending_expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND) WHERE id=?',[expiring.order.id]);
  await assert.rejects(service.updateOrder(expiring.order.id,{status:'accepted'},kitchen),e=>e.code==='EXPIRED'&&e.status===409);
  const expired=await store.getOrder(expiring.order.id);assert.equal(expired.status,'cancelled');assert.equal(expired.cancellation_reason,'expired');assert.equal(expired.reservation_held,false);
  const replay=await service.createOrder(expiringBody);assert.equal(replay.replayed,true);assert.equal(replay.order.cancellation_reason,'expired');
  assert.equal((await store.getMenu(menu.id)).stock,3);
  // Exercise the real HTTP handler + SQL-backed service (not a service mock).
  const handlers=createFoodHandlers({getService:()=>service,authorizeRoles:async()=>({status:200,actor:owner})});
  const post=payload=>handlers.orderPost(new Request('http://localhost/api/food/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}));
  for(let i=0;i<2;i++)assert.equal((await post({...body,phone:'0852345678',client_request_id:randomUUID()})).status,201);
  const limited=await post({...body,phone:'0852345678',client_request_id:randomUUID()});assert.equal(limited.status,429);assert.equal((await limited.json()).code,'RATE_LIMITED');
  const expiredPatch=await handlers.adminOrderPatch(new Request('http://localhost/api/food/admin/orders/'+expired.id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({status:'accepted'})}),{params:Promise.resolve({id:expired.id})});
  assert.equal(expiredPatch.status,409);assert.equal((await expiredPatch.json()).code,'EXPIRED');
  const replayResponse=await post(expiringBody);assert.equal(replayResponse.status,200);assert.equal((await replayResponse.json()).order.status,'cancelled');
  // Reapply migrations after real activity; do not alter reservations, snapshots, or timestamps.
  const before=await snapshot();await pool.query(migration);assert.equal(await snapshot(),before);
 } finally {
  if(provisioned) {
   for(const table of ['food_order_items','food_orders','food_menu_options','food_menu_items','food_categories','food_settings','wishlists','reviews','order_items','orders','product_images','products','users'])await pool.query(`DROP TABLE IF EXISTS ${table}`);
  }
  await pool.end();
 }
});
