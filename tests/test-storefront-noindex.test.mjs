import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('public test storefront asks crawlers not to index template content', () => {
  const layout = readFileSync(new URL('../app/layout.js', import.meta.url), 'utf8');
  assert.match(layout, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
});
