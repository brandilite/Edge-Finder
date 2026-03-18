'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TrendingUp } from 'lucide-react';
import clsx from 'clsx';

const MARKET_TABS = [
  { label: 'US Markets', value: 'us' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Forex', value: 'forex' },
  { label: 'Commodities', value: 'commodities' },
  { label: 'Indices', value: 'indices' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab from path or default to 'us'
  const activeTab = (() => {
    if (pathname === '/') return 'us';
    return 'us';
  })();

  return (
    <header className="h-11 bg-[#151c24] border-b border-[#2a2f3a] flex items-center justify-between px-4 flex-shrink-0">
      {/* Market tabs */}
      <div className="flex items-center gap-0.5 h-full">
        {MARKET_TABS.map((tab) => (
          <button
            key={tab.value}
            className={clsx(
              'relative h-full px-3 text-[13px] font-medium transition-colors',
              activeTab === tab.value
                ? 'text-gray-100 tab-active'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Market status indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp size={12} className="text-emerald-400" />
          <span className="text-[11px] font-medium text-emerald-400">Markets Open</span>
        </div>
      </div>
    </header>
  );
}
