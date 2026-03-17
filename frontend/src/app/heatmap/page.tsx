'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { ASSET_CLASSES } from '@/lib/constants';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useRouter } from 'next/navigation';

function scoreToColor(score: number): string {
  if (score >= 6) return '#16a34a';
  if (score >= 3) return '#22c55e';
  if (score >= 1) return '#86efac';
  if (score > -1) return '#eab308';
  if (score > -3) return '#fca5a5';
  if (score > -6) return '#ef4444';
  return '#dc2626';
}

export default function HeatmapPage() {
  const router = useRouter();

  const queries = ASSET_CLASSES.map((ac) => ({
    queryKey: ['scorecard', ac],
    queryFn: () => apiGet<any>(`/scorecard/${ac}`),
  }));

  const results = queries.map((q) => useQuery(q));
  const isLoading = results.some((r) => r.isLoading);

  const allCards: any[] = [];
  results.forEach((r) => {
    if (r.data?.scorecards) {
      allCards.push(...r.data.scorecards);
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Market Heatmap</h1>
      <p className="text-gray-400">Score-based heatmap across all tracked instruments</p>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {allCards.map((card: any) => (
            <button
              key={card.symbol}
              onClick={() => router.push(`/scorecard/${card.symbol}`)}
              className="rounded-lg p-4 text-center transition-transform hover:scale-105 cursor-pointer"
              style={{ backgroundColor: scoreToColor(card.total_score) + '33', borderColor: scoreToColor(card.total_score), borderWidth: 1 }}
            >
              <div className="font-bold text-white">{card.symbol}</div>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: scoreToColor(card.total_score) }}
              >
                {card.total_score > 0 ? '+' : ''}{card.total_score?.toFixed(1)}
              </div>
              <div className={`text-xs mt-1 font-semibold ${
                card.direction === 'BULLISH' ? 'text-accent-green'
                : card.direction === 'BEARISH' ? 'text-accent-red'
                : 'text-accent-yellow'
              }`}>
                {card.direction}
              </div>
              <div className="text-xs text-gray-400 mt-1">{card.asset_class}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
