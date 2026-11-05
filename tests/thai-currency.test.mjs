import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
test('product cards display prices using the shared Thai baht formatter', () => {
  const card = source('components/products/ProductCard.jsx');
  assert.match(card, /formatTHB\(product\.price\)/);
  assert.match(card, /formatTHB\(product\.originalPrice\)/);
  assert.doesNotMatch(card, /CHF/);
});

const storefronts = ['components/ProdDetailsPrice.jsx', 'components/ProductDetails.jsx', 'components/Navbar/SearchDrawer.jsx', 'components/Navbar/MobileMenu.jsx', 'components/Wishlist.jsx', 'components/Cart.jsx', 'components/MobileCart.jsx', 'components/HomepageComponents/FeaturedProduct.jsx', 'components/HomepageComponents/BestSelling.jsx', 'app/products/page.jsx', 'app/checkout/page.jsx'];
test('storefront price views use the Thai baht formatter', () => {
  for (const path of storefronts) assert.match(source(path), /formatTHB\(/, path);
});
test('historical order views disclose that their currency is not recorded', () => {
  for (const path of ['components/OrderItem.jsx', 'components/AllOrders.jsx', 'app/orders/[orderId]/page.jsx']) assert.match(source(path), /currency (?:is )?not recorded/i, path);
});
test('formatter handles baht amounts, decimal strings and missing prices', async () => {
  const { formatTHB } = await import('../lib/currency.mjs');
  assert.equal(formatTHB(12500), '฿12,500.00');
  assert.equal(formatTHB('12.50'), '฿12.50');
  assert.equal(formatTHB(0), '฿0.00');
  assert.equal(formatTHB(null), 'Price unavailable');
});
