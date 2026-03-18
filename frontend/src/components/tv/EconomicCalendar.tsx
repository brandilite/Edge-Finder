'use client';

import { useMemo } from 'react';
import TradingViewWidget from './TradingViewWidget';

interface EconomicCalendarProps {
  height?: number;
}

export default function EconomicCalendar({ height = 600 }: EconomicCalendarProps) {
  const config = useMemo(
    () => ({
      width: '100%',
      height,
      colorTheme: 'dark',
      isTransparent: true,
      locale: 'en',
      importanceFilter: '-1,0,1',
      countryFilter: 'ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu',
    }),
    [height]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
        config={config}
      />
    </div>
  );
}
