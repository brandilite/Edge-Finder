'use client';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function ScoreGauge({ score, size = 120, strokeWidth = 10, showLabel = true }: ScoreGaugeProps) {
  const normalized = (score + 10) / 20; // 0 to 1
  const angle = normalized * 180;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const polarToCartesian = (angleDeg: number) => {
    const rad = ((angleDeg - 180) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const start = polarToCartesian(0);
  const end = polarToCartesian(angle);
  const largeArc = angle > 180 ? 1 : 0;

  const getColor = () => {
    if (score >= 3) return '#22c55e';
    if (score <= -3) return '#ef4444';
    return '#eab308';
  };

  const bgStart = polarToCartesian(0);
  const bgEnd = polarToCartesian(180);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Background arc */}
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 0 1 ${bgEnd.x} ${bgEnd.y}`}
          fill="none"
          stroke="#1c2530"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {score !== 0 && (
          <path
            d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
      </svg>
      {showLabel && (
        <div className="text-center -mt-2">
          <span className="text-2xl font-bold" style={{ color: getColor() }}>
            {score > 0 ? '+' : ''}
            {score.toFixed(1)}
          </span>
          <p className="text-xs text-gray-500 mt-0.5">/ 10</p>
        </div>
      )}
    </div>
  );
}
