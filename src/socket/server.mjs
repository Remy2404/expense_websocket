import { Server } from 'socket.io';
import { verifyRealtimeToken } from '../security/token.mjs';

const createOriginValidator = (allowedOrigins) => {
  const allowAll = allowedOrigins.includes('*');
  const originSet = new Set(allowedOrigins);

  return (origin, callback) => {
    if (allowAll || !origin || originSet.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed: ${origin}`));
  };
};

export const createSocketServer = (httpServer, config) => {
  const io = new Server(httpServer, {
    cors: {
      origin: createOriginValidator(config.allowedOrigins),
      methods: ['GET', 'POST'],
      credentials: !config.allowedOrigins.includes('*'),
    },
    transports: ['websocket'],
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== 'string' || !token) {
        next(new Error('Missing realtime auth token.'));
        return;
      }

      const claims = verifyRealtimeToken(token, config.relaySecret);
      socket.data.firebaseUid = claims.firebaseUid;
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error('Realtime authentication failed.'));
    }
  });

  io.on('connection', (socket) => {
    const firebaseUid = socket.data.firebaseUid;
    if (typeof firebaseUid === 'string' && firebaseUid) {
      socket.join(firebaseUid);
    }
  });

  return io;
};
