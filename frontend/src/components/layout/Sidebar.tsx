'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  Activity,
  CandlestickChart,
  PieChart,
  Gauge,
  Globe,
  Calendar,
  Snowflake,
  Newspaper,
  Bot,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Layers,
  ScanSearch,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', href: '/', icon: BarChart3 },
  { label: 'Charts', href: '/charts', icon: CandlestickChart },
  { label: 'Technical', href: '/technical', icon: Activity },
  { label: 'Screener', href: '/screener', icon: ScanSearch },
  { label: 'Heatmap', href: '/heatmap', icon: LayoutGrid },
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'Economic Calendar', href: '/economic', icon: Calendar },
  { label: 'Macro Map', href: '/macro', icon: Globe },
  { label: 'Scorecard', href: '/top-setups', icon: TrendingUp },
  { label: 'COT Analysis', href: '/cot', icon: PieChart },
  { label: 'Sentiment', href: '/sentiment', icon: Gauge },
  { label: 'Seasonality', href: '/seasonality', icon: Snowflake },
  { label: 'AI Analysis', href: '/analysis', icon: Bot },
  { label: 'All Widgets', href: '/widgets', icon: Layers },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-[#151c24] border-r border-[#243040] flex flex-col z-40 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 border-b border-[#243040]">
        {!collapsed && (
          <Link href="/" className="text-lg font-bold text-blue-400 tracking-tight">
            EdgeFinder
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-[#1c2530] text-gray-400 hover:text-gray-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-gray-400 hover:bg-[#1c2530] hover:text-gray-200'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#243040]">
        {!collapsed && (
          <div className="text-[10px] text-gray-600 text-center">
            Powered by TradingView
          </div>
        )}
      </div>
    </aside>
  );
}
