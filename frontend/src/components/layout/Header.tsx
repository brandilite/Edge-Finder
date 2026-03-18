'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const QUICK_SYMBOLS = [
  { tv: 'FX:EURUSD', label: 'EUR/USD', href: '/scorecard/EURUSD' },
  { tv: 'OANDA:XAUUSD', label: 'Gold', href: '/scorecard/XAUUSD' },
  { tv: 'BITSTAMP:BTCUSD', label: 'BTC', href: '/scorecard/BTCUSD' },
  { tv: 'FOREXCOM:SPXUSD', label: 'S&P', href: '/scorecard/SPX500' },
];

export default function Header() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/scorecard/${search.trim().toUpperCase()}`);
      setSearch('');
    }
  };

  return (
    <header className="h-12 bg-[#151c24] border-b border-[#243040] flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        {QUICK_SYMBOLS.map((s) => (
          <button
            key={s.tv}
            onClick={() => router.push(s.href)}
            className="px-2.5 py-1 rounded text-xs font-medium text-gray-400 hover:bg-[#1c2530] hover:text-gray-200 transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex items-center bg-[#1c2530] rounded-lg border border-[#243040] px-3 py-1.5">
        <Search size={14} className="text-gray-500 mr-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Go to symbol..."
          className="bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none w-36"
        />
      </form>
    </header>
  );
}
