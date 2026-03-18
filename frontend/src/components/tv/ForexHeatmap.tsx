'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface ForexHeatmapProps {
  height?: number;
  currencies?: string[];
}

export default function ForexHeatmap({ height = 500, currencies }: ForexHeatmapProps) {
  const config = useMemo(
    () => ({
      width: '100%',
      height,
      currencies: currencies || [
        'EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD',
      ],
      isTransparent: true,
      colorTheme: 'dark',
      locale: 'en',
      backgroundColor: '#0f1419',
    }),
    [height, currencies]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js"
        config={config}
      />
    </div>
  );
}
