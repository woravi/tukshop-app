import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const hero = readFileSync(new URL('../components/HomepageComponents/HeroVideo.jsx', import.meta.url), 'utf8');

test('storefront hero does not fetch third-party Cloudinary media', () => {
  assert.doesNotMatch(hero, /res\.cloudinary\.com|CldUploadButton|next-cloudinary/);
});

test('storefront hero contains no unlicensed Rolex demo video claim', () => {
  assert.doesNotMatch(hero, /Video Credit: Rolex|herovideo_oekufj/);
});

test('Next image optimizer does not allow Cloudinary or depend on Mongoose', () => {
  const config = readFileSync(new URL('../next.config.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(config, /res\.cloudinary\.com|mongoose/);
});
