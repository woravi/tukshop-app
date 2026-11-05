// FOOD_DB_INTEGRATION=1 node --test tests/food-migration.test.mjs
// Private scratch MariaDB, socket only; never uses application credentials.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,mkdirSync} from 'node:fs';
import {homedir} from 'node:os';
import {spawn,spawnSync} from 'node:child_process';
import {join} from 'node:path';
import mysql from 'mysql2/promise';
import {DEFAULT_SETTINGS} from '../lib/food-domain.mjs';
import {createFoodStore} from '../lib/food-store.mjs';
import {createFoodService} from '../lib/food-service.mjs';
const sql=p=>readFileSync(new URL('../sql/'+p,import.meta.url),'utf8');
test('food migration is repeatable on fresh and configured databases without replacing records',{skip:process.env.FOOD_DB_INTEGRATION!=='1',timeout:60000},async()=>{
 const scratch=join(homedir(),'.hermes/cache/scratch');mkdirSync(scratch,{recursive:true});
 const dir=mkdtempSync(join(scratch,'food-db-')),socketPath=join(dir,'db.sock');let root,server,pool;
 try {
  const init=spawnSync('mariadb-install-db',['--no-defaults',`--datadir=${dir}/data`,'--auth-root-authentication-method=normal','--skip-test-db'],{encoding:'utf8'});
  assert.equal(init.status,0,init.stderr);
  server=spawn('mysqld',['--no-defaults',`--datadir=${dir}/data`,`--socket=${socketPath}`,`--pid-file=${dir}/pid`,'--skip-networking',`--log-error=${dir}/server.log`],{stdio:'ignore'});
  for(let attempt=0;attempt<100;attempt++){try{root=await mysql.createConnection({socketPath,user:'root',multipleStatements:true,decimalNumbers:true,timezone:'Z'});break;}catch{await new Promise(r=>setTimeout(r,100));}}
  assert.ok(root,readFileSync(join(dir,'server.log'),'utf8'));
  await root.query('CREATE DATABASE isolated_food_test CHARACTER SET utf8mb4');await root.query('USE isolated_food_test');
  await root.query(sql('001_initial.sql'));await root.query(sql('006_food.sql'));await root.query(sql('007_food_pending_safeguards.sql'));
  pool=mysql.createPool({socketPath,user:'root',database:'isolated_food_test',decimalNumbers:true,timezone:'Z'});
  const store=createFoodStore(pool),service=createFoodService(store,{clock:()=>new Date('2026-11-05T03:00:00Z'),trackingSecret:'integration-only-secret-'.repeat(3)});
  assert.deepEqual(await store.getSettings(),DEFAULT_SETTINGS);
  await root.query(sql('006_food.sql'));
  assert.deepEqual(await store.getSettings(),DEFAULT_SETTINGS);
  const [actor]=await root.execute('INSERT INTO users (name,email,admin) VALUES (?,?,1)',['owner','owner@example.test']);
  const owner={id:String(actor.insertId),role:'owner'};
  const partial=await service.putSettings(DEFAULT_SETTINGS,owner);
  assert.equal(partial.configured,false);assert.equal(partial.accepting_now,false);
  assert.deepEqual(await store.getSettings(),DEFAULT_SETTINGS);
  await root.query(sql('006_food.sql'));assert.deepEqual(await store.getSettings(),DEFAULT_SETTINGS);
  await assert.rejects(service.putSettings({...DEFAULT_SETTINGS,order_accepting:true,daily_capacity:80},owner),/hours/);
  const settings={...DEFAULT_SETTINGS,order_accepting:true,hours:Object.fromEntries([1,2,3,4,5].map(d=>[d,{open:'10:00',close:'17:30'}])),pickup_address:'Existing owner address',prep_minutes:35,daily_capacity:80,delivery_zones:[{id:'actual',name:'Actual zone',fee:37.5,enabled:true}]};
  await service.putSettings(settings,owner);
  const menu=await service.saveMenu({name:'Existing real menu',description:'Preserve me',category:'Owner category',image_url:null,price:75,source_type:'resale',available:true,daily_limit:null,stock:8,allergens:'',allergens_confirmed:false,options:[]},null,owner);
  const order=await service.createOrder({customer_name:'Customer',phone:'0812345678',method:'pickup',scheduled_at:'2026-11-05T12:00:00+07:00',lines:[{menu_id:menu.id,quantity:1,options:[]}],client_request_id:'a'.repeat(32)});
  assert.ok(order.order.id);
  assert.equal((await store.getMenu(menu.id)).stock,8);assert.equal(await store.quantityForDate('2026-11-05'),0);
  assert.equal((await store.getOrder(order.order.id)).reservation_held,false);
  assert.ok(order.order.pending_expires_at);
  const pending=await service.createOrder({customer_name:'Pending',phone:'+66 81 234 5678',method:'pickup',scheduled_at:'2026-11-05T12:00:00+07:00',lines:[{menu_id:menu.id,quantity:2,options:[]}],client_request_id:'b'.repeat(32)});
  await service.updateOrder(order.order.id,{status:'accepted'},owner);
  assert.equal((await store.getMenu(menu.id)).stock,7);assert.equal(await store.quantityForDate('2026-11-05'),1);
  assert.equal((await store.getOrder(pending.order.id)).reservation_held,false);
  const tables=['food_settings','food_categories','food_menu_items','food_menu_options','food_orders','food_order_items','users'];
  const snapshot=async()=>Object.fromEntries(await Promise.all(tables.map(async table=>[table,(await root.query(`SELECT * FROM ${table} ORDER BY id`))[0]])));
  const before=await snapshot();
  for(let i=0;i<2;i++){await root.query(sql('006_food.sql'));await root.query(sql('007_food_pending_safeguards.sql'));}
  assert.deepEqual(await snapshot(),before);
  assert.deepEqual(await store.getSettings(),settings);
 }finally{
  if(pool)await pool.end();
  if(root)await root.end();
  if(server&&server.exitCode===null){const exited=new Promise(resolve=>server.once('exit',resolve));server.kill('SIGTERM');await exited;}
  rmSync(dir,{recursive:true,force:true});
 }
});
