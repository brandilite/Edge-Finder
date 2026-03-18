'use client';

import { useMemo } from 'react';
import TradingViewWidget from '@/components/tv/TradingViewWidget';
import EconomicCalendar from '@/components/tv/EconomicCalendar';

function EconomyMap({ height = 400 }: { height?: number }) {
  const config = useMemo(
    () => ({
      width: '100%',
      height,
      isTransparent: true,
      colorTheme: 'dark',
      locale: 'en',
    }),
    [height]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-economy-overview.js"
        config={config}
      />
    </div>
  );
}

export default function MacroPage() {
  return (
    <div className="p-5 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Macro Map</h1>
        <p className="text-sm text-gray-500 mt-1">
          Global economic overview — GDP, interest rates, inflation, and more
        </p>
      </div>

      <div className="rounded-lg border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a]">
        <EconomyMap height={500} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Economic Calendar</h2>
        <div className="rounded-lg border border-[#1a1a1a] overflow-hidden">
          <EconomicCalendar height={450} />
        </div>
      </div>
    </div>
  );
}
