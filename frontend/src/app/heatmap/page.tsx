'use client';

import { useState } from 'react';
import ForexHeatmap from '@/components/tv/ForexHeatmap';
import StockHeatmap from '@/components/tv/StockHeatmap';
import CryptoHeatmap from '@/components/tv/CryptoHeatmap';

const TABS = ['Forex', 'Stocks', 'Crypto'] as const;

export default function HeatmapPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Forex');

  return (
    <div className="p-5 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Market Heatmap</h1>
        <p className="text-sm text-gray-500 mt-1">Visual strength/weakness across markets</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-[#015608] text-white'
                : 'bg-[#111111] text-gray-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[#1a1a1a] overflow-hidden">
        {tab === 'Forex' && <ForexHeatmap height={600} />}
        {tab === 'Stocks' && <StockHeatmap height={600} dataSource="SPX500" />}
        {tab === 'Crypto' && <CryptoHeatmap height={600} />}
      </div>
    </div>
  );
}
