import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('the storefront identifies itself as TukShop, not the template brand', () => {
  const layout = readFileSync(new URL('../app/layout.js', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('../components/Footer/Footer.jsx', import.meta.url), 'utf8');
  assert.match(layout, /title:\s*["']TukShop["']/);
  assert.match(footer, /TukShop/);
  assert.doesNotMatch(footer, /EcommWatch|EcommStore/);
  const navbar = readFileSync(new URL('../components/Navbar/Navbar.jsx', import.meta.url), 'utf8');
  assert.match(navbar, /TukShop/);
  assert.doesNotMatch(navbar, /logo1\.png/);
});

test('password hashes are excluded from public product and registration responses', () => {
  const model = readFileSync(new URL('../lib/mysql-model.mjs', import.meta.url), 'utf8');
  assert.match(model, /delete item\.password/);
  assert.match(model, /state\.password = s === '\+password'/);
  for (const route of ['products', 'products/allProducts', 'products/[search]', 'products/brand/[brand]']) {
    const content = readFileSync(new URL(`../app/api/${route}/route.js`, import.meta.url), 'utf8');
    assert.doesNotMatch(content, /\.populate\(["']user["']\)/);
  }
  const registration = readFileSync(new URL('../app/api/register/route.js', import.meta.url), 'utf8');
  assert.doesNotMatch(registration, /\bsaveUser\s*[,}]/);
  const login = readFileSync(new URL('../app/api/auth/[...nextauth]/route.js', import.meta.url), 'utf8');
  const change = readFileSync(new URL('../app/api/change-password/route.js', import.meta.url), 'utf8');
  assert.match(login, /\.select\(["']\+password["']\)/);
  assert.match(change, /\.select\(["']\+password["']\)/);
});

test('privileged API handlers check fresh owner/manager authority before application data access', () => {
  for (const [route, methods] of [['products', ['POST']], ['product/[productId]', ['PUT', 'DELETE']], ['product/featured/[productId]', ['PUT']], ['ordersAdmin', ['GET', 'PUT']], ['orders', ['PUT']]]) {
    const content = readFileSync(new URL(`../app/api/${route}/route.js`, import.meta.url), 'utf8');
    for (const method of methods) {
      const handler = content.split(`export async function ${method}`)[1]?.split(/export async function /)[0];
      const check = handler?.search(/await authorizeRoles\(\[['"]owner['"],\s*['"]manager['"]\]\)/) ?? -1;
      assert.ok(check >= 0, `${route} ${method} has no database-backed role check`);
      for (const sideEffect of ['await connect(', 'await dbConnect(', 'await req.json(']) {
        const index = handler.indexOf(sideEffect);
        if (index >= 0) assert.ok(check < index, `${route} ${method} performs work before authorization`);
      }
    }
  }
});

test('customer order and profile routes use session identity, not arbitrary request email', () => {
  const orders = readFileSync(new URL('../app/api/orders/route.js', import.meta.url), 'utf8');
  const detail = readFileSync(new URL('../app/api/orders/[orderId]/route.js', import.meta.url), 'utf8');
  const update = readFileSync(new URL('../app/api/updateUser/route.js', import.meta.url), 'utf8');
  assert.doesNotMatch(orders, /searchParams\.get\(["']email["']\)/);
  assert.match(orders, /email:\s*actor\.email/);
  assert.match(orders, /await authorizeRoles\(/);
  assert.match(detail, /ownsOrder\(\{ user: actor \}, order\)/);
  assert.match(update, /email:\s*session\.user\.email/);
  assert.doesNotMatch(update, /\{\s*email,\s*name,\s*newEmail\s*\}/);
});

for (const route of ['product/[productId]', 'product/featured/[productId]', 'orders/[orderId]', 'products/[search]', 'products/brand/[brand]']) {
  test(`${route} awaits dynamic params in Next.js 16`, () => {
    const content = readFileSync(new URL(`../app/api/${route}/route.js`, import.meta.url), 'utf8');
    assert.match(content, /await params/);
  });
}
for (const page of ['product/[productId]', 'editProduct/[productId]', 'orders/[orderId]', 'products/brand/[brand]']) {
  test(`${page} uses client-side route parameters`, () => {
    const content = readFileSync(new URL(`../app/${page}/page.jsx`, import.meta.url), 'utf8');
    assert.match(content, /useParams\(\)/);
  });
}

for (const route of ['orders', 'ordersAdmin', 'product/featured', 'products/allProducts']) {
  test(`${route} is never prerendered against the production database`, () => {
    const content = readFileSync(new URL(`../app/api/${route}/route.js`, import.meta.url), 'utf8');
    assert.match(content, /export const dynamic\s*=\s*["']force-dynamic["']/);
  });
}
