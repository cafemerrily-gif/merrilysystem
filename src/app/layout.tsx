import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeInitScript } from '@/components/ThemeInitScript';
import InstagramNavBar from '@/components/InstagramNavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MERRILY - Cafe Management System',
  description: 'バイトログがひと目でわかるダッシュボード',
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
      <head>
        <ThemeInitScript />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <InstagramNavBar />
          <main className="pb-16 md:pb-0 md:pt-16">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
