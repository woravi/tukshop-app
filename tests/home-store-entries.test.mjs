import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/build/swc');
test('homepage retains its bag hero and offers two explicit store entrances', async () => {
  const module = { exports: {} };
  const host = tag => ({ children, ...props }) => React.createElement(tag, props, children);
  const ShopHero = () => React.createElement('section', { 'data-testid': 'bag-hero' });
  const code = transformSync(readFileSync(new URL('../app/page.js', import.meta.url), 'utf8'), {
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' },
  }).code;
  vm.runInNewContext(code, { module, exports: module.exports, AbortController,
    fetch: async () => ({ ok: true, json: async () => ({ products: [] }) }),
    require(id) {
      if (id === 'next/link') return host('a');
      if (id === 'next/image') return host('img');
      if (id === '@/components/HomepageComponents/HeroVideo') return { __esModule: true, default: ShopHero };
      if (id === '@/lib/currency.mjs') return require('../lib/currency.mjs');
      return require(id);
    },
  });
  let renderer;
  try {
    await act(async () => { renderer = TestRenderer.create(React.createElement(module.exports.default)); });
    assert.equal(renderer.root.findAllByType(ShopHero).length, 1);
    const entries = renderer.root.findByProps({ 'aria-label': 'เลือกร้าน' });
    const links = entries.findAllByType('a');
    assert.deepEqual(links.map(link => link.props.href), ['/products/category/all', '/food']);
    assert.deepEqual(links.map(link => link.findByType('h2').children.join('')), ['ร้านสินค้า', 'ร้านอาหาร']);
  } finally { if (renderer) act(() => renderer.unmount()); }
});
