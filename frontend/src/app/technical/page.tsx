'use client';

import { useState } from 'react';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';
import MiniChart from '@/components/tv/MiniChart';

const SYMBOLS = [
  { tv: 'FX:EURUSD', label: 'EUR/USD' },
  { tv: 'FX:GBPUSD', label: 'GBP/USD' },
  { tv: 'FX:USDJPY', label: 'USD/JPY' },
  { tv: 'FX:AUDUSD', label: 'AUD/USD' },
  { tv: 'FX:USDCAD', label: 'USD/CAD' },
  { tv: 'OANDA:XAUUSD', label: 'Gold' },
  { tv: 'OANDA:XAGUSD', label: 'Silver' },
  { tv: 'BITSTAMP:BTCUSD', label: 'Bitcoin' },
  { tv: 'BITSTAMP:ETHUSD', label: 'Ethereum' },
  { tv: 'FOREXCOM:SPXUSD', label: 'S&P 500' },
  { tv: 'FOREXCOM:NSXUSD', label: 'Nasdaq' },
  { tv: 'TVC:USOIL', label: 'Crude Oil' },
];

export default function TechnicalPage() {
  const [selected, setSelected] = useState(SYMBOLS[0].tv);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100">Technical Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time technical ratings from TradingView</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SYMBOLS.map((s) => (
          <button
            key={s.tv}
            onClick={() => setSelected(s.tv)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selected === s.tv
                ? 'bg-blue-500 text-white'
                : 'bg-[#1c2530] text-gray-400 hover:text-gray-200 hover:bg-[#243040]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Chart</h2>
          <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
            <MiniChart symbol={selected} height={300} dateRange="3M" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Daily Rating</h2>
          <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
            <TechnicalAnalysis symbol={selected} interval="1D" height={300} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">1 Minute</h3>
          <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
            <TechnicalAnalysis symbol={selected} interval="1m" height={350} />
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">1 Hour</h3>
          <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
            <TechnicalAnalysis symbol={selected} interval="1h" height={350} />
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">1 Week</h3>
          <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
            <TechnicalAnalysis symbol={selected} interval="1W" height={350} />
          </div>
        </div>
      </div>
    </div>
  );
}
