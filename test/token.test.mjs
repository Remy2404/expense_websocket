import test from 'node:test';
import assert from 'node:assert/strict';
import { createRealtimeToken, verifyRealtimeToken, verifyBearerAuthorization } from '../src/security/token.mjs';

test('verifyRealtimeToken accepts valid token', () => {
  const secret = '1234567890abcdef';
  const expiresAt = Math.floor(Date.now() / 1000) + 60;
  const token = createRealtimeToken('uid-1', expiresAt, secret);
  const claims = verifyRealtimeToken(token, secret);

  assert.equal(claims.firebaseUid, 'uid-1');
  assert.equal(claims.expiresAt, expiresAt);
});

test('verifyRealtimeToken rejects expired token', () => {
  const secret = '1234567890abcdef';
  const expiredToken = createRealtimeToken('uid-1', Math.floor(Date.now() / 1000) - 10, secret);

  assert.throws(() => verifyRealtimeToken(expiredToken, secret), /Realtime token expired/);
});

test('verifyBearerAuthorization validates secret safely', () => {
  const secret = '1234567890abcdef';
  assert.equal(verifyBearerAuthorization(`Bearer ${secret}`, secret), true);
  assert.equal(verifyBearerAuthorization('Bearer wrong', secret), false);
  assert.equal(verifyBearerAuthorization('', secret), false);
});
