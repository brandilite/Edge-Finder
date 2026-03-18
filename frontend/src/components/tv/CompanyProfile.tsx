'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface CompanyProfileProps {
  symbol?: string;
  height?: number;
}

export default function CompanyProfile({ symbol = 'NASDAQ:AAPL', height = 400 }: CompanyProfileProps) {
  const config = useMemo(
    () => ({
      width: '100%',
      height,
      isTransparent: true,
      colorTheme: 'dark',
      symbol,
      locale: 'en',
    }),
    [symbol, height]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js"
        config={config}
      />
    </div>
  );
}
