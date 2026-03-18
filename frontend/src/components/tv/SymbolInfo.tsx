'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface SymbolInfoProps {
  symbol?: string;
}

export default function SymbolInfo({ symbol = 'FX:EURUSD' }: SymbolInfoProps) {
  const config = useMemo(
    () => ({
      symbol,
      width: '100%',
      locale: 'en',
      colorTheme: 'dark',
      isTransparent: true,
    }),
    [symbol]
  );

  return (
    <div className="h-[180px]">
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
        config={config}
      />
    </div>
  );
}
