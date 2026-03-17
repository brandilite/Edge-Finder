import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { tvClient } from './services/tvClient.js';
import { createRealtimeServer } from './ws/realtimeServer.js';

import candlesRouter from './routes/candles.js';
import taRouter from './routes/ta.js';
import searchRouter from './routes/search.js';
import quotesRouter from './routes/quotes.js';
import indicatorsRouter from './routes/indicators.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Mount routes
app.use('/tv', candlesRouter);
app.use('/tv', taRouter);
app.use('/tv', searchRouter);
app.use('/tv', quotesRouter);
app.use('/tv', indicatorsRouter);

// Start HTTP server
const httpServer = app.listen(config.PORT, () => {
  console.log(`[tvproxy] HTTP server listening on port ${config.PORT}`);
});

// Start WebSocket server
const wss = createRealtimeServer(config.WS_PORT);

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n[tvproxy] Received ${signal}, shutting down...`);

  wss.close(() => {
    console.log('[tvproxy] WebSocket server closed');
  });

  httpServer.close(async () => {
    console.log('[tvproxy] HTTP server closed');
    await tvClient.end();
    console.log('[tvproxy] TradingView client disconnected');
    process.exit(0);
  });

  // Force exit after 5s
  setTimeout(() => {
    console.error('[tvproxy] Forced shutdown after timeout');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
