import { readJsonBody } from './body.mjs';
import { verifyBearerAuthorization } from '../security/token.mjs';

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const validateEventPayload = (payload) => {
  const { type, firebaseUid } = payload;
  if (typeof type !== 'string' || !type.trim()) {
    throw new Error('Event payload requires a non-empty string type.');
  }
  if (typeof firebaseUid !== 'string' || !firebaseUid.trim()) {
    throw new Error('Event payload requires a non-empty string firebaseUid.');
  }
};

const handleInternalEvents = async (req, res, config, publishEvent) => {
  if (!verifyBearerAuthorization(req.headers.authorization, config.relaySecret)) {
    json(res, 401, { error: 'Unauthorized' });
    return;
  }

  try {
    const payload = await readJsonBody(req, config.maxBodyBytes);
    validateEventPayload(payload);
    const { type, firebaseUid, ...eventPayload } = payload;
    publishEvent(type, firebaseUid, eventPayload);
    json(res, 202, { accepted: true });
  } catch (error) {
    json(res, 400, { error: error instanceof Error ? error.message : 'Invalid request body.' });
  }
};

export const createHttpHandler = (config, publishEvent) => {
  return async (req, res) => {
    if (req.url === '/health' || req.url === '/ready') {
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && req.url === config.internalEventPath) {
      await handleInternalEvents(req, res, config, publishEvent);
      return;
    }

    json(res, 404, { error: 'Not found' });
  };
};
