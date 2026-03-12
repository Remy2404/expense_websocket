import { createServer } from 'node:http';
import { loadRelayConfig } from './config/env.mjs';
import { createHttpHandler } from './http/handler.mjs';
import { createSocketServer } from './socket/server.mjs';

const closeServer = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

export const createRelayServer = (config = loadRelayConfig()) => {
  let io = null;
  const httpHandler = createHttpHandler(config, (type, firebaseUid, eventPayload) => {
    io?.to(firebaseUid).emit(type, eventPayload);
  });

  const httpServer = createServer(httpHandler);
  io = createSocketServer(httpServer, config);

  const start = () =>
    new Promise((resolve, reject) => {
      httpServer.once('error', reject);
      httpServer.listen(config.port, () => {
        httpServer.off('error', reject);
        resolve();
      });
    });

  const stop = async () => {
    io.close();
    await closeServer(httpServer);
  };

  return { start, stop, config };
};

export const startRelayServer = async () => {
  const relayServer = createRelayServer();
  await relayServer.start();
  console.log(`Realtime relay listening on port ${relayServer.config.port}`);

  const shutdown = async () => {
    try {
      await relayServer.stop();
      process.exit(0);
    } catch (error) {
      console.error('Failed to shutdown relay server gracefully.', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};
