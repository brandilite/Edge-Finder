'use client';

import clsx from 'clsx';

interface CryptoItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  color: string;
}

const CRYPTOS: CryptoItem[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: '$67,420', change: '+1.23%', color: '#f7931a' },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,520', change: '+1.29%', color: '#627eea' },
  { symbol: 'SOL', name: 'Solana', price: '$142.80', change: '+3.45%', color: '#00ffa3' },
  { symbol: 'BNB', name: 'BNB', price: '$572.30', change: '+0.67%', color: '#f3ba2f' },
  { symbol: 'XRP', name: 'Ripple', price: '$0.628', change: '-0.42%', color: '#23292f' },
  { symbol: 'ADA', name: 'Cardano', price: '$0.645', change: '+2.18%', color: '#0033ad' },
  { symbol: 'DOGE', name: 'Dogecoin', price: '$0.162', change: '+4.50%', color: '#c2a633' },
];

export default function CryptoList() {
  return (
    <div className="bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <h3 className="text-sm font-semibold text-gray-200">Popular Cryptocurrencies</h3>
      </div>
      <div className="divide-y divide-[#1a1a1a]/50">
        {CRYPTOS.map((crypto) => {
          const isPositive = crypto.change.startsWith('+');
          return (
            <div key={crypto.symbol} className="flex items-center gap-3 px-4 py-2 hover:bg-[#111111] transition-colors cursor-pointer">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                style={{ backgroundColor: crypto.color + '30', color: crypto.color }}
              >
                {crypto.symbol.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium text-gray-200">{crypto.symbol}</span>
                <span className="text-[11px] text-gray-500 ml-1.5">{crypto.name}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[13px] font-medium text-gray-200">{crypto.price}</div>
                <div className={clsx('text-[11px] font-medium', isPositive ? 'text-[#22c55e]' : 'text-red-400')}>
                  {crypto.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
