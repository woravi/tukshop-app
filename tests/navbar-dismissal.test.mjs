import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/build/swc');
const root = new URL('../', import.meta.url);

// Render the real navbar and menus; replace only framework/irrelevant UI boundaries.
const categoryRows = [
  { id: 23, name: 'กระเป๋าใหม่', active: 1, sort_order: 9 },
  { id: 4, name: 'กระเป๋าถือ', active: true, sort_order: 2 },
  { id: 3, name: 'ไม่แสดง', active: 0, sort_order: 0 },
];
function mountNavbar(initialPath = '/', { categories = categoryRows, categoryError = false, user = null } = {}) {
  let pathname = initialPath;
  const listeners = new Map();
  const document = {
    body: { style: {} },
    addEventListener(name, fn) { listeners.set(name, fn); },
    removeEventListener(name, fn) { if (listeners.get(name) === fn) listeners.delete(name); },
  };
  const host = tag => ({ children, ...props }) => React.createElement(tag, props, children);
  const mocks = {
    'next/navigation': { useRouter: () => ({ push() {} }), usePathname: () => pathname },
    'next-auth/react': { useSession: () => ({ data: user ? { user } : null }), signOut() {} },
    'next/link': host('a'),
    'next/image': host('img'),
    axios: { get() { throw new Error('Unexpected network request'); } },
    'lucide-react': Object.fromEntries(['Menu', 'X', 'Star', 'ChevronRight'].map(name => [name, host(name)])),
    '@/components/ui/button': { Button: host('button') },
    '../ui/input': { Input: host('input') },
  };
  const modules = new Map();
  function load(name) {
    if (modules.has(name)) return modules.get(name);
    const code = transformSync(readFileSync(new URL(`components/Navbar/${name}.jsx`, root), 'utf8'), {
      jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'classic' } } },
      module: { type: 'commonjs' },
    }).code;
    const module = { exports: {} };
    vm.runInNewContext(code, {
      module, exports: module.exports, document,
      fetch: async url => {
        assert.equal(url, '/api/categories');
        if (categoryError) throw new Error('offline');
        return { ok: true, json: async () => categories };
      },
      console: { log() {} }, setTimeout, clearTimeout,
      require(id) {
        if (Object.hasOwn(mocks, id)) return mocks[id];
        if (id.startsWith('@/lib/')) return require(fileURLToPath(new URL(id.replace('@/', ''), root)));
        if (['./ProductDrawer', './MobileMenu', './NavbarLinks', './AdminDrawer'].includes(id)) return load(id.slice(2));
        if (id === './navigation.mjs') return require(fileURLToPath(new URL('components/Navbar/navigation.mjs', root)));
        if (id.startsWith('.')) return { __esModule: true, default: () => null };
        return require(id);
      },
    }, { filename: `${name}.jsx` });
    modules.set(name, module.exports);
    return module.exports;
  }
  const Navbar = load('Navbar').default;
  let renderer;
  act(() => { renderer = TestRenderer.create(React.createElement(Navbar), {
    createNodeMock: () => ({ contains: target => Boolean(target?.insideNavbar) }),
  }); });
  const component = name => renderer.root.findByType(load(name).default);
  return {
    renderer, document, listeners, component,
    navigate(path) { pathname = path; act(() => renderer.update(React.createElement(Navbar))); },
    openDesktop() { act(() => component('NavbarLinks').props.setProductOpen(true)); },
    openMobile() {
      act(() => renderer.root.findByProps({ 'aria-label': 'เปิดเมนู' }).props.onClick());
      act(() => component('MobileMenu').props.setProductModile(true));
    },
    dispose() { act(() => renderer.unmount()); },
  };
}

for (const path of ['/blog', '/contact', '/about']) {
  test(`desktop navigation to ${path} dismisses categories even on the current route`, () => {
    const app = mountNavbar(path);
    try {
      app.openDesktop();
      const link = app.component('NavbarLinks').findByProps({ href: path });
      act(() => link.props.onClick?.());
      assert.equal(app.component('ProductDrawer').props.productOpen, false);
    } finally { app.dispose(); }
  });
}

test('closing mobile navigation resets its category submenu and is idempotent', () => {
  const app = mountNavbar('/contact');
  try {
    app.openMobile();
    const close = app.component('MobileMenu').props.setMenuClose;
    act(() => { close(); close(); });
    assert.equal(app.component('MobileMenu').props.isOpen, false);
    assert.equal(app.component('MobileMenu').props.productModile, false);
    act(() => close());
    assert.equal(app.component('MobileMenu').props.isOpen, false);
  } finally { app.dispose(); }
});

for (const path of ['/blog', '/contact']) {
  test(`mobile navigation to ${path} closes categories and does not reopen on a second close`, () => {
    const app = mountNavbar(path);
    try {
      app.openMobile();
      const button = app.component('MobileMenu').findAllByType('button')
        .find(node => node.findAllByProps({ href: path }).length);
      act(() => button.props.onClick());
      assert.equal(app.component('MobileMenu').props.isOpen, false);
      assert.equal(app.component('MobileMenu').props.productModile, false);
      act(() => button.props.onClick());
      assert.equal(app.component('MobileMenu').props.isOpen, false);
    } finally { app.dispose(); }
  });
}

test('desktop and mobile categories use active API categories in order with stable ID routes and dismiss on selection', async () => {
  const app = mountNavbar();
  const { categoryHref } = require('../lib/category-navigation.mjs');
  const expected = ['all', '4', '23'].map(categoryHref);
  try {
    await act(async () => {});
    app.openDesktop();
    const desktopLinks = app.component('ProductDrawer').findAllByType('a');
    assert.deepEqual(desktopLinks.map(link => link.props.href), expected);
    act(() => desktopLinks[1].props.onClick());
    assert.equal(app.component('ProductDrawer').props.productOpen, false);
    app.openMobile();
    const buttons = app.component('MobileMenu').findAllByType('button')
      .filter(node => node.findAllByType('a').some(link => expected.includes(link.props.href)));
    assert.deepEqual(buttons.map(button => button.findByType('a').props.href), expected);
    act(() => buttons[1].props.onClick());
    assert.equal(app.component('MobileMenu').props.isOpen, false);
    assert.equal(app.component('MobileMenu').props.productModile, false);
  } finally { app.dispose(); }
});

test('outside pointer presses dismiss categories but presses inside navigation do not', () => {
  const app = mountNavbar();
  try {
    app.openDesktop();
    assert.equal(typeof app.listeners.get('pointerdown'), 'function');
    act(() => app.listeners.get('pointerdown')({ target: { insideNavbar: true } }));
    assert.equal(app.component('ProductDrawer').props.productOpen, true);
    act(() => app.listeners.get('pointerdown')({ target: {} }));
    assert.equal(app.component('ProductDrawer').props.productOpen, false);
  } finally { app.dispose(); }
  assert.equal(app.listeners.has('pointerdown'), false);
});

test('route changes dismiss desktop categories and reset the mobile menu', () => {
  const app = mountNavbar();
  try {
    app.openDesktop();
    app.openMobile();
    assert.equal(app.component('ProductDrawer').props.productOpen, true);
    assert.equal(app.component('MobileMenu').props.productModile, true);
    app.navigate('/blog');
    assert.equal(app.component('ProductDrawer').props.productOpen, false);
    assert.equal(app.component('MobileMenu').props.isOpen, false);
    assert.equal(app.component('MobileMenu').props.productModile, false);
    assert.equal(app.document.body.style.overflow, 'auto');
  } finally { app.dispose(); }
});

test('desktop and mobile staff menus honor explicit roles instead of the legacy admin flag', async () => {
  const management = ['/dashboard', '/create', '/orders', '/products', '/admin/categories', '/admin/food', '/admin/food/settings', '/kitchen'];
  for (const role of ['owner', 'manager', 'kitchen', 'customer', 'unknown', null]) {
    const app = mountNavbar('/', { user: role === null ? null : { role, admin: true } });
    try {
      await act(async () => {});
      const expected = role === 'owner' ? [...management, '/admin/users'] : role === 'manager' ? management : role === 'kitchen' ? ['/kitchen'] : [];
      act(() => app.component('NavbarLinks').props.setAdmin(true));
      const desktop = app.component('AdminDrawer').findAllByType('a');
      assert.deepEqual(desktop.map(link => link.props.href).sort(), expected.toSorted(), `desktop ${role}`);
      app.openMobile();
      act(() => app.component('MobileMenu').props.setAdminPanelMob(true));
      const mobile = app.component('MobileMenu').findAllByType('a')
        .filter(link => management.includes(link.props.href) || link.props.href === '/admin/users');
      assert.deepEqual(mobile.map(link => link.props.href).sort(), expected.toSorted(), `mobile ${role}`);
      if (expected.length) {
        act(() => desktop[0].props.onClick?.());
        assert.equal(app.component('AdminDrawer').props.admin, false);
      }
    } finally { app.dispose(); }
  }
});

test('both navigation layouts expose the restaurant and food cart separately from merchandise and dismiss on same-route links', async () => {
  const app = mountNavbar('/food');
  try {
    await act(async () => {});
    for (const href of ['/food', '/food/cart']) {
      app.openDesktop();
      const link = app.component('NavbarLinks').findByProps({ href });
      assert.match(link.findByType('a').children.join(''), href === '/food' ? /ร้านอาหาร/ : /ตะกร้าอาหาร/);
      act(() => link.props.onClick());
      assert.equal(app.component('ProductDrawer').props.productOpen, false);
      app.openMobile();
      const mobileLink = app.component('MobileMenu').findByProps({ href });
      act(() => mobileLink.props.onClick());
      assert.equal(app.component('MobileMenu').props.isOpen, false);
      assert.equal(app.component('MobileMenu').props.productModile, false);
    }
    assert.ok(app.renderer.root.findAllByProps({ 'aria-label': 'ตะกร้าสินค้า' }).length >= 2);
  } finally { app.dispose(); }
});

test('category management changes appear after navigation without remounting the navbar', async () => {
  const categories = categoryRows.map(row => ({ ...row }));
  const app = mountNavbar('/admin/categories', { categories });
  try {
    await act(async () => {});
    categories.splice(0, categories.length, { id: 8, name: 'หมวดใหม่', active: 1, sort_order: 0 });
    await act(async () => app.navigate('/food'));
    app.openDesktop();
    assert.deepEqual(app.component('ProductDrawer').findAllByType('a').map(link => link.props.href), ['/products/category/all', '/products/category/8']);
  } finally { app.dispose(); }
});

for (const options of [{ categories: [] }, { categoryError: true }, { categories: { error: 'unavailable' } }]) {
  test(`category load ${JSON.stringify(options)} keeps an all-products entrance without stale hardcoded categories`, async () => {
    const app = mountNavbar('/', options);
    try {
      await act(async () => {});
      app.openDesktop();
      assert.deepEqual(app.component('ProductDrawer').findAllByType('a').map(link => link.props.href), ['/products/category/all']);
      app.openMobile();
      assert.equal(app.component('MobileMenu').findAllByType('a').filter(link => link.props.href.startsWith('/products/category/')).length, 1);
    } finally { app.dispose(); }
  });
}

test('compact navigation uses a labeled keyboard button and desktop layout only at a wide breakpoint', () => {
  const app = mountNavbar();
  try {
    const trigger = app.renderer.root.findByProps({ 'aria-label': 'เปิดเมนู' });
    assert.equal(trigger.type, 'button');
    assert.equal(trigger.props['aria-expanded'], false);
    assert.equal(trigger.props['aria-controls'], 'mobile-navigation');
    act(() => trigger.props.onClick());
    assert.equal(app.renderer.root.findByProps({ 'aria-label': 'ปิดเมนู' }).props['aria-expanded'], true);
    assert.ok(app.renderer.root.findAllByType('div').some(node => /hidden xl:flex/.test(node.props.className || '')));
  } finally { app.dispose(); }
});
