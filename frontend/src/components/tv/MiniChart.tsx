'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface MiniChartProps {
  symbol?: string;
  width?: number | string;
  height?: number | string;
  dateRange?: string;
}

export default function MiniChart({
  symbol = 'FX:EURUSD',
  width = '100%',
  height = 220,
  dateRange = '12M',
}: MiniChartProps) {
  const config = useMemo(
    () => ({
      symbol,
      width: typeof width === 'number' ? width : '100%',
      height: typeof height === 'number' ? height : '100%',
      locale: 'en',
      dateRange,
      colorTheme: 'dark',
      isTransparent: true,
      autosize: typeof width !== 'number',
      largeChartUrl: '',
    }),
    [symbol, width, height, dateRange]
  );

  return (
    <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js"
        config={config}
      />
    </div>
  );
}
