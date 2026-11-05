import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = path => readFileSync(new URL(`../app/api/${path}/route.js`, import.meta.url), 'utf8');

test('payment webhook is disabled by default before Stripe or database side effects', () => {
  const route = source('webhook');
  assert.ok(route.indexOf('process.env.CHECKOUT_ENABLED !== "true"') > 0);
  assert.ok(route.indexOf('process.env.CHECKOUT_ENABLED !== "true"') < route.indexOf('new Stripe('));
  assert.ok(route.indexOf('process.env.CHECKOUT_ENABLED !== "true"') < route.indexOf('await connect()'));
  assert.doesNotMatch(route, /console\.log\([^\n]*(?:Raw body|Headers:|Stripe signature:)/);
});
