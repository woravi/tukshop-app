import test from 'node:test';
import assert from 'node:assert/strict';
import {createFoodHandlers} from '../lib/food-http.mjs';

test('configured public origin permits real browser writes behind an internal reverse-proxy URL',async()=>{
 const writes=[];
 const h=createFoodHandlers({publicOrigin:'https://tukshop.ratchavit.com',authorizeRoles:async()=>({status:200,actor:{id:'1',role:'owner'}}),getService:()=>({putSettings:async v=>{writes.push(v);return v;}})});
 const req=new Request('http://localhost:3000/api/food/settings',{method:'PUT',headers:{'content-type':'application/json',origin:'https://tukshop.ratchavit.com','sec-fetch-site':'same-origin'},body:JSON.stringify({daily_capacity:50})});
 const response=await h.settingsPut(req);
 assert.equal(response.status,200);
 assert.deepEqual(writes,[{daily_capacity:50}]);
});

test('proxy origin check still blocks foreign and internal origins, cross-site requests and forged forwarding headers',async()=>{
 let writes=0;
 const h=createFoodHandlers({publicOrigin:'https://tukshop.ratchavit.com',authorizeRoles:async()=>({status:200,actor:{id:'1',role:'owner'}}),getService:()=>{writes++;return {putSettings:async v=>v};}});
 for(const headers of [
  {origin:'https://evil.example','x-forwarded-host':'evil.example','x-forwarded-proto':'https'},
  {origin:'http://localhost:3000'},
  {origin:'https://tukshop.ratchavit.com.evil.example'},
  {origin:'null'},
  {origin:'https://tukshop.ratchavit.com','sec-fetch-site':'cross-site'}
 ]){
  const req=new Request('http://localhost:3000/api/food/settings',{method:'PUT',headers:{'content-type':'application/json',...headers},body:'{}'});
  assert.equal((await h.settingsPut(req)).status,403);
 }
 assert.equal(writes,0);
});

test('runtime NEXTAUTH_URL supplies canonical origin when no test override is passed',async()=>{
 const previous=process.env.NEXTAUTH_URL;
 try{
  process.env.NEXTAUTH_URL='https://tukshop.ratchavit.com';
  const h=createFoodHandlers({authorizeRoles:async()=>({status:200,actor:{id:'1',role:'owner'}}),getService:()=>({putSettings:async v=>v})});
  const req=new Request('http://localhost:3000/api/food/settings',{method:'PUT',headers:{'content-type':'application/json',origin:'https://tukshop.ratchavit.com'},body:'{}'});
  assert.equal((await h.settingsPut(req)).status,200);
 }finally{if(previous===undefined)delete process.env.NEXTAUTH_URL;else process.env.NEXTAUTH_URL=previous;}
});
