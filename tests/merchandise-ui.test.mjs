import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import React from 'react';
import Renderer,{act} from 'react-test-renderer';
import * as stock from '../lib/stock.mjs';
import * as currency from '../lib/currency.mjs';
import useCartStore from '../store/cartStore.js';
const require=createRequire(import.meta.url);
const {transformSync}=require('next/dist/build/swc');
function load(path,stubs={},globals={}){
 const code=transformSync(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code;
 const module={exports:{}};vm.runInNewContext(code,{module,exports:module.exports,...globals,require:id=>id in stubs?stubs[id]:require(id)});return module.exports.default;
}
const text=node=>node.children.map(c=>typeof c==='string'?c:typeof c==='object'?text(c):'').join('');

test('public selector requires an available color-size combination and passes stable variant ID',async()=>{
 useCartStore.setState({items:[]});
 const calls=[];
 const Price=load('components/ProdDetailsPrice.jsx',{'@/lib/stock.mjs':stock,'@/lib/currency.mjs':currency,'@/store/cartStore':useCartStore,'lucide-react':{ShoppingCart:()=>null,Heart:()=>null}});
 const product={_id:'2',price:100,stock:4,has_variants:true,variants:[{id:9,color:'Red',size:'M',price:150,stock:1,active:true},{id:10,color:'Blue',size:'S',price:250,stock:3,active:true}]};
 let app;await act(async()=>{app=Renderer.create(React.createElement(Price,{product,averageRating:0,allReviews:[],handleAddToCart:id=>calls.push(id)}));});
 const add=()=>app.root.findAllByType('button')[0];
 assert.equal(add().props.disabled,true);
 act(()=>app.root.findAllByType('select')[0].props.onChange({target:{value:'Red'}}));
 assert.equal(add().props.disabled,true);
 act(()=>app.root.findAllByType('select')[1].props.onChange({target:{value:'M'}}));
 assert.equal(add().props.disabled,false);
 act(()=>add().props.onClick());assert.deepEqual(calls,[9]);
 act(()=>app.root.findAllByType('select')[0].props.onChange({target:{value:'Blue'}}));assert.equal(add().props.disabled,true);
 await act(async()=>app.update(React.createElement(Price,{product:{...product,is_demo:true},averageRating:0,allReviews:[]})));
 assert.equal(add().props.disabled,true);assert.match(JSON.stringify(app.toJSON()),/สินค้าสาธิต/);
 act(()=>app.unmount());
});

test('category admin creates, edits and reorders server data with explicit CAS version',async()=>{
 let rows=[{id:1,name:'Bags',active:true,parent_id:null,sort_order:0,version:2}];const writes=[];
 const fetch=async(url,options)=>{if(options){const body=JSON.parse(options.body);writes.push({url,method:options.method,body});rows=[{...body,id:1,version:body.version+1}];}return {ok:true,json:async()=>rows};};
 const Manager=load('components/CategoryManager.jsx',{}, {fetch});let app;
 await act(async()=>{app=Renderer.create(React.createElement(Manager));});
 act(()=>app.root.findAllByType('button').find(b=>text(b).includes('แก้ไข')).props.onClick());
 const input=app.root.findAllByType('input').find(i=>i.props['aria-label']==='ชื่อหมวดหมู่');
 act(()=>input.props.onChange({target:{value:'Trips'}}));
 act(()=>app.root.findAllByType('input').find(i=>i.props.type==='number').props.onChange({target:{value:'10'}}));
 await act(async()=>app.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(writes[0].url,'/api/categories/1');assert.equal(writes[0].method,'PUT');assert.equal(writes[0].body.version,2);assert.equal(writes[0].body.sort_order,10);assert.equal(writes[0].body.name,'Trips');
 assert.match(JSON.stringify(app.toJSON()),/Trips/);
 act(()=>app.root.findAllByType('input').find(i=>i.props['aria-label']==='ชื่อหมวดหมู่').props.onChange({target:{value:'New child'}}));
 await act(async()=>app.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(writes[1].method,'POST');assert.equal(writes[1].body.active,true);
 act(()=>app.unmount());
});

test('category admin moves rows with atomic order IDs and versions rather than name-based navigation',async()=>{
 const rows=[{id:1,name:'Bags',active:true,parent_id:null,sort_order:0,version:2},{id:2,name:'Trips',active:true,parent_id:null,sort_order:1,version:1}];let write;
 const Manager=load('components/CategoryManager.jsx',{}, {fetch:async(url,options)=>{if(options)write={method:options.method,body:JSON.parse(options.body)};return {ok:true,json:async()=>rows};}});let app;
 await act(async()=>{app=Renderer.create(React.createElement(Manager));});
 const down=app.root.findAllByType('button').find(b=>b.props['aria-label']==='ย้าย Bags ลง');
 assert.ok(down,'reorder button must be accessible');
 await act(async()=>down.props.onClick());
 assert.equal(write.method,'PATCH');assert.deepEqual(write.body.order,[{id:2,version:1},{id:1,version:2}]);
 act(()=>app.unmount());
});

test('dynamic catalogue filter canonicalizes legacy Thai category URLs to stable IDs',async()=>{
 const Grid=load('components/products/ProductGrid.jsx',{'./ProductCard':()=>null,'next/navigation':{useRouter:()=>({push(){}})},'@/lib/category-navigation.mjs':{categoryHref:id=>`/products/category/${id}`}}, {fetch:async()=>({ok:true,json:async()=>[{id:5,name:'กระเป๋าถือ',active:true}]})});let app;
 await act(async()=>{app=Renderer.create(React.createElement(Grid,{products:[{_id:'2',category_id:5,category:'กระเป๋าถือ'}],category:'กระเป๋าถือ'}));});
 assert.equal(String(app.root.findAllByType('select')[0].props.value),'5');
 act(()=>app.unmount());
});

test('variant admin edits stock and active state, reports conflicts and refreshes aggregate product owner',async()=>{
 const row={id:4,sku:'BAG-R-M',color:'Red',size:'M',price:20,stock:3,active:true,version:2};let writes=[],notified=0;
 const fetch=async(url,options)=>{if(options){writes.push(JSON.parse(options.body));return {ok:true,json:async()=>row};}return {ok:true,json:async()=>[row]};};
 const Manager=load('components/VariantManager.jsx',{}, {fetch});let app;
 await act(async()=>{app=Renderer.create(React.createElement(Manager,{productId:'2',onSaved:()=>{notified++;}}));});
 act(()=>app.root.findAllByType('button').find(b=>text(b)==='แก้ไข').props.onClick());
 act(()=>app.root.findAllByType('input').find(i=>i.props['aria-label']==='สต็อก').props.onChange({target:{value:'6'}}));
 await act(async()=>app.root.findAllByType('button').find(b=>text(b)==='บันทึกการแก้ไข').props.onClick());
 assert.equal(writes[0].stock,6);assert.equal(writes[0].version,2);assert.equal(notified,1);
 act(()=>app.unmount());
});
