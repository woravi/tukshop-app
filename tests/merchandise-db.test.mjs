// Opt-in isolated MariaDB regression suite: MERCH_DB_INTEGRATION=1 node --test tests/merchandise-db.test.mjs
// Uses a new scratch datadir, Unix socket only. Never connects to the application's DB.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,mkdirSync} from 'node:fs';
import {homedir} from 'node:os';
import {spawn,spawnSync} from 'node:child_process';
import {join} from 'node:path';
import mysql from 'mysql2/promise';
import {createManagement} from '../lib/merchandise.mjs';
import {createModel} from '../lib/mysql-model.mjs';
const sql=p=>readFileSync(new URL('../sql/'+p,import.meta.url),'utf8');
test('real MariaDB: repeatable migration preserves records; editable categories, aliases and variants are atomic', {skip:process.env.MERCH_DB_INTEGRATION!=='1',timeout:60000},async()=>{
 const scratch=join(homedir(),'.hermes/cache/scratch');mkdirSync(scratch,{recursive:true});
 const dir=mkdtempSync(join(scratch,'merch-db-'));
 const socketPath=join(dir,'db.sock');let pool,server;
 try {
  const init=spawnSync('mariadb-install-db',['--no-defaults',`--datadir=${dir}/data`,'--auth-root-authentication-method=normal','--skip-test-db'],{encoding:'utf8'});
  assert.equal(init.status,0,init.stderr);
  server=spawn('mysqld',['--no-defaults',`--datadir=${dir}/data`,`--socket=${socketPath}`,`--pid-file=${dir}/pid`,'--skip-networking',`--log-error=${dir}/server.log`],{stdio:'ignore'});
  let root;
  for(let attempt=0;attempt<100;attempt++){try{root=await mysql.createConnection({socketPath,user:'root',multipleStatements:true,decimalNumbers:true});break;}catch{await new Promise(r=>setTimeout(r,100));}}
  assert.ok(root,readFileSync(join(dir,'server.log'),'utf8'));
  await root.query('CREATE DATABASE merchandise_test CHARACTER SET utf8mb4');await root.query('USE merchandise_test');
  await root.query(sql('001_initial.sql'));
  await root.query("INSERT INTO products (id,name,stock,price,category) VALUES (2,'Real bag',7,100,'กระเป๋าถือ'),(3,'Other bag',2,200,NULL),(4,'Real4',1,20,NULL),(5,'Real5',3,30,NULL),(6,'[DEMO] Bag',50,10,NULL),(7,'User bag',4,44,NULL),(12,'DEMO customer name',4,44,NULL)");
  const [before]=await root.query('SELECT id,name,stock,price FROM products ORDER BY id');
  await root.query(sql('005_product_management.sql'));await root.query(sql('005_product_management.sql'));
  const [after]=await root.query('SELECT id,name,stock,price FROM products ORDER BY id');assert.deepEqual(after,before);
  const [demos]=await root.query('SELECT id FROM products WHERE is_demo=1');assert.deepEqual(demos.map(r=>r.id),[6]);
  pool=mysql.createPool({socketPath,user:'root',database:'merchandise_test',decimalNumbers:true,connectionLimit:6});
  const api=createManagement(pool), Product=createModel('products',pool);
  let category=await api.saveCategory(null,{name:'Travel',parent_id:null,sort_order:8,active:true});
  const product=await Product.create({name:'New user bag',price:90,stock:9,category_id:category.id,is_demo:false});
  assert.equal(product.category,'Travel');
  category=await api.saveCategory(category.id,{...category,name:'Trips',active:true});
  assert.equal((await api.resolveCategory('Travel')).id,category.id);assert.equal((await Product.findById(product._id)).category,'Trips');
  await assert.rejects(api.saveCategory(category.id,{...category,active:false}),/nonempty/);
  await root.query(sql('005_product_management.sql'));
  const [oldName]=await root.query("SELECT * FROM product_categories WHERE name='Travel'");assert.equal(oldName.length,0);
  const concurrentCategory=await api.saveCategory(null,{name:'Concurrent',parent_id:null,sort_order:9,active:true});
  const categoryRace=await Promise.allSettled([
    Product.create({name:'Concurrent bag',price:1,stock:1,category_id:concurrentCategory.id}),
    api.saveCategory(concurrentCategory.id,{...concurrentCategory,active:false}),
  ]);
  assert.equal(categoryRace.filter(r=>r.status==='fulfilled').length,1,'assignment and deactivation cannot both succeed');
  const allCategories=await api.listCategories(true);
  const reverse=allCategories.toReversed().map(({id,version})=>({id,version}));
  await api.reorderCategories(reverse);
  assert.deepEqual((await api.listCategories(true)).map(c=>c.id),reverse.map(c=>c.id));
  await assert.rejects(api.reorderCategories(reverse),e=>e.status===409);
  let variant=await api.saveVariant(2,null,{sku:'REAL-RED-M',color:'Red',size:'M',price:120,stock:3,active:true},1);
  const second=await api.saveVariant(2,null,{sku:'REAL-BLUE-L',color:'Blue',size:'L',price:130,stock:2,active:true},1);
  assert.equal((await Product.findById(2)).stock,5);
  await assert.rejects(Product.findByIdAndUpdate(2,{stock:7},{expectedStock:5}),/variant/);
  const saves=await Promise.allSettled([api.saveVariant(2,variant.id,{...variant,stock:6},1),api.saveVariant(2,variant.id,{...variant,stock:8},1)]);
  assert.equal(saves.filter(r=>r.status==='fulfilled').length,1);assert.equal(saves.filter(r=>r.status==='rejected')[0].reason.status,409);
  const current=(await api.listVariants(2,true)).find(v=>v.id===variant.id);
  assert.equal((await Product.findById(2)).stock,current.stock+2);
  await api.saveVariant(2,second.id,{...second,active:false},1);
  assert.equal((await Product.findById(2)).stock,current.stock);
  const snapshot=await Product.findById(2);
  await assert.rejects(api.saveVariant(2,null,{sku:'REAL-RED-M',color:'Black',size:'S',price:1,stock:100,active:true},1),e=>e.code==='ER_DUP_ENTRY');
  assert.equal((await Product.findById(2)).stock,snapshot.stock);
  await Product.findByIdAndUpdate(6,{is_demo:false});await root.query(sql('005_product_management.sql'));assert.equal((await Product.findById(6)).is_demo,false);
  const [audit]=await root.query('SELECT * FROM inventory_changes');assert.equal(audit.length,4);
  await root.end();
 }finally{if(pool)await pool.end();if(server){server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}rmSync(dir,{recursive:true,force:true});}
});
