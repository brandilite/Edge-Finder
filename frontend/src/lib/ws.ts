export interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

type QuoteCallback = (quote: Quote) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private subscriptions: Map<string, Set<QuoteCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnected = false;
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();

  constructor() {
    this.url = process.env.NEXT_PUBLIC_TV_WS_URL || 'ws://localhost:4001';
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.notifyConnectionStatus(true);

        // Re-subscribe to all active symbols
        for (const symbol of Array.from(this.subscriptions.keys())) {
          this.sendSubscribe(symbol);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'quote' && data.symbol) {
            const callbacks = this.subscriptions.get(data.symbol);
            if (callbacks) {
              const quote: Quote = {
                symbol: data.symbol,
                bid: data.bid ?? data.price ?? 0,
                ask: data.ask ?? data.price ?? 0,
                price: data.price ?? 0,
                change: data.change ?? 0,
                changePercent: data.changePercent ?? 0,
                timestamp: data.timestamp ?? Date.now(),
              };
              callbacks.forEach((cb) => cb(quote));
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyConnectionStatus(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
      this.connect();
    }, this.reconnectDelay);
  }

  private sendSubscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  private sendUnsubscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  subscribe(symbol: string, callback: QuoteCallback): () => void {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, new Set());
      this.sendSubscribe(symbol);
    }
    this.subscriptions.get(symbol)!.add(callback);

    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect();
    }

    return () => {
      const callbacks = this.subscriptions.get(symbol);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(symbol);
          this.sendUnsubscribe(symbol);
        }
      }
    };
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.add(callback);
    callback(this.isConnected);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  private notifyConnectionStatus(connected: boolean): void {
    this.connectionCallbacks.forEach((cb) => cb(connected));
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.subscriptions.clear();
    this.isConnected = false;
  }
}

export const wsManager = new WebSocketManager();
