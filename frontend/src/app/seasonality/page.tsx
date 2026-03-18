'use client';

import { useState } from 'react';
import AdvancedChart from '@/components/tv/AdvancedChart';
import MiniChart from '@/components/tv/MiniChart';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';

const SYMBOLS = [
  { tv: 'FX:EURUSD', label: 'EUR/USD' },
  { tv: 'FX:GBPUSD', label: 'GBP/USD' },
  { tv: 'FX:USDJPY', label: 'USD/JPY' },
  { tv: 'OANDA:XAUUSD', label: 'Gold' },
  { tv: 'BITSTAMP:BTCUSD', label: 'Bitcoin' },
  { tv: 'FOREXCOM:SPXUSD', label: 'S&P 500' },
  { tv: 'TVC:USOIL', label: 'Crude Oil' },
];

const RANGES = [
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '12M' },
  { label: '5Y', value: '60M' },
  { label: 'All', value: 'ALL' },
];

export default function SeasonalityPage() {
  const [selected, setSelected] = useState(SYMBOLS[0]);
  const [range, setRange] = useState('12M');

  return (
    <div className="p-5 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">Seasonality</h1>
        <p className="text-sm text-gray-500 mt-1">
          Historical price patterns and seasonal trends
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {SYMBOLS.map((s) => (
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
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                range === r.value
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <AdvancedChart symbol={selected.tv} height={500} interval="M" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#2a2f3a] overflow-hidden bg-[#1a1f2e]">
          <div className="px-3 py-2 border-b border-[#2a2f3a]">
            <span className="text-xs font-semibold text-gray-400 uppercase">Weekly View</span>
          </div>
          <MiniChart symbol={selected.tv} height={250} dateRange={range} />
        </div>
        <div className="rounded-lg border border-[#2a2f3a] overflow-hidden bg-[#1a1f2e]">
          <div className="px-3 py-2 border-b border-[#2a2f3a]">
            <span className="text-xs font-semibold text-gray-400 uppercase">Monthly Technical</span>
          </div>
          <TechnicalAnalysis symbol={selected.tv} interval="1M" height={250} />
        </div>
      </div>
    </div>
  );
}
