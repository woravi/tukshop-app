import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import * as categoryNavigation from '../lib/category-navigation.mjs';
import { BAG_CATEGORIES } from '../lib/product-categories.mjs';

const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/build/swc');
const pageCode = transformSync(readFileSync(new URL('../app/products/category/[category]/page.jsx', import.meta.url), 'utf8'), {
  jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
  module: { type: 'commonjs' },
}).code;

// Run the real page's hooks/loader; substitute only router, HTTP and child UI.
async function mountCategoryPage(category, get) {
  const requests = [];
  const module = { exports: {} };
  function ProductGrid() { return null; }
  function LoadingErrorComponent() { return null; }
  vm.runInNewContext(pageCode, {
    module, exports: module.exports,
    require(id) {
      if (id === 'next/navigation') return { useParams: () => ({ category }) };
      if (id === 'axios') return { get: url => { requests.push(url); return get(url); } };
      if (id === '@/components/products/ProductGrid') return ProductGrid;
      if (id === '@/components/Loader/LoadingErrorComponent') return LoadingErrorComponent;
      if (id === '@/lib/category-navigation.mjs') return categoryNavigation;
      return require(id);
    },
  });
  let renderer;
  await act(async () => { renderer = TestRenderer.create(React.createElement(module.exports.default)); });
  return {
    renderer, requests, ProductGrid, LoadingErrorComponent,
    dispose() { act(() => renderer.unmount()); },
  };
}

test('encoded Thai route param loads the singly encoded API and displays decoded category', async () => {
  const category = 'กระเป๋าถือ';
  const encoded = encodeURIComponent(category);
  const products = [{ _id: 'bag-1', name: 'Handbag', category }];
  const app = await mountCategoryPage(encoded, async () => ({ data: products }));
  try {
    assert.deepEqual(app.requests, [`/api/products/category/${encoded}`]);
    assert.equal(app.renderer.root.findByType('h1').children.join(''), category);
    const grid = app.renderer.root.findByType(app.ProductGrid);
    assert.equal(grid.props.category, category);
    assert.equal(grid.props.products, products);
    assert.equal(app.renderer.root.findAllByType(app.LoadingErrorComponent).length, 0);
  } finally { app.dispose(); }
});

for (const category of BAG_CATEGORIES) {
  for (const param of [category, encodeURIComponent(category)]) {
    test(`category ${category} loads from ${param === category ? 'decoded' : 'encoded'} route params`, async () => {
      const app = await mountCategoryPage(param, async () => ({ data: [] }));
      try {
        assert.deepEqual(app.requests, [`/api/products/category/${encodeURIComponent(category)}`]);
        assert.equal(app.renderer.root.findByType('h1').children.join(''), category);
        assert.equal(app.renderer.root.findByType(app.ProductGrid).props.category, category);
      } finally { app.dispose(); }
    });
  }
}

for (const param of ['all', '%61ll']) {
  test(`all-products route ${param} keeps its API, Thai label and grid selection`, async () => {
    const app = await mountCategoryPage(param, async () => ({ data: [] }));
    try {
      assert.deepEqual(app.requests, ['/api/products']);
      assert.equal(app.renderer.root.findByType('h1').children.join(''), 'กระเป๋าทั้งหมด');
      assert.equal(app.renderer.root.findByType(app.ProductGrid).props.category, 'all');
    } finally { app.dispose(); }
  });
}

test('route normalization decodes only one layer, never recursively', async () => {
  const onceEncoded = encodeURIComponent('กระเป๋าถือ');
  const twiceEncoded = encodeURIComponent(onceEncoded);
  const app = await mountCategoryPage(twiceEncoded, async () => ({ data: [] }));
  try {
    assert.deepEqual(app.requests, [`/api/products/category/${twiceEncoded}`]);
    assert.equal(app.renderer.root.findByType('h1').children.join(''), onceEncoded);
    assert.equal(app.renderer.root.findByType(app.ProductGrid).props.category, onceEncoded);
  } finally { app.dispose(); }
});

for (const malformed of ['%', '%ZZ', '%E0%A4%A']) {
  test(`malformed route param ${malformed} reaches the normal loading error instead of crashing`, async () => {
    const app = await mountCategoryPage(malformed, async () => { throw new Error('Unknown category'); });
    try {
      assert.deepEqual(app.requests, [`/api/products/category/${encodeURIComponent(malformed)}`]);
      const state = app.renderer.root.findByType(app.LoadingErrorComponent).props;
      assert.equal(state.loading, false);
      assert.equal(state.error, 'Error loading products');
      assert.equal(app.renderer.root.findAllByType(app.ProductGrid).length, 0);
    } finally { app.dispose(); }
  });
}
