'use client';

import { useState } from 'react';
import Screener from '@/components/tv/Screener';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';
import MiniChart from '@/components/tv/MiniChart';

const TOP_SYMBOLS = [
  { tv: 'FX:EURUSD', label: 'EUR/USD' },
  { tv: 'FX:GBPUSD', label: 'GBP/USD' },
  { tv: 'FX:USDJPY', label: 'USD/JPY' },
  { tv: 'FX:AUDUSD', label: 'AUD/USD' },
  { tv: 'OANDA:XAUUSD', label: 'Gold' },
  { tv: 'BITSTAMP:BTCUSD', label: 'Bitcoin' },
  { tv: 'FOREXCOM:SPXUSD', label: 'S&P 500' },
  { tv: 'TVC:USOIL', label: 'Oil' },
];

export default function TopSetupsPage() {
  const [selected, setSelected] = useState(TOP_SYMBOLS[0]);

  return (
    <div className="p-5 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">Scorecard / Top Setups</h1>
        <p className="text-sm text-gray-500 mt-1">Technical scorecard overview with multi-timeframe analysis</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TOP_SYMBOLS.map((s) => (
          <button
            key={s.tv}
            onClick={() => setSelected(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selected.tv === s.tv
                ? 'bg-blue-500 text-white'
                : 'bg-[#1f2937] text-gray-400 hover:text-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-[#2a2f3a] overflow-hidden bg-[#1a1f2e]">
            <MiniChart symbol={selected.tv} height={300} dateRange="3M" />
          </div>
        </div>
        <div className="rounded-lg border border-[#2a2f3a] overflow-hidden bg-[#1a1f2e]">
          <TechnicalAnalysis symbol={selected.tv} interval="1D" height={300} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {['1m', '15m', '1h', '1W'].map((tf) => (
          <div key={tf} className="rounded-lg border border-[#2a2f3a] overflow-hidden bg-[#1a1f2e]">
            <div className="px-3 py-2 border-b border-[#2a2f3a] text-xs font-semibold text-gray-400 uppercase">
              {tf}
            </div>
            <TechnicalAnalysis symbol={selected.tv} interval={tf} height={250} />
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Forex Screener</h2>
        <div className="rounded-lg border border-[#2a2f3a] overflow-hidden">
          <Screener height={400} market="forex" defaultScreen="most_volatile" />
        </div>
      </div>
    </div>
  );
}
