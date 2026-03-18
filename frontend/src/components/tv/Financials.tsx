'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface FinancialsProps {
  symbol?: string;
  height?: number;
}

export default function Financials({ symbol = 'NASDAQ:AAPL', height = 450 }: FinancialsProps) {
  const config = useMemo(
    () => ({
      isTransparent: true,
      largeChartUrl: '',
      displayMode: 'regular',
      width: '100%',
      height,
      colorTheme: 'dark',
      symbol,
      locale: 'en',
    }),
    [symbol, height]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-financials.js"
        config={config}
      />
    </div>
  );
}
