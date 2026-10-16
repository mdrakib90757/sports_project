type EventCallback = (payload: any) => void;

class RealtimeClient {
  private static instance: RealtimeClient;
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 10000;
  private reconnectTimer: any = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initConnection();
    }
  }

  public static getInstance(): RealtimeClient {
    if (!RealtimeClient.instance) {
      RealtimeClient.instance = new RealtimeClient();
    }
    return RealtimeClient.instance;
  }

  private initConnection(): void {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      (window.location.protocol === 'https:' ? 'wss:' : 'ws:') +
        '//' +
        (window.location.hostname === 'localhost' ? 'localhost:4000' : window.location.host) +
        '/ws';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('STATUS_CHANGE', { connected: true, transport: 'ws' });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type) {
            this.emit(msg.type, msg.payload);
          }
        } catch {
          // ignore invalid json
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit('STATUS_CHANGE', { connected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        // Fallback to SSE if WS fails
        if (!this.isConnected && !this.eventSource) {
          this.initSseFallback();
        }
      };
    } catch {
      this.initSseFallback();
    }
  }

  private initSseFallback(): void {
    const sseUrl =
      (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api') + '/realtime/stream';

    try {
      this.eventSource = new EventSource(sseUrl, { withCredentials: true });

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.emit('STATUS_CHANGE', { connected: true, transport: 'sse' });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type) {
            this.emit(msg.type, msg.payload);
          }
        } catch {
          // ignore
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.emit('STATUS_CHANGE', { connected: false });
        this.eventSource?.close();
        this.eventSource = null;
        this.scheduleReconnect();
      };
    } catch {
      // ignore
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.initConnection();
    }, delay);
  }

  public on(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unbind function
    return () => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  public emit(eventType: string, payload: any): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`Error in realtime listener for ${eventType}:`, err);
        }
      });
    }
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const realtimeClient = RealtimeClient.getInstance();
