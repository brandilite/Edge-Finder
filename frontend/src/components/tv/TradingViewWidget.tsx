'use client';

import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  scriptSrc: string;
  config: Record<string, unknown>;
  className?: string;
  style?: React.CSSProperties;
}

function TradingViewWidgetInner({ scriptSrc, config, className = '', style }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const configRef = useRef(JSON.stringify(config));

  useEffect(() => {
    const newConfig = JSON.stringify(config);
    if (configRef.current === newConfig && containerRef.current?.querySelector('script')) {
      return;
    }
    configRef.current = newConfig;

    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = newConfig;
    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [scriptSrc, config]);

  return (
    <div
      ref={containerRef}
      className={`tradingview-widget-container ${className}`}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
}

export const TradingViewWidget = memo(TradingViewWidgetInner);
export default TradingViewWidget;
