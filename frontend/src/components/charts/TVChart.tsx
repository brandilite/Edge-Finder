'use client';

interface TVChartProps {
  symbol: string;
  theme?: 'dark' | 'light';
  interval?: string;
  width?: string | number;
  height?: string | number;
}

export default function TVChart({
  symbol,
  theme = 'dark',
  interval = 'D',
  width = '100%',
  height = 500,
}: TVChartProps) {
  const tvSymbol = symbol.includes(':') ? symbol : symbol;
  const src = `https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=${encodeURIComponent(
    tvSymbol
  )}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=0f1419&studies=[]&theme=${theme === 'dark' ? 'dark' : 'light'}&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=[]&disabled_features=[]&showvolume=1&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart`;

  return (
    <div className="rounded-lg overflow-hidden border border-dark-600 bg-dark-800">
      <iframe
        src={src}
        style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
        frameBorder="0"
        allowFullScreen
        title={`TradingView chart for ${symbol}`}
      />
    </div>
  );
}
