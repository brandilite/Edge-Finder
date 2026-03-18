'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface TechnicalAnalysisProps {
  symbol?: string;
  interval?: string;
  height?: number;
}

export default function TechnicalAnalysis({
  symbol = 'FX:EURUSD',
  interval = '1D',
  height = 450,
}: TechnicalAnalysisProps) {
  const config = useMemo(
    () => ({
      interval,
      width: '100%',
      isTransparent: true,
      height,
      symbol,
      showIntervalTabs: true,
      displayMode: 'multiple',
      locale: 'en',
      colorTheme: 'dark',
    }),
    [symbol, interval, height]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
        config={config}
      />
    </div>
  );
}
