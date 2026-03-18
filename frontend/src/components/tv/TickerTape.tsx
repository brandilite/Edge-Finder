'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

export default function TickerTape() {
  const config = useMemo(
    () => ({
      symbols: [
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
        { proName: 'FOREXCOM:NSXUSD', title: 'US 100' },
        { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
        { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
        { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
        { proName: 'OANDA:XAUUSD', title: 'Gold' },
        { proName: 'FX_IDC:GBPUSD', title: 'GBP/USD' },
        { proName: 'FX_IDC:USDJPY', title: 'USD/JPY' },
        { proName: 'TVC:USOIL', title: 'Crude Oil' },
        { proName: 'TVC:SILVER', title: 'Silver' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'en',
    }),
    []
  );

  return (
    <div className="h-[46px] border-b border-[#243040] overflow-hidden">
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
        config={config}
      />
    </div>
  );
}
