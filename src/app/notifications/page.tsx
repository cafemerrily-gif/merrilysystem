'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // テーマ
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const cardBg = isDark ? '#1a1a1a' : '#fafafa';
  const unreadBg = isDark ? '#0a2540' : '#eff6ff';

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = filter === 'unread' 
        ? '/api/notifications?unread_only=true'
        : '/api/notifications';
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('通知取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_id: notificationId,
        }),
      });

      if (!res.ok) throw new Error('Failed to update');

      // 通知を更新
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('既読エラー:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mark_all_as_read: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to update');

      await fetchNotifications();
    } catch (error) {
      console.error('一括既読エラー:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!confirm('この通知を削除しますか？')) return;

    try {
      const res = await fetch(`/api/notifications?notification_id=${notificationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('削除エラー:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_post':
        return '📝';
      case 'new_like':
        return '❤️';
      case 'new_comment':
        return '💬';
      case 'welcome':
        return '🎉';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'たった今';
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: bgColor }}>
      {/* ヘッダー */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}>
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold" style={{ color: textColor }}>
              通知
            </h1>
          </div>
          <Link href="/">
            <Image
              src={isDark ? '/white.png' : '/black.png'}
              alt="MERRILY"
              width={100}
              height={33}
              priority
            />
          </Link>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="pt-20 max-w-2xl mx-auto px-4">
        {/* フィルタとアクション */}
        <div className="py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: filter === 'all' ? textColor : 'transparent',
                  color: filter === 'all' ? bgColor : textColor,
                  border: `1px solid ${filter === 'all' ? textColor : borderColor}`,
                }}
              >
                全て
              </button>
              <button
                onClick={() => setFilter('unread')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                style={{
                  backgroundColor: filter === 'unread' ? textColor : 'transparent',
                  color: filter === 'unread' ? bgColor : textColor,
                  border: `1px solid ${filter === 'unread' ? textColor : borderColor}`,
                }}
              >
                未読
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                style={{ color: '#3b82f6' }}
              >
                全て既読
              </button>
            )}
          </div>
        </div>

        {/* 通知リスト */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: textColor }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔔</div>
            <p style={{ color: mutedColor }}>
              {filter === 'unread' ? '未読の通知はありません' : '通知がありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-xl p-4 border cursor-pointer transition-all hover:opacity-80"
                style={{ 
                  backgroundColor: notification.is_read ? cardBg : unreadBg, 
                  borderColor: notification.is_read ? borderColor : '#3b82f6',
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  {/* アイコン */}
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold" style={{ color: textColor }}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                          style={{ backgroundColor: '#3b82f6' }}
                        />
                      )}
                    </div>
                    <p className="text-sm mb-2" style={{ color: mutedColor }}>
                      {notification.message}
                    </p>
                    <p className="text-xs" style={{ color: mutedColor }}>
                      {formatTime(notification.created_at)}
                    </p>
                  </div>

                  {/* 削除ボタン */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-2 rounded-lg transition-opacity hover:opacity-70 flex-shrink-0"
                    style={{ color: mutedColor }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
