import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('homepage uses the live catalogue rather than demo watch sections', () => {
  const home = read('app/page.js');
  assert.match(home, /\/api\/products\/allProducts/);
  assert.match(home, /product\.images/);
  assert.match(home, /product\._id/);
  assert.doesNotMatch(home, /BestSellingWatches|WatchOfTheMonth|WatchReviewSlider|GallerySlider|FeaturedProduct/);
});

test('public informational pages contain no watch template content', () => {
  for (const path of ['about', 'blog', 'blog/post1', 'blog/post2', 'blog/post3', 'blog/post4', 'contact', 'faq', 'warranty', 'privacy-policy', 'shipping-returns']) {
    assert.doesNotMatch(read(`app/${path}/page.jsx`), /watch|timepiece|rolex|ecomwatch|newslettercomponent/i, path);
  }
  assert.doesNotMatch(read('components/Footer/Footer.jsx'), /yourwatchbrand|timepiece|newsletter/i);
});
