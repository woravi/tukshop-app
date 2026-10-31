import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  MAX_ADDITIONAL_PRODUCT_IMAGES,
  validateAdditionalProductImages
} from '../src/lib/productImages.mjs';

test('old products can omit supplementary images', () => {
  assert.deepEqual(validateAdditionalProductImages(undefined), { images: undefined });
});

test('accepts up to three safe supplementary images and removes duplicates', () => {
  const result = validateAdditionalProductImages([
    '/images/front.jpg',
    '/uploads/side-view.webp',
    '/images/front.jpg'
  ], '/images/main.jpg');

  assert.equal(MAX_ADDITIONAL_PRODUCT_IMAGES, 3);
  assert.deepEqual(result, { images: ['/images/front.jpg', '/uploads/side-view.webp'] });
});

test('excludes the main image from supplementary images', () => {
  assert.deepEqual(
    validateAdditionalProductImages(['/images/main.jpg', '/images/back.png'], '/images/main.jpg'),
    { images: ['/images/back.png'] }
  );
});

test('rejects unsafe paths, invalid values, and more than three images', () => {
  assert.ok(validateAdditionalProductImages('not-an-array').error);
  assert.ok(validateAdditionalProductImages(['/images/../secret.jpg']).error);
  assert.ok(validateAdditionalProductImages(['https://example.com/image.jpg']).error);
  assert.ok(validateAdditionalProductImages(['/images/a.jpg', '/images/b.jpg', '/images/c.jpg', '/images/d.jpg']).error);
});

test('admin form persists three optional slots and product detail uses the gallery', async () => {
  const adminSource = await readFile(new URL('../src/app/admin/page.tsx', import.meta.url), 'utf8');
  const apiSource = await readFile(new URL('../src/app/api/products/route.ts', import.meta.url), 'utf8');
  const dbSource = await readFile(new URL('../src/lib/db.ts', import.meta.url), 'utf8');
  const detailSource = await readFile(new URL('../src/app/products/[id]/page.tsx', import.meta.url), 'utf8');

  assert.match(adminSource, /ADDITIONAL_IMAGE_SLOTS = 3/);
  assert.match(adminSource, /images: additionalImages/);
  assert.match(adminSource, /product-additional-image-/);
  assert.match(adminSource, /ตัวอย่างรูปสินค้าเพิ่มเติม/);
  assert.match(apiSource, /images: imageValidation\.images \|\| \[\]/);
  assert.match(apiSource, /updates\.images = imageValidation\.images/);
  assert.match(dbSource, /images\?: string\[\]/);
  assert.match(detailSource, /\.\.\.\(product\.images \|\| \[\]\)/);
  assert.match(detailSource, /productGalleryImages\.map/);
});
