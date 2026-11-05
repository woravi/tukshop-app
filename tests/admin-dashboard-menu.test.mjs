import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { staffNavigation } from '../components/Navbar/navigation.mjs';

const navbar = name => readFileSync(new URL(`../components/Navbar/${name}.jsx`, import.meta.url), 'utf8');

for (const [layout, component] of [['desktop', 'AdminDrawer'], ['mobile', 'MobileMenu']]) {
  test(`admin ${layout} menu offers Dashboard as its first item linking to /dashboard`, () => {
    const source = navbar(component);
    assert.match(source, /staffNavigation\(session\?\.user\)/);
    assert.match(source, /href=\{href\}/);
    for (const role of ['owner', 'manager']) {
      assert.deepEqual(staffNavigation({ role })[0], { href: '/dashboard', label: 'Dashboard' });
    }
    assert.deepEqual(staffNavigation({ role: 'customer', admin: true }), []);
  });
}
