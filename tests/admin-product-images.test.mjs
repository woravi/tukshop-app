import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('admin product cards render a compact three-column media row', async () => {
  const source = await readFile(new URL('../src/app/admin/page.tsx', import.meta.url), 'utf8');
  const productGrid = source.slice(
    source.indexOf('{/* Products Grid */}'),
    source.indexOf('{/* TAB 2: QR CODE SCANNER')
  );

  assert.match(productGrid, /src=\{p\.image \|\| '\/images\/studio_hero_banner\.jpg'\}/);
  assert.match(productGrid, /alt=\{p\.title\}/);
  assert.match(productGrid, /grid grid-cols-3 items-stretch gap-2/);
  assert.match(productGrid, /relative aspect-square w-full bg-neutral-100/);
  assert.match(productGrid, /w-full aspect-square bg-white border-2 border-black/);

  const brandIndex = productGrid.indexOf('{p.brand}');
  const imageIndex = productGrid.indexOf("src={p.image || '/images/studio_hero_banner.jpg'}");
  const qrIndex = productGrid.indexOf('generateQRCodeSVG');
  assert.ok(brandIndex < imageIndex && imageIndex < qrIndex);
});
