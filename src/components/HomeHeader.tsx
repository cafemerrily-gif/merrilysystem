'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomeHeader() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    
    // 30秒ごとに未読件数を更新
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications?action=unread_count');
      if (!res.ok) return;
      
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('未読件数取得エラー:', error);
    }
  };

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <Link href="/">
          <Image
            src={isDark ? '/white.png' : '/black.png'}
            alt="MERRILY"
            width={120}
            height={40}
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          {/* 通知アイコン */}
          <Link href="/notifications" className="relative p-2">
            {/* ベルアイコン */}
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke={textColor} 
              viewBox="0 0 24 24" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" 
              />
            </svg>

            {/* 未読バッジ */}
            {unreadCount > 0 && (
              <div 
                className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: '#ef4444' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
