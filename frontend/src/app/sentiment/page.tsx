'use client';

import { useState } from 'react';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';
import MiniChart from '@/components/tv/MiniChart';

const PAIRS = [
  { tv: 'FX:EURUSD', label: 'EUR/USD' },
  { tv: 'FX:GBPUSD', label: 'GBP/USD' },
  { tv: 'FX:USDJPY', label: 'USD/JPY' },
  { tv: 'FX:AUDUSD', label: 'AUD/USD' },
  { tv: 'FX:USDCAD', label: 'USD/CAD' },
  { tv: 'FX:USDCHF', label: 'USD/CHF' },
  { tv: 'OANDA:XAUUSD', label: 'Gold' },
  { tv: 'BITSTAMP:BTCUSD', label: 'Bitcoin' },
];

export default function SentimentPage() {
  const [view, setView] = useState<'grid' | 'detail'>('grid');

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Market Sentiment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Technical sentiment across major pairs — oscillators + moving averages
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              view === 'grid' ? 'bg-[#015608] text-white' : 'bg-[#111111] text-gray-400'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView('detail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              view === 'detail' ? 'bg-[#015608] text-white' : 'bg-[#111111] text-gray-400'
            }`}
          >
            Detail
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PAIRS.map((pair) => (
            <div
              key={pair.tv}
              className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-[#1a1a1a]">
                <span className="text-sm font-semibold text-gray-200">{pair.label}</span>
              </div>
              <TechnicalAnalysis symbol={pair.tv} interval="1D" height={280} />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-5 space-y-4">
          {PAIRS.map((pair) => (
            <div
              key={pair.tv}
              className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[#1a1a1a]">
                <span className="text-sm font-bold text-gray-200">{pair.label}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <MiniChart symbol={pair.tv} height={200} dateRange="1M" />
                <TechnicalAnalysis symbol={pair.tv} interval="1D" height={200} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
