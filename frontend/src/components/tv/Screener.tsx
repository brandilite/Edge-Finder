'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface ScreenerProps {
  height?: number;
  defaultScreen?: string;
  market?: string;
}

export default function Screener({
  height = 600,
  defaultScreen = 'general',
  market = 'forex',
}: ScreenerProps) {
  const config = useMemo(
    () => ({
      width: '100%',
      height,
      defaultColumn: 'overview',
      defaultScreen,
      market,
      showToolbar: true,
      colorTheme: 'dark',
      locale: 'en',
      isTransparent: true,
    }),
    [height, defaultScreen, market]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-screener.js"
        config={config}
      />
    </div>
  );
}
