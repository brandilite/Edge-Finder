'use client';

import { useState } from 'react';
import AdvancedChart from '@/components/tv/AdvancedChart';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';
import Timeline from '@/components/tv/Timeline';

const COT_SYMBOLS = [
  { tv: 'FX:EURUSD', label: 'EUR/USD', cot: 'Euro FX' },
  { tv: 'FX:GBPUSD', label: 'GBP/USD', cot: 'British Pound' },
  { tv: 'FX:USDJPY', label: 'USD/JPY', cot: 'Japanese Yen' },
  { tv: 'FX:AUDUSD', label: 'AUD/USD', cot: 'Australian Dollar' },
  { tv: 'FX:USDCAD', label: 'USD/CAD', cot: 'Canadian Dollar' },
  { tv: 'OANDA:XAUUSD', label: 'Gold', cot: 'Gold' },
  { tv: 'OANDA:XAGUSD', label: 'Silver', cot: 'Silver' },
  { tv: 'TVC:USOIL', label: 'Crude Oil', cot: 'Crude Oil' },
];

export default function COTPage() {
  const [selected, setSelected] = useState(COT_SYMBOLS[0]);

  return (
    <div className="p-5 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">COT Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Commitment of Traders positioning context — chart + technical + news
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {COT_SYMBOLS.map((s) => (
          <button
            key={s.tv}
            onClick={() => setSelected(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selected.tv === s.tv
                ? 'bg-[#015608] text-white'
                : 'bg-[#111111] text-gray-400 hover:text-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AdvancedChart symbol={selected.tv} height={450} interval="W" />
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-lg border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a]">
            <TechnicalAnalysis symbol={selected.tv} interval="1W" height={250} />
          </div>
          <div className="rounded-lg border border-[#1a1a1a] overflow-hidden">
            <Timeline height={250} feedMode="all_symbols" market="forex" />
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] p-4">
        <p className="text-sm text-gray-400">
          <span className="text-gray-200 font-semibold">COT Data Note:</span>{' '}
          CFTC Commitment of Traders reports are released weekly (Fridays 3:30 PM ET).
          Use the weekly chart above to correlate institutional positioning with price action.
          The TradingView COT indicator can be added via the chart&apos;s indicator menu (search &quot;COT&quot;).
        </p>
      </div>
    </div>
  );
}
