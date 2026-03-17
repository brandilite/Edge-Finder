'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { ASSET_CLASS_SYMBOLS } from '@/lib/constants';
import TVChart from '@/components/charts/TVChart';
import clsx from 'clsx';

const TIMEFRAMES = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1H', value: '60' },
  { label: '4H', value: '240' },
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
  { label: '1M', value: 'M' },
];

export default function ChartsPage() {
  const assetClass = useAppStore((s) => s.selectedAssetClass);
  const symbols = ASSET_CLASS_SYMBOLS[assetClass];
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);
  const [timeframe, setTimeframe] = useState('D');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-100">Charts</h1>
        <p className="text-sm text-gray-500 mt-1">Interactive TradingView charts</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent-blue/50"
        >
          {symbols.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                timeframe === tf.value
                  ? 'bg-accent-blue text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-gray-200'
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <TVChart
        symbol={selectedSymbol}
        interval={timeframe}
        height={typeof window !== 'undefined' ? window.innerHeight - 220 : 600}
      />
    </div>
  );
}
