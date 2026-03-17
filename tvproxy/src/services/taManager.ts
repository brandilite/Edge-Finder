import TradingView from '@mathieuc/tradingview';

const taCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000;

export async function getTechnicalAnalysis(symbol: string): Promise<any> {
  const cacheKey = symbol;
  const cached = taCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const ta = await TradingView.getTA(symbol);
  taCache.set(cacheKey, { data: ta, timestamp: Date.now() });
  return ta;
}
