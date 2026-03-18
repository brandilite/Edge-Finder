'use client';

import { useParams } from 'next/navigation';
import AdvancedChart from '@/components/tv/AdvancedChart';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';
import SymbolInfo from '@/components/tv/SymbolInfo';
import MiniChart from '@/components/tv/MiniChart';
import Timeline from '@/components/tv/Timeline';

const SYMBOL_MAP: Record<string, string> = {
  EURUSD: 'FX:EURUSD',
  GBPUSD: 'FX:GBPUSD',
  USDJPY: 'FX:USDJPY',
  AUDUSD: 'FX:AUDUSD',
  USDCAD: 'FX:USDCAD',
  USDCHF: 'FX:USDCHF',
  NZDUSD: 'FX:NZDUSD',
  XAUUSD: 'OANDA:XAUUSD',
  XAGUSD: 'OANDA:XAGUSD',
  BTCUSD: 'BITSTAMP:BTCUSD',
  ETHUSD: 'BITSTAMP:ETHUSD',
  SPX500: 'FOREXCOM:SPXUSD',
  NAS100: 'FOREXCOM:NSXUSD',
  USOIL: 'TVC:USOIL',
};

export default function ScorecardSymbolPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const tvSymbol = SYMBOL_MAP[symbol] || `FX:${symbol}`;

  return (
    <div className="space-y-4">
      <SymbolInfo symbol={tvSymbol} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AdvancedChart symbol={tvSymbol} height={500} />
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a]">
            <div className="px-3 py-2 border-b border-[#1a1a1a]">
              <span className="text-xs font-semibold text-gray-400 uppercase">1D Technical</span>
            </div>
            <TechnicalAnalysis symbol={tvSymbol} interval="1D" height={250} />
          </div>
          <div className="rounded-lg border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a]">
            <div className="px-3 py-2 border-b border-[#1a1a1a]">
              <span className="text-xs font-semibold text-gray-400 uppercase">1H Technical</span>
            </div>
            <TechnicalAnalysis symbol={tvSymbol} interval="1h" height={250} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {['1M', '3M', '6M', '12M'].map((range) => (
          <div key={range} className="rounded-lg border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a]">
            <div className="px-3 py-1.5 border-b border-[#1a1a1a]">
              <span className="text-[10px] font-semibold text-gray-500 uppercase">{range}</span>
            </div>
            <MiniChart symbol={tvSymbol} height={150} dateRange={range} />
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Related News</h2>
        <div className="rounded-lg border border-[#1a1a1a] overflow-hidden">
          <Timeline height={350} feedMode="all_symbols" market="forex" />
        </div>
      </div>
    </div>
  );
}
