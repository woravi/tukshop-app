import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {loadFoodComponent} from './food-render-helper.mjs';

const link = {__esModule:true, default:({children, href, ...props}) => React.createElement('a', {href, ...props}, children)};

async function renderMenu(t, items) {
  const originalFetch = globalThis.fetch;
  let tree;
  t.after(async () => {
    if (tree) await act(async () => tree.unmount());
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async url => Response.json(url.endsWith('/menu')
    ? {items}
    : {settings:{configured:true, order_accepting:true, accepting_now:true}});
  const {default:Menu} = loadFoodComponent('components/food/FoodMenu.jsx', {'next/link':link});
  await act(async () => { tree = renderer.create(React.createElement(Menu)); });
  return tree;
}

for (const stock of [0, 3]) {
  test(`resale source describes origin, not availability (stock ${stock})`, async t => {
    const tree = await renderMenu(t, [{id:'resale', name:'อาหารกล่อง', category:'อาหารกล่อง', price:45, source_type:'resale', stock, available:true, options:[]}]);
    const card = tree.root.findByType('article');
    const text = JSON.stringify(tree.toJSON());
    assert.match(text, /รับมาจำหน่าย/);
    assert.doesNotMatch(text, /พร้อมจำหน่าย/);
    assert.equal(text.includes('หมดชั่วคราว'), stock === 0);
    assert.equal(card.findByType('button').props.disabled, stock === 0);
  });
}

test('menu hero uses neutral wording without an unverified freshness claim', async t => {
  const tree = await renderMenu(t, []);
  const eyebrow = tree.root.findByType('header').findAllByType('p')[0];
  assert.equal(eyebrow.children.join(''), 'เมนูอาหารจากครัวรัชนี');
});
