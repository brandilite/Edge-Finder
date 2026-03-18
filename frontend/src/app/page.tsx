'use client';

import MarketOverview from '@/components/tv/MarketOverview';
import MiniChart from '@/components/tv/MiniChart';
import Timeline from '@/components/tv/Timeline';

const WATCHLIST = [
  { symbol: 'FX:EURUSD', label: 'EUR/USD' },
  { symbol: 'FX:GBPUSD', label: 'GBP/USD' },
  { symbol: 'FX:USDJPY', label: 'USD/JPY' },
  { symbol: 'OANDA:XAUUSD', label: 'Gold' },
  { symbol: 'BITSTAMP:BTCUSD', label: 'Bitcoin' },
  { symbol: 'BITSTAMP:ETHUSD', label: 'Ethereum' },
  { symbol: 'FOREXCOM:SPXUSD', label: 'S&P 500' },
  { symbol: 'TVC:USOIL', label: 'Crude Oil' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100">Market Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time market overview powered by TradingView</p>
      </div>

      {/* Mini Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {WATCHLIST.map((item) => (
          <div
            key={item.symbol}
            className="bg-[#151c24] rounded-lg border border-[#243040] overflow-hidden"
          >
            <MiniChart symbol={item.symbol} height={180} dateRange="1M" />
          </div>
        ))}
      </div>

      {/* Market Overview + News side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Market Overview</h2>
          <MarketOverview height={500} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Latest News</h2>
          <div className="rounded-lg border border-[#243040] overflow-hidden">
            <Timeline height={500} feedMode="all_symbols" market="forex" />
          </div>
        </div>
      </div>
    </div>
  );
}
