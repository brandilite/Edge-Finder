'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  Bell,
  Star,
  DollarSign,
  Zap,
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
  { label: 'Earnings', href: '/earnings', icon: DollarSign },
  { label: 'Watchlist', href: '/watchlist', icon: Star },
  { label: 'Price Alerts', href: '/alerts', icon: Bell },
  { label: 'Predictions', href: '/predictions', icon: Zap },
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
        'fixed left-0 top-0 h-screen bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col z-40 sidebar-transition',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Logo + Collapse */}
      <div className="flex items-center h-14 px-3 border-b border-[#1a1a1a] flex-shrink-0">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
            <Image
              src="/brand/Logo White.png"
              alt="Reversals Club"
              width={28}
              height={28}
              className="flex-shrink-0"
            />
            <span className="text-[14px] font-semibold text-white tracking-tight truncate">
              Reversals Club
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <Image
              src="/brand/Logo White.png"
              alt="Reversals Club"
              width={24}
              height={24}
            />
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={clsx(
            'p-1.5 rounded-md hover:bg-[#111111] text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0',
            collapsed && 'mx-auto mt-2'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Thread / Search button */}
      <div className="px-2 py-3 border-b border-[#1a1a1a]">
        <button
          className={clsx(
            'flex items-center gap-2 w-full rounded-lg text-sm font-medium text-gray-300 hover:bg-[#111111] transition-colors',
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
                  ? 'bg-[#015608]/20 text-[#22c55e] border border-[#015608]/30'
                  : 'text-gray-400 hover:bg-[#111111] hover:text-gray-200'
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
      <div className="border-t border-[#1a1a1a] p-2 flex-shrink-0">
        <Link
          href="/account"
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors',
            pathname === '/account'
              ? 'bg-[#015608]/20 text-[#22c55e] border border-[#015608]/30'
              : 'text-gray-400 hover:bg-[#111111] hover:text-gray-200',
            collapsed && 'justify-center'
          )}
        >
          <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-gray-400" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <span className="truncate">Account</span>
              <Settings size={14} className="text-gray-500 flex-shrink-0" />
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
