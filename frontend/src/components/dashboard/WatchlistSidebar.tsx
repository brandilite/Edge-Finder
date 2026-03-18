'use client';

import { useState } from 'react';
import { Star, Plus } from 'lucide-react';
import clsx from 'clsx';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  starred: boolean;
}

const MOCK_WATCHLIST: WatchlistItem[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: '178.72', change: '+2.14', changePercent: '+1.21%', starred: true },
  { symbol: 'MSFT', name: 'Microsoft', price: '415.30', change: '+3.87', changePercent: '+0.94%', starred: true },
  { symbol: 'GOOGL', name: 'Alphabet', price: '141.80', change: '-0.56', changePercent: '-0.39%', starred: true },
  { symbol: 'NVDA', name: 'NVIDIA', price: '878.35', change: '+12.40', changePercent: '+1.43%', starred: true },
  { symbol: 'TSLA', name: 'Tesla', price: '171.05', change: '-3.22', changePercent: '-1.85%', starred: false },
  { symbol: 'BTC', name: 'Bitcoin', price: '67,420', change: '+820', changePercent: '+1.23%', starred: true },
  { symbol: 'ETH', name: 'Ethereum', price: '3,520', change: '+45', changePercent: '+1.29%', starred: false },
];

export default function WatchlistSidebar() {
  const [items, setItems] = useState(MOCK_WATCHLIST);

  const toggleStar = (symbol: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.symbol === symbol ? { ...item, starred: !item.starred } : item
      )
    );
  };

  return (
    <div className="bg-[#1a1f2e] rounded-lg border border-[#2a2f3a] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2f3a]">
        <h3 className="text-sm font-semibold text-gray-200">Watchlist</h3>
        <button className="p-1 rounded-md hover:bg-[#2a2f3a] text-gray-400 hover:text-gray-200 transition-colors">
          <Plus size={14} />
        </button>
      </div>
      <div className="divide-y divide-[#2a2f3a]/50">
        {items.map((item) => {
          const isPositive = item.change.startsWith('+');
          return (
            <div
              key={item.symbol}
              className="flex items-center gap-2 px-4 py-2 hover:bg-[#1f2937] transition-colors cursor-pointer"
            >
              <button
                onClick={() => toggleStar(item.symbol)}
                className="flex-shrink-0"
              >
                <Star
                  size={13}
                  className={clsx(
                    'transition-colors',
                    item.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                  )}
                />
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium text-gray-200">{item.symbol}</span>
                <span className="text-[11px] text-gray-500 ml-1.5">{item.name}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[13px] font-medium text-gray-200">${item.price}</div>
                <div
                  className={clsx(
                    'text-[11px] font-medium',
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {item.changePercent}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Note: Will connect to useWatchlist hook for Supabase data */}
    </div>
  );
}
