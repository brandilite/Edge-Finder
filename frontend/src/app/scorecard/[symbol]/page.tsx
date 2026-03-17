'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { useQuote } from '@/hooks/useQuote';
import { ScorecardItem } from '@/hooks/useScorecard';
import ScoreGauge from '@/components/shared/ScoreGauge';
import ScoreBadge from '@/components/shared/ScoreBadge';
import ScoreBreakdown from '@/components/scorecard/ScoreBreakdown';
import TVChart from '@/components/charts/TVChart';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ScorecardDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const { quote, isConnected } = useQuote(symbol);

  const { data: scorecard, isLoading, error } = useQuery<ScorecardItem>({
    queryKey: ['scorecard-detail', symbol],
    queryFn: async () => {
      // Try each asset class until we find the symbol
      for (const ac of ['forex', 'crypto', 'commodities', 'indices']) {
        try {
          return await apiGet<ScorecardItem>(`/scorecard/${ac}/${symbol}`);
        } catch {
          continue;
        }
      }
      throw new Error('Symbol not found');
    },
    enabled: !!symbol,
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingSpinner />;

  if (error || !scorecard) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-sm text-accent-red">
        Failed to load scorecard for {symbol}.
      </div>
    );
  }

  const breakdownScores = [
    { label: 'Technical Analysis', value: scorecard.technical, details: 'Based on moving averages, RSI, MACD, and other technical indicators' },
    { label: 'Sentiment', value: scorecard.sentiment, details: 'Retail and institutional sentiment positioning' },
    { label: 'COT Data', value: scorecard.cot, details: 'Commitment of Traders speculator and commercial positioning' },
    { label: 'Fundamental', value: scorecard.fundamental, details: 'Interest rate differentials, economic data, and macro factors' },
    { label: 'Seasonal', value: scorecard.seasonal, details: 'Historical seasonal patterns for current month' },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-100">{symbol}</h1>
        <ScoreBadge direction={scorecard.direction} />
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent-green' : 'bg-gray-600'}`}
          />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {quote && (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 mb-6 flex items-center gap-6">
          <div>
            <span className="text-xs text-gray-500">Price</span>
            <p className="text-xl font-bold text-gray-100">{quote.price.toFixed(quote.price > 100 ? 2 : 5)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Change</span>
            <p className={`text-sm font-medium flex items-center gap-1 ${quote.change >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              {quote.change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(quote.price > 100 ? 2 : 5)} ({quote.changePercent.toFixed(2)}%)
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Bid</span>
            <p className="text-sm text-gray-300">{quote.bid.toFixed(quote.price > 100 ? 2 : 5)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Ask</span>
            <p className="text-sm text-gray-300">{quote.ask.toFixed(quote.price > 100 ? 2 : 5)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 flex flex-col items-center">
            <h2 className="text-sm font-medium text-gray-400 mb-4">Overall Score</h2>
            <ScoreGauge score={scorecard.total_score} size={180} strokeWidth={14} />
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
            <h2 className="text-sm font-medium text-gray-400 mb-4">Score Breakdown</h2>
            <ScoreBreakdown scores={breakdownScores} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <TVChart symbol={symbol} height={600} />
        </div>
      </div>
    </div>
  );
}
