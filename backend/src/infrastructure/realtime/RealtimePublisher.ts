import { WebSocket } from 'ws';
import { Response } from 'express';
import { logger } from '../../shared/logger/logger.js';

export interface RealtimeMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export class RealtimePublisher {
  private static instance: RealtimePublisher;
  private wsClients: Set<WebSocket> = new Set();
  private sseClients: Set<Response> = new Set();

  private constructor() {}

  public static getInstance(): RealtimePublisher {
    if (!RealtimePublisher.instance) {
      RealtimePublisher.instance = new RealtimePublisher();
    }
    return RealtimePublisher.instance;
  }

  public registerWebSocket(ws: WebSocket): void {
    this.wsClients.add(ws);
    logger.info(`Realtime: WebSocket client connected. Active: ${this.wsClients.size}`);

    ws.on('close', () => {
      this.wsClients.delete(ws);
      logger.info(`Realtime: WebSocket client disconnected. Remaining: ${this.wsClients.size}`);
    });

    ws.on('error', (err) => {
      logger.error('Realtime: WebSocket client error', err);
      this.wsClients.delete(ws);
    });

    // Send initial ping/welcome
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'KPL Live Stream Connected', timestamp: new Date().toISOString() }));
  }

  public registerSseClient(res: Response): void {
    this.sseClients.add(res);
    logger.info(`Realtime: SSE client connected. Active: ${this.sseClients.size}`);

    res.on('close', () => {
      this.sseClients.delete(res);
      logger.info(`Realtime: SSE client disconnected. Remaining: ${this.sseClients.size}`);
    });

    // Send initial connected event
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Stream Active', timestamp: new Date().toISOString() })}\n\n`);
  }

  public broadcast(type: string, payload: any): void {
    const message: RealtimeMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(message);

    // Broadcast to WebSocket clients
    for (const ws of this.wsClients) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(jsonString);
        } catch (err) {
          logger.error('Failed to send to WS client', err);
        }
      }
    }

    // Broadcast to SSE clients
    const sseFormatted = `data: ${jsonString}\n\n`;
    for (const res of this.sseClients) {
      try {
        res.write(sseFormatted);
      } catch (err) {
        logger.error('Failed to send to SSE client', err);
      }
    }

    logger.debug(`Realtime: Broadcasted ${type} to ${this.wsClients.size} WS and ${this.sseClients.size} SSE clients`);
  }
}
