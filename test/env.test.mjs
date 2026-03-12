import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRelayConfig } from '../src/config/env.mjs';

test('loadRelayConfig parses comma-separated origins', () => {
  const config = loadRelayConfig({
    RELAY_SECRET: '1234567890abcdef',
    RELAY_ALLOWED_ORIGINS: 'https://a.example, https://b.example',
    PORT: '8091',
  });

  assert.equal(config.port, 8091);
  assert.deepEqual(config.allowedOrigins, ['https://a.example', 'https://b.example']);
});

test('loadRelayConfig rejects wildcard origin in production', () => {
  assert.throws(
    () =>
      loadRelayConfig({
        NODE_ENV: 'production',
        RELAY_SECRET: '1234567890abcdef',
        RELAY_ALLOWED_ORIGINS: '*',
      }),
    /Wildcard CORS origin is not allowed in production/
  );
});
