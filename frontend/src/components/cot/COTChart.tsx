'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface COTHistoryEntry {
  date: string;
  spec_long: number;
  spec_short: number;
  spec_net: number;
  comm_long: number;
  comm_short: number;
  comm_net: number;
}

interface COTChartProps {
  data: COTHistoryEntry[];
  symbol: string;
}

export function COTChart({ data, symbol = '' }: Partial<COTChartProps> & { data: COTHistoryEntry[] }) {
  return (
    <div className="bg-dark-800 rounded-lg border border-dark-600 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">
        COT History - {symbol}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1c2530" />
          <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: '8px',
              color: '#e5e7eb',
            }}
          />
          <Legend />
          <Bar dataKey="spec_net" name="Speculator Net" fill="#3b82f6" />
          <Bar dataKey="comm_net" name="Commercial Net" fill="#06b6d4" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default COTChart;
