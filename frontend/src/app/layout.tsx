'use client';

import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAppStore } from '@/stores/useAppStore';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  return (
    <html lang="en" className="dark">
      <head>
        <title>EdgeFinder | Trading Intelligence</title>
        <meta name="description" content="AI-powered trading analysis dashboard" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div
              className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
                sidebarCollapsed ? 'ml-16' : 'ml-60'
              }`}
            >
              <Header />
              <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
                {children}
              </main>
            </div>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
