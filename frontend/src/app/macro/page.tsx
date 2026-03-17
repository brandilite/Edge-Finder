'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { COUNTRIES } from '@/lib/constants';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MacroPage() {
  const [country, setCountry] = useState<string>('US');

  const { data, isLoading } = useQuery({
    queryKey: ['macro', country],
    queryFn: () => apiGet<any>(`/macro/${country}`),
  });

  const indicators = data?.indicators || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Macro Dashboard</h1>

      <div className="flex gap-2">
        {COUNTRIES.map((c) => (
          <button
            key={c}
            onClick={() => setCountry(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              country === c
                ? 'bg-accent-blue text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indicators.map((ind: any) => {
            const change = ind.latest_value && ind.previous_value
              ? ind.latest_value - ind.previous_value
              : null;
            const isPositive = change !== null && change > 0;
            const isNegative = change !== null && change < 0;

            return (
              <div key={ind.series_id} className="bg-dark-800 rounded-lg p-5">
                <div className="text-sm text-gray-400 mb-1">{ind.name}</div>
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-bold">
                    {ind.latest_value != null ? ind.latest_value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'}
                  </span>
                  {change !== null && (
                    <span className={`flex items-center text-sm ${
                      isPositive ? 'text-accent-green' : isNegative ? 'text-accent-red' : 'text-gray-400'
                    }`}>
                      {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
                      <span className="ml-1">{Math.abs(change).toFixed(2)}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Previous: {ind.previous_value?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'}
                  {ind.latest_date && ` | ${ind.latest_date}`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
