import test from 'node:test';
import assert from 'node:assert/strict';
import { createModel, localImageIds, validateImageUrls } from '../lib/mysql-model.mjs';
import { resizeImage } from '../lib/product-image.mjs';
import sharp from 'sharp';
import { readFileSync, existsSync } from 'node:fs';

test('order updates await SQL update rather than chaining populate on a promise', () => {
  for (const path of ['orders/route.js','ordersAdmin/route.js']) {
    const route=readFileSync(new URL(`../app/api/${path}`,import.meta.url),'utf8');
    assert.doesNotMatch(route,/\)\.populate\(\{/);
  }
});

test('backend API and utils do not retain Cloudinary adapter', () => {
  assert.equal(existsSync(new URL('../utils/cloudinary.js',import.meta.url)),false);
});

test('notification updates use SQL JSON object instead of Mongo $set paths', () => {
  const route=readFileSync(new URL('../app/api/update-notification-preferences/route.js',import.meta.url),'utf8');
  assert.doesNotMatch(route,/\$set/);
  assert.match(route,/notificationPreferences/);
});

test('product search only filters columns present in SQL schema', () => {
  const search=readFileSync(new URL('../app/api/products/[search]/route.js',import.meta.url),'utf8');
  assert.doesNotMatch(search,/shortDescription/);
});

test('product mutations use session ownership and reject external image URLs', () => {
  const create=readFileSync(new URL('../app/api/products/route.js',import.meta.url),'utf8');
  const update=readFileSync(new URL('../app/api/product/[productId]/route.js',import.meta.url),'utf8');
  assert.match(create,/user:\s*session\.user\._id/);
  assert.match(create,/validateImageUrls\(images\)/);
  assert.match(update,/validateImageUrls\(body\.images\)/);
});

test('model modules load without opening a connection at build time', async () => {
  const {default:User} = await import('../utils/models/User.js');
  assert.equal(typeof User.findOne,'function');
});

test('review routes no longer depend on mongoose object IDs', () => {
  for (const path of ['review/route.js','review/canReview/route.js']) assert.doesNotMatch(readFileSync(new URL(`../app/api/${path}`,import.meta.url),'utf8'),/mongoose|Types\.ObjectId/);
});

test('image API requires admin before reading uploads and delivers binary from SQL', () => {
  const post = readFileSync(new URL('../app/api/images/route.js',import.meta.url),'utf8');
  const get = readFileSync(new URL('../app/api/images/[id]/route.js',import.meta.url),'utf8');
  assert.ok(post.indexOf('adminAccessStatus(session)') < post.indexOf('await boundedFormData(req)'));
  assert.match(post, /resizeImage/);
  assert.match(post, /INSERT INTO product_images/);
  assert.match(get, /SELECT mime,data/);
});

test('schema has relational product images, order items, reviews, and wishlist', () => {
  const sql = readFileSync(new URL('../sql/001_initial.sql',import.meta.url),'utf8');
  for (const table of ['users','products','product_images','orders','order_items','reviews','wishlists']) assert.match(sql,new RegExp(`CREATE TABLE ${table}\\b`));
  assert.match(sql,/LONGBLOB/);
});

test('backend models and DB connection never import MongoDB', () => {
  for (const path of ['utils/config/dbConnection.js',...['User','Product','Order','Review'].map(x=>`utils/models/${x}.js`)]) {
    assert.doesNotMatch(readFileSync(new URL(`../${path}`, import.meta.url),'utf8'), /mongoose|mongodb|MONGO_URI/i, path);
  }
});
import { databaseConfig } from '../lib/mysql-config.mjs';

test('MySQL configuration refuses absent secrets and defaults to Hostinger IPv4 loopback', () => {
  assert.throws(() => databaseConfig({}), /DB_NAME|DB_USER|DB_PASSWORD/);
  assert.deepEqual(databaseConfig({DB_NAME:'shop', DB_USER:'shop_user',DB_PASSWORD:'secret'}), {
    host:'127.0.0.1',port:3306,user:'shop_user',password:'secret',database:'shop',
    waitForConnections:true,connectionLimit:10,decimalNumbers:true,
  });
});

test('product queries bind user input instead of interpolating SQL', async () => {
  const calls = [];
  const db = { execute: async (sql, params) => { calls.push([sql, params]); return [[], []]; } };
  const Product = createModel('products', db);
  await Product.find({ name: { $regex: /x' OR 1=1/i } }).sort({createdAt:-1}).limit(5);
  assert.match(calls[0][0], /LIKE \?/);
  assert.equal(calls[0][1][0], "%x' OR 1=1%");
  assert.doesNotMatch(calls[0][0], /OR 1=1/);
});

test('product images reject remote or arbitrary URLs', () => {
  assert.deepEqual(localImageIds(['/api/images/7', '/api/images/12']), [7, 12]);
  assert.throws(() => validateImageUrls(['https://evil.test/a.jpg']), /image/i);
  assert.throws(() => validateImageUrls(['/api/images/1?other=x']), /image/i);
});

test('product creation rolls back when an uploaded image is missing', async () => {
  const calls=[];
  const db={execute:async(sql,args)=>{calls.push(sql); if(sql.startsWith('SELECT id,product_id')) return [[],[]]; if(sql.startsWith('INSERT INTO products')) return [{insertId:7},[]]; return [[],[]];},getConnection:async()=>({execute:db.execute,beginTransaction:async()=>calls.push('BEGIN'),commit:async()=>calls.push('COMMIT'),rollback:async()=>calls.push('ROLLBACK'),release:()=>{}})};
  await assert.rejects(createModel('products',db).create({name:'Watch',images:['/api/images/123']}),/ownership/);
  assert.ok(calls.indexOf('BEGIN') >= 0 && calls.indexOf('BEGIN') < calls.findIndex(x=>x.startsWith('INSERT INTO products')));
  assert.ok(calls.includes('ROLLBACK'));
  assert.ok(!calls.includes('COMMIT'));
});

test('invalid image ownership cannot partially modify product data', async () => {
  const calls=[];
  const db={
    execute: async (sql,args) => {calls.push(sql); if(sql.startsWith('SELECT id,product_id')) return [[{id:2,product_id:99}],[]]; if(sql.startsWith('SELECT * FROM products')) return [[{id:1,name:'Old'}],[]]; if(sql.startsWith('SELECT id FROM product_images')) return [[],[]]; return [{affectedRows:1},[]];},
    getConnection: async () => ({execute:db.execute,beginTransaction:async()=>calls.push('BEGIN'),commit:async()=>calls.push('COMMIT'),rollback:async()=>calls.push('ROLLBACK'),release:()=>calls.push('RELEASE')})
  };
  const Product=createModel('products',db);
  await assert.rejects(Product.findByIdAndUpdate(1,{name:'New',images:['/api/images/2']}),/ownership/);
  assert.ok(calls.indexOf('ROLLBACK')>=0);
  assert.ok(!calls.some(x=>x.startsWith('UPDATE products')));
});

test('image bytes are decoded and resized to bounded webp', async () => {
  const input = await sharp({create:{width:2100,height:1700,channels:3,background:'#fff'}}).png().toBuffer();
  const result = await resizeImage(input, 'image/png');
  assert.equal(result.mime, 'image/webp');
  assert.ok(result.data.length < input.length);
  const meta = await sharp(result.data).metadata();
  assert.ok(meta.width <= 1600 && meta.height <= 1600);
  await assert.rejects(resizeImage(Buffer.from('not an image'), 'image/png'), /image/i);
  await assert.rejects(resizeImage(input, 'image/svg+xml'), /image/i);
});
