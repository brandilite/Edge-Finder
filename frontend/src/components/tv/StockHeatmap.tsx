'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface StockHeatmapProps {
  height?: number;
  dataSource?: string;
  grouping?: string;
}

export default function StockHeatmap({
  height = 500,
  dataSource = 'SPX500',
  grouping = 'sector',
}: StockHeatmapProps) {
  const config = useMemo(
    () => ({
      exchanges: [],
      dataSource,
      grouping,
      blockSize: 'market_cap_basic',
      blockColor: 'change',
      locale: 'en',
      symbolUrl: '',
      colorTheme: 'dark',
      hasTopBar: true,
      isDataSet498: true,
      isTransparent: true,
      width: '100%',
      height,
    }),
    [height, dataSource, grouping]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js"
        config={config}
      />
    </div>
  );
}
