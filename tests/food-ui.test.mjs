import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import renderer,{act} from 'react-test-renderer';
import useFoodCart from '../store/foodCartStore.js';
import {loadFoodComponent} from './food-render-helper.mjs';
const link={__esModule:true,default:({children,href,...props})=>React.createElement('a',{href,...props},children)};

test('customer menu fetches real records and prevents ordering when closed', async () => {
  const old=globalThis.fetch; const calls=[];
  globalThis.fetch=async(url)=>{calls.push(url);return Response.json(url.endsWith('menu')?{items:[{id:'1',name:'กะเพราเต้าหู้',price:55,category:'ตามสั่ง',source_type:'made_to_order',available:true,options:[],allergens:'ถั่วเหลือง',allergens_confirmed:true}]}:{settings:{order_accepting:false,configured:false}});};
  try {
    const {default:Menu}=loadFoodComponent('components/food/FoodMenu.jsx',{'next/link':link});
    let tree; await act(async()=>{tree=renderer.create(React.createElement(Menu));});
    const text=JSON.stringify(tree.toJSON());
    assert.match(text,/กะเพราเต้าหู้/);
    assert.match(text,/ยังไม่เปิดรับออร์เดอร์/);
    assert.match(text,/บ้าน ทุ่งประดู่/);
    assert.match(text,/18:00/);
    assert.match(text,/20/);
    assert.match(text,/ถั่วเหลือง/);
    assert.equal(tree.root.findAllByType('button').find(b=>b.props['aria-label']==='เพิ่ม กะเพราเต้าหู้').props.disabled,true);
    assert.deepEqual(calls.sort(),['/api/food/menu','/api/food/settings']);
    await act(async()=>tree.unmount());
  } finally {globalThis.fetch=old;}
});


test('checkout retains food cart on network failure and retries the exact request key before confirmed redirect', async()=>{
  const old=globalThis.fetch; let attempts=0;const payloads=[],routes=[];
  useFoodCart.setState({items:[{key:'1',menu_id:'1',name:'ข้าว',price:45,quantity:1,options:{}}],clientRequestId:null,draft:{customer_name:'มาลี',phone:'0812345678',method:'pickup',scheduled_at:'2026-11-06T12:00',notes:''}});
  globalThis.fetch=async(url,init)=>{if(url.endsWith('settings'))return Response.json({settings:{order_accepting:true,configured:true,accepting_now:true,pickup_enabled:true,pickup_address:'จุดรับจริงจากฐานข้อมูล'}});payloads.push(JSON.parse(init.body));attempts++;if(attempts===1)throw new Error('เครือข่ายขัดข้อง');return Response.json({tracking_token:'b'.repeat(64),order:{id:'4',status:'pending'}});};
  try{
    const {default:Cart}=loadFoodComponent('components/food/FoodCheckout.jsx',{'next/link':link,'next/navigation':{useRouter:()=>({push:path=>routes.push(path)})}});
    let tree;await act(async()=>{tree=renderer.create(React.createElement(Cart));});
    await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
    assert.equal(useFoodCart.getState().items.length,1);assert.equal(routes.length,0);
    assert.ok(useFoodCart.getState().pendingSubmission);
    assert.equal(tree.root.findByType('fieldset').props.disabled,true);
    assert.match(JSON.stringify(tree.toJSON()),/เครือข่ายขัดข้อง/);
    await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
    assert.equal(payloads[0].client_request_id,payloads[1].client_request_id);
    assert.equal(useFoodCart.getState().items.length,0);assert.deepEqual(routes,[`/food/orders/${'b'.repeat(64)}`]);
    await act(async()=>tree.unmount());
  }finally{globalThis.fetch=old;}
});

test('tracking renders only a server-persisted order and keeps terminal rejection explicit', async()=>{
  const old=globalThis.fetch;const calls=[];
  globalThis.fetch=async(url)=>{calls.push(url);return Response.json({order:{id:'72',status:'rejected',method:'pickup',scheduled_at:'2026-11-06T12:00:00+07:00',total:55,items:[{name:'ข้าวกะเพรา',quantity:1,unit_price:55,options:[]}]}});};
  try{
    const {default:Tracking}=loadFoodComponent('components/food/FoodTracking.jsx',{'next/link':link});
    let tree;await act(async()=>{tree=renderer.create(React.createElement(Tracking,{token:'secret-token'}));});
    assert.match(JSON.stringify(tree.toJSON()),/ร้านไม่สามารถรับออร์เดอร์/);
    assert.match(JSON.stringify(tree.toJSON()),/ข้าวกะเพรา/);
    assert.deepEqual(calls,['/api/food/orders/secret-token']);
    await act(async()=>tree.unmount());
  }finally{globalThis.fetch=old;}
});
