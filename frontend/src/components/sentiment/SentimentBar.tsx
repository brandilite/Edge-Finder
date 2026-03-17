'use client';

import clsx from 'clsx';

interface SentimentBarProps {
  symbol?: string;
  longPercent?: number;
  shortPercent?: number;
  pctLong?: number;
  pctShort?: number;
}

export function SentimentBar({ symbol, longPercent, shortPercent, pctLong, pctShort }: SentimentBarProps) {
  const effLong = pctLong ?? longPercent ?? 50;
  const effShort = pctShort ?? shortPercent ?? 50;
  const isExtremeLong = effLong >= 65;
  const isExtremeShort = effShort >= 65;

  return (
    <div className="bg-dark-800 rounded-lg border border-dark-600 p-4">
      {symbol && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-200">{symbol}</span>
          {(isExtremeLong || isExtremeShort) && (
            <span
              className={clsx(
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                isExtremeLong && 'bg-accent-green/15 text-accent-green',
                isExtremeShort && 'bg-accent-red/15 text-accent-red'
              )}
            >
              EXTREME
            </span>
          )}
        </div>
      )}

      <div className="flex h-6 rounded-full overflow-hidden bg-dark-600">
        <div
          className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
          style={{
            width: `${effLong}%`,
            backgroundColor: isExtremeLong ? '#16a34a' : '#22c55e',
          }}
        >
          {effLong >= 20 && `${effLong.toFixed(1)}%`}
        </div>
        <div
          className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
          style={{
            width: `${effShort}%`,
            backgroundColor: isExtremeShort ? '#dc2626' : '#ef4444',
          }}
        >
          {effShort >= 20 && `${effShort.toFixed(1)}%`}
        </div>
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-accent-green">Long {effLong.toFixed(1)}%</span>
        <span className="text-[10px] text-accent-red">Short {effShort.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export default SentimentBar;
