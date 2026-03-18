'use client';

import StockHeatmap from '@/components/tv/StockHeatmap';
import Screener from '@/components/tv/Screener';
import Timeline from '@/components/tv/Timeline';
import MarketOverview from '@/components/tv/MarketOverview';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';
import AdvancedChart from '@/components/tv/AdvancedChart';

export default function IndicesPage() {
  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-white">Indices</h1>
        <p className="text-sm text-gray-500 mt-1">Global indices real-time data and analysis</p>
      </div>

      {/* Key Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">S&P 500</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <AdvancedChart symbol="FOREXCOM:SPXUSD" height={300} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Nasdaq 100</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <AdvancedChart symbol="FOREXCOM:NSXUSD" height={300} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Dow Jones</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <AdvancedChart symbol="BLACKBULL:US30" height={300} />
          </div>
        </div>
      </div>

      {/* S&P 500 Heatmap */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">S&P 500 Heatmap</h2>
        <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
          <StockHeatmap height={500} dataSource="SPX500" />
        </div>
      </div>

      {/* Technical Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">S&P 500 Technical</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <TechnicalAnalysis symbol="FOREXCOM:SPXUSD" height={350} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">DAX 40 Technical</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <TechnicalAnalysis symbol="PEPPERSTONE:GER40" height={350} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">FTSE 100 Technical</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <TechnicalAnalysis symbol="PEPPERSTONE:UK100" height={350} />
          </div>
        </div>
      </div>

      {/* Screener + News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Stock Screener</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <Screener height={500} market="america" />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Market News</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <Timeline height={500} feedMode="all_symbols" market="stock" />
          </div>
        </div>
      </div>
    </div>
  );
}
