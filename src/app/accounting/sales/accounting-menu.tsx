'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AccountingMenu() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const stored = window.localStorage.getItem('ui-is-dark');
    
    const currentIsDark = isMobile ? media.matches : (stored === 'true' ? true : stored === 'false' ? false : media.matches);
    setIsDark(currentIsDark);
    
    document.documentElement.classList.toggle('dark', currentIsDark);
    document.body.style.backgroundColor = currentIsDark ? '#000000' : '#ffffff';
    document.body.style.color = currentIsDark ? '#ffffff' : '#000000';
  }, []);

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const hoverColor = isDark ? '#121212' : '#fafafa';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold" style={{ color: textColor }}>会計部メニュー</h1>
            <p className="text-sm" style={{ color: mutedColor }}>売上ダッシュボードや会計ページへの入り口です。</p>
          </div>
          <Link 
            href="/" 
            className="text-sm px-3 py-2 rounded-lg border transition"
            style={{ borderColor, backgroundColor: bgColor, color: textColor }}
          >
            ホームへ戻る
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/accounting" 
            className="rounded-xl border transition p-4 shadow-sm"
            style={{ borderColor, backgroundColor: bgColor }}
          >
            <p className="text-sm mb-1" style={{ color: mutedColor }}>売上ダッシュボード</p>
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>売上・詳細分析を見る</h2>
          </Link>
          <div className="rounded-xl border border-dashed p-4" style={{ borderColor, color: mutedColor, opacity: 0.6 }}>
            <p className="text-sm mb-1">追加予定</p>
            <p className="text-base">レポート出力</p>
          </div>
          <div className="rounded-xl border border-dashed p-4" style={{ borderColor, color: mutedColor, opacity: 0.6 }}>
            <p className="text-sm mb-1">追加予定</p>
            <p className="text-base">コスト管理</p>
          </div>
        </div>
      </div>
    </div>
  );
}
