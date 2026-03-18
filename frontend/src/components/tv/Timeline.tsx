'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface TimelineProps {
  height?: number;
  feedMode?: string;
  market?: string;
}

export default function Timeline({
  height = 600,
  feedMode = 'all_symbols',
  market = 'forex',
}: TimelineProps) {
  const config = useMemo(
    () => ({
      feedMode,
      market,
      isTransparent: true,
      displayMode: 'regular',
      width: '100%',
      height,
      colorTheme: 'dark',
      locale: 'en',
    }),
    [height, feedMode, market]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
        config={config}
      />
    </div>
  );
}
