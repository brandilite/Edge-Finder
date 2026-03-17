import { Router, Request, Response } from 'express';
import TradingView from '@mathieuc/tradingview';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q ? String(req.query.q) : '';
    const type = req.query.type ? String(req.query.type) : undefined;

    if (!query) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    const searchOptions: any = {};
    if (type) {
      searchOptions.type = type;
    }

    const results = await TradingView.searchMarketV3(query, searchOptions);
    res.json({
      query,
      type: type || 'all',
      count: results.length,
      results,
    });
  } catch (err: any) {
    console.error('[search] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
