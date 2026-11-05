import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('homepage mounts a photo hero without replacing the live product catalogue', () => {
  const home = read('app/page.js');
  const hero = read('components/HomepageComponents/HeroVideo.jsx');
  assert.match(home, /<ShopHero\s*\/>/);
  assert.match(home, /\/api\/products\/allProducts/);
  assert.match(home, /products\.map/);
  for (const id of [2, 7, 12, 17]) assert.ok(hero.includes(`/api/images/${id}"`), `actual product photo ${id}`);
  assert.doesNotMatch(hero, /https?:\/\//);
  assert.match(hero, /object-contain/);
});

test('photo slideshow offers manual selection, pause and reduced-motion protection', () => {
  const hero = read('components/HomepageComponents/HeroVideo.jsx');
  assert.match(hero, /useReducedMotion/);
  assert.match(hero, /setInterval/);
  assert.match(hero, /clearInterval/);
  assert.match(hero, /if \(reducedMotion \|\| paused/);
  assert.match(hero, /aria-pressed=\{active === index\}/);
  assert.match(hero, /setActive\(index\)/);
  assert.match(hero, /onFocusCapture/);
  assert.match(hero, /onMouseEnter/);
  assert.match(hero, /aria-live="off"/);
  assert.match(hero, /หยุดภาพอัตโนมัติ/);
});

test('homepage clearly identifies example prices in the demo catalogue', () => {
  assert.match(read('app/page.js'), /ราคาที่แสดงเป็นราคาตัวอย่าง/);
});
