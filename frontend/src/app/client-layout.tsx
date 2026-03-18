'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StickyChat from '@/components/layout/StickyChat';
import { useAppStore } from '@/stores/useAppStore';
import { usePathname } from 'next/navigation';

const AUTH_ROUTES = ['/auth', '/onboarding'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const pathname = usePathname();

  // Don't show chrome on auth/onboarding pages
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute) {
    return <>{children}</>;
  }

  const sidebarWidth = sidebarCollapsed ? 60 : 240;

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#0f1419]"
      style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
    >
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-200"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-24">
          {children}
        </main>
      </div>
      <StickyChat />
    </div>
  );
}
