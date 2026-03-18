'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  Activity,
  CandlestickChart,
  LayoutGrid,
  Gauge,
  Globe,
  Calendar,
  Snowflake,
  Newspaper,
  Bot,
  Layers,
  ChevronLeft,
  ChevronRight,
  ScanSearch,
  Plus,
  Settings,
  PieChart,
  User,
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
  { label: 'Widgets', href: '/widgets', icon: Layers },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-[#151c24] border-r border-[#2a2f3a] flex flex-col z-40 sidebar-transition',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Logo + Collapse */}
      <div className="flex items-center h-14 px-3 border-b border-[#2a2f3a] flex-shrink-0">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Activity size={15} className="text-blue-400" />
            </div>
            <span className="text-[15px] font-semibold text-gray-100 tracking-tight truncate">
              EdgeFinder
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={clsx(
            'p-1.5 rounded-md hover:bg-[#1f2937] text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Thread / Search button */}
      <div className="px-2 py-3 border-b border-[#2a2f3a]">
        <button
          className={clsx(
            'flex items-center gap-2 w-full rounded-lg text-sm font-medium text-gray-300 hover:bg-[#1f2937] transition-colors',
            collapsed ? 'justify-center p-2' : 'px-3 py-2'
          )}
        >
          <Plus size={16} className="flex-shrink-0" />
          {!collapsed && <span>New Thread</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors mb-0.5',
                isActive
                  ? 'bg-[#1f2937] text-gray-100'
                  : 'text-gray-400 hover:bg-[#1f2937]/60 hover:text-gray-200'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User + Settings */}
      <div className="border-t border-[#2a2f3a] p-2 flex-shrink-0">
        <div
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-gray-400 hover:bg-[#1f2937] hover:text-gray-200 transition-colors cursor-pointer',
            collapsed && 'justify-center'
          )}
        >
          <div className="w-6 h-6 rounded-full bg-[#2a2f3a] flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-gray-400" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <span className="truncate">Account</span>
              <Settings size={14} className="text-gray-500 flex-shrink-0" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
