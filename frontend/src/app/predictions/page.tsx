'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, ExternalLink, BarChart3, DollarSign, Clock, ChevronRight, Flame } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface PolyMarket {
  id: string;
  question: string;
  slug: string;
  image: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  volumeNum: number;
  volume24hr?: number;
  oneDayPriceChange: number;
  oneWeekPriceChange: number;
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
  endDate: string;
  active: boolean;
  closed: boolean;
  groupItemTitle: string;
  description: string;
}

interface PolyEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  volume: number;
  volume24hr: number;
  liquidity: number;
  startDate: string;
  endDate: string;
  active: boolean;
  closed: boolean;
  commentCount: number;
  markets: PolyMarket[];
  tags: { id: string; label: string; slug: string }[];
}

const CATEGORIES = [
  { label: 'Trending', value: '' },
  { label: 'Finance', value: 'finance' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Politics', value: 'politics' },
  { label: 'Culture', value: 'culture' },
  { label: 'Tech', value: 'tech' },
  { label: 'Economy', value: 'economy' },
  { label: 'Geopolitics', value: 'geopolitics' },
  { label: 'Earnings', value: 'earnings' },
  { label: 'World', value: 'world' },
];

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(0)}K`;
  return `$${vol.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PriceChange({ change }: { change: number }) {
  if (!change || Math.abs(change) < 0.001) {
    return <span className="flex items-center gap-0.5 text-gray-500 text-xs"><Minus size={10} /> 0.0%</span>;
  }
  const isPositive = change > 0;
  return (
    <span className={clsx('flex items-center gap-0.5 text-xs font-medium', isPositive ? 'text-[#22c55e]' : 'text-red-400')}>
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isPositive ? '+' : ''}{(change * 100).toFixed(1)}%
    </span>
  );
}

function EventCard({ event }: { event: PolyEvent }) {
  const topMarkets = event.markets.slice(0, 4);
  const hasMore = event.markets.length > 4;

  return (
    <Link
      href={`/predictions/${event.slug}`}
      className="block bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] hover:border-[#333333] transition-all group"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {event.image && (
            <img
              src={event.image}
              alt=""
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-[#1a1a1a]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white group-hover:text-[#22c55e] transition-colors line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <DollarSign size={10} />
                {formatVolume(event.volume)} vol.
              </span>
              {event.endDate && (
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Clock size={10} />
                  Ends {formatDate(event.endDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Markets / Outcomes */}
        <div className="space-y-2">
          {topMarkets.map((market) => {
            const prices = market.outcomePrices?.map((p) => parseFloat(p)) || [];
            const outcomes = market.outcomes || [];

            // For multi-outcome events, show groupItemTitle
            const label = event.markets.length > 1 ? (market.groupItemTitle || market.question) : outcomes[0];
            const topPrice = prices[0];

            return (
              <div key={market.id} className="flex items-center justify-between py-1.5">
                <span className="text-[13px] text-gray-300 truncate mr-3">
                  {label}
                </span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[13px] font-mono font-medium text-white">
                    {topPrice !== undefined ? `${(topPrice * 100).toFixed(1)}%` : '—'}
                  </span>
                  <PriceChange change={market.oneDayPriceChange} />
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-500">
            <span>+{event.markets.length - 4} more</span>
            <ChevronRight size={10} />
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#1a1a1a]">
            <div className="flex gap-1.5">
              {event.tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-400">
                  {tag.label}
                </span>
              ))}
            </div>
            <span className="text-[11px] text-gray-600 ml-auto">{event.commentCount} comments</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function PredictionsPage() {
  const [events, setEvents] = useState<PolyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Use our proxy API route to avoid CORS
      const params = new URLSearchParams();
      params.set('limit', '30');
      if (search) params.set('title', search);
      if (category) params.set('tag', category);

      const res = await fetch(`/api/polymarket/events?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }
      const data: PolyEvent[] = await res.json();

      // Filter to only events with markets and sort by 24h volume (trending)
      const withMarkets = data.filter((e) => e.markets && e.markets.length > 0);
      withMarkets.sort((a, b) => (b.volume24hr || 0) - (a.volume24hr || 0));
      setEvents(withMarkets);
    } catch (err) {
      console.error('Failed to fetch prediction markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prediction markets.');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            <h1 className="text-lg font-semibold text-white">Prediction Markets</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Trending live events from Polymarket</p>
        </div>
        <a
          href="https://polymarket.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a1a1a] text-xs text-gray-400 hover:text-white hover:border-[#333333] transition-colors"
        >
          View on Polymarket
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search prediction markets..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#015608] transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              category === cat.value
                ? 'bg-[#015608] text-white'
                : 'bg-[#0a0a0a] border border-[#1a1a1a] text-gray-400 hover:text-white hover:border-[#333333]'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
          <button onClick={fetchEvents} className="ml-3 text-xs underline hover:text-red-300">Retry</button>
        </div>
      )}

      {/* Events grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a]" />
                <div className="flex-1">
                  <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-[#1a1a1a] rounded w-full" />
                <div className="h-3 bg-[#1a1a1a] rounded w-2/3" />
                <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 && !error ? (
        <div className="text-center py-16">
          <BarChart3 size={40} className="text-gray-600 mx-auto mb-3" />
          <h3 className="text-white font-medium mb-1">No markets found</h3>
          <p className="text-sm text-gray-500">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
