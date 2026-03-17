import clsx from 'clsx';

interface ScoreBadgeProps {
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  size?: 'sm' | 'md';
}

export default function ScoreBadge({ direction, size = 'md' }: ScoreBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded-full uppercase tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        direction === 'BULLISH' && 'bg-accent-green/15 text-accent-green',
        direction === 'BEARISH' && 'bg-accent-red/15 text-accent-red',
        direction === 'NEUTRAL' && 'bg-accent-yellow/15 text-accent-yellow'
      )}
    >
      {direction}
    </span>
  );
}
