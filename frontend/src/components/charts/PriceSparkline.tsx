'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface PriceSparklineProps {
  symbol: string;
  width?: number;
  height?: number;
}

export default function PriceSparkline({ symbol, width = 120, height = 40 }: PriceSparklineProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);

  const { data: candles } = useQuery<CandleData[]>({
    queryKey: ['sparkline', symbol],
    queryFn: () => apiGet<CandleData[]>(`/symbols/${symbol}/candles?timeframe=1D&count=30`),
    staleTime: 300_000,
  });

  useEffect(() => {
    if (!chartRef.current || !candles || candles.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.remove();
    }

    const chart = createChart(chartRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: { mode: 0 },
      handleScroll: false,
      handleScale: false,
    });

    chartInstance.current = chart;

    const lineData = candles.map((c) => ({
      time: c.time as string,
      value: c.close,
    }));

    const firstClose = candles[0]?.close ?? 0;
    const lastClose = candles[candles.length - 1]?.close ?? 0;
    const color = lastClose >= firstClose ? '#22c55e' : '#ef4444';

    const series = chart.addAreaSeries({
      lineColor: color,
      topColor: `${color}33`,
      bottomColor: 'transparent',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    series.setData(lineData as Parameters<typeof series.setData>[0]);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartInstance.current = null;
    };
  }, [candles, width, height]);

  return <div ref={chartRef} />;
}
