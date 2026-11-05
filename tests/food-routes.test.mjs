import test from 'node:test';
import assert from 'node:assert/strict';
import {loadFoodComponent} from './food-render-helper.mjs';
const authPath='@/app/api/auth/[...nextauth]/route';

test('food customer routes render independent menu checkout and token tracking',async()=>{
 for(const [file,component] of [['app/food/page.jsx','FoodMenu'],['app/food/cart/page.jsx','FoodCheckout']]){
  const page=loadFoodComponent(file);assert.equal((await page.default()).type.name,component);
 }
 const page=loadFoodComponent('app/food/orders/[token]/page.jsx');const element=await page.default({params:Promise.resolve({token:'opaque'})});assert.equal(element.props.token,'opaque');assert.equal(page.metadata.robots.index,false);assert.equal(page.metadata.referrer,'no-referrer');
});

test('manager pages and kitchen page enforce session permissions on the server',async()=>{
 let session=null;const overrides={[authPath]:{authOptions:{}},'next-auth/next':{getServerSession:async()=>session},'next/navigation':{redirect:path=>{throw new Error(`redirect:${path}`);}}};
 const layout=loadFoodComponent('app/admin/food/layout.jsx',overrides);
 await assert.rejects(()=>layout.default({children:'admin'}),/redirect:/);
 session={user:{role:'kitchen'}};await assert.rejects(()=>layout.default({children:'admin'}),/redirect:/);
 session={user:{role:'manager'}};assert.equal(await layout.default({children:'admin'}),'admin');
 const kitchen=loadFoodComponent('app/kitchen/page.jsx',overrides);
 session={user:{role:'customer'}};await assert.rejects(()=>kitchen.default(),/redirect:/);
 session={user:{role:'kitchen'}};assert.equal((await kitchen.default()).props.manager,false);
 session={user:{role:'owner'}};assert.equal((await kitchen.default()).props.manager,true);
 for(const file of ['app/admin/food/page.jsx','app/admin/food/settings/page.jsx'])assert.ok((await loadFoodComponent(file).default()).type);
});
