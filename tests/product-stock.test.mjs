import test from 'node:test';
import assert from 'node:assert/strict';
import { createModel } from '../lib/mysql-model.mjs';

test('product stock defaults to zero and is persisted', async () => {
  const calls = [];
  const db = { execute: async (sql, params) => {
    calls.push([sql, params]);
    if (sql.startsWith('INSERT')) return [{insertId: 1}];
    if (sql.startsWith('SELECT *')) return [[{id: 1, stock: 0}]];
    return [[]];
  }};
  const product = await createModel('products', db).create({name: 'Watch'});
  assert.equal(product.stock, 0);
  assert.match(calls[0][0], /`stock`/);
  assert.ok(calls[0][1].includes(0));
});


test('invalid stock values are rejected before SQL on create and update', async () => {
  const db = {execute: async sql => sql.startsWith('SELECT *') ? [[{id:1, stock:0}]] : [[]]};
  const Product = createModel('products', db);
  for (const stock of [-1, 1.2, 4294967296, '3', null, NaN]) {
    await assert.rejects(Product.create({name:'x', stock}), /stock/i);
    await assert.rejects(Product.findByIdAndUpdate(1, {stock}), /stock/i);
  }
});


test('stock compare prevents stale updates before other changes', async () => {
  const calls=[];
  const db={execute:async (sql,params)=>{
    calls.push([sql,params]);
    if (sql.startsWith('SELECT * FROM products')) return [[{id:1,stock:4}]];
    if (sql.startsWith('UPDATE')) return [{affectedRows:0}];
    return [[]];
  }};
  await assert.rejects(createModel('products',db).findByIdAndUpdate(1,{stock:8,name:'Changed'},{expectedStock:3}), /stock.*changed/i);
  const update=calls.find(([sql])=>sql.startsWith('UPDATE'));
  assert.match(update[0], /WHERE id=\? AND `stock`=\?/);
  assert.equal(update[1].at(-1), 3);
});


test('admin forms and routes carry validated stock with conflict protection', async () => {
  const {readFileSync}=await import('node:fs');
  const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
  for (const p of ['app/create/page.jsx','app/editProduct/[productId]/page.jsx']) {
    const form=read(p); assert.match(form,/name="stock"/); assert.match(form,/max="4294967295"/);
  }
  assert.match(read('app/api/products/route.js'),/validateStock\(stock\)/);
  const update=read('app/api/product/[productId]/route.js');
  assert.match(update,/validateStock\(body\.stock\)/);
  assert.match(update,/expectedStock/);
  assert.match(update,/status:\s*409/);
  for (const p of ['sql/001_initial.sql','sql/002_product_stock.sql']) assert.match(read(p),/stock INT UNSIGNED NOT NULL DEFAULT 0/i);
});


test('saving a review-loaded product does not overwrite stock', async () => {
  const calls=[];
  const db={execute:async (sql,params)=>{
    calls.push([sql,params]);
    if(sql.startsWith('SELECT *')) return [[{id:1,stock:4,name:'x'}]];
    if(sql.startsWith('UPDATE')) return [{affectedRows:1}];
    return [[]];
  }};
  const product=await createModel('products',db).findById(1);
  product.averageRating=5;
  await product.save();
  const [sql]=calls.find(([sql])=>sql.startsWith('UPDATE'));
  assert.doesNotMatch(sql,/`stock`=/);
});
