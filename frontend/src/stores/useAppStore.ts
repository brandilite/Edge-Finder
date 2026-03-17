import { create } from 'zustand';
import { AssetClass } from '@/lib/constants';

interface AppState {
  selectedAssetClass: AssetClass;
  selectedSymbol: string | null;
  sidebarCollapsed: boolean;
  setAssetClass: (ac: AssetClass) => void;
  setSymbol: (symbol: string | null) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedAssetClass: 'forex',
  selectedSymbol: null,
  sidebarCollapsed: false,
  setAssetClass: (ac) => set({ selectedAssetClass: ac, selectedSymbol: null }),
  setSymbol: (symbol) => set({ selectedSymbol: symbol }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
