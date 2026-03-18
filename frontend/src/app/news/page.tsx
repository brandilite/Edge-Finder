'use client';

import { useState } from 'react';
import Timeline from '@/components/tv/Timeline';

const MARKETS = [
  { label: 'All', value: 'forex', feed: 'all_symbols' },
  { label: 'Forex', value: 'forex', feed: 'market' },
  { label: 'Crypto', value: 'crypto', feed: 'market' },
  { label: 'Stock', value: 'stock', feed: 'market' },
  { label: 'Index', value: 'index', feed: 'market' },
  { label: 'Futures', value: 'futures', feed: 'market' },
];

export default function NewsPage() {
  const [selected, setSelected] = useState(0);

  const current = MARKETS[selected];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-100">Market News</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time news feed from TradingView</p>
      </div>

      <div className="flex gap-2">
        {MARKETS.map((m, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selected === i
                ? 'bg-blue-500 text-white'
                : 'bg-[#1c2530] text-gray-400 hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[#243040] overflow-hidden">
        <Timeline
          height={Math.max(600, typeof window !== 'undefined' ? window.innerHeight - 220 : 700)}
          feedMode={current.feed}
          market={current.value}
        />
      </div>
    </div>
  );
}
