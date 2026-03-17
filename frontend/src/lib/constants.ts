export const ASSET_CLASSES = ['forex', 'crypto', 'commodities', 'indices'] as const;
export type AssetClass = typeof ASSET_CLASSES[number];

export const FOREX_SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'];
export const CRYPTO_SYMBOLS = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD'];
export const COMMODITY_SYMBOLS = ['XAUUSD', 'XAGUSD', 'USOIL', 'NGAS'];
export const INDEX_SYMBOLS = ['SPX500', 'NAS100', 'US30', 'UK100', 'DE40'];

export const COUNTRIES = ['US', 'EU', 'UK', 'JP', 'CA', 'AU'] as const;
export type Country = typeof COUNTRIES[number];

export const SCORE_COLORS = {
  bullish: '#22c55e',
  bearish: '#ef4444',
  neutral: '#eab308',
} as const;

export const ASSET_CLASS_SYMBOLS: Record<AssetClass, string[]> = {
  forex: FOREX_SYMBOLS,
  crypto: CRYPTO_SYMBOLS,
  commodities: COMMODITY_SYMBOLS,
  indices: INDEX_SYMBOLS,
};

export const ALL_SYMBOLS = [
  ...FOREX_SYMBOLS,
  ...CRYPTO_SYMBOLS,
  ...COMMODITY_SYMBOLS,
  ...INDEX_SYMBOLS,
];
