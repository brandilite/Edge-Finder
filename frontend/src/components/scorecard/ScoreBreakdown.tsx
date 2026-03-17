'use client';

import { SCORE_COLORS } from '@/lib/constants';

interface ScoreBreakdownProps {
  scores: {
    label: string;
    value: number;
    details?: string;
  }[];
}

export default function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      {scores.map((score) => {
        const pct = ((score.value + 10) / 20) * 100;
        const color =
          score.value > 0
            ? SCORE_COLORS.bullish
            : score.value < 0
            ? SCORE_COLORS.bearish
            : SCORE_COLORS.neutral;

        return (
          <div key={score.label} className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">{score.label}</span>
              <span className="text-lg font-bold" style={{ color }}>
                {score.value > 0 ? '+' : ''}
                {score.value}
              </span>
            </div>
            <div className="w-full h-2.5 bg-dark-600 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            {score.details && (
              <p className="text-xs text-gray-500 mt-1">{score.details}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
