import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('restaurant metadata and kitchen board use owner-confirmed ครัวรัชนี consistently',async()=>{
 for(const file of ['app/food/page.jsx','app/food/cart/page.jsx','app/food/orders/[token]/page.jsx','app/admin/food/page.jsx','app/admin/food/settings/page.jsx','app/kitchen/page.jsx','components/food/FoodKitchen.jsx']){
  const source=await readFile(new URL('../'+file,import.meta.url),'utf8');
  assert.match(source,/ครัวรัชนี/,file);
  assert.doesNotMatch(source,/ครัวตุ๊ก/,file);
 }
});
