'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  data: any;
};

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const hoverBg = isDark ? '#1a1a1a' : '#fafafa';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=50');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('通知取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // 既読にする
    if (!notification.is_read) {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notification.id, is_read: true }),
      });

      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, is_read: true } : n
      ));
    }

    // リンク先に遷移
    if (notification.link) {
      router.push(notification.link);
      onClose();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });

      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('既読エラー:', error);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('削除エラー:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;
    return past.toLocaleDateString('ja-JP');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_post':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3b82f6' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        );
      case 'new_comment':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
        );
      case 'new_like':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: mutedColor }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:inset-auto md:absolute md:top-full md:right-0 md:w-96 md:mt-2">
      {/* オーバーレイ（モバイル） */}
      <div className="md:hidden fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* パネル */}
      <div 
        className="relative h-full md:h-auto md:max-h-[600px] md:rounded-2xl md:shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor }}>
          <h2 className="text-lg font-semibold">通知</h2>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                style={{ color: '#3b82f6' }}
              >
                すべて既読
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-lg transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 通知リスト */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: textColor }} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 mb-4" fill="none" stroke={mutedColor} viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <p style={{ color: mutedColor }}>通知はありません</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex items-start gap-3 p-4 border-b cursor-pointer transition-colors"
                  style={{ 
                    borderColor,
                    backgroundColor: notification.is_read ? 'transparent' : (isDark ? '#1a1a1a' : '#eff6ff')
                  }}
                  onMouseEnter={(e) => {
                    if (notification.is_read) {
                      e.currentTarget.style.backgroundColor = hoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (notification.is_read) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* アイコン */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">{notification.title}</p>
                    <p className="text-sm mb-1" style={{ color: mutedColor }}>{notification.message}</p>
                    <p className="text-xs" style={{ color: mutedColor }}>{getTimeAgo(notification.created_at)}</p>
                  </div>

                  {/* 未読マーク & 削除ボタン */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                    )}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="p-1 rounded-lg transition-opacity hover:opacity-70"
                    >
                      <svg className="w-4 h-4" fill="none" stroke={mutedColor} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
