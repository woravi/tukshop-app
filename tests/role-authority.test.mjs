import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeSessionRoles } from '../lib/role-authority.mjs';

const session = {user:{_id:'7',email:'old@example.test',role:'owner',admin:true}};
test('authorization reloads role and identity from SQL rather than stale session privileges', async () => {
  const calls=[];
  const db={execute:async(...args)=>{calls.push(args);return [[{id:7,email:'current@example.test',role:'customer'}]];}};
  assert.deepEqual(await authorizeSessionRoles(session,['owner'],db),{status:403,actor:{id:'7',email:'current@example.test',role:'customer'}});
  assert.match(calls[0][0],/SELECT id,email,role FROM users WHERE id=\?/);
  assert.deepEqual(calls[0][1],['7']);
});
test('missing sessions and deleted accounts are unauthorized, unknown SQL roles fail closed', async () => {
  const db={execute:async()=>[[]]};
  assert.deepEqual(await authorizeSessionRoles(null,['owner'],{execute:()=>{throw Error('must not query');}}),{status:401,actor:null});
  assert.deepEqual(await authorizeSessionRoles(session,['owner'],db),{status:401,actor:null});
  assert.deepEqual(await authorizeSessionRoles(session,['owner'],{execute:async()=>[[{id:7,email:'x',role:'superadmin',admin:1}]]}),{status:403,actor:null});
});
test('each role has explicit access and a stale admin flag cannot override the SQL role', async () => {
  for (const role of ['owner','manager','kitchen','customer']) {
    const db={execute:async()=>[[{id:7,email:'x@example.test',role,admin:1}]]};
    assert.equal((await authorizeSessionRoles(session,['owner','manager'],db)).status,['owner','manager'].includes(role)?200:403);
    assert.equal((await authorizeSessionRoles(session,['owner'],db)).status,role==='owner'?200:403);
  }
});
test('malformed session identifiers cannot fall back to attacker-selected email', async () => {
  const db={execute:()=>{throw Error('must not query');}};
  assert.equal((await authorizeSessionRoles({user:{email:'owner@example.test'}},['owner'],db)).status,401);
  assert.equal((await authorizeSessionRoles({user:{_id:'7 OR 1=1',email:'owner@example.test'}},['owner'],db)).status,401);
});
