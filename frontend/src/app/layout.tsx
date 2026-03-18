import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import Providers from './providers';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'EdgeFinder | Trading Intelligence',
  description: 'AI-powered trading analysis dashboard with real-time market data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} font-sans`}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
