import TradingView from '@mathieuc/tradingview';
import { tvClient } from './tvClient.js';

export async function getQuote(symbol: string): Promise<any> {
  const client = await tvClient.getClient();

  return new Promise((resolve, reject) => {
    const quote = new client.Session.Quote();
    const market = new quote.Market(symbol);

    market.onData((data: any) => {
      resolve(data);
      market.close();
    });

    market.onError((...args: any[]) => {
      reject(new Error(`Quote error: ${args.join(', ')}`));
      market.close();
    });

    setTimeout(() => {
      market.close();
      reject(new Error('Quote fetch timeout'));
    }, 10000);
  });
}
