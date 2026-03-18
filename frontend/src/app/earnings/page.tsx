'use client';

import EconomicCalendar from '@/components/tv/EconomicCalendar';
import Timeline from '@/components/tv/Timeline';
import Screener from '@/components/tv/Screener';

export default function EarningsPage() {
  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-white">Earnings Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">Track upcoming and recent earnings reports</p>
      </div>

      {/* Earnings Calendar via TradingView Economic Calendar (earnings filter) */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Upcoming Earnings</h2>
        <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
          <EconomicCalendar height={600} />
        </div>
      </div>

      {/* Earnings News + Stock Screener */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Earnings News</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <Timeline height={500} feedMode="all_symbols" market="stock" />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Stock Screener</h2>
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
            <Screener height={500} market="america" />
          </div>
        </div>
      </div>
    </div>
  );
}
