import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {loadFoodComponent} from './food-render-helper.mjs';

const link={__esModule:true,default:({children,href,...props})=>React.createElement('a',{href,...props},children)};
const menu=[{id:'welcome-dish',name:'ข้าวผัด',description:'เลือกไข่เพิ่มได้',category:'ตามสั่ง',price:55,available:true,source_type:'made_to_order',image_url:'/api/images/welcome-dish',options:[]}];
async function renderMenu(t, {items=menu,settings={configured:true,order_accepting:true,accepting_now:true},transport}={}) {
  const original=globalThis.fetch;
  let tree;
  t.after(async()=>{if(tree)await act(async()=>tree.unmount());globalThis.fetch=original;});
  globalThis.fetch=transport|| (async url=>Response.json(url.endsWith('/menu')?{items}:{settings}));
  const {default:Menu}=loadFoodComponent('components/food/FoodMenu.jsx',{'next/link':link});
  await act(async()=>{tree=renderer.create(React.createElement(Menu));});
  return tree;
}

test('welcome service strip reflects confirmed settings, including delivery price and closed ordering',async t=>{
  const tree=await renderMenu(t,{settings:{configured:true,order_accepting:true,accepting_now:false,pickup_enabled:false,pickup_address:'จุดรับทดสอบ',prep_minutes:37,delivery_enabled:true,delivery_zones:[{id:'test',name:'พื้นที่ทดสอบ',enabled:true,fee:65},{id:'hidden',name:'พื้นที่ปิด',enabled:false,fee:15}],hours:{1:{open:'10:30',close:'16:45'}}}});
  const text=JSON.stringify(tree.toJSON());
  assert.match(text,/ยังไม่เปิดรับออร์เดอร์/);
  assert.match(text,/37/);
  assert.match(text,/10:30/);
  assert.match(text,/16:45/);
  assert.match(text,/พื้นที่ทดสอบ/);
  assert.match(text,/65/);
  assert.doesNotMatch(text,/พื้นที่ปิด|จุดรับทดสอบ/,'disabled service information is not offered');
  assert.equal(tree.root.findByProps({'aria-label':'เพิ่ม ข้าวผัด'}).props.disabled,true);
});

test('welcome does not offer fallback service facts when settings cannot be loaded',async t=>{
  const tree=await renderMenu(t,{transport:async()=>Response.json({error:'เชื่อมต่อร้านไม่ได้'},{status:503})});
  const hero=tree.root.findByType('header');
  const text=JSON.stringify(tree.toJSON());
  assert.match(text,/ยังไม่เปิดรับออร์เดอร์|ยังไม่สามารถตรวจสอบ/);
  assert.doesNotMatch(text,/บ้าน ทุ่งประดู่|18:00/);
  assert.equal(hero.findAllByType('img').length,0);
  assert.ok(tree.root.findByProps({role:'alert'}));
});

test('confirmed pickup details and service days remain accurate without offering disabled delivery',async t=>{
  const tree=await renderMenu(t,{settings:{configured:true,order_accepting:true,accepting_now:true,pickup_enabled:true,pickup_address:'จุดรับที่ร้านกำหนด',prep_minutes:23,delivery_enabled:false,delivery_zones:[{id:'off',name:'เขตที่ยังไม่เปิด',fee:0,enabled:true}],weekdays:[2],hours:{1:{open:'08:00',close:'12:00'},2:{open:'11:00',close:'17:00'}}}});
  const text=JSON.stringify(tree.toJSON());
  assert.match(text,/จุดรับที่ร้านกำหนด/);
  assert.match(text,/23/);
  assert.match(text,/11:00/);
  assert.doesNotMatch(text,/08:00|เขตที่ยังไม่เปิด/);
  assert.equal(tree.root.findByProps({'aria-label':'เพิ่ม ข้าวผัด'}).props.disabled,false);
});

test('welcome rejects remote image URLs and uses an available local menu image',async t=>{
  const items=[{...menu[0],id:'remote',name:'รูปภายนอก',image_url:'https://example.com/dish.jpg'},{...menu[0],id:'sold',name:'หมดแล้ว',available:false,image_url:'/api/images/sold'},...menu];
  const tree=await renderMenu(t,{items});
  assert.equal(tree.root.findByType('header').findByType('img').props.src,menu[0].image_url);
  assert.equal(tree.root.findAllByType('article').length,items.length);
});

test('welcome introduces the restaurant and leads to the actual menu toolbar with a local menu photograph',async t=>{
  const tree=await renderMenu(t);
  const hero=tree.root.findByType('header');
  assert.equal(hero.findByType('h1').children.join(''),'ครัวรัชนี');
  const cta=hero.findAllByType('a').find(a=>a.props.href==='#food-menu');
  assert.ok(cta,'welcome links directly to the menu');
  assert.match(cta.children.filter(c=>typeof c==='string').join(''),/ดูเมนูและสั่งอาหาร/);
  const target=tree.root.findByProps({id:'food-menu'});
  assert.ok(target.findByProps({'aria-label':'ค้นหาเมนู'}));
  assert.ok(hero.findAllByType('a').some(a=>a.props.href==='/food/cart'));
  assert.equal(hero.findByType('img').props.src,menu[0].image_url);
  assert.equal(hero.findByType('img').props.alt,menu[0].name);
  assert.equal(tree.root.findAllByType('article').length,menu.length);
  await act(async()=>target.findByProps({'aria-label':'ค้นหาเมนู'}).props.onChange({target:{value:'ไม่พบ'}}));
  assert.equal(tree.root.findAllByType('article').length,0);
  assert.equal(hero.findByType('img').props.src,menu[0].image_url,'filtering does not remove the welcome photograph');
});
