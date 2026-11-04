import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const navbar = name => readFileSync(new URL(`../components/Navbar/${name}.jsx`, import.meta.url), 'utf8');

test('admin desktop menu offers Dashboard as its first item linking to /dashboard', () => {
  const source = navbar('AdminDrawer');
  assert.match(source, /\["Dashboard", "Create Product", "Orders", "Products"\]/);
  assert.match(source, /cat === "Dashboard"\s*\? "\/dashboard"/);
  assert.ok(source.indexOf('admin &&') < source.indexOf('"Dashboard"'));
});

test('admin mobile menu offers Dashboard as its first item linking to /dashboard', () => {
  const source = navbar('MobileMenu');
  assert.match(source, /\["Dashboard", "Create Product", "Orders", "All Products"\]/);
  assert.match(source, /cat === "Dashboard"\s*\? "\/dashboard"/);
  assert.ok(source.indexOf('sessionData?.user?.admin') < source.indexOf('"Dashboard"'));
});
