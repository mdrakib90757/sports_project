import http from 'http';
import { WebSocketServer } from 'ws';
import { createApp } from './app.js';
import { env } from '../../config/env.js';
import { logger } from '../../shared/logger/logger.js';
import { getDbClient } from '../../infrastructure/database/drizzle/client.js';

async function bootstrap() {
  const { app, realtimePublisher } = createApp();
  const server = http.createServer(app);

  // Attach WebSocket server on /ws
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    realtimePublisher.registerWebSocket(ws);
  });

  // Try DB connection asynchronously without blocking server startup
  getDbClient().catch((err) => {
    logger.warn('Initial DB connection attempt ended:', err.message);
  });

  server.listen(env.PORT, () => {
    logger.info(`====================================================`);
    logger.info(`KPL Season 3 Backend Server running on port ${env.PORT}`);
    logger.info(`REST API: http://localhost:${env.PORT}/api`);
    logger.info(`WebSocket: ws://localhost:${env.PORT}/ws`);
    logger.info(`SSE Stream: http://localhost:${env.PORT}/api/realtime/stream`);
    logger.info(`====================================================`);
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error:', err);
  process.exit(1);
});
