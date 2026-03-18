'use client';

import { useState } from 'react';
import AdvancedChart from '@/components/tv/AdvancedChart';
import SymbolOverview from '@/components/tv/SymbolOverview';
import MiniChart from '@/components/tv/MiniChart';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';
import MarketOverview from '@/components/tv/MarketOverview';
import MarketQuotes from '@/components/tv/MarketQuotes';
import ForexHeatmap from '@/components/tv/ForexHeatmap';
import StockHeatmap from '@/components/tv/StockHeatmap';
import CryptoHeatmap from '@/components/tv/CryptoHeatmap';
import Screener from '@/components/tv/Screener';
import EconomicCalendar from '@/components/tv/EconomicCalendar';
import Timeline from '@/components/tv/Timeline';
import SymbolInfo from '@/components/tv/SymbolInfo';
import CompanyProfile from '@/components/tv/CompanyProfile';
import Financials from '@/components/tv/Financials';

const SECTIONS = [
  'Charts',
  'Market Data',
  'Heatmaps',
  'Analysis',
  'News & Calendar',
  'Company',
] as const;

export default function WidgetsPage() {
  const [symbol, setSymbol] = useState('FX:EURUSD');
  const [stockSymbol, setStockSymbol] = useState('NASDAQ:AAPL');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(SECTIONS));

  const toggle = (s: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">All Widgets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every TradingView widget in one place — interact, explore, analyze
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Symbol (e.g. FX:EURUSD)"
            className="bg-[#1c2530] border border-[#243040] rounded-lg px-3 py-2 text-sm text-gray-200 outline-none w-48 focus:border-blue-500/50"
          />
          <input
            type="text"
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
            placeholder="Stock (e.g. NASDAQ:AAPL)"
            className="bg-[#1c2530] border border-[#243040] rounded-lg px-3 py-2 text-sm text-gray-200 outline-none w-48 focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Charts Section */}
      <Section title="Charts" open={openSections.has('Charts')} toggle={() => toggle('Charts')}>
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">Advanced Chart</h3>
          <AdvancedChart symbol={symbol} height={500} />

          <h3 className="text-xs font-semibold text-gray-500 uppercase">Symbol Overview</h3>
          <SymbolOverview height={400} />

          <h3 className="text-xs font-semibold text-gray-500 uppercase">Mini Charts</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {['FX:EURUSD', 'OANDA:XAUUSD', 'BITSTAMP:BTCUSD', 'FOREXCOM:SPXUSD'].map((s) => (
              <div key={s} className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
                <MiniChart symbol={s} height={180} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Market Data */}
      <Section title="Market Data" open={openSections.has('Market Data')} toggle={() => toggle('Market Data')}>
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">Market Overview</h3>
          <MarketOverview height={450} />

          <h3 className="text-xs font-semibold text-gray-500 uppercase">Market Quotes (Watchlist)</h3>
          <MarketQuotes height={400} />

          <h3 className="text-xs font-semibold text-gray-500 uppercase">Screener</h3>
          <div className="rounded-lg border border-[#243040] overflow-hidden">
            <Screener height={500} market="forex" />
          </div>
        </div>
      </Section>

      {/* Heatmaps */}
      <Section title="Heatmaps" open={openSections.has('Heatmaps')} toggle={() => toggle('Heatmaps')}>
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">Forex Heatmap</h3>
          <div className="rounded-lg border border-[#243040] overflow-hidden">
            <ForexHeatmap height={400} />
          </div>

          <h3 className="text-xs font-semibold text-gray-500 uppercase">Stock Heatmap (S&P 500)</h3>
          <div className="rounded-lg border border-[#243040] overflow-hidden">
            <StockHeatmap height={400} />
          </div>

          <h3 className="text-xs font-semibold text-gray-500 uppercase">Crypto Heatmap</h3>
          <div className="rounded-lg border border-[#243040] overflow-hidden">
            <CryptoHeatmap height={400} />
          </div>
        </div>
      </Section>

      {/* Analysis */}
      <Section title="Analysis" open={openSections.has('Analysis')} toggle={() => toggle('Analysis')}>
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">Technical Analysis — {symbol}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
              <TechnicalAnalysis symbol={symbol} interval="1m" height={350} />
            </div>
            <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
              <TechnicalAnalysis symbol={symbol} interval="1h" height={350} />
            </div>
            <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
              <TechnicalAnalysis symbol={symbol} interval="1D" height={350} />
            </div>
          </div>

          <h3 className="text-xs font-semibold text-gray-500 uppercase">Symbol Info — {symbol}</h3>
          <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
            <SymbolInfo symbol={symbol} />
          </div>
        </div>
      </Section>

      {/* News & Calendar */}
      <Section title="News & Calendar" open={openSections.has('News & Calendar')} toggle={() => toggle('News & Calendar')}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">News Timeline</h3>
            <div className="rounded-lg border border-[#243040] overflow-hidden">
              <Timeline height={500} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Economic Calendar</h3>
            <div className="rounded-lg border border-[#243040] overflow-hidden">
              <EconomicCalendar height={500} />
            </div>
          </div>
        </div>
      </Section>

      {/* Company */}
      <Section title="Company" open={openSections.has('Company')} toggle={() => toggle('Company')}>
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">Company Profile — {stockSymbol}</h3>
          <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
            <CompanyProfile symbol={stockSymbol} height={400} />
          </div>

          <h3 className="text-xs font-semibold text-gray-500 uppercase">Financials — {stockSymbol}</h3>
          <div className="rounded-lg border border-[#243040] overflow-hidden bg-[#151c24]">
            <Financials symbol={stockSymbol} height={450} />
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  open,
  toggle,
  children,
}: {
  title: string;
  open: boolean;
  toggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#243040] rounded-lg overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#151c24] hover:bg-[#1c2530] transition-colors"
      >
        <span className="text-sm font-bold text-gray-200">{title}</span>
        <span className="text-gray-500 text-lg">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}
