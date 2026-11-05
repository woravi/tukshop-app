import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
async function auth(user) {
  const source=read('app/api/auth/[...nextauth]/route.js').replace(/^import .*;\n/gm,'').replace('export const authOptions','const authOptions').replace('export {handler as GET, handler as POST};','');
  const User={findById:async()=>user,findOne:()=>({select:async()=>user})};
  return new Function('User','connect','NextAuth','CredentialsProvider','GoogleProvider','bcryptjs','isAdminRole',source+'; return authOptions;')(User,async()=>{},()=>{},x=>x,x=>x,{compare:async()=>true},r=>r==='owner'||r==='manager');
}
test('session privileges are refreshed from the database despite a stale owner JWT',async()=>{
  const options=await auth({_id:'7',email:'real@test',name:'Current',role:'customer',profileImage:'/x'});
  const result=await options.callbacks.session({session:{user:{}},token:{_id:'7',email:'fake@test',role:'owner',admin:true}});
  assert.equal(result.user.role,'customer');
  assert.equal(result.user.admin,false);
  assert.equal(result.user.email,'real@test');
});
test('manager retains legacy admin UI flag but kitchen does not',async()=>{
  for(const role of ['owner','manager','kitchen','customer']) {
    const options=await auth({_id:'7',email:'real@test',role});
    const result=await options.callbacks.session({session:{user:{}},token:{_id:'7'}});
    assert.equal(result.user.admin,['owner','manager'].includes(role));
    assert.equal(result.user.role,role);
  }
});
test('deleted database user does not retain an authenticated session identity',async()=>{
  const options=await auth(null);
  const result=await options.callbacks.session({session:{user:{email:'old@test',admin:true}},token:{_id:'7'}});
  assert.equal(result.user,null);
});
test('client session updates cannot replace the signed account identity or privilege',async()=>{
  const options=await auth({_id:'7',email:'real@test',role:'customer'});
  const token=await options.callbacks.jwt({token:{_id:'7',email:'real@test',role:'customer',admin:false},trigger:'update',session:{user:{_id:'1',email:'owner@test',role:'owner',admin:true,name:'New'}}});
  assert.equal(token._id,'7');
  assert.equal(token.email,'real@test');
  assert.equal(token.role,'customer');
  assert.equal(token.admin,false);
});
test('all public registration paths explicitly persist customer privileges and ignore supplied elevation',async()=>{
  const registration=read('app/api/register/route.js');
  assert.match(registration,/role:\s*['"]customer['"]/);
  assert.match(registration,/admin:\s*false/);
  const login=read('app/api/auth/[...nextauth]/route.js');
  assert.equal((login.match(/role:\s*['"]customer['"]/g)||[]).length,2);
  assert.equal((login.match(/admin:\s*false/g)||[]).length,2);
  assert.doesNotMatch(registration,/const \{[^}]*\b(role|admin)\b[^}]*\} = await request\.json/);
});

test('public registration ignores an attempted owner/admin injection at execution time',async()=>{
  let created;
  class User {
    constructor(data) { created=data; }
    static async findOne() { return null; }
    async save() { return {_id:'8',name:created.name,email:created.email}; }
  }
  const source=read('app/api/register/route.js').replace(/^import .*;\n/gm,'').replace('export async function','async function');
  const handler=new Function('User','connect','bcryptjs','NextResponse',source+';return POST;')(User,async()=>{},{genSalt:async()=>'',hash:async()=>'(test fixture)'},{json:(body,options={})=>({body,status:options.status??200})});
  const result=await handler({json:async()=>({name:'Customer',email:'customer@test',password:'test input only',role:'owner',admin:true})});
  assert.equal(result.status,200);
  assert.equal(created.role,'customer');
  assert.equal(created.admin,false);
  assert.deepEqual(Object.keys(result.body.user),['id','name','email']);
});

test('anonymous server authorization returns 401 without opening a database pool',async()=>{
  const source=read('lib/server-access.js').replace(/^import .*;\n/gm,'').replace('export async function','async function');
  const {authorizeSessionRoles}=await import('../lib/role-authority.mjs');
  const handler=new Function('getServerSession','authOptions','getPool','authorizeSessionRoles',source+';return authorizeRoles;')(async()=>null,{},()=>{throw Error('Database configuration should not be required for anonymous denial');},authorizeSessionRoles);
  assert.deepEqual(await handler(['owner']),{status:401,actor:null});
});

test('fresh server authority always resolves a server session before SQL',async()=>{
  const source=read('lib/server-access.js').replace(/^import .*;\n/gm,'').replace('export async function','async function');
  const events=[];
  const authorizeRoles=new Function('getServerSession','authOptions','getPool','authorizeSessionRoles',source+';return authorizeRoles;')(async()=>{events.push('session');return {user:{_id:'7'}};},{},()=>({}),async(s,roles)=>{events.push('sql');return {status:200,actor:{id:s.user._id,role:roles[0]}};});
  assert.equal((await authorizeRoles(['owner'])).actor.role,'owner');
  assert.deepEqual(events,['session','sql']);
});
