import { Router, Request, Response } from 'express';
import { getTechnicalAnalysis } from '../services/taManager.js';

const router = Router();

router.get('/ta/:symbol(*)', async (req: Request, res: Response) => {
  try {
    const symbol = String(req.params.symbol);

    if (!symbol) {
      res.status(400).json({ error: 'Symbol is required' });
      return;
    }

    const ta = await getTechnicalAnalysis(String(symbol));
    res.json({
      symbol,
      analysis: ta,
    });
  } catch (err: any) {
    console.error('[ta] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
