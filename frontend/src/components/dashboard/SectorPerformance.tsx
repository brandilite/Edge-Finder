'use client';

import clsx from 'clsx';

interface Sector {
  name: string;
  change: string;
}

const SECTORS: Sector[] = [
  { name: 'Technology', change: '+1.24%' },
  { name: 'Healthcare', change: '+0.87%' },
  { name: 'Financials', change: '+0.65%' },
  { name: 'Consumer Disc.', change: '+0.42%' },
  { name: 'Industrials', change: '+0.31%' },
  { name: 'Communication', change: '+0.18%' },
  { name: 'Energy', change: '-0.22%' },
  { name: 'Utilities', change: '-0.35%' },
  { name: 'Materials', change: '-0.41%' },
  { name: 'Real Estate', change: '-0.58%' },
  { name: 'Consumer Staples', change: '-0.12%' },
];

export default function SectorPerformance() {
  return (
    <div className="bg-[#1a1f2e] rounded-lg border border-[#2a2f3a] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2f3a]">
        <h3 className="text-sm font-semibold text-gray-200">Equity Sectors</h3>
      </div>
      <div className="divide-y divide-[#2a2f3a]/50">
        {SECTORS.map((sector) => {
          const isPositive = sector.change.startsWith('+');
          const absPct = parseFloat(sector.change.replace(/[+%]/g, ''));
          return (
            <div
              key={sector.name}
              className="flex items-center justify-between px-4 py-2 hover:bg-[#1f2937] transition-colors cursor-pointer"
            >
              <span className="text-[13px] text-gray-300">{sector.name}</span>
              <div className="flex items-center gap-2">
                {/* Mini bar */}
                <div className="w-16 h-1.5 rounded-full bg-[#2a2f3a] overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full',
                      isPositive ? 'bg-emerald-500' : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(absPct * 40, 100)}%` }}
                  />
                </div>
                <span
                  className={clsx(
                    'text-[12px] font-medium min-w-[52px] text-right',
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {sector.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
