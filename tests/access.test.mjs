import test from 'node:test';
import assert from 'node:assert/strict';
import { adminAccessStatus, ownsOrder } from '../lib/access.mjs';

test('explicit roles override stale admin flags in compatibility helpers', () => {
  for (const role of ['owner','manager','kitchen','customer']) {
    const session={user:{email:'staff@test',role,admin:true}};
    const permitted=['owner','manager'].includes(role);
    assert.equal(adminAccessStatus(session),permitted?200:403);
    assert.equal(ownsOrder(session,{email:'customer@test'}),permitted);
  }
  assert.equal(adminAccessStatus({user:{email:'x@test',role:'invalid',admin:true}}),403);
});

test('admin API policy denies anonymous and regular users', () => {
  assert.equal(adminAccessStatus(null), 401);
  assert.equal(adminAccessStatus({ user: { email: 'x@example.test', admin: false } }), 403);
  assert.equal(adminAccessStatus({ user: { email: 'x@example.test', admin: true } }), 200);
});

test('order ownership cannot be asserted by passing a different email', () => {
  assert.equal(ownsOrder(null, {email: 'x@example.test'}), false);
  assert.equal(ownsOrder({ user: { email: 'x@example.test' } }, { email: 'y@example.test' }), false);
  assert.equal(ownsOrder({ user: { email: 'X@example.test' } }, { email: 'x@example.test' }), true);
  assert.equal(ownsOrder({ user: { email: 'admin@example.test', admin: true } }, { email: 'x@example.test' }), true);
});
