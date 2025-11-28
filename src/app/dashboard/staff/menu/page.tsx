'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function StaffMenu() {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold" style={{ color: textColor }}>店舗スタッフメニュー</h1>
            <p className="text-sm" style={{ color: mutedColor }}>勤怠やシフトをスタッフ自身で記録・確認できます。</p>
          </div>
          <Link 
            href="/" 
            className="text-sm px-3 py-2 rounded-lg border transition"
            style={{ borderColor, backgroundColor: bgColor, color: textColor }}
          >
            ホームへ戻る
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            href="/dashboard/staff" 
            className="rounded-xl border transition p-4 shadow-sm"
            style={{ borderColor, backgroundColor: bgColor }}
          >
            <p className="text-sm mb-1" style={{ color: mutedColor }}>勤怠管理</p>
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>出勤・退勤を記録</h2>
          </Link>
          <div className="rounded-xl border p-4 shadow-sm" style={{ borderColor, backgroundColor: bgColor }}>
            <p className="text-sm mb-1" style={{ color: mutedColor }}>シフト管理</p>
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>（準備中）</h2>
            <p className="text-sm mt-2" style={{ color: mutedColor }}>シフト登録・確認機能をここに追加予定です。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
