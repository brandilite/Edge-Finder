'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TrendingUp } from 'lucide-react';
import clsx from 'clsx';

const MARKET_TABS = [
  { label: 'US Markets', value: 'us', href: '/' },
  { label: 'Crypto', value: 'crypto', href: '/markets/crypto' },
  { label: 'Forex', value: 'forex', href: '/markets/forex' },
  { label: 'Commodities', value: 'commodities', href: '/markets/commodities' },
  { label: 'Indices', value: 'indices', href: '/markets/indices' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = (() => {
    if (pathname.startsWith('/markets/crypto')) return 'crypto';
    if (pathname.startsWith('/markets/forex')) return 'forex';
    if (pathname.startsWith('/markets/commodities')) return 'commodities';
    if (pathname.startsWith('/markets/indices')) return 'indices';
    if (pathname === '/') return 'us';
    return '';
  })();

  return (
    <header className="h-11 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-between px-4 flex-shrink-0">
      {/* Market tabs */}
      <div className="flex items-center gap-0.5 h-full">
        {MARKET_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => router.push(tab.href)}
            className={clsx(
              'relative h-full px-3 text-[13px] font-medium transition-colors',
              activeTab === tab.value
                ? 'text-white tab-active'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Market status indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#015608]/10 border border-[#015608]/30">
          <TrendingUp size={12} className="text-[#22c55e]" />
          <span className="text-[11px] font-medium text-[#22c55e]">Markets Open</span>
        </div>
      </div>
    </header>
  );
}
