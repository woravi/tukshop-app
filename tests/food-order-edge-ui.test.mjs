import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import renderer,{act} from 'react-test-renderer';
import useFoodCart from '../store/foodCartStore.js';
import {loadFoodComponent} from './food-render-helper.mjs';
const link={__esModule:true,default:({children,href,...props})=>React.createElement('a',{href,...props},children)};

test('menu UI sends structured option IDs, includes surcharges and warns about unconfirmed allergens',async()=>{
 const old=globalThis.fetch;useFoodCart.getState().clear();
 globalThis.fetch=async(url)=>Response.json(url.endsWith('menu')?{items:[{id:'1',name:'ข้าวกะเพรา',category:'ตามสั่ง',source_type:'made_to_order',available:true,price:50,allergens:'',allergens_confirmed:false,options:[{id:'egg',name:'ไข่',min:1,max:1,choices:[{id:'fried',name:'ไข่ดาว',price_adjustment:10,available:true}]}]}]}:{settings:{order_accepting:true,configured:true,accepting_now:true}});
 try{
  const {default:Menu}=loadFoodComponent('components/food/FoodMenu.jsx',{'next/link':link});let tree;await act(async()=>{tree=renderer.create(React.createElement(Menu));});
  assert.match(JSON.stringify(tree.toJSON()),/สอบถามร้านเรื่องสารก่อภูมิแพ้/);
  const add=()=>tree.root.findByProps({'aria-label':'เพิ่ม ข้าวกะเพรา'});assert.equal(add().props.disabled,true);
  await act(async()=>tree.root.findByType('select').props.onChange({target:{value:'fried'}}));
  assert.equal(add().props.disabled,false);
  await act(async()=>add().props.onClick());
  assert.equal(useFoodCart.getState().items[0].price,60);assert.deepEqual(useFoodCart.getState().items[0].options,[{group_id:'egg',choice_ids:['fried']}]);
  await act(async()=>tree.unmount());useFoodCart.getState().clear();
 }finally{globalThis.fetch=old;}
});
