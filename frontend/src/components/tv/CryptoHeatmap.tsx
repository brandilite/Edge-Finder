'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface CryptoHeatmapProps {
  height?: number;
}

export default function CryptoHeatmap({ height = 500 }: CryptoHeatmapProps) {
  const config = useMemo(
    () => ({
      dataSource: 'Crypto',
      blockSize: 'market_cap_calc',
      blockColor: 'change',
      locale: 'en',
      symbolUrl: '',
      colorTheme: 'dark',
      hasTopBar: true,
      isDataSetEnabled: true,
      isTransparent: true,
      width: '100%',
      height,
    }),
    [height]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js"
        config={config}
      />
    </div>
  );
}
