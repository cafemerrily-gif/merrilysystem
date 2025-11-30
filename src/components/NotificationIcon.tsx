'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function NotificationIcon({ textColor }: { textColor: string }) {
  const supabase = createClientComponentClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();

    // リアルタイム更新
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications?action=unread_count');
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('未読件数取得エラー:', error);
    }
  };

  return (
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

      {/* 未読バッジ（赤丸） */}
      {unreadCount > 0 && (
        <div 
          className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: '#ef4444' }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </Link>
  );
}
