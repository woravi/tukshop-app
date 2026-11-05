import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const module=await import('../lib/food-http.mjs').catch(()=>({}));
const request=(method='GET',body,headers={})=>new Request('https://shop.test/api/food/menu',{method,headers:{...(body?{'content-type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
test('food HTTP auth protects writes before touching database, bounds JSON and blocks cross-origin writes',async()=>{
 assert.equal(typeof module.createFoodHandlers,'function');
 let calls=0;let status=401;
 const handlers=module.createFoodHandlers({authorizeRoles:async()=>({status,actor:status===200?{id:'1',role:'owner'}:null}),getService:()=>{calls++;return {saveMenu:async v=>({id:'1',...v}),createOrder:async()=>({order:{id:'1'},replayed:false})};}});
 const denied=await handlers.menuPost(request('POST',{name:'meal'}));assert.equal(denied.status,401);assert.equal(calls,0);
 status=200;
 const forbidden=await handlers.menuPost(request('POST',{name:'meal'},{origin:'https://evil.test'}));assert.equal(forbidden.status,403);assert.equal(calls,0);
 const oversized=await handlers.menuPost(request('POST',{name:'a'.repeat(70000)}));assert.equal(oversized.status,400);assert.equal(calls,0);
 const malformed=await handlers.menuPost(new Request('https://shop.test/api/food/menu',{method:'POST',headers:{'content-type':'application/json'},body:'{'}));assert.equal(malformed.status,400);
 const saved=await handlers.menuPost(request('POST',{name:'meal'}));assert.equal(saved.status,201);assert.deepEqual(await saved.json(),{item:{id:'1',name:'meal'}});
 assert.equal(saved.headers.get('cache-control'),'no-store');
 const order=await handlers.orderPost(request('POST',{anything:true}));assert.equal(order.status,201);
});
test('food HTTP response shapes await params, preserve idempotency status and redact unexpected errors',async()=>{
 const calls=[];
 const service={getSettings:async()=>({order_accepting:false}),putSettings:async(v,a)=>{calls.push(['settings',v,a]);return v;},listMenu:async(inactive,a)=>{calls.push(['menu',inactive,a]);return [];},saveMenu:async(v,id)=>{calls.push(['save',id]);return {id,...v};},deleteMenu:async id=>{calls.push(['delete',id]);return {ok:true};},createOrder:async()=>({order:{id:'1'},tracking_token:'a'.repeat(64),replayed:true}),trackOrder:async token=>{calls.push(['track',token]);return {id:'1'};},listOrders:async(date,a)=>{calls.push(['list',date,a]);return {orders:[],truncated:false};},updateOrder:async(id,v,a)=>{calls.push(['update',id,v,a]);return {id,status:v.status};}};
 const actor={id:'1',role:'owner'},roles=[];
 const h=module.createFoodHandlers({getService:()=>service,authorizeRoles:async list=>{roles.push(list);return {status:200,actor};}});
 assert.deepEqual(await (await h.settingsGet(request())).json(),{settings:{order_accepting:false}});
 await h.settingsPut(request('PUT',{order_accepting:false}));
 assert.deepEqual(await (await h.menuGet(new Request('https://shop.test/api/food/menu?include_inactive=1'))).json(),{items:[]});
 await h.menuPut(request('PUT',{name:'food'}),{params:Promise.resolve({id:'9'})});
 await h.menuDelete(request('DELETE'),{params:Promise.resolve({id:'9'})});
 const replay=await h.orderPost(request('POST',{customer_name:'guest'}));assert.equal(replay.status,200);
 await h.orderGet(request(),{params:Promise.resolve({token:'a'.repeat(64)})});
 await h.adminOrdersGet(new Request('https://shop.test/api/food/admin/orders?date=2026-11-05'));
 await h.adminOrderPatch(request('PATCH',{status:'accepted'}),{params:Promise.resolve({id:'1'})});
 assert.ok(calls.some(c=>c[0]==='save'&&c[1]==='9'));assert.ok(calls.some(c=>c[0]==='update'&&c[1]==='1'));
 assert.ok(roles.some(r=>r.includes('kitchen')));
 service.getSettings=async()=>{throw Error('password/address/secret');};
 const failed=await h.settingsGet(request());assert.equal(failed.status,500);assert.equal((await failed.text()).includes('password'),false);
});
test('food route files connect every endpoint and await dynamic params',async()=>{
 for(const [path,methods] of Object.entries({'settings':['GET','PUT'],'menu':['GET','POST'],'menu/[id]':['PUT','DELETE'],'orders':['POST'],'orders/[token]':['GET'],'admin/orders':['GET'],'admin/orders/[id]':['PATCH']})) {
  const source=await readFile(new URL(`../app/api/food/${path}/route.js`,import.meta.url),'utf8').catch(()=>'');
  for(const method of methods)assert.match(source,new RegExp(`export (?:const|async function) ${method}`));
  assert.match(source,/nodejs/);
 }
});
