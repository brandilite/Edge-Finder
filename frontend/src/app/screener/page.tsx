'use client';

import { useState } from 'react';
import Screener from '@/components/tv/Screener';

const MARKETS = [
  { label: 'Forex', value: 'forex' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'America', value: 'america' },
  { label: 'UK', value: 'uk' },
  { label: 'Germany', value: 'germany' },
  { label: 'India', value: 'india' },
];

export default function ScreenerPage() {
  const [market, setMarket] = useState('forex');

  return (
    <div className="p-5 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Screener</h1>
        <p className="text-sm text-gray-500 mt-1">Filter and scan markets with TradingView screener</p>
      </div>

      <div className="flex gap-2">
        {MARKETS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMarket(m.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              market === m.value
                ? 'bg-[#015608] text-white'
                : 'bg-[#0a0a0a] text-gray-400 hover:text-white border border-[#1a1a1a]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[#1a1a1a] overflow-hidden">
        <Screener
          height={typeof window !== 'undefined' ? window.innerHeight - 220 : 650}
          market={market}
        />
      </div>
    </div>
  );
}
