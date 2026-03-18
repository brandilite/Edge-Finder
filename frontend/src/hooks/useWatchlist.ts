'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  symbols: string[];
  created_at: string;
  updated_at: string;
}

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlists = useCallback(async () => {
    if (!user) {
      setWatchlists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching watchlists:', error);
    } else {
      setWatchlists((data as Watchlist[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const addSymbol = async (watchlistId: string, symbol: string) => {
    const watchlist = watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    const upperSymbol = symbol.toUpperCase();
    if (watchlist.symbols.includes(upperSymbol)) return;

    const updatedSymbols = [...watchlist.symbols, upperSymbol];
    const { error } = await supabase
      .from('watchlists')
      .update({ symbols: updatedSymbols, updated_at: new Date().toISOString() })
      .eq('id', watchlistId);

    if (error) {
      console.error('Error adding symbol:', error);
      throw error;
    }

    setWatchlists((prev) =>
      prev.map((w) =>
        w.id === watchlistId ? { ...w, symbols: updatedSymbols } : w
      )
    );
  };

  const removeSymbol = async (watchlistId: string, symbol: string) => {
    const watchlist = watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    const updatedSymbols = watchlist.symbols.filter(
      (s) => s !== symbol.toUpperCase()
    );
    const { error } = await supabase
      .from('watchlists')
      .update({ symbols: updatedSymbols, updated_at: new Date().toISOString() })
      .eq('id', watchlistId);

    if (error) {
      console.error('Error removing symbol:', error);
      throw error;
    }

    setWatchlists((prev) =>
      prev.map((w) =>
        w.id === watchlistId ? { ...w, symbols: updatedSymbols } : w
      )
    );
  };

  const createWatchlist = async (name: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('watchlists')
      .insert({ user_id: user.id, name, symbols: [] })
      .select()
      .single();

    if (error) {
      console.error('Error creating watchlist:', error);
      throw error;
    }

    setWatchlists((prev) => [...prev, data as Watchlist]);
    return data as Watchlist;
  };

  return {
    watchlists,
    loading,
    addSymbol,
    removeSymbol,
    createWatchlist,
    refreshWatchlists: fetchWatchlists,
  };
}
