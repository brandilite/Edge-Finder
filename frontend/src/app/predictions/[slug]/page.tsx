'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Users,
  Droplets,
} from 'lucide-react';
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
  oneDayPriceChange: number;
  oneWeekPriceChange: number;
  oneMonthPriceChange: number;
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
  endDate: string;
  startDate: string;
  active: boolean;
  closed: boolean;
  groupItemTitle: string;
  description: string;
  liquidity: string;
  liquidityClob: number;
  seriesColor: string;
  clobTokenIds: string[];
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

interface PricePoint {
  t: number;
  p: number;
}

// Parse JSON string fields from the Gamma API (outcomePrices/outcomes come as JSON strings)
function parseJsonField(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }
  return [];
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(0)}K`;
  return `$${vol.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function PriceChange({ change, className }: { change: number; className?: string }) {
  if (!change || Math.abs(change) < 0.001) {
    return <span className={clsx('flex items-center gap-0.5 text-gray-500', className)}><Minus size={10} /> 0.0%</span>;
  }
  const isPositive = change > 0;
  return (
    <span className={clsx('flex items-center gap-0.5 font-medium', isPositive ? 'text-[#22c55e]' : 'text-red-400', className)}>
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isPositive ? '+' : ''}{(change * 100).toFixed(1)}%
    </span>
  );
}

// Simple SVG line chart
function MiniLineChart({ data, color, height = 120 }: { data: PricePoint[]; color: string; height?: number }) {
  if (!data || data.length < 2) {
    return <div className="flex items-center justify-center text-gray-600 text-xs" style={{ height }}>No chart data</div>;
  }

  const width = 600;
  const padding = 10;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const prices = data.map((d) => d.p);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const rangeP = maxP - minP || 0.01;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartW;
    const y = padding + chartH - ((d.p - minP) / rangeP) * chartH;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `${padding},${padding + chartH} ${points} ${padding + chartW},${padding + chartH}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current price dot */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1];
        const x = padding + chartW;
        const y = padding + chartH - ((last.p - minP) / rangeP) * chartH;
        return <circle cx={x} cy={y} r="4" fill={color} />;
      })()}
    </svg>
  );
}

const CHART_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6'];

export default function PredictionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [event, setEvent] = useState<PolyEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState<Record<string, PricePoint[]>>({});
  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '1D' | '1W' | '1M' | 'MAX'>('1M');

  useEffect(() => {
    if (!slug) return;
    fetchEvent();
  }, [slug]);

  useEffect(() => {
    if (!event) return;
    fetchPriceHistory();
  }, [event, timeRange]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/polymarket/events?slug=${slug}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setEvent(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch event:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    if (!event) return;

    const fidelity = timeRange === '1H' ? 1 : timeRange === '6H' ? 5 : timeRange === '1D' ? 10 : timeRange === '1W' ? 60 : 360;
    const now = Math.floor(Date.now() / 1000);
    const rangeMap: Record<string, number> = {
      '1H': 3600,
      '6H': 21600,
      '1D': 86400,
      '1W': 604800,
      '1M': 2592000,
      'MAX': now - Math.floor(new Date(event.startDate).getTime() / 1000),
    };
    const startTs = now - (rangeMap[timeRange] || 2592000);

    const history: Record<string, PricePoint[]> = {};

    // Fetch price history for each market's first outcome token
    for (const market of event.markets.slice(0, 8)) {
      const tokenIds = parseJsonField(market.clobTokenIds);
      if (tokenIds.length === 0) continue;
      const tokenId = tokenIds[0];
      try {
        const res = await fetch(
          `/api/polymarket/prices?market=${tokenId}&interval=${timeRange.toLowerCase()}&fidelity=${fidelity}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.history) {
            history[market.id] = data.history.map((h: { t: number; p: number }) => ({ t: h.t, p: h.p }));
          }
        }
      } catch {
        // Silently skip failed fetches
      }
    }

    setPriceHistory(history);
  };

  if (loading) {
    return (
      <div className="p-5 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-5">
          <div className="h-6 bg-[#1a1a1a] rounded w-1/3" />
          <div className="h-64 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]" />
          <div className="h-40 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-5 text-center py-20">
        <h2 className="text-white font-medium mb-2">Event not found</h2>
        <Link href="/predictions" className="text-[#22c55e] text-sm">Back to Predictions</Link>
      </div>
    );
  }

  const totalMarkets = event.markets.length;

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link href="/predictions" className="p-2 rounded-lg hover:bg-[#111111] text-gray-400 hover:text-white transition-colors mt-0.5">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-start gap-3">
            {event.image && (
              <img src={event.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-[#1a1a1a]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div>
              <h1 className="text-xl font-semibold text-white">{event.title}</h1>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <DollarSign size={11} /> {formatVolume(event.volume)} volume
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Droplets size={11} /> {formatVolume(event.liquidity)} liquidity
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <BarChart3 size={11} /> {totalMarkets} market{totalMarkets !== 1 ? 's' : ''}
                </span>
                {event.endDate && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={11} /> Ends {formatDate(event.endDate)}
                  </span>
                )}
                <a
                  href={`https://polymarket.com/event/${event.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#22c55e] transition-colors"
                >
                  View on Polymarket <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-5">
        {/* Time range buttons */}
        <div className="flex items-center gap-1 mb-4">
          {(['1H', '6H', '1D', '1W', '1M', 'MAX'] as const).map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={clsx(
                'px-3 py-1 rounded text-xs font-medium transition-colors',
                timeRange === tr
                  ? 'bg-[#015608] text-white'
                  : 'text-gray-500 hover:text-white hover:bg-[#111111]'
              )}
            >
              {tr}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="space-y-4">
          {event.markets.slice(0, 8).map((market, idx) => {
            const color = market.seriesColor || CHART_COLORS[idx % CHART_COLORS.length];
            const data = priceHistory[market.id] || [];
            const prices = parseJsonField(market.outcomePrices).map((p) => parseFloat(p));
            const label = totalMarkets > 1 ? (market.groupItemTitle || market.question) : parseJsonField(market.outcomes)[0] || market.question;

            return (
              <div key={market.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm text-gray-300">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-medium text-white">
                      {prices[0] !== undefined ? `${(prices[0] * 100).toFixed(1)}%` : '—'}
                    </span>
                    <PriceChange change={market.oneDayPriceChange} className="text-xs" />
                  </div>
                </div>
                <MiniLineChart data={data} color={color} height={80} />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-[#1a1a1a]">
          {event.markets.slice(0, 8).map((market, idx) => {
            const color = market.seriesColor || CHART_COLORS[idx % CHART_COLORS.length];
            const label = totalMarkets > 1 ? (market.groupItemTitle || market.question) : parseJsonField(market.outcomes)[0];
            const prices = parseJsonField(market.outcomePrices).map((p) => parseFloat(p));
            return (
              <div key={market.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-gray-400">{label}</span>
                <span className="text-[11px] font-mono text-white">{prices[0] !== undefined ? `${(prices[0] * 100).toFixed(1)}%` : ''}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Details Table */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1a1a1a]">
          <h2 className="text-sm font-semibold text-white">Market Details</h2>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {event.markets.map((market, idx) => {
            const prices = parseJsonField(market.outcomePrices).map((p) => parseFloat(p));
            const label = totalMarkets > 1 ? (market.groupItemTitle || market.question) : market.question;
            const color = market.seriesColor || CHART_COLORS[idx % CHART_COLORS.length];

            return (
              <div key={market.id} className="px-5 py-3 hover:bg-[#111111] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[13px] font-medium text-white truncate">{label}</span>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[13px] font-mono font-medium text-white">
                        {prices[0] !== undefined ? `${(prices[0] * 100).toFixed(1)}%` : '—'}
                      </span>
                    </div>
                    <div className="w-16 text-right">
                      <PriceChange change={market.oneDayPriceChange} className="text-xs justify-end" />
                      <span className="text-[10px] text-gray-600">24h</span>
                    </div>
                    <div className="w-16 text-right">
                      <PriceChange change={market.oneWeekPriceChange} className="text-xs justify-end" />
                      <span className="text-[10px] text-gray-600">7d</span>
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-[11px] text-gray-400">
                        {market.volumeNum ? formatVolume(market.volumeNum) : formatVolume(parseFloat(market.volume || '0'))}
                      </span>
                      <span className="text-[10px] text-gray-600 block">volume</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Info */}
      {event.description && (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-5">
          <h2 className="text-sm font-semibold text-white mb-3">About</h2>
          <p className="text-[13px] text-gray-400 leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </div>
      )}
    </div>
  );
}
