import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const React=require('react');
const {create,act}=require('react-test-renderer');
const {transformSync}=require('next/dist/build/swc');
const source=readFileSync(new URL('../app/admin/users/UsersAdmin.jsx',import.meta.url),'utf8');
const code=transformSync(source,{jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code;
function component(fetch) {
  const module={exports:{}};
  vm.runInNewContext(code,{module,exports:module.exports,require,fetch,URLSearchParams,AbortController,console});
  return module.exports.default;
}
const users=[{id:'1',email:'owner@test',name:'Owner',role:'owner'},{id:'2',email:'staff@test',name:'Staff',role:'customer'}];
test('staff administration UI locks own role and submits only role for existing account',async()=>{
  const calls=[];
  const Component=component(async(url,options={})=>{calls.push([url,options]);return {ok:true,json:async()=>options.method==='PATCH'?{user:{...users[1],role:'manager'}}:{users,hasMore:false}};});
  let view;
  await act(async()=>{view=create(React.createElement(Component,{currentUserId:'1'}));});
  const selects=view.root.findAllByType('select');
  assert.equal(selects[0].props.disabled,true);
  assert.equal(selects[1].props.value,'customer');
  await act(async()=>{selects[1].props.onChange({target:{value:'manager'}});});
  const save=view.root.findAllByType('button').find(button=>button.props.children==='บันทึก'&&!button.props.disabled);
  await act(async()=>{await save.props.onClick();});
  const mutation=calls.find(([,options])=>options.method==='PATCH');
  assert.equal(mutation[0],'/api/admin/users/2');
  assert.deepEqual(JSON.parse(mutation[1].body),{role:'manager'});
  assert.equal(view.root.findAllByType('select')[1].props.value,'manager');
  await act(async()=>{view.unmount();});
});
test('revoked owner access clears staff details and disables further role editing',async()=>{
  const Component=component(async()=>({ok:false,status:403,json:async()=>({error:'Forbidden'})}));
  let view;
  await act(async()=>{view=create(React.createElement(Component,{currentUserId:'1'}));});
  assert.equal(view.root.findAllByType('select').length,0);
  assert.equal(view.root.findAllByProps({role:'alert'})[0].props.children,'Forbidden');
  assert.doesNotMatch(JSON.stringify(view.toJSON()),/staff@test/);
  await act(async()=>{view.unmount();});
});
