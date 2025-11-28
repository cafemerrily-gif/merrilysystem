import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeScript } from '@/components/ThemeScript';
import InstagramNavBar from '@/components/InstagramNavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MERRILY - Cafe Management System',
  description: 'バーとログがひと目でわかるダッシュボード',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeScript />
        <InstagramNavBar />
        <main className="pb-16 md:pb-0 md:pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
