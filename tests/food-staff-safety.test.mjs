import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import renderer,{act} from 'react-test-renderer';
import {loadFoodComponent} from './food-render-helper.mjs';
const link={__esModule:true,default:({children,href,...props})=>React.createElement('a',{href,...props},children)};

test('kitchen clears previously loaded contact details when staff authority is revoked',async()=>{
 const old=globalThis.fetch;let revoked=false;
 globalThis.fetch=async()=>revoked?Response.json({error:'Forbidden',code:'FORBIDDEN'},{status:403}):Response.json({orders:[{id:'1',status:'pending',scheduled_at:'2026-11-06T12:00:00Z',method:'delivery',customer_name:'PRIVATE-NAME',phone:'0819999999',address:'PRIVATE-ADDRESS',items:[]}],truncated:false});
 try{
  const {default:Kitchen}=loadFoodComponent('components/food/FoodKitchen.jsx',{'next/link':link});let tree;
  await act(async()=>{tree=renderer.create(React.createElement(Kitchen,{manager:true}));});assert.match(JSON.stringify(tree.toJSON()),/PRIVATE-NAME/);
  revoked=true;await act(async()=>tree.root.findAllByType('button').find(button=>button.children.includes(' อัปเดตคิว')).props.onClick());
  assert.doesNotMatch(JSON.stringify(tree.toJSON()),/PRIVATE|0819999999/);
  await act(async()=>tree.unmount());
 }finally{globalThis.fetch=old;}
});
