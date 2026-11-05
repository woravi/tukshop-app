import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function load(path,method,deps) {
  const source=read(path).replace(/^import .*;\n/gm,'').replace(/export (async function|function|const)/g,'$1');
  return new Function(...Object.keys(deps),source+`;return ${method};`)(...Object.values(deps));
}
const NextResponse={json:(body,{status=200}={})=>({status,body})};
test('owner-only user API denies before reading a request or enumerating accounts',async()=>{
  for(const [path,method] of [['app/api/admin/users/route.js','GET'],['app/api/admin/users/[id]/route.js','PATCH']]) {
    for(const status of [401,403]) {
      const handler=load(path,method,{NextResponse,authorizeRoles:async roles=>{assert.deepEqual(roles,['owner']);return {status,actor:null};},getPool:()=>{throw Error('must not read database');},listUsers:()=>{throw Error('must not list');},changeUserRole:()=>{throw Error('must not mutate');}});
      assert.equal((await handler({json:()=>{throw Error('must not parse');}},{params:Promise.resolve({id:'7'})})).status,status);
    }
  }
});
test('owner role API changes only an existing account using its authenticated actor',async()=>{
  let captured;
  const actor={id:'1',email:'owner@test',role:'owner'};
  const handler=load('app/api/admin/users/[id]/route.js','PATCH',{NextResponse,authorizeRoles:async()=>({status:200,actor}),getPool:()=>({}),changeUserRole:async(...args)=>{captured=args;return {id:'7',role:'manager'};}});
  const response=await handler({json:async()=>({role:'manager'})},{params:Promise.resolve({id:'7'})});
  assert.equal(response.status,200);
  assert.deepEqual(captured.slice(1),[actor,'7',{role:'manager'}]);
});
test('owner role API rejects malformed JSON without exposing internals',async()=>{
  const handler=load('app/api/admin/users/[id]/route.js','PATCH',{NextResponse,authorizeRoles:async()=>({status:200,actor:{id:'1'}}),getPool:()=>({}),changeUserRole:()=>{throw Error('must not mutate');}});
  const response=await handler({json:async()=>{throw new SyntaxError('private detail');}},{params:Promise.resolve({id:'7'})});
  assert.equal(response.status,400);
  assert.doesNotMatch(JSON.stringify(response),/private detail/);
});
test('image uploads and legacy full order administration use fresh owner/manager roles before side effects',async()=>{
  for(const [path,methods] of [['app/api/images/route.js',['POST']],['app/api/ordersAdmin/route.js',['GET','PUT']],['app/api/orders/route.js',['PUT']]]) {
    for(const method of methods) {
      const handler=load(path,method,{NextResponse,MAX_UPLOAD_BYTES:100,authorizeRoles:async roles=>{assert.deepEqual(roles,['owner','manager']);return {status:403,actor:{id:'7',role:'kitchen'}};}});
      assert.equal((await handler({})).status,403);
    }
  }
});
test('order detail uses fresh database identity for ownership instead of stale privilege claims',()=>{
  const source=read('app/api/orders/[orderId]/route.js');
  assert.match(source,/await authorizeRoles\(/);
  assert.match(source,/ownsOrder\(\{ user: actor \}, order\)/);
  assert.doesNotMatch(source,/getServerSession|session\.user\.admin/);
});
test('account deletion routes through locked owner retention instead of generic model deletion',()=>{
  const source=read('app/api/delete-account/route.js');
  assert.match(source,/authorizeRoles\(/);
  assert.match(source,/deleteOwnAccount\(/);
  assert.doesNotMatch(source,/findByIdAndDelete/);
});
test('role migration is additive, repeatable and promotes only pre-role legacy administrators',()=>{
  const source=read('sql/004_user_roles.sql');
  assert.match(source,/ADD COLUMN IF NOT EXISTS role/);
  assert.match(source,/role IS NULL/);
  assert.match(source,/admin\s*=\s*(1|TRUE)/i);
  assert.match(source,/DEFAULT 'customer'/);
  assert.doesNotMatch(source,/DROP TABLE|DELETE FROM|password|INSERT INTO users/i);
});
test('user role UI is server-gated and never collects or generates staff passwords',()=>{
  assert.match(read('app/admin/users/page.jsx'),/authorizeRoles\(\['owner'\]\)/);
  const source=read('app/admin/users/UsersAdmin.jsx');
  assert.match(source,/method:\s*['"]PATCH['"]/);
  assert.doesNotMatch(source,/type=['"]password|Math\.random|randomUUID|password:/);
});
