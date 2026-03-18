'use client';

import Screener from '@/components/tv/Screener';
import Timeline from '@/components/tv/Timeline';
import MarketOverview from '@/components/tv/MarketOverview';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';
import AdvancedChart from '@/components/tv/AdvancedChart';

export default function CommoditiesPage() {
  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-white">Commodities</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time commodities data and analysis</p>
      </div>

      {/* Key Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Gold (XAU/USD)</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <AdvancedChart symbol="OANDA:XAUUSD" height={350} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Crude Oil (WTI)</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <AdvancedChart symbol="TVC:USOIL" height={350} />
          </div>
        </div>
      </div>

      {/* Technical Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Gold Technical</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <TechnicalAnalysis symbol="OANDA:XAUUSD" height={350} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Silver Technical</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <TechnicalAnalysis symbol="OANDA:XAGUSD" height={350} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Oil Technical</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <TechnicalAnalysis symbol="TVC:USOIL" height={350} />
          </div>
        </div>
      </div>

      {/* Market Overview + News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Market Overview</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <MarketOverview height={400} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Commodities News</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <Timeline height={400} feedMode="all_symbols" market="commodity" />
          </div>
        </div>
      </div>
    </div>
  );
}
