'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { FOREX_SYMBOLS, COMMODITY_SYMBOLS, INDEX_SYMBOLS, CRYPTO_SYMBOLS } from '@/lib/constants';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const ALL_SYMBOLS = [...FOREX_SYMBOLS, ...COMMODITY_SYMBOLS, ...INDEX_SYMBOLS, ...CRYPTO_SYMBOLS];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SeasonalityPage() {
  const [symbol, setSymbol] = useState('EURUSD');

  const { data, isLoading } = useQuery({
    queryKey: ['seasonality', symbol],
    queryFn: () => apiGet<any>(`/seasonality/${symbol}`),
  });

  const months = (data?.months || []).map((m: any) => ({
    ...m,
    name: MONTH_NAMES[m.month - 1],
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Seasonality</h1>

      <select
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white"
      >
        {ALL_SYMBOLS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="bg-dark-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Average Monthly Return (%)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243040" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c2530', border: '1px solid #243040', borderRadius: 8 }}
                  />
                  <Bar dataKey="avg_return" radius={[4, 4, 0, 0]}>
                    {months.map((m: any, i: number) => (
                      <Cell key={i} fill={m.avg_return >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600 text-gray-400">
                  <th className="text-left p-3">Month</th>
                  <th className="text-right p-3">Avg Return</th>
                  <th className="text-right p-3">Median</th>
                  <th className="text-right p-3">Win Rate</th>
                  <th className="text-right p-3">Best</th>
                  <th className="text-right p-3">Worst</th>
                  <th className="text-right p-3">Years</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m: any) => (
                  <tr key={m.month} className="border-b border-dark-700">
                    <td className="p-3 font-medium">{m.name}</td>
                    <td className={`p-3 text-right ${m.avg_return >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {m.avg_return?.toFixed(2)}%
                    </td>
                    <td className="p-3 text-right text-gray-300">{m.median_return?.toFixed(2)}%</td>
                    <td className={`p-3 text-right font-semibold ${
                      m.win_rate >= 60 ? 'text-accent-green' : m.win_rate <= 40 ? 'text-accent-red' : 'text-gray-300'
                    }`}>
                      {m.win_rate?.toFixed(0)}%
                    </td>
                    <td className="p-3 text-right text-accent-green">{m.best_return?.toFixed(2)}%</td>
                    <td className="p-3 text-right text-accent-red">{m.worst_return?.toFixed(2)}%</td>
                    <td className="p-3 text-right text-gray-500">{m.years}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
