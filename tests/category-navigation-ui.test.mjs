import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
test('desktop and mobile menus share dynamic stable-ID category links', async () => {
  for (const path of ['components/Navbar/ProductDrawer.jsx', 'components/Navbar/MobileMenu.jsx']) {
    const text = await source(path);
    assert.doesNotMatch(text, /BAG_CATEGORIES/);
    assert.match(text, /categories/);
    assert.match(text, /categoryHref\(cat.id\)/);
    assert.match(text, /categoryHref/);
    assert.doesNotMatch(text, /Rolex|Patek Philipe/);
  }
});
test('category API and page use category; grid filters by category', async () => {
  const api = await source('app/api/products/category/[category]/route.js');
  assert.match(api, /resolveCategory/);
  assert.match(api, /category_id:found.id/);
  const page = await source('app/products/category/[category]/page.jsx');
  assert.match(page, /api\/products\/category/);
  const grid = await source('components/products/ProductGrid.jsx');
  assert.match(grid, /api\/categories/);
  assert.doesNotMatch(grid, /Rolex|Patek Philipe/);
});
test('product details and search previews do not expose watch specifications', async () => {
  for (const path of ['components/ProdDetailsList.jsx', 'components/ProductDetails.jsx', 'components/Navbar/MobileMenu.jsx', 'components/Navbar/SearchDrawer.jsx']) {
    assert.doesNotMatch(await source(path), /\.(bracelet|movement|thickness|glass|luminova|casematerial|crown|bandsize|lugs|water)\b/);
  }
});
