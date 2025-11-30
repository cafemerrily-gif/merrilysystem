'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import NotificationPanel from './NotificationPanel';

export default function NotificationIcon({ textColor }: { textColor: string }) {
  const supabase = createClientComponentClient();
  const [showPanel, setShowPanel] = useState(false);
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
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="p-2 rounded-lg transition-opacity hover:opacity-70 relative"
      >
        {/* インスタ風ハートアイコン */}
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
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>

        {/* 未読バッジ */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-xs font-bold text-white bg-red-500">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* 通知パネル */}
      {showPanel && <NotificationPanel onClose={() => setShowPanel(false)} />}
    </div>
  );
}
