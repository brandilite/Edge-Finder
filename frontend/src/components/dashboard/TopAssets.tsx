'use client';

import MiniChart from '@/components/tv/MiniChart';

const TOP_ASSETS = [
  { symbol: 'FOREXCOM:SPXUSD', label: 'S&P 500' },
  { symbol: 'FOREXCOM:NSXUSD', label: 'Nasdaq' },
  { symbol: 'OANDA:XAUUSD', label: 'Gold' },
  { symbol: 'BITSTAMP:BTCUSD', label: 'Bitcoin' },
  { symbol: 'TVC:VIX', label: 'VIX' },
];

export default function TopAssets() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Top Assets
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {TOP_ASSETS.map((asset) => (
          <div
            key={asset.symbol}
            className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden card-hover"
          >
            <MiniChart symbol={asset.symbol} height={140} dateRange="1M" />
          </div>
        ))}
      </div>
    </div>
  );
}
