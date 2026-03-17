'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { useAppStore } from '@/stores/useAppStore';
import { ASSET_CLASS_SYMBOLS } from '@/lib/constants';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import clsx from 'clsx';

interface TechnicalData {
  symbol: string;
  summary?: { signal: string; buy: number; sell: number; neutral: number };
  oscillators?: { signal: string; buy: number; sell: number; neutral: number };
  moving_averages?: { signal: string; buy: number; sell: number; neutral: number };
  indicators?: Record<string, number | string>;
}

function RatingBar({ label, data }: { label: string; data?: { signal: string; buy: number; sell: number; neutral: number } }) {
  if (!data) return null;
  const total = data.buy + data.sell + data.neutral || 1;
  const buyPct = (data.buy / total) * 100;
  const neutralPct = (data.neutral / total) * 100;
  const sellPct = (data.sell / total) * 100;

  const signalColor = data.signal?.toLowerCase().includes('buy')
    ? 'text-accent-green'
    : data.signal?.toLowerCase().includes('sell')
    ? 'text-accent-red'
    : 'text-accent-yellow';

  return (
    <div className="bg-dark-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className={clsx('text-sm font-bold uppercase', signalColor)}>
          {data.signal || 'N/A'}
        </span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-dark-600">
        <div className="bg-accent-green" style={{ width: `${buyPct}%` }} />
        <div className="bg-accent-yellow" style={{ width: `${neutralPct}%` }} />
        <div className="bg-accent-red" style={{ width: `${sellPct}%` }} />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Buy: {data.buy}</span>
        <span>Neutral: {data.neutral}</span>
        <span>Sell: {data.sell}</span>
      </div>
    </div>
  );
}

export default function TechnicalPage() {
  const assetClass = useAppStore((s) => s.selectedAssetClass);
  const symbols = ASSET_CLASS_SYMBOLS[assetClass];
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);

  const { data, isLoading, error } = useQuery<TechnicalData>({
    queryKey: ['technical', selectedSymbol],
    queryFn: () => apiGet<TechnicalData>(`/technical/${selectedSymbol}`),
    enabled: !!selectedSymbol,
    staleTime: 120_000,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-100">Technical Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Technical ratings and indicator analysis</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {symbols.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSymbol(s)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedSymbol === s
                ? 'bg-accent-blue text-white'
                : 'bg-dark-700 text-gray-400 hover:text-gray-200 hover:bg-dark-600'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-sm text-accent-red">
          Failed to load technical data for {selectedSymbol}.
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RatingBar label="Summary" data={data.summary} />
            <RatingBar label="Oscillators" data={data.oscillators} />
            <RatingBar label="Moving Averages" data={data.moving_averages} />
          </div>

          {data.indicators && Object.keys(data.indicators).length > 0 && (
            <div className="bg-dark-800 border border-dark-600 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-dark-600">
                <h2 className="text-sm font-bold text-gray-200">Indicator Values</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-dark-700">
                {Object.entries(data.indicators).map(([key, value]) => (
                  <div key={key} className="bg-dark-800 p-3">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <span className="text-sm font-mono text-gray-200">
                      {typeof value === 'number' ? value.toFixed(4) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
