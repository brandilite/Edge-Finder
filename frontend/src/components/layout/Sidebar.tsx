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
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import clsx from 'clsx';

const navItems = [
  { label: 'Scorecard', href: '/', icon: BarChart3 },
  { label: 'Top Setups', href: '/top-setups', icon: TrendingUp },
  { label: 'Technical', href: '/technical', icon: Activity },
  { label: 'Charts', href: '/charts', icon: CandlestickChart },
  { label: 'COT Analysis', href: '/cot', icon: PieChart },
  { label: 'Sentiment', href: '/sentiment', icon: Gauge },
  { label: 'Macro Dashboard', href: '/macro', icon: Globe },
  { label: 'Economic Calendar', href: '/economic', icon: Calendar },
  { label: 'Seasonality', href: '/seasonality', icon: Snowflake },
  { label: 'News Feed', href: '/news', icon: Newspaper },
  { label: 'AI Analysis', href: '/analysis', icon: Bot },
  { label: 'Heatmap', href: '/heatmap', icon: LayoutGrid },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-dark-800 border-r border-dark-600 flex flex-col z-40 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 border-b border-dark-600">
        {!collapsed && (
          <Link href="/" className="text-lg font-bold text-accent-blue tracking-tight">
            EdgeFinder
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-gray-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-gray-400 hover:bg-dark-700 hover:text-gray-200'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-dark-600">
        {!collapsed && (
          <div className="text-xs text-gray-500 text-center">
            EdgeFinder v1.0
          </div>
        )}
      </div>
    </aside>
  );
}
