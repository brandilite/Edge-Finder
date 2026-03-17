'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { AssetClass } from '@/lib/constants';

export interface ScorecardItem {
  symbol: string;
  total_score: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  technical: number;
  sentiment: number;
  cot: number;
  fundamental: number;
  seasonal: number;
  [key: string]: unknown;
}

interface ScorecardResponse {
  asset_class: string;
  scorecards: ScorecardItem[];
}

export function useScorecards(assetClass: AssetClass) {
  return useQuery<ScorecardResponse>({
    queryKey: ['scorecards', assetClass],
    queryFn: () => apiGet<ScorecardResponse>(`/scorecard/${assetClass}`),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useScorecard(assetClass: AssetClass, symbol: string) {
  return useQuery<ScorecardItem>({
    queryKey: ['scorecard', assetClass, symbol],
    queryFn: () => apiGet<ScorecardItem>(`/scorecard/${assetClass}/${symbol}`),
    staleTime: 60_000,
    enabled: !!symbol,
  });
}
