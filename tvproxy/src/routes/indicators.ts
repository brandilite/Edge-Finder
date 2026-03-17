import { Router, Request, Response } from 'express';
import TradingView from '@mathieuc/tradingview';
import { tvClient } from '../services/tvClient.js';

const router = Router();

const BUILTIN_INDICATORS: Record<string, string> = {
  RSI: 'STD;RSI',
  MACD: 'STD;MACD',
  EMA: 'STD;EMA',
  SMA: 'STD;SMA',
  BB: 'STD;Bollinger_Bands',
  STOCH: 'STD;Stochastic',
  ATR: 'STD;Average_True_Range',
  ADX: 'STD;Average_Directional_Index',
  CCI: 'STD;CCI',
  MFI: 'STD;Money_Flow',
  OBV: 'STD;On_Balance_Volume',
  VWAP: 'STD;VWAP',
  ICHIMOKU: 'STD;Ichimoku_Cloud',
  PSAR: 'STD;Parabolic_SAR',
  WILLIAMS: 'STD;Williams_R',
};

router.get('/indicators/:symbol(*)', async (req: Request, res: Response) => {
  try {
    const symbol = String(req.params.symbol);
    const indicatorName = String(req.query.indicator || 'RSI').toUpperCase();
    const timeframe = String(req.query.timeframe || '1D');
    const count = parseInt(String(req.query.count || '100'), 10);

    if (!symbol) {
      res.status(400).json({ error: 'Symbol is required' });
      return;
    }

    const indicatorId = BUILTIN_INDICATORS[indicatorName];
    if (!indicatorId) {
      res.status(400).json({
        error: `Unknown indicator "${indicatorName}". Available: ${Object.keys(BUILTIN_INDICATORS).join(', ')}`,
      });
      return;
    }

    const client = await tvClient.getClient();

    const data = await new Promise<any>((resolve, reject) => {
      const chart = new client.Session.Chart();

      chart.setMarket(symbol, {
        timeframe,
        range: count,
      });

      chart.onError((...args: any[]) => {
        chart.delete();
        reject(new Error(`Chart error: ${args.join(', ')}`));
      });

      chart.onSymbolLoaded(() => {
        const study = new chart.Study(indicatorId);

        study.onReady(() => {
          setTimeout(() => {
            const studyPeriods = study.periods.map((p: any) => {
              const entry: any = { time: p.time };
              for (const key of Object.keys(p)) {
                if (key !== 'time' && key !== '$') {
                  entry[key] = p[key];
                }
              }
              return entry;
            });
            chart.delete();
            resolve(studyPeriods);
          }, 2000);
        });

        study.onError((...args: any[]) => {
          chart.delete();
          reject(new Error(`Study error: ${args.join(', ')}`));
        });
      });

      setTimeout(() => {
        chart.delete();
        reject(new Error('Indicator fetch timeout'));
      }, 15000);
    });

    res.json({
      symbol,
      indicator: indicatorName,
      timeframe,
      count: data.length,
      data,
    });
  } catch (err: any) {
    console.error('[indicators] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
