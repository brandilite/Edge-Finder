'use client';

import { useState } from 'react';
import clsx from 'clsx';

type Tab = 'gainers' | 'losers' | 'active';

interface StockRow {
  symbol: string;
  price: string;
  change: string;
  volume?: string;
}

const MOCK_DATA: Record<Tab, StockRow[]> = {
  gainers: [
    { symbol: 'SMCI', price: '1,028.50', change: '+8.42%' },
    { symbol: 'ARM', price: '164.20', change: '+6.15%' },
    { symbol: 'PLTR', price: '23.85', change: '+5.67%' },
    { symbol: 'RIVN', price: '14.30', change: '+4.89%' },
    { symbol: 'COIN', price: '178.40', change: '+4.23%' },
  ],
  losers: [
    { symbol: 'MRNA', price: '97.30', change: '-5.21%' },
    { symbol: 'PYPL', price: '61.20', change: '-3.87%' },
    { symbol: 'DIS', price: '112.50', change: '-2.98%' },
    { symbol: 'NKE', price: '93.40', change: '-2.55%' },
    { symbol: 'BA', price: '185.60', change: '-2.12%' },
  ],
  active: [
    { symbol: 'TSLA', price: '171.05', change: '-1.85%', volume: '142M' },
    { symbol: 'NVDA', price: '878.35', change: '+1.43%', volume: '89M' },
    { symbol: 'AAPL', price: '178.72', change: '+1.21%', volume: '67M' },
    { symbol: 'AMD', price: '178.40', change: '+2.15%', volume: '58M' },
    { symbol: 'META', price: '505.20', change: '+0.78%', volume: '42M' },
  ],
};

export default function GainersLosers() {
  const [tab, setTab] = useState<Tab>('gainers');

  return (
    <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
      <div className="flex border-b border-[#1a1a1a]">
        {(['gainers', 'losers', 'active'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'flex-1 text-[12px] font-medium py-2.5 transition-colors capitalize',
              tab === t
                ? 'text-white border-b-2 border-[#015608] -mb-px'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="divide-y divide-[#1a1a1a]/50">
        {MOCK_DATA[tab].map((row) => {
          const isPositive = row.change.startsWith('+');
          return (
            <div key={row.symbol} className="flex items-center justify-between px-4 py-2 hover:bg-[#111111] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-gray-200 w-12">{row.symbol}</span>
                {row.volume && <span className="text-[11px] text-gray-500">Vol: {row.volume}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-gray-300">${row.price}</span>
                <span className={clsx('text-[12px] font-medium min-w-[60px] text-right', isPositive ? 'text-[#22c55e]' : 'text-red-400')}>
                  {row.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
