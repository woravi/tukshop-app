import test from 'node:test';
import assert from 'node:assert/strict';
import { createModel } from '../lib/mysql-model.mjs';

test('category is persisted independently from brand and invalid categories are rejected', async () => {
  const calls=[];
  const db={execute:async (sql,params)=>{ calls.push([sql,params]); if(sql.startsWith('INSERT')) return [{insertId:1}]; if(sql.startsWith('SELECT * FROM products')) return [[{id:1,category:'กระเป๋าถือ',brand:'Brand',stock:0}]]; if(sql.startsWith('SELECT * FROM product_categories')) return [!params || params[0]==='กระเป๋าถือ'?[{id:1,name:'กระเป๋าถือ'}]:[]]; return [[]]; }};
  const Product=createModel('products',db);
  const item=await Product.create({name:'bag',brand:'Brand',category:'กระเป๋าถือ'});
  assert.equal(item.category,'กระเป๋าถือ');
  assert.match(calls.find(([sql])=>sql.startsWith('INSERT INTO products'))[0],/`category`/);
  await assert.rejects(Product.create({category:'watch'}),/category/i);
  await assert.rejects(Product.findByIdAndUpdate(1,{category:'watch'}),/category/i);
  await Product.create({category:null});
});


test('admin forms and APIs expose nullable bag category without watch fields', async () => {
  const {readFileSync}=await import('node:fs');
  const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
  for (const p of ['app/create/page.jsx','app/editProduct/[productId]/page.jsx']) {
    const form=read(p);
    assert.match(form,/CategorySelect/);
    assert.match(read('components/CategorySelect.jsx'),/name="category"/);
    assert.doesNotMatch(form,/name="(?:movement|bracelet|glass|luminova|casematerial|crown|bandsize|lugs|water|thickness)"/);
    assert.doesNotMatch(form,/Seiko|Rolex|Watch Condition/);
  }
  assert.match(read('app/api/products/route.js'),/validateCategory/);
  assert.match(read('app/api/product/[productId]/route.js'),/validateCategory/);
  assert.match(read('sql/003_product_category.sql'),/ADD COLUMN IF NOT EXISTS category VARCHAR\(255\) NULL/i);
});
