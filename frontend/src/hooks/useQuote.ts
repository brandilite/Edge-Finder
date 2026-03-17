'use client';

import { useState, useEffect, useCallback } from 'react';
import { wsManager, Quote } from '@/lib/ws';

export function useQuote(symbol: string | null) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleQuote = useCallback((q: Quote) => {
    setQuote(q);
  }, []);

  useEffect(() => {
    const unsub = wsManager.onConnectionChange(setIsConnected);
    return unsub;
  }, []);

  useEffect(() => {
    if (!symbol) {
      setQuote(null);
      return;
    }

    wsManager.connect();
    const unsub = wsManager.subscribe(symbol, handleQuote);
    return unsub;
  }, [symbol, handleQuote]);

  return { quote, isConnected };
}
