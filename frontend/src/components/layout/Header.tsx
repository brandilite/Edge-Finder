'use client';

import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/useAppStore';
import { ASSET_CLASSES, AssetClass } from '@/lib/constants';
import { apiGet } from '@/lib/api';
import clsx from 'clsx';

interface SearchResult {
  symbol: string;
  name?: string;
  type?: string;
}

export default function Header() {
  const router = useRouter();
  const selectedAssetClass = useAppStore((s) => s.selectedAssetClass);
  const setAssetClass = useAppStore((s) => s.setAssetClass);
  const setSymbol = useAppStore((s) => s.setSymbol);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(
    async (q: string) => {
      setSearchQuery(q);
      if (q.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      try {
        const results = await apiGet<SearchResult[]>(`/symbols/search?q=${encodeURIComponent(q)}`);
        setSearchResults(Array.isArray(results) ? results.slice(0, 8) : []);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      }
    },
    []
  );

  const handleSelectResult = (result: SearchResult) => {
    setSymbol(result.symbol);
    setSearchQuery('');
    setShowResults(false);
    router.push(`/scorecard/${result.symbol}`);
  };

  const assetClassLabels: Record<AssetClass, string> = {
    forex: 'Forex',
    crypto: 'Crypto',
    commodities: 'Commodities',
    indices: 'Indices',
  };

  return (
    <header className="h-14 bg-dark-800 border-b border-dark-600 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-1">
        {ASSET_CLASSES.map((ac) => (
          <button
            key={ac}
            onClick={() => setAssetClass(ac)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedAssetClass === ac
                ? 'bg-accent-blue text-white'
                : 'text-gray-400 hover:bg-dark-700 hover:text-gray-200'
            )}
          >
            {assetClassLabels[ac]}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center bg-dark-700 rounded-lg border border-dark-600 px-3 py-1.5">
          <Search size={16} className="text-gray-500 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search symbol..."
            className="bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none w-48"
          />
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute right-0 top-full mt-1 w-72 bg-dark-700 border border-dark-600 rounded-lg shadow-xl z-50 overflow-hidden">
            {searchResults.map((r) => (
              <button
                key={r.symbol}
                onClick={() => handleSelectResult(r)}
                className="w-full text-left px-4 py-2.5 hover:bg-dark-600 transition-colors flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-200">{r.symbol}</span>
                {r.name && (
                  <span className="text-xs text-gray-500 truncate ml-2">{r.name}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
