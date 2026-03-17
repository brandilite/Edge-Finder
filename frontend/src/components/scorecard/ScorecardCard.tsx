'use client';

import Link from 'next/link';
import ScoreBadge from '@/components/shared/ScoreBadge';
import PriceSparkline from '@/components/charts/PriceSparkline';
import { ScorecardItem } from '@/hooks/useScorecard';
import { SCORE_COLORS } from '@/lib/constants';

interface ScorecardCardProps {
  item: ScorecardItem;
}

function SubScoreBar({ label, value }: { label: string; value: number }) {
  const pct = ((value + 10) / 20) * 100;
  const color = value > 0 ? SCORE_COLORS.bullish : value < 0 ? SCORE_COLORS.bearish : SCORE_COLORS.neutral;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-14 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-mono w-6 text-right" style={{ color }}>
        {value > 0 ? '+' : ''}
        {value}
      </span>
    </div>
  );
}

export default function ScorecardCard({ item }: ScorecardCardProps) {
  const scoreColor =
    item.total_score > 0
      ? SCORE_COLORS.bullish
      : item.total_score < 0
      ? SCORE_COLORS.bearish
      : SCORE_COLORS.neutral;

  return (
    <Link href={`/scorecard/${item.symbol}`}>
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 hover:border-dark-600/80 hover:bg-dark-700/50 transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
            {item.symbol}
          </h3>
          <ScoreBadge direction={item.direction} size="sm" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl font-bold" style={{ color: scoreColor }}>
            {item.total_score > 0 ? '+' : ''}
            {item.total_score}
          </span>
          <PriceSparkline symbol={item.symbol} width={100} height={36} />
        </div>

        <div className="space-y-1.5">
          <SubScoreBar label="Technical" value={item.technical} />
          <SubScoreBar label="Sentiment" value={item.sentiment} />
          <SubScoreBar label="COT" value={item.cot} />
          <SubScoreBar label="Fundmntl" value={item.fundamental} />
          <SubScoreBar label="Seasonal" value={item.seasonal} />
        </div>
      </div>
    </Link>
  );
}
