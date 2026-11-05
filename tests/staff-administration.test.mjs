import test from 'node:test';
import assert from 'node:assert/strict';
import { changeUserRole, deleteOwnAccount, listUsers } from '../lib/user-administration.mjs';
function database(rows) {
  const calls=[];
  const execute=async(sql,params)=>{
    calls.push([sql,params]);
    if(sql.startsWith('SELECT')) return [rows.map(row=>({...row}))];
    if(sql.startsWith('UPDATE')) { const user=rows.find(row=>String(row.id)===params[2]); user.role=params[0];user.admin=params[1]; return [{affectedRows:1}]; }
    if(sql.startsWith('DELETE')) {rows.splice(rows.findIndex(row=>String(row.id)===params[0]),1);return [{affectedRows:1}];}
    throw Error(sql);
  };
  return {calls,execute,getConnection:async()=>({execute,beginTransaction:async()=>calls.push(['BEGIN']),commit:async()=>calls.push(['COMMIT']),rollback:async()=>calls.push(['ROLLBACK']),release:()=>calls.push(['RELEASE'])})};
}
const owner={id:'1',role:'owner',email:'owner@test'};
const users=()=>[{id:1,email:'owner@test',name:'Owner',role:'owner'},{id:2,email:'other@test',name:'Other',role:'customer'}];
test('owner changes an existing registered user role with row locks and compatibility admin in one transaction',async()=>{
  const db=database(users());
  const result=await changeUserRole(db,owner,'2',{role:'manager'});
  assert.equal(result.role,'manager');
  assert.equal(result.id,'2');
  const lock=db.calls.findIndex(([s])=>s.includes('FOR UPDATE'));
  const write=db.calls.findIndex(([s])=>s.startsWith('UPDATE'));
  assert.ok(lock>0 && write>lock);
  assert.deepEqual(db.calls[write][1],['manager',true,'2']);
  assert.ok(db.calls.find(([s])=>s==='COMMIT'));
});
test('changing a role rechecks the acting owner under lock to close revocation races',async()=>{
  const db=database(users().map(u=>u.id===1?{...u,role:'manager'}:u));
  await assert.rejects(changeUserRole(db,owner,'2',{role:'owner'}),{status:403});
  assert.ok(!db.calls.some(([s])=>s.startsWith('UPDATE')));
  assert.ok(db.calls.some(([s])=>s==='ROLLBACK'));
});
test('owner self-demotion is blocked even with another owner',async()=>{
  const rows=users(); rows[1].role='owner';const db=database(rows);
  await assert.rejects(changeUserRole(db,owner,'1',{role:'customer'}),{status:409});
});
test('unknown roles, privilege payload extras, malformed IDs, and absent users cannot create accounts',async()=>{
  for(const [id,body] of [['2',{role:'administrator'}],['2',{role:'owner',password:'shared'}],['2',{role:'owner',admin:true}],['2 OR 1=1',{role:'owner'}]]) {
    const db=database(users()); await assert.rejects(changeUserRole(db,owner,id,body),{status:400});
    assert.ok(!db.calls.some(([s])=>/^(INSERT|UPDATE)/.test(s)));
  }
  await assert.rejects(changeUserRole(database(users()),owner,'88',{role:'kitchen'}),{status:404});
});
test('owner account deletion cannot bypass owner retention; customer deletion is locked',async()=>{
  const db=database(users());
  await assert.rejects(deleteOwnAccount(db,owner),{status:409});
  assert.ok(!db.calls.some(([s])=>s.startsWith('DELETE')));
  assert.deepEqual(await deleteOwnAccount(db,{id:'2'}),{deleted:true});
  assert.ok(db.calls.some(([s])=>s.startsWith('DELETE')));
});
test('staff list uses bounded pagination and selects no passwords, preferences or other private fields',async()=>{
  const db=database(users());
  await listUsers(db,{page:1,limit:20,search:'% OR 1=1'});
  const [sql,params]=db.calls[0];
  assert.match(sql,/SELECT id,name,email,role,createdAt/);
  assert.doesNotMatch(sql,/SELECT \*|password|notificationPreferences/);
  assert.doesNotMatch(sql,/OR 1=1/);
  assert.ok(params.includes('% OR 1=1'));
  await assert.rejects(listUsers(db,{page:-1}),{status:400});
});
