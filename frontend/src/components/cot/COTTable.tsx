'use client';

interface COTRow {
  symbol: string;
  name?: string;
  open_interest: number;
  spec_long: number;
  spec_short: number;
  spec_net: number;
  comm_long: number;
  comm_short: number;
  comm_net: number;
}

interface COTTableProps {
  data: COTRow[];
  onRowClick?: (symbol: string) => void;
  selectedSymbol?: string | null;
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function COTTable({ data, onRowClick, onSelectSymbol, selectedSymbol }: COTTableProps & { onSelectSymbol?: (symbol: string) => void }) {
  const handleClick = (symbol: string) => {
    onRowClick?.(symbol);
    onSelectSymbol?.(symbol);
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-600">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Open Interest</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Spec Long</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Spec Short</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Spec Net</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Comm Long</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Comm Short</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Comm Net</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.symbol}
              onClick={() => handleClick(row.symbol)}
              className={`border-b border-dark-700 cursor-pointer transition-colors ${
                selectedSymbol === row.symbol
                  ? 'bg-accent-blue/10'
                  : 'hover:bg-dark-700'
              }`}
            >
              <td className="py-3 px-4 font-medium text-gray-200">
                {row.name || row.symbol}
              </td>
              <td className="py-3 px-4 text-right text-gray-300">{formatNum(row.open_interest)}</td>
              <td className="py-3 px-4 text-right text-accent-green">{formatNum(row.spec_long)}</td>
              <td className="py-3 px-4 text-right text-accent-red">{formatNum(row.spec_short)}</td>
              <td
                className={`py-3 px-4 text-right font-medium ${
                  row.spec_net >= 0 ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {formatNum(row.spec_net)}
              </td>
              <td className="py-3 px-4 text-right text-accent-green">{formatNum(row.comm_long)}</td>
              <td className="py-3 px-4 text-right text-accent-red">{formatNum(row.comm_short)}</td>
              <td
                className={`py-3 px-4 text-right font-medium ${
                  row.comm_net >= 0 ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {formatNum(row.comm_net)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default COTTable;
