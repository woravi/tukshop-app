import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const baseURL = process.env.TUKSHOP_SMOKE_BASE_URL;
if (!baseURL) throw new Error('Set TUKSHOP_SMOKE_BASE_URL to the authorized test server');
const origin = new URL(baseURL);
const local = ['127.0.0.1', 'localhost'].includes(origin.hostname);
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');

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
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
  } finally {
    if (local) await unlink(path.join(process.cwd(), 'public', 'uploads', result.filename));
  }
});
