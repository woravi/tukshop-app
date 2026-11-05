import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('category edits reject parent cycles, stale versions and nonempty deactivation', async () => {
  const {createManagement}=await import('../lib/merchandise.mjs');
  const rows=[{id:1,name:'Bags',parent_id:null,version:2,active:1,sort_order:0},{id:2,name:'Child',parent_id:1,version:1,active:1,sort_order:1}];
  const calls=[];
  const db={execute:async(sql,args)=>{calls.push(sql); if(sql.includes('FROM product_categories'))return [rows]; if(sql.includes('COUNT(*)'))return [[{total:1}]]; return [{affectedRows:1}];},beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{}};
  db.getConnection=async()=>db;
  const api=createManagement(db);
  await assert.rejects(api.saveCategory(1,{name:'Bags',parent_id:2,sort_order:0,active:true,version:2}),/cycle/i);
  await assert.rejects(api.saveCategory(1,{name:'Bags',parent_id:null,sort_order:0,active:true,version:1}),/changed/i);
  await assert.rejects(api.saveCategory(1,{name:'Bags',parent_id:null,sort_order:0,active:false,version:2}),/nonempty/i);
  assert.equal(calls.some(s=>s.startsWith('UPDATE')),false);
});

test('variant saves validate quantities and prices, use CAS, recalculate total and audit in one transaction', async () => {
  const {createManagement}=await import('../lib/merchandise.mjs');
  const calls=[];
  let stale=false;
  const db={execute:async(sql,args)=>{calls.push([sql,args]);if(sql.startsWith('SELECT id FROM products'))return [[{id:2}]];if(sql.startsWith('SELECT * FROM product_variants'))return [[{id:4,product_id:2,stock:1,version:3}]];if(sql.startsWith('UPDATE product_variants'))return [{affectedRows:stale?0:1}];return [{insertId:7,affectedRows:1}];},getConnection:async()=>db,beginTransaction:async()=>calls.push(['BEGIN']),commit:async()=>calls.push(['COMMIT']),rollback:async()=>calls.push(['ROLLBACK']),release:()=>{}};
  const api=createManagement(db); const good={sku:'BAG-RED-M',color:'Red',size:'M',price:500,stock:2,active:true,version:3};
  for(const patch of [{stock:-1},{stock:1.5},{price:-1},{price:NaN},{sku:''},{active:'false'}]) await assert.rejects(api.saveVariant(2,4,{...good,...patch},9),/Invalid/);
  await api.saveVariant(2,4,good,9);
  assert.ok(calls.some(([s])=>s.includes('SUM(stock)')));
  assert.ok(calls.some(([s])=>s.startsWith('INSERT INTO inventory_changes')));
  assert.match(calls.find(([s])=>s.startsWith('UPDATE product_variants'))[0], /version=\?/);
  assert.equal(calls.at(-1)[0],'COMMIT');
  stale=true;
  const before=calls.length;
  await assert.rejects(api.saveVariant(2,4,good,9),/changed/);
  assert.equal(calls.at(-1)[0],'ROLLBACK');
  assert.ok(!calls.slice(before).some(([s])=>s.startsWith('UPDATE products')));
});

test('migration is additive, repeatable and restricts demo backfill to known marked sample records',()=>{
 const sql=readFileSync(new URL('../sql/005_product_management.sql',import.meta.url),'utf8');
 assert.doesNotMatch(sql,/DROP TABLE|DELETE FROM|TRUNCATE/i);
 for(const table of ['product_categories','product_variants','product_category_aliases','inventory_changes'])assert.match(sql,new RegExp('CREATE TABLE IF NOT EXISTS '+table));
 assert.match(sql,/ADD COLUMN IF NOT EXISTS is_demo/);
 assert.match(sql,/id IN \(6,7,8,9,10,11\)/);
 assert.match(sql,/name LIKE/);
 assert.match(sql,/ADD COLUMN IF NOT EXISTS category_id/);
 assert.match(sql,/UNIQUE.*sku/i);
 assert.match(sql,/price >= 0/);
});

test('demo products cannot enter cart and variant stock is isolated by line identity',async()=>{
 const {default:cart}=await import('../store/cartStore.js');
 cart.setState({items:[]});
 assert.equal(cart.getState().addItem({_id:'demo',is_demo:true,stock:20}),false);
 const product={_id:'2',stock:10,variants:[{id:1,stock:1,price:100,color:'Red',size:'M',active:true},{id:2,stock:2,price:200,color:'Blue',size:'L',active:true}]};
 assert.equal(cart.getState().addItem(product),false);
 assert.equal(cart.getState().addItem(product,1),true);
 assert.equal(cart.getState().addItem(product,1),false);
 assert.equal(cart.getState().addItem(product,2),true);
 assert.equal(cart.getState().items.length,2);
 const red=cart.getState().items.find(i=>i.variant_id===1);
 const blue=cart.getState().items.find(i=>i.variant_id===2);
 assert.equal(red.price,100);assert.equal(blue.stock,2);
 cart.getState().updateItemQuantity(blue.lineId,2);
 assert.equal(cart.getState().items.find(i=>i.variant_id===2).quantity,2);
 cart.getState().removeItem(red.lineId);
 assert.equal(cart.getState().items.length,1);
 assert.equal(cart.getState().items[0].variant_id,2);
});

test('model persists explicit demo and category ID, loads variants and blocks aggregate stock bypass',async()=>{
 const {createModel}=await import('../lib/mysql-model.mjs');const calls=[];
 const db={execute:async(sql,args)=>{calls.push([sql,args]);if(sql.startsWith('SELECT * FROM products'))return [[{id:2,stock:3,is_demo:1,category_id:1}]];if(sql.startsWith('SELECT * FROM product_variants'))return [[{id:1,product_id:2,active:1,stock:3,price:10}]];if(sql.startsWith('SELECT * FROM product_categories'))return [[{id:1,name:'New category',active:1}]];return [sql.startsWith('INSERT')?{insertId:2}:[]];},getConnection:async()=>db,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{}};
 const Product=createModel('products',db);
 const product=await Product.create({name:'Sample',is_demo:true,category_id:1});
 const insert=calls.find(([sql])=>sql.startsWith('INSERT INTO products'));
 assert.match(insert[0],/`is_demo`/);assert.match(insert[0],/`category_id`/);
 assert.equal(product.is_demo,true);assert.equal(product.variants[0].stock,3);
 await assert.rejects(Product.findByIdAndUpdate(2,{stock:5},{expectedStock:3}),/variant/i);
 await assert.rejects(Product.create({is_demo:'false'}),/demo/i);
});

test('management HTTP handlers deny buyers before reading bodies and return structured validation failures',async()=>{
 const {managementHandlers}=await import('../lib/merchandise-http.mjs');let read=false;
 const denied=managementHandlers({db:{},authorize:async roles=>{assert.deepEqual(roles,['owner','manager']);return {status:403};}});
 const req={json:async()=>{read=true;return {};}};
 assert.equal((await denied.categorySave(req,null)).status,403);
 assert.equal((await denied.variantSave(req,2,null)).status,403);assert.equal(read,false);
 const allowed=managementHandlers({db:{},authorize:async()=>({status:200,actor:{id:1}})});
 assert.equal((await allowed.variantSave({json:async()=>({price:-1})},2,null)).status,400);
 assert.equal((await allowed.categorySave({json:async()=>{throw new SyntaxError('bad json');}},null)).status,400);
});

test('routes wire management APIs and fresh owner/manager authorization, forms and public UI use dynamic catalogue',()=>{
 const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
 for(const path of ['app/api/categories/route.js','app/api/categories/[categoryId]/route.js','app/api/product/[productId]/variants/route.js','app/api/product/[productId]/variants/[variantId]/route.js']) {const src=read(path);assert.match(src,/authorizeRoles/);assert.match(src,/managementHandlers/);}
 for(const path of ['app/api/products/route.js','app/api/product/[productId]/route.js']){assert.match(read(path),/authorizeRoles\(\["owner", "manager"\]\)/);assert.match(read(path),/is_demo/);}
 for(const path of ['app/create/page.jsx','app/editProduct/[productId]/page.jsx']){assert.match(read(path),/is_demo/);assert.match(read(path),/CategorySelect/);}
 assert.match(read('components/products/ProductGrid.jsx'),/\/api\/categories/);
 assert.match(read('components/ProdDetailsPrice.jsx'),/สี/);assert.match(read('components/ProdDetailsPrice.jsx'),/ขนาด/);
 for(const path of ['components/Cart.jsx','components/MobileCart.jsx'])assert.match(read(path),/cartLineId/);
 assert.match(read('app/admin/categories/page.jsx'),/CategoryManager/);
 assert.match(read('app/admin/variants/page.jsx'),/VariantManager/);
});

test('persisted cart refresh removes newly marked demos and disabled variants and clamps stock',async()=>{
 const {default:cart}=await import('../store/cartStore.js');
 cart.setState({items:[{_id:'a',stock:5,quantity:3},{_id:'b',variant_id:2,stock:4,quantity:2},{_id:'c',variant_id:3,stock:4,quantity:3}]});
 cart.getState().refreshProducts([{_id:'a',is_demo:true,stock:5},{_id:'b',has_variants:true,variants:[]},{_id:'c',has_variants:true,variants:[{id:3,active:true,stock:1,price:99,color:'Red',size:'S'}]}]);
 assert.equal(cart.getState().items.length,1);assert.equal(cart.getState().items[0].quantity,1);assert.equal(cart.getState().items[0].price,99);
});

test('product category assignment locks category tree before product to prevent rename/deactivation races',async()=>{
 const {createModel}=await import('../lib/mysql-model.mjs');const calls=[];
 const db={execute:async(sql,args)=>{calls.push(sql);if(sql.startsWith('SELECT * FROM products'))return [[{id:2,stock:1}]];if(sql.startsWith('SELECT * FROM product_categories'))return [[{id:1,name:'Bags',active:1}]];return [sql.startsWith('UPDATE')?{affectedRows:1}:[]];},getConnection:async()=>db,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{}};
 await createModel('products',db).findByIdAndUpdate(2,{category_id:1});
 const tree=calls.findIndex(sql=>sql==='SELECT * FROM product_categories ORDER BY id FOR UPDATE');
 const product=calls.findIndex(sql=>sql==='SELECT id FROM products WHERE id=? FOR UPDATE');
 assert.ok(tree>=0 && tree<product,'category lock must precede product lock');
});

test('review-loaded product saves only dirty fields and cannot overwrite a later demo flag or category rename',async()=>{
 const {createModel}=await import('../lib/mysql-model.mjs');const calls=[];
 const db={execute:async(sql,args)=>{calls.push(sql);if(sql.startsWith('SELECT * FROM products'))return [[{id:2,name:'Bag',is_demo:0,category:'Bags',category_id:1,stock:1,averageRating:0}]];if(sql.startsWith('SELECT * FROM product_categories'))return [[{id:1,name:'Bags',active:1}]];return [sql.startsWith('UPDATE')?{affectedRows:1}:[]];}};
 const product=await createModel('products',db).findById(2);product.averageRating=5;await product.save();
 const update=calls.find(sql=>sql.startsWith('UPDATE products'));
 assert.match(update,/averageRating/);assert.doesNotMatch(update,/`is_demo`|`category`|`name`/);
});

test('active duplicate color-size combinations cannot become ambiguous storefront selections',async()=>{
 const {createManagement}=await import('../lib/merchandise.mjs');
 const db={execute:async sql=>sql.startsWith('SELECT id FROM products')?[[{id:2}]]:sql.startsWith('SELECT * FROM product_variants')?[[{id:4,color:'Red',size:'M',active:1}]]:[{insertId:5}],getConnection:async()=>db,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{}};
 await assert.rejects(createManagement(db).saveVariant(2,null,{sku:'DIFFERENT',color:'Red',size:'M',price:10,stock:1,active:true},1),/combination/);
});

test('category reorder is atomic, validates complete unique IDs and guards every row version',async()=>{
 const {createManagement}=await import('../lib/merchandise.mjs');const calls=[];
 const db={execute:async(sql,args)=>{calls.push([sql,args]);if(sql.startsWith('SELECT'))return [[{id:1,version:2},{id:2,version:1}]];return [{affectedRows:1}];},getConnection:async()=>db,beginTransaction:async()=>{},commit:async()=>calls.push(['COMMIT']),rollback:async()=>calls.push(['ROLLBACK']),release:()=>{}};
 const api=createManagement(db);
 await assert.rejects(api.reorderCategories([{id:1,version:2},{id:1,version:2}]),/Invalid/);
 await assert.rejects(api.reorderCategories([{id:1,version:2}]),/changed/);
 await assert.rejects(api.reorderCategories([{id:2,version:3},{id:1,version:2}]),/changed/);
 await api.reorderCategories([{id:2,version:1},{id:1,version:2}]);
 const updates=calls.filter(([sql])=>sql.startsWith('UPDATE'));
 assert.deepEqual(updates.map(([,params])=>params),[[0,2,1],[1,1,2]]);
 assert.equal(calls.at(-1)[0],'COMMIT');
});

test('category validation accepts editable names while rejecting malformed input', async () => {
  const {validateCategory}=await import('../lib/product-categories.mjs');
  assert.equal(validateCategory('กระเป๋ารุ่นใหม่'), 'กระเป๋ารุ่นใหม่');
  for(const value of ['', '  ', 3, {}, 'x'.repeat(256)]) assert.throws(()=>validateCategory(value), /category/i);
});

test('numeric category creation and rename reject before writes or alias creation', async () => {
  const {createManagement}=await import('../lib/merchandise.mjs');
  const calls=[];
  const db={
    execute:async(sql,args)=>{
      calls.push([sql,args]);
      if(sql==='SELECT * FROM product_categories ORDER BY id FOR UPDATE')return [[{id:1,name:'กระเป๋าถือ',active:1,version:1}]];
      if(sql.startsWith('SELECT'))return [[]];
      return [{insertId:2,affectedRows:1}];
    },
    getConnection:async()=>db,beginTransaction:async()=>{},commit:async()=>calls.push(['COMMIT']),
    rollback:async()=>calls.push(['ROLLBACK']),release:()=>{},
  };
  const api=createManagement(db);
  for(const id of [null,1]) {
    calls.length=0;
    await assert.rejects(api.saveCategory(id,{name:'2026',parent_id:null,sort_order:0,active:true,version:1}), /ชื่อหมวดหมู่ต้องไม่เป็นตัวเลขล้วน/);
    assert.equal(calls.some(([sql])=>/^(INSERT|UPDATE|DELETE)/.test(sql)),false);
    assert.equal(calls.at(-1)[0],'ROLLBACK');
  }
});

test('numeric category names return HTTP 400 with actionable Thai validation for create and rename', async () => {
  const {managementHandlers}=await import('../lib/merchandise-http.mjs');
  const db={getConnection:async()=>db,beginTransaction:async()=>{},rollback:async()=>{},release:()=>{}};
  const handlers=managementHandlers({db,authorize:async()=>({status:200,actor:{id:1}})});
  for(const id of [null,1]) {
    const response=await handlers.categorySave({json:async()=>({name:'2026',sort_order:0,active:true,version:1})},id);
    assert.equal(response.status,400);
    assert.match((await response.json()).error,/ชื่อหมวดหมู่ต้องไม่เป็นตัวเลขล้วน/);
  }
});

test('renaming a Thai category preserves its numeric ID route and legacy Thai alias', async () => {
  const {createManagement}=await import('../lib/merchandise.mjs');
  const category={id:7,name:'กระเป๋าถือ',active:1,version:1};
  const aliases=new Map();
  const calls=[];
  const db={
    execute:async(sql,args)=>{
      calls.push([sql,args]);
      if(sql==='SELECT * FROM product_categories ORDER BY id FOR UPDATE')return [[{...category}]];
      if(sql.startsWith('SELECT category_id FROM product_category_aliases'))return [[...(aliases.has(args[0])?[{category_id:aliases.get(args[0])}]:[])]];
      if(sql.startsWith('INSERT IGNORE INTO product_category_aliases'))aliases.set(args[0],args[1]);
      if(sql.startsWith('UPDATE product_categories')){category.name=args[0];category.version++;}
      if(sql.startsWith('SELECT * FROM product_categories WHERE id='))return [[...(String(category.id)===String(args[0])?[{...category}]:[])]];
      if(sql.startsWith('SELECT * FROM product_categories WHERE name='))return [[...(category.name===args[0]?[{...category}]:[])]];
      if(sql.startsWith('SELECT c.* FROM product_category_aliases'))return [[...(aliases.get(args[0])===category.id?[{...category}]:[])]];
      return [{affectedRows:1}];
    },
    getConnection:async()=>db,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{},
  };
  const api=createManagement(db);
  await api.saveCategory(7,{name:'กระเป๋า 2026',parent_id:null,sort_order:0,active:true,version:1});
  for(const token of ['7',7,'กระเป๋าถือ','กระเป๋า 2026']) {
    const resolved=await api.resolveCategory(token);
    assert.equal(resolved.id,7);
    assert.equal(resolved.name,'กระเป๋า 2026');
  }
  // Even pre-existing numeric names/aliases must never shadow canonical ID routes.
  aliases.set('2026',7);
  const before=calls.length;
  await assert.rejects(api.resolveCategory('2026'),{status:404});
  assert.deepEqual(calls.slice(before),[['SELECT * FROM product_categories WHERE id=? AND active=1',['2026']]]);
});

test('category names reject numeric-only route tokens but allow names containing numbers', async () => {
  const {validateCategory,BAG_CATEGORIES}=await import('../lib/product-categories.mjs');
  for(const name of ['2026','1','0','001','9007199254740992']) {
    assert.throws(()=>validateCategory(name), /ชื่อหมวดหมู่ต้องไม่เป็นตัวเลขล้วน/);
  }
  for(const name of [...BAG_CATEGORIES,'กระเป๋า 2026','2026 Collection']) assert.equal(validateCategory(name),name);
  assert.equal(validateCategory(null),null);
});
