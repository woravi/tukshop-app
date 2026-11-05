import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import renderer,{act} from 'react-test-renderer';
import {loadFoodComponent} from './food-render-helper.mjs';
const link={__esModule:true,default:({children,href,...props})=>React.createElement('a',{href,...props},children)};

test('manager edits real menu via PUT and reads database-backed list before success',async()=>{
 const old=globalThis.fetch,calls=[];
 let menu={id:'8',name:'ข้าวผัด',description:'',category:'ตามสั่ง',price:50,source_type:'made_to_order',available:true,allergens:'',allergens_confirmed:false,options:[],stock:0,daily_limit:null,image_url:null};
 globalThis.fetch=async(url,init={})=>{calls.push({url,method:init.method||'GET'});if(init.method==='PUT'){menu={...menu,...JSON.parse(init.body)};return Response.json({item:menu});}return Response.json({items:[menu]});};
 try{
  const {default:Admin}=loadFoodComponent('components/food/FoodMenuAdmin.jsx',{'next/link':link});
  let tree;await act(async()=>{tree=renderer.create(React.createElement(Admin));});
  await act(async()=>tree.root.findAllByType('button').find(b=>b.props['aria-label']==='แก้ไข ข้าวผัด').props.onClick());
  await act(async()=>tree.root.findByProps({name:'name'}).props.onChange({target:{name:'name',value:'ข้าวผัดไข่'}}));
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.equal(menu.name,'ข้าวผัดไข่');
  assert.deepEqual(calls.map(c=>c.method),['GET','PUT','GET']);
  assert.equal(calls[1].url,'/api/food/menu/8');
  assert.match(JSON.stringify(tree.toJSON()),/บันทึกเมนูแล้ว/);
  await act(async()=>tree.unmount());
 }finally{globalThis.fetch=old;}
});

test('settings never invent hours or address and save explicit weekday Bangkok configuration',async()=>{
 const old=globalThis.fetch,calls=[];let settings={timezone:'Asia/Bangkok',weekdays:[1,2,3,4,5],order_accepting:false,pickup_enabled:true,delivery_enabled:false,hours:{},pickup_address:'',delivery_zones:[],prep_minutes:null,daily_capacity:null,configured:false,online_payment_enabled:false};
 globalThis.fetch=async(url,init={})=>{calls.push({url,method:init.method||'GET',body:init.body});if(init.method==='PUT'){settings={...settings,...JSON.parse(init.body)};}return Response.json({settings});};
 try{
  const {default:Settings}=loadFoodComponent('components/food/FoodSettings.jsx',{'next/link':link});let tree;
  await act(async()=>{tree=renderer.create(React.createElement(Settings));});
  assert.equal(tree.root.findByProps({name:'pickup_address'}).props.value,'บ้าน ทุ่งประดู่');
  assert.equal(tree.root.findByProps({name:'hours-1-open'}).props.value,'');
  await act(async()=>tree.root.findByProps({name:'pickup_address'}).props.onChange({target:{name:'pickup_address',value:'จุดรับที่เจ้าของระบุ'}}));
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.deepEqual(calls.map(call=>call.method),['GET','PUT','GET']);
  const body=JSON.parse(calls[1].body);assert.equal(body.prep_minutes,20);assert.equal(body.daily_capacity,0);assert.equal(body.order_accepting,false);assert.equal(body.timezone,'Asia/Bangkok');assert.deepEqual(body.weekdays,[1,2,3,4,5]);assert.equal(body.pickup_address,'จุดรับที่เจ้าของระบุ');
  assert.match(JSON.stringify(tree.toJSON()),/บันทึกการตั้งค่าแล้ว/);
  await act(async()=>tree.unmount());
 }finally{globalThis.fetch=old;}
});

test('kitchen transitions use PATCH then read back persisted state without exposing customer contacts',async()=>{
 const old=globalThis.fetch,calls=[];let order={id:'12',status:'preparing',method:'pickup',scheduled_at:'2026-11-06T12:00:00+07:00',customer_name:'PRIVATE-NAME',phone:'0819999999',address:'PRIVATE-ADDRESS',notes:'ไม่ใส่ถั่ว',items:[{menu_id:'1',name:'ผัดไทย',quantity:2,unit_price:60,options:[]}]};
 globalThis.fetch=async(url,init={})=>{calls.push({url,method:init.method||'GET',body:init.body});if(init.method==='PATCH'){order={...order,...JSON.parse(init.body)};return Response.json({order});}return Response.json({orders:[order],truncated:false});};
 try{
  const {default:Kitchen}=loadFoodComponent('components/food/FoodKitchen.jsx',{'next/link':link});let tree;
  await act(async()=>{tree=renderer.create(React.createElement(Kitchen,{manager:false}));});
  const text=JSON.stringify(tree.toJSON());assert.match(text,/ผัดไทย/);assert.match(text,/ไม่ใส่ถั่ว/);assert.doesNotMatch(text,/PRIVATE|0819999999/);
  assert.equal(tree.root.findAllByType('button').some(button=>button.props['aria-label']==='ยืนยันรับชำระ 12'),false);
  await act(async()=>tree.root.findByProps({'aria-label':'พร้อมรับ 12'}).props.onClick());
  assert.deepEqual(calls.map(call=>call.method),['GET','PATCH','GET']);assert.equal(JSON.parse(calls[1].body).status,'ready');assert.match(JSON.stringify(tree.toJSON()),/อัปเดตออร์เดอร์แล้ว/);
  await act(async()=>tree.unmount());
 }finally{globalThis.fetch=old;}
});
