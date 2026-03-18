'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface MarketQuotesProps {
  height?: number;
  symbols?: Array<{ name: string; displayName?: string }>;
}

export default function MarketQuotes({ height = 400, symbols }: MarketQuotesProps) {
  const config = useMemo(
    () => ({
      width: '100%',
      height,
      symbolsGroups: [
        {
          name: 'Forex',
          originalName: 'Forex',
          symbols: [
            { name: 'FX:EURUSD', displayName: 'EUR/USD' },
            { name: 'FX:GBPUSD', displayName: 'GBP/USD' },
            { name: 'FX:USDJPY', displayName: 'USD/JPY' },
            { name: 'FX:AUDUSD', displayName: 'AUD/USD' },
            { name: 'FX:USDCAD', displayName: 'USD/CAD' },
            { name: 'FX:USDCHF', displayName: 'USD/CHF' },
            { name: 'FX:NZDUSD', displayName: 'NZD/USD' },
            { name: 'FX:EURGBP', displayName: 'EUR/GBP' },
          ],
        },
        {
          name: 'Crypto',
          originalName: 'Crypto',
          symbols: [
            { name: 'BITSTAMP:BTCUSD', displayName: 'Bitcoin' },
            { name: 'BITSTAMP:ETHUSD', displayName: 'Ethereum' },
            { name: 'BINANCE:SOLUSDT', displayName: 'Solana' },
            { name: 'BINANCE:XRPUSDT', displayName: 'XRP' },
          ],
        },
        {
          name: 'Commodities',
          originalName: 'Commodities',
          symbols: [
            { name: 'OANDA:XAUUSD', displayName: 'Gold' },
            { name: 'OANDA:XAGUSD', displayName: 'Silver' },
            { name: 'TVC:USOIL', displayName: 'Crude Oil' },
            { name: 'TVC:NGAS', displayName: 'Natural Gas' },
          ],
        },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      colorTheme: 'dark',
      locale: 'en',
    }),
    [height, symbols]
  );

  return (
    <div style={{ height: `${height}px` }} className="rounded-lg overflow-hidden border border-[#243040]">
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
        config={config}
      />
    </div>
  );
}
