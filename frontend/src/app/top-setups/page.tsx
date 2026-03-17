'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { ScorecardItem } from '@/hooks/useScorecard';
import { ASSET_CLASSES, AssetClass } from '@/lib/constants';
import ScoreBadge from '@/components/shared/ScoreBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Link from 'next/link';

interface ScorecardResponse {
  asset_class: string;
  scorecards: ScorecardItem[];
}

export default function TopSetupsPage() {
  const { data: allScorecards, isLoading, error } = useQuery({
    queryKey: ['all-scorecards'],
    queryFn: async () => {
      const results = await Promise.all(
        ASSET_CLASSES.map((ac) =>
          apiGet<ScorecardResponse>(`/scorecard/${ac}`).catch(() => ({
            asset_class: ac,
            scorecards: [],
          }))
        )
      );
      return results.flatMap((r) =>
        r.scorecards.map((s) => ({ ...s, asset_class: r.asset_class }))
      );
    },
    staleTime: 60_000,
  });

  const sorted = allScorecards
    ? [...allScorecards].sort((a, b) => Math.abs(b.total_score) - Math.abs(a.total_score))
    : [];

  const topBullish = sorted.filter((s) => s.total_score > 0).slice(0, 10);
  const topBearish = sorted.filter((s) => s.total_score < 0).slice(0, 10);

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-sm text-accent-red">
        Failed to load setups.
      </div>
    );
  }

  const renderTable = (items: (ScorecardItem & { asset_class: string })[], title: string) => (
    <div className="bg-dark-800 border border-dark-600 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-600">
        <h2 className="text-sm font-bold text-gray-200">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-700">
            <th className="text-left py-2.5 px-4 text-gray-400 font-medium">#</th>
            <th className="text-left py-2.5 px-4 text-gray-400 font-medium">Symbol</th>
            <th className="text-right py-2.5 px-4 text-gray-400 font-medium">Score</th>
            <th className="text-center py-2.5 px-4 text-gray-400 font-medium">Direction</th>
            <th className="text-left py-2.5 px-4 text-gray-400 font-medium">Class</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.symbol} className="border-b border-dark-700 hover:bg-dark-700 transition-colors">
              <td className="py-2.5 px-4 text-gray-500">{i + 1}</td>
              <td className="py-2.5 px-4">
                <Link href={`/scorecard/${item.symbol}`} className="text-gray-200 font-medium hover:text-accent-blue transition-colors">
                  {item.symbol}
                </Link>
              </td>
              <td className={`py-2.5 px-4 text-right font-bold ${item.total_score > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {item.total_score > 0 ? '+' : ''}{item.total_score}
              </td>
              <td className="py-2.5 px-4 text-center">
                <ScoreBadge direction={item.direction} size="sm" />
              </td>
              <td className="py-2.5 px-4 text-gray-400 capitalize">{item.asset_class}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500">No setups found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-100">Top Setups</h1>
        <p className="text-sm text-gray-500 mt-1">Strongest trading setups across all asset classes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTable(topBullish, 'Top Bullish Setups')}
        {renderTable(topBearish, 'Top Bearish Setups')}
      </div>
    </div>
  );
}
