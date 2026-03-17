import { WebSocketServer, WebSocket } from 'ws';
import { tvClient } from '../services/tvClient.js';

interface ClientSubscription {
  ws: WebSocket;
  symbols: Set<string>;
}

interface MarketHandle {
  market: any;
  quote: any;
  subscribers: Set<WebSocket>;
}

export function createRealtimeServer(port: number): WebSocketServer {
  const wss = new WebSocketServer({ port });
  const clients = new Map<WebSocket, ClientSubscription>();
  const markets = new Map<string, MarketHandle>();

  console.log(`[ws] Realtime WebSocket server listening on port ${port}`);

  wss.on('connection', (ws: WebSocket) => {
    console.log('[ws] Client connected');
    clients.set(ws, { ws, symbols: new Set() });

    ws.on('message', async (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === 'subscribe' && msg.symbol) {
          await handleSubscribe(ws, msg.symbol);
        } else if (msg.type === 'unsubscribe' && msg.symbol) {
          handleUnsubscribe(ws, msg.symbol);
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type. Use subscribe/unsubscribe with a symbol.' }));
        }
      } catch (err: any) {
        ws.send(JSON.stringify({ type: 'error', message: `Parse error: ${err.message}` }));
      }
    });

    ws.on('close', () => {
      console.log('[ws] Client disconnected');
      const sub = clients.get(ws);
      if (sub) {
        for (const symbol of sub.symbols) {
          handleUnsubscribe(ws, symbol);
        }
        clients.delete(ws);
      }
    });

    ws.on('error', (err) => {
      console.error('[ws] Client error:', err.message);
    });
  });

  async function handleSubscribe(ws: WebSocket, symbol: string) {
    const sub = clients.get(ws);
    if (!sub) return;

    sub.symbols.add(symbol);

    if (markets.has(symbol)) {
      const handle = markets.get(symbol)!;
      handle.subscribers.add(ws);
      ws.send(JSON.stringify({ type: 'subscribed', symbol }));
      return;
    }

    try {
      const client = await tvClient.getClient();
      const quote = new client.Session.Quote();
      const market = new quote.Market(symbol);

      const handle: MarketHandle = {
        market,
        quote,
        subscribers: new Set([ws]),
      };
      markets.set(symbol, handle);

      market.onData((data: any) => {
        const payload = JSON.stringify({
          type: 'quote',
          symbol,
          data,
        });
        for (const subscriber of handle.subscribers) {
          if (subscriber.readyState === WebSocket.OPEN) {
            subscriber.send(payload);
          }
        }
      });

      market.onError((...args: any[]) => {
        const errPayload = JSON.stringify({
          type: 'error',
          symbol,
          message: `Market error: ${args.join(', ')}`,
        });
        for (const subscriber of handle.subscribers) {
          if (subscriber.readyState === WebSocket.OPEN) {
            subscriber.send(errPayload);
          }
        }
      });

      ws.send(JSON.stringify({ type: 'subscribed', symbol }));
    } catch (err: any) {
      ws.send(JSON.stringify({ type: 'error', symbol, message: err.message }));
    }
  }

  function handleUnsubscribe(ws: WebSocket, symbol: string) {
    const sub = clients.get(ws);
    if (sub) {
      sub.symbols.delete(symbol);
    }

    const handle = markets.get(symbol);
    if (!handle) return;

    handle.subscribers.delete(ws);

    if (handle.subscribers.size === 0) {
      try {
        handle.market.close();
      } catch (_) {
        // ignore close errors
      }
      markets.delete(symbol);
      console.log(`[ws] No subscribers left for ${symbol}, closed market`);
    }

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'unsubscribed', symbol }));
    }
  }

  return wss;
}
