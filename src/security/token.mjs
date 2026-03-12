import crypto from 'node:crypto';

const nowEpochSeconds = () => Math.floor(Date.now() / 1000);

const base64Url = (buffer) => buffer.toString('base64url');

const signPayload = (payload, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return base64Url(hmac.digest());
};

const timingSafeEqualText = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const createRealtimeToken = (firebaseUid, expiresAtEpochSeconds, secret) => {
  const payload = `${firebaseUid}.${expiresAtEpochSeconds}`;
  const signature = signPayload(payload, secret);
  return `${payload}.${signature}`;
};

export const verifyRealtimeToken = (token, secret) => {
  const [firebaseUid, expiresAtRaw, signature] = token.split('.');
  if (!firebaseUid || !expiresAtRaw || !signature) {
    throw new Error('Malformed realtime token.');
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= nowEpochSeconds()) {
    throw new Error('Realtime token expired.');
  }

  const payload = `${firebaseUid}.${expiresAtRaw}`;
  const expectedSignature = signPayload(payload, secret);
  if (!timingSafeEqualText(signature, expectedSignature)) {
    throw new Error('Invalid realtime token signature.');
  }

  return { firebaseUid, expiresAt };
};

export const verifyBearerAuthorization = (authorizationHeader, secret) => {
  if (typeof authorizationHeader !== 'string' || !authorizationHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authorizationHeader.slice('Bearer '.length);
  return timingSafeEqualText(token, secret);
};
