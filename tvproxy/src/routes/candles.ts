import { Router, Request, Response } from 'express';
import { getCandles } from '../services/chartManager.js';

const router = Router();

router.get('/candles/:symbol(*)', async (req: Request, res: Response) => {
  try {
    const symbol = String(req.params.symbol);
    const timeframe = String(req.query.timeframe || '1D');
    const count = parseInt(String(req.query.count || '300'), 10);

    if (!symbol) {
      res.status(400).json({ error: 'Symbol is required' });
      return;
    }

    const candles = await getCandles(symbol, timeframe, count);
    res.json({
      symbol,
      timeframe,
      count: candles.length,
      candles,
    });
  } catch (err: any) {
    console.error('[candles] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
