'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Clock } from 'lucide-react';

export default function MarketSummary() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#111111] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#22c55e]" />
          <span className="text-sm font-semibold text-gray-200">Market Summary</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Clock size={11} />
            <span>Updated 5m ago</span>
          </div>
          {expanded ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 space-y-3">
          <p className="text-[13px] text-gray-300 leading-relaxed">
            US equity markets are trading higher in early session, with the S&P 500 gaining 0.4% as
            technology and healthcare sectors lead broad-based advances. Treasury yields are
            relatively stable, with the 10-year holding near 4.25%. The dollar index is flat against
            major pairs.
          </p>
          <p className="text-[13px] text-gray-300 leading-relaxed">
            Gold continues its upward momentum, trading above $2,150 as geopolitical uncertainty
            and central bank buying provide support. Bitcoin is consolidating above $67,000 after
            recent volatility. Crude oil is modestly higher on Middle East supply concerns.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['S&P 500 +0.4%', 'Nasdaq +0.6%', 'Gold +0.3%', 'BTC +1.2%', 'DXY -0.1%'].map(
              (tag) => {
                const isPositive = tag.includes('+');
                return (
                  <span
                    key={tag}
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      isPositive
                        ? 'text-[#22c55e] bg-[#015608]/10 border-[#015608]/20'
                        : 'text-red-400 bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    {tag}
                  </span>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}
