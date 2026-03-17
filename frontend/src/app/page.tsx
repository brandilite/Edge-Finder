'use client';

import { useAppStore } from '@/stores/useAppStore';
import { useScorecards } from '@/hooks/useScorecard';
import ScorecardCard from '@/components/scorecard/ScorecardCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function HomePage() {
  const assetClass = useAppStore((s) => s.selectedAssetClass);
  const { data, isLoading, error } = useScorecards(assetClass);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-100">Scorecard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          AI-driven scores across technical, sentiment, COT, fundamental, and seasonal factors
        </p>
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-sm text-accent-red">
          Failed to load scorecards. Please check your connection and try again.
        </div>
      )}

      {data?.scorecards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {data.scorecards.map((item) => (
            <ScorecardCard key={item.symbol} item={item} />
          ))}
        </div>
      )}

      {data?.scorecards?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No scorecards available for this asset class.
        </div>
      )}
    </div>
  );
}
