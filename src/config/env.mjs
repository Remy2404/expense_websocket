const DEFAULT_PORT = 8090;
const DEFAULT_EVENT_PATH = '/internal/events';
const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const normalizeOriginList = (value) => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const ensureValidConfig = (config) => {
  if (!config.relaySecret) {
    throw new Error('RELAY_SECRET or REALTIME_RELAY_SECRET is required.');
  }

  if (config.relaySecret.length < 16) {
    throw new Error('Relay secret must be at least 16 characters.');
  }

  if (config.nodeEnv === 'production' && config.allowedOrigins.includes('*')) {
    throw new Error('Wildcard CORS origin is not allowed in production.');
  }
};

export const loadRelayConfig = (env = process.env) => {
  const allowedOriginsRaw = env.RELAY_ALLOWED_ORIGIN || env.RELAY_ALLOWED_ORIGINS || ''.split(',');
  const allowedOrigins = normalizeOriginList(allowedOriginsRaw);

  const config = {
    nodeEnv: env.NODE_ENV || 'development',
    port: parsePositiveInt(env.RELAY_PORT || env.PORT, DEFAULT_PORT),
    relaySecret: env.RELAY_SECRET || env.REALTIME_RELAY_SECRET || '',
    allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : ['*'],
    internalEventPath: env.RELAY_INTERNAL_EVENT_PATH || DEFAULT_EVENT_PATH,
    maxBodyBytes: parsePositiveInt(env.RELAY_MAX_BODY_BYTES, DEFAULT_MAX_BODY_BYTES),
  };

  ensureValidConfig(config);
  return config;
};
