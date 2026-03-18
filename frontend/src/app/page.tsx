'use client';

import TopAssets from '@/components/dashboard/TopAssets';
import MarketSummary from '@/components/dashboard/MarketSummary';
import WatchlistSidebar from '@/components/dashboard/WatchlistSidebar';
import GainersLosers from '@/components/dashboard/GainersLosers';
import SectorPerformance from '@/components/dashboard/SectorPerformance';
import CryptoList from '@/components/dashboard/CryptoList';
import StockHeatmap from '@/components/tv/StockHeatmap';
import Timeline from '@/components/tv/Timeline';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex gap-5 p-5 min-h-0">
      {/* Main column (2/3) */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Top Assets */}
        <TopAssets />

        {/* Market Summary */}
        <MarketSummary />

        {/* S&P 500 Heatmap */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              S&P 500 Heatmap
            </h2>
            <Link
              href="/heatmap"
              className="flex items-center gap-1 text-[12px] text-[#22c55e] hover:text-[#4ade80] transition-colors"
            >
              Expand
              <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <StockHeatmap height={400} dataSource="SPX500" />
          </div>
        </div>

        {/* Recent Developments */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recent Developments
          </h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <Timeline height={400} feedMode="all_symbols" market="stock" />
          </div>
        </div>
      </div>

      {/* Right sidebar column (1/3) */}
      <div className="w-[340px] flex-shrink-0 space-y-4 hidden xl:block">
        <WatchlistSidebar />
        <GainersLosers />
        <SectorPerformance />
        <CryptoList />
      </div>
    </div>
  );
}
