'use client';

import EconomicCalendar from '@/components/tv/EconomicCalendar';

export default function EconomicPage() {
  return (
    <div className="p-5 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">Economic Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upcoming economic events, releases, and their impact — powered by TradingView
        </p>
      </div>

      <div className="rounded-lg border border-[#2a2f3a] overflow-hidden">
        <EconomicCalendar
          height={typeof window !== 'undefined' ? window.innerHeight - 180 : 700}
        />
      </div>
    </div>
  );
}
