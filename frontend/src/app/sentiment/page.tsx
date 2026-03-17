'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { SentimentBar } from '@/components/sentiment/SentimentBar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function SentimentPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sentiment'],
    queryFn: () => apiGet<any>('/sentiment'),
  });

  const symbols = data?.symbols || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Retail Sentiment</h1>
      <p className="text-gray-400">
        Myfxbook community outlook. Contrarian signal — extreme positioning often precedes reversals.
      </p>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-red-400">Failed to load sentiment data</div>
      ) : (
        <div className="grid gap-4">
          {symbols.map((item: any) => (
            <div key={item.symbol} className="bg-dark-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg">{item.symbol}</span>
                <span className="text-xs text-gray-500">{item.source}</span>
              </div>
              <SentimentBar pctLong={item.pct_long} pctShort={item.pct_short} />
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-accent-green">Long: {item.pct_long?.toFixed(1)}%</span>
                <span className="text-accent-red">Short: {item.pct_short?.toFixed(1)}%</span>
              </div>
              {(item.pct_long >= 70 || item.pct_long <= 30) && (
                <div className={`mt-2 text-xs font-semibold px-2 py-1 rounded inline-block ${
                  item.pct_long >= 70 ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
                }`}>
                  {item.pct_long >= 70 ? 'EXTREME LONG — Bearish Signal' : 'EXTREME SHORT — Bullish Signal'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
