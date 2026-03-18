'use client';

import CryptoHeatmap from '@/components/tv/CryptoHeatmap';
import Screener from '@/components/tv/Screener';
import Timeline from '@/components/tv/Timeline';
import MarketOverview from '@/components/tv/MarketOverview';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';

export default function CryptoPage() {
  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-white">Crypto Markets</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time cryptocurrency data and analysis</p>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Market Overview</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <MarketOverview height={400} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">BTC Technical Analysis</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <TechnicalAnalysis symbol="BITSTAMP:BTCUSD" height={400} />
          </div>
        </div>
      </div>

      {/* Crypto Heatmap */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Crypto Heatmap</h2>
        <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
          <CryptoHeatmap height={500} />
        </div>
      </div>

      {/* Screener + News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Crypto Screener</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <Screener height={500} market="crypto" />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Crypto News</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <Timeline height={500} feedMode="all_symbols" market="crypto" />
          </div>
        </div>
      </div>
    </div>
  );
}
