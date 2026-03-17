'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { COTTable } from '@/components/cot/COTTable';
import { COTChart } from '@/components/cot/COTChart';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function COTPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const { data: cotData, isLoading } = useQuery({
    queryKey: ['cot-all'],
    queryFn: () => apiGet<any>('/cot'),
  });

  const { data: historyData } = useQuery({
    queryKey: ['cot-history', selectedSymbol],
    queryFn: () => apiGet<any>(`/cot/${selectedSymbol}`),
    enabled: !!selectedSymbol,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">COT Analysis</h1>
      <p className="text-gray-400">Commitment of Traders data from CFTC. Updated weekly.</p>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <COTTable
          data={cotData?.symbols || {}}
          onSelectSymbol={setSelectedSymbol}
          selectedSymbol={selectedSymbol}
        />
      )}

      {selectedSymbol && historyData && (
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">{selectedSymbol} - COT History</h2>
          <COTChart data={historyData.history || []} />
        </div>
      )}
    </div>
  );
}
