import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('public catalogue calls to action use the all-category route', () => {
  for (const path of ['app/page.js', 'components/Footer/Footer.jsx', 'components/InfoPage.jsx', 'components/HomepageComponents/HeroVideo.jsx']) {
    const text = source(path);
    assert.match(text, /["']\/products\/category\/all["']/, path);
    assert.doesNotMatch(text, /["']\/products["']/, path);
  }
});

test('single product supporting blocks provide bag guidance without unverified promises', () => {
  const page = source('components/ProductDetailsSinglePage.jsx');
  for (const name of ['FeaturesSection', 'GuaranteeSection', 'FAQSection']) {
    assert.match(page, new RegExp(`<${name}\\s*/>`));
    const text = source(`components/${name}.jsx`);
    assert.doesNotMatch(text, /swiss|luzern|904L|stainless|sapphire|30.day|full refund|free returns|global shipping|international shipping|5-7|PayPal|Apple Pay|quality assured|quality control|Stripe Checkout|tracking information/i, name);
    assert.match(text, /กระเป๋า|สินค้า/, name);
    assert.match(text, /\/contact/, `${name} offers a way to confirm details`);
  }
  assert.match(source('components/FeaturesSection.jsx'), /\/products\/category\/all/);
  assert.match(source('components/GuaranteeSection.jsx'), /\/shipping-returns/);
  assert.match(source('components/GuaranteeSection.jsx'), /\/warranty/);
  const faq = source('components/FAQSection.jsx');
  assert.match(faq, /useState/);
  assert.match(faq, /aria-expanded/);
});
