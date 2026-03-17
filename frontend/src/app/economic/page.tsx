'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function EconomicPage() {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);

  const { data: calendar, isLoading } = useQuery({
    queryKey: ['economic-calendar'],
    queryFn: () => apiGet<any>('/economic/calendar'),
  });

  const { data: seriesData } = useQuery({
    queryKey: ['economic-series', selectedSeries],
    queryFn: () => apiGet<any>(`/economic/series/${selectedSeries}?limit=50`),
    enabled: !!selectedSeries,
  });

  const allSeries = calendar?.series || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Economic Data</h1>
      <p className="text-gray-400">FRED economic indicators. Click any series to view historical chart.</p>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-dark-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600 text-gray-400">
                <th className="text-left p-3">Country</th>
                <th className="text-left p-3">Indicator</th>
                <th className="text-left p-3">Series ID</th>
              </tr>
            </thead>
            <tbody>
              {allSeries.map((s: any) => (
                <tr
                  key={s.series_id}
                  onClick={() => setSelectedSeries(s.series_id)}
                  className={`border-b border-dark-700 cursor-pointer hover:bg-dark-700 transition-colors ${
                    selectedSeries === s.series_id ? 'bg-dark-600' : ''
                  }`}
                >
                  <td className="p-3 font-medium">{s.country}</td>
                  <td className="p-3">{s.name}</td>
                  <td className="p-3 text-gray-500 font-mono text-xs">{s.series_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSeries && seriesData && (
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {seriesData.name} ({seriesData.country}) — {seriesData.series_id}
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...(seriesData.data || [])].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243040" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c2530', border: '1px solid #243040', borderRadius: 8 }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
