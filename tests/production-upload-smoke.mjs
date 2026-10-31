import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { inflateSync } from 'node:zlib';

const baseURL = process.env.TUKSHOP_SMOKE_BASE_URL;
if (!baseURL) throw new Error('Set TUKSHOP_SMOKE_BASE_URL to the authorized test server');
const origin = new URL(baseURL);
const local = ['127.0.0.1', 'localhost'].includes(origin.hostname);
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');

// Hostinger's image CDN can re-encode PNG metadata and compression. For this
// one-pixel 8-bit grayscale+alpha fixture, verify decoded pixels, not metadata.
function fixturePixels(image) {
  assert.deepEqual(image.subarray(0, 8), png.subarray(0, 8), 'valid PNG signature');
  const data = [];
  let header;
  for (let offset = 8; offset < image.length;) {
    const length = image.readUInt32BE(offset);
    assert.ok(offset + 12 + length <= image.length, 'complete PNG chunk');
    const kind = image.toString('ascii', offset + 4, offset + 8);
    const bytes = image.subarray(offset + 8, offset + 8 + length);
    if (kind === 'IHDR') header = bytes;
    if (kind === 'IDAT') data.push(bytes);
    offset += length + 12;
  }
  assert.ok(header, 'PNG header exists');
  assert.deepEqual(header, png.subarray(16, 29), 'fixture dimensions and color format preserved');
  const row = inflateSync(Buffer.concat(data));
  assert.equal(row.length, 3, 'one grayscale+alpha pixel');
  assert.ok(row[0] <= 4, 'valid PNG row filter');
  // All left/up predictors are zero for the first and only pixel.
  return row.subarray(1);
}


test('a newly uploaded image is readable without restarting the production server', async () => {
  const form = new FormData();
  form.append('userRole', 'MANAGER'); // Existing demo authorization; not a security test.
  form.append('file', new Blob([png], { type: 'image/png' }), 'deployment-smoke.png');
  const upload = await fetch(new URL('/api/uploads', origin), { method: 'POST', body: form });
  assert.equal(upload.status, 200, 'image upload succeeds');
  const result = await upload.json();
  assert.equal(result.success, true);
  assert.match(result.filename, /^product-\d+-[a-f0-9-]+\.png$/);
  assert.equal(result.url, `/uploads/${result.filename}`);
  try {
    const image = await fetch(new URL(result.url, origin));
    assert.equal(image.status, 200, 'a new upload must be available immediately');
    assert.match(image.headers.get('content-type') || '', /^image\/png/);
    const served = Buffer.from(await image.arrayBuffer());
    if (local) assert.deepEqual(served, png);
    else assert.deepEqual(fixturePixels(served), fixturePixels(png), 'CDN preserves image pixels');
  } finally {
    if (local) await unlink(path.join(process.cwd(), 'public', 'uploads', result.filename));
  }
});
