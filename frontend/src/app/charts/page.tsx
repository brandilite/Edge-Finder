'use client';

import { useState } from 'react';
import AdvancedChart from '@/components/tv/AdvancedChart';
import SymbolInfo from '@/components/tv/SymbolInfo';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';

const POPULAR_SYMBOLS = [
  { tv: 'FX:EURUSD', label: 'EUR/USD' },
  { tv: 'FX:GBPUSD', label: 'GBP/USD' },
  { tv: 'FX:USDJPY', label: 'USD/JPY' },
  { tv: 'OANDA:XAUUSD', label: 'Gold' },
  { tv: 'BITSTAMP:BTCUSD', label: 'Bitcoin' },
  { tv: 'BITSTAMP:ETHUSD', label: 'Ethereum' },
  { tv: 'FOREXCOM:SPXUSD', label: 'S&P 500' },
  { tv: 'FOREXCOM:NSXUSD', label: 'Nasdaq' },
  { tv: 'TVC:USOIL', label: 'Crude Oil' },
  { tv: 'TVC:SILVER', label: 'Silver' },
  { tv: 'FX:AUDUSD', label: 'AUD/USD' },
  { tv: 'FX:USDCAD', label: 'USD/CAD' },
];

const INTERVALS = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1H', value: '60' },
  { label: '4H', value: '240' },
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
  { label: '1M', value: 'M' },
];

export default function ChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState(POPULAR_SYMBOLS[0].tv);
  const [interval, setInterval] = useState('D');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="bg-[#1c2530] border border-[#243040] rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500/50"
        >
          {POPULAR_SYMBOLS.map((s) => (
            <option key={s.tv} value={s.tv}>{s.label}</option>
          ))}
        </select>

        <div className="flex gap-1">
          {INTERVALS.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setInterval(tf.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                interval === tf.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#1c2530] text-gray-400 hover:text-gray-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <SymbolInfo symbol={selectedSymbol} />

      <AdvancedChart
        symbol={selectedSymbol}
        interval={interval}
        height="calc(100vh - 340px)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#151c24] rounded-lg border border-[#243040] overflow-hidden">
          <TechnicalAnalysis symbol={selectedSymbol} interval="1m" height={380} />
        </div>
        <div className="bg-[#151c24] rounded-lg border border-[#243040] overflow-hidden">
          <TechnicalAnalysis symbol={selectedSymbol} interval="1h" height={380} />
        </div>
        <div className="bg-[#151c24] rounded-lg border border-[#243040] overflow-hidden">
          <TechnicalAnalysis symbol={selectedSymbol} interval="1D" height={380} />
        </div>
      </div>
    </div>
  );
}
