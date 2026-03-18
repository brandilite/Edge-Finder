'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import MarketQuotes from '@/components/tv/MarketQuotes';
import AdvancedChart from '@/components/tv/AdvancedChart';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';
import { Plus, X, Star } from 'lucide-react';

interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
}

export default function WatchlistPage() {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlist, setActiveWatchlist] = useState<Watchlist | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [newSymbol, setNewSymbol] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchWatchlists();
  }, [user]);

  const fetchWatchlists = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setWatchlists(data);
      setActiveWatchlist(data[0]);
      if (data[0].symbols?.length > 0) {
        setSelectedSymbol(data[0].symbols[0]);
      }
    }
    setLoading(false);
  };

  const addSymbol = async () => {
    if (!activeWatchlist || !newSymbol.trim()) return;
    const upper = newSymbol.toUpperCase().trim();
    if (activeWatchlist.symbols?.includes(upper)) return;

    const updatedSymbols = [...(activeWatchlist.symbols || []), upper];
    await supabase
      .from('watchlists')
      .update({ symbols: updatedSymbols, updated_at: new Date().toISOString() })
      .eq('id', activeWatchlist.id);

    setActiveWatchlist({ ...activeWatchlist, symbols: updatedSymbols });
    setWatchlists((prev) =>
      prev.map((w) => (w.id === activeWatchlist.id ? { ...w, symbols: updatedSymbols } : w))
    );
    setNewSymbol('');
  };

  const removeSymbol = async (symbol: string) => {
    if (!activeWatchlist) return;
    const updatedSymbols = activeWatchlist.symbols.filter((s) => s !== symbol);
    await supabase
      .from('watchlists')
      .update({ symbols: updatedSymbols, updated_at: new Date().toISOString() })
      .eq('id', activeWatchlist.id);

    setActiveWatchlist({ ...activeWatchlist, symbols: updatedSymbols });
    setWatchlists((prev) =>
      prev.map((w) => (w.id === activeWatchlist.id ? { ...w, symbols: updatedSymbols } : w))
    );
    if (selectedSymbol === symbol) {
      setSelectedSymbol(updatedSymbols[0] || '');
    }
  };

  if (loading) {
    return (
      <div className="p-5 flex items-center justify-center h-64">
        <div className="text-gray-500">Loading watchlist...</div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Watchlist</h1>
          <p className="text-sm text-gray-500 mt-1">Track your favorite symbols</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Symbol List */}
        <div className="w-[300px] flex-shrink-0 space-y-3">
          {/* Add symbol */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSymbol();
                }
              }}
              placeholder="Add symbol (e.g. AAPL)"
              className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#015608] transition-colors"
            />
            <button
              onClick={addSymbol}
              disabled={!newSymbol.trim()}
              className="p-2 rounded-lg bg-[#015608] hover:bg-[#016a0a] disabled:opacity-50 text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Symbols */}
          <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] divide-y divide-[#1a1a1a]">
            {activeWatchlist?.symbols?.map((symbol) => (
              <div
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                  selectedSymbol === symbol
                    ? 'bg-[#015608]/10 border-l-2 border-l-[#015608]'
                    : 'hover:bg-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-[#015608]" fill="#015608" />
                  <span className="text-sm font-medium text-white">{symbol}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSymbol(symbol);
                  }}
                  className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {(!activeWatchlist?.symbols || activeWatchlist.symbols.length === 0) && (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No symbols in watchlist. Add one above.
              </div>
            )}
          </div>
        </div>

        {/* Chart + Technical */}
        <div className="flex-1 min-w-0 space-y-5">
          {selectedSymbol ? (
            <>
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {selectedSymbol} Chart
                </h2>
                <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
                  <AdvancedChart symbol={selectedSymbol} height={450} />
                </div>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {selectedSymbol} Technical Analysis
                </h2>
                <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
                  <TechnicalAnalysis symbol={selectedSymbol} height={350} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Select a symbol to view chart and analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
