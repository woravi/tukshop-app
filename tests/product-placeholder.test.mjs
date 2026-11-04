import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const files = [
  '../components/Wishlist.jsx',
  '../components/ProductDetails.jsx',
  '../app/products/page.jsx',
  '../components/products/ProductCard.jsx',
  '../components/Navbar/SearchDrawer.jsx',
  '../components/Navbar/MobileMenu.jsx',
];

test('empty product photos use a local placeholder, never an external URL or missing asset', () => {
  assert.ok(existsSync(new URL('../public/product-placeholder.svg', import.meta.url)));
  for (const name of files) {
    const source = readFileSync(new URL(name, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /via\.placeholder\.com|placeholder-watch\.jpg|\/placeholder\.jpg/);
  }
});
