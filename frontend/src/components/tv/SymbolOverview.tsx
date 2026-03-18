'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface SymbolOverviewProps {
  symbols?: string[][];
  height?: number;
}

export default function SymbolOverview({
  symbols,
  height = 400,
}: SymbolOverviewProps) {
  const config = useMemo(
    () => ({
      symbols: symbols || [
        ['FX:EURUSD|1D'],
        ['FX:GBPUSD|1D'],
        ['FX:USDJPY|1D'],
        ['OANDA:XAUUSD|1D'],
        ['BITSTAMP:BTCUSD|1D'],
      ],
      chartOnly: false,
      width: '100%',
      height,
      locale: 'en',
      colorTheme: 'dark',
      autosize: true,
      showVolume: true,
      showMA: true,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: 'right',
      scaleMode: 'Normal',
      fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
      fontSize: '10',
      noTimeScale: false,
      valuesTracking: '1',
      changeMode: 'price-and-percent',
      chartType: 'area',
      maLineColor: '#2962FF',
      maLineWidth: 1,
      maLength: 9,
      backgroundColor: 'rgba(15, 20, 25, 1)',
      gridLineColor: 'rgba(36, 48, 64, 0.6)',
      lineWidth: 2,
      lineType: 0,
      dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
    }),
    [symbols, height]
  );

  return (
    <div style={{ height: `${height}px` }} className="rounded-lg overflow-hidden border border-[#243040]">
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
        config={config}
      />
    </div>
  );
}
