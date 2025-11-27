// src/app/layout.tsx
// このファイルを参考にして、実際のlayout.tsxを修正してください

import { ThemeScript } from '@/components/ThemeScript';
import './globals.css';

export const metadata = {
  title: 'MERRILY',
  description: 'Cafe Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* メタタグなど */}
      </head>
      <body>
        {/* ⭐ このスクリプトを<body>の最初に配置 */}
        <ThemeScript />
        
        {children}
      </body>
    </html>
  );
}
