import { Router, Request, Response } from 'express';
import { getQuote } from '../services/quoteManager.js';

const router = Router();

router.get('/quotes/:symbol(*)', async (req: Request, res: Response) => {
  try {
    const symbol = String(req.params.symbol);

    if (!symbol) {
      res.status(400).json({ error: 'Symbol is required' });
      return;
    }

    const quote = await getQuote(String(symbol));
    res.json({
      symbol,
      quote,
    });
  } catch (err: any) {
    console.error('[quotes] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
