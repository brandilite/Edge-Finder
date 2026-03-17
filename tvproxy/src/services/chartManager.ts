import TradingView from '@mathieuc/tradingview';
import { tvClient } from './tvClient.js';

export async function getCandles(
  symbol: string,
  timeframe: string = '1D',
  count: number = 300
): Promise<any[]> {
  const client = await tvClient.getClient();

  return new Promise((resolve, reject) => {
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
      setTimeout(() => {
        const periods = chart.periods.map((p: any) => ({
          time: p.time,
          open: p.open,
          high: p.max,
          low: p.min,
          close: p.close,
          volume: p.volume,
        }));
        chart.delete();
        resolve(periods);
      }, 2000);
    });

    setTimeout(() => {
      chart.delete();
      reject(new Error('Candle fetch timeout'));
    }, 10000);
  });
}
