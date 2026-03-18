'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface MarketOverviewProps {
  height?: number;
}

export default function MarketOverview({ height = 450 }: MarketOverviewProps) {
  const config = useMemo(
    () => ({
      colorTheme: 'dark',
      dateRange: '12M',
      showChart: true,
      locale: 'en',
      width: '100%',
      height,
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      plotLineColorGrowing: 'rgba(34, 197, 94, 1)',
      plotLineColorFalling: 'rgba(239, 68, 68, 1)',
      gridLineColor: 'rgba(36, 48, 64, 0.6)',
      scaleFontColor: 'rgba(156, 163, 175, 1)',
      belowLineFillColorGrowing: 'rgba(34, 197, 94, 0.12)',
      belowLineFillColorFalling: 'rgba(239, 68, 68, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(34, 197, 94, 0)',
      belowLineFillColorFallingBottom: 'rgba(239, 68, 68, 0)',
      symbolActiveColor: 'rgba(59, 130, 246, 0.12)',
      tabs: [
        {
          title: 'Forex',
          symbols: [
            { s: 'FX:EURUSD', d: 'EUR/USD' },
            { s: 'FX:GBPUSD', d: 'GBP/USD' },
            { s: 'FX:USDJPY', d: 'USD/JPY' },
            { s: 'FX:AUDUSD', d: 'AUD/USD' },
            { s: 'FX:USDCAD', d: 'USD/CAD' },
            { s: 'FX:USDCHF', d: 'USD/CHF' },
          ],
          originalTitle: 'Forex',
        },
        {
          title: 'Indices',
          symbols: [
            { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
            { s: 'FOREXCOM:NSXUSD', d: 'US 100' },
            { s: 'FOREXCOM:DJI', d: 'Dow 30' },
            { s: 'INDEX:DEU40', d: 'DAX 40' },
            { s: 'INDEX:UKX', d: 'FTSE 100' },
            { s: 'INDEX:NKY', d: 'Nikkei 225' },
          ],
          originalTitle: 'Indices',
        },
        {
          title: 'Commodities',
          symbols: [
            { s: 'OANDA:XAUUSD', d: 'Gold' },
            { s: 'OANDA:XAGUSD', d: 'Silver' },
            { s: 'TVC:USOIL', d: 'Crude Oil' },
            { s: 'TVC:NGAS', d: 'Natural Gas' },
            { s: 'OANDA:XCUUSD', d: 'Copper' },
          ],
          originalTitle: 'Commodities',
        },
        {
          title: 'Crypto',
          symbols: [
            { s: 'BITSTAMP:BTCUSD', d: 'Bitcoin' },
            { s: 'BITSTAMP:ETHUSD', d: 'Ethereum' },
            { s: 'BINANCE:SOLUSDT', d: 'Solana' },
            { s: 'BINANCE:XRPUSDT', d: 'XRP' },
            { s: 'BINANCE:ADAUSDT', d: 'Cardano' },
          ],
          originalTitle: 'Crypto',
        },
      ],
    }),
    [height]
  );

  return (
    <div style={{ height: `${height}px` }} className="rounded-lg overflow-hidden border border-[#243040]">
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
        config={config}
      />
    </div>
  );
}
