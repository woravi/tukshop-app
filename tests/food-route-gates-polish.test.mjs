import test from 'node:test';
import assert from 'node:assert/strict';
import {loadFoodComponent} from './food-render-helper.mjs';

function loadWithSession(file, session) {
  return loadFoodComponent(file, {
    '@/app/api/auth/[...nextauth]/route': {authOptions:{}},
    'next-auth/next': {getServerSession:async () => session},
    'next/navigation': {redirect:path => { throw new Error(`redirect:${path}`); }},
  }).default;
}

// The shared server layout gates both /admin/food and /admin/food/settings.
for (const role of [null, 'customer', 'kitchen', 'manager', 'owner']) {
  test(`food administration server layout gates ${role ?? 'anonymous'}`, async () => {
    const page = loadWithSession('app/admin/food/layout.jsx', role ? {user:{role}} : null);
    if (role === 'owner' || role === 'manager') {
      assert.equal(await page({children:'protected-food-pages'}), 'protected-food-pages');
    } else {
      const target = role ? '/food' : '/login?callbackUrl=%2Fadmin%2Ffood';
      await assert.rejects(async () => page({children:'protected-food-pages'}), {message:`redirect:${target}`});
    }
  });

  test(`kitchen server page gates ${role ?? 'anonymous'}`, async () => {
    const page = loadWithSession('app/kitchen/page.jsx', role ? {user:{role}} : null);
    if (['owner', 'manager', 'kitchen'].includes(role)) {
      const element = await page();
      assert.equal(element.type.name, 'FoodKitchen');
      assert.equal(element.props.manager, role !== 'kitchen');
    } else {
      const target = role ? '/food' : '/login?callbackUrl=%2Fkitchen';
      await assert.rejects(async () => page(), {message:`redirect:${target}`});
    }
  });
}
