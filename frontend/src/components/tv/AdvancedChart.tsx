'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface AdvancedChartProps {
  symbol?: string;
  interval?: string;
  height?: number | string;
  allowSymbolChange?: boolean;
  showDrawingToolbar?: boolean;
}

export default function AdvancedChart({
  symbol = 'FX:EURUSD',
  interval = 'D',
  height = 600,
  allowSymbolChange = true,
  showDrawingToolbar = true,
}: AdvancedChartProps) {
  const config = useMemo(
    () => ({
      autosize: true,
      symbol,
      interval,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#000000',
      gridColor: 'rgba(36, 48, 64, 0.6)',
      allow_symbol_change: allowSymbolChange,
      hide_side_toolbar: !showDrawingToolbar,
      calendar: false,
      studies: ['STD;RSI', 'STD;MACD'],
      support_host: 'https://www.tradingview.com',
    }),
    [symbol, interval, allowSymbolChange, showDrawingToolbar]
  );

  return (
    <div style={{ height: typeof height === 'number' ? `${height}px` : height }} className="rounded-lg overflow-hidden border border-[#243040]">
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
        config={config}
      />
    </div>
  );
}
