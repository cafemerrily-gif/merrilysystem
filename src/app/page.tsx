'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LogoutButton from '@/components/LogoutButton';

type NavItem = {
  href: string;
  icon: React.ReactNode;
  title: string;
  accent: string;
  requiredTags?: string[];
};

type NotificationItem = { id: number; title: string; detail: string | null; created_at: string };
type BlogPost = { id: string; title: string; body: string; date: string; images?: string[]; author?: string };

export default function Home() {
  const supabase = createClientComponentClient();
  const [userName, setUserName] = useState('');
  const [userDepartments, setUserDepartments] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appTitle] = useState('MERRILY');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const stored = window.localStorage.getItem('ui-is-dark');
    if (isMobile) return window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const privileged = useMemo(() => ['職員', 'マネジメント部', 'エンジニアチーム'], []);

  const navItems: NavItem[] = useMemo(() => [
    {
      href: '/dashboard/staff/menu',
      icon: isDark ? (
        <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'スタッフ',
      accent: 'スタッフ',
      requiredTags: ['店舗スタッフ']
    },
    {
      href: '/dashboard/accounting/menu',
      icon: isDark ? (
        <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: '会計',
      accent: '会計',
      requiredTags: ['会計部']
    },
    {
      href: '/dashboard/dev/menu',
      icon: isDark ? (
        <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: '開発',
      accent: '開発',
      requiredTags: ['開発部']
    },
    {
      href: '/dashboard/pr/menu',
      icon: isDark ? (
        <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      title: '広報',
      accent: '広報',
      requiredTags: ['広報部']
    },
    {
      href: '/dashboard/debug/menu',
      icon: isDark ? (
        <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      title: 'デバッグ',
      accent: 'デバッグ',
      requiredTags: ['エンジニアチーム']
    },
  ], [isDark]);

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.requiredTags || item.requiredTags.length === 0) return true;
      if (userDepartments.some((d) => privileged.includes(d))) return true;
      return item.requiredTags.some((t) => userDepartments.includes(t));
    });
  }, [navItems, userDepartments, privileged]);

  const unreadNotifications = useMemo(() => {
    return notifications.slice(0, 5);
  }, [notifications]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const stored = window.localStorage.getItem('ui-is-dark');
      
      if (isMobile || stored === null) {
        setIsDark(e.matches);
      }
    };
    
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const meta = data.user?.user_metadata;
      if (meta?.full_name) setUserName(meta.full_name);
      if (Array.isArray(meta?.departments)) setUserDepartments(meta.departments);
      if (meta?.is_admin === true || meta?.role === 'admin') setIsAdmin(true);
    })();
  }, [supabase]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (!data.error) setNotifications(data);
      } finally {
        setLoadingNotifications(false);
      }
    };

    const loadBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const res = await fetch('/api/pr/website', { cache: 'no-store' });
        const data = await res.json();
        if (data?.blogPosts) {
          const sorted = data.blogPosts
            .slice()
            .map((p: any) => ({
              ...p,
              images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
              author: p.author || '',
            }))
            .sort((a: any, b: any) => (a.date > b.date ? -1 : 1));
          setBlogPosts(sorted);
        } else {
          setBlogPosts([]);
        }
      } finally {
        setLoadingBlogs(false);
      }
    };

    loadNotifications();
    loadBlogs();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = isDark ? '#000000' : '#ffffff';
    document.body.style.color = isDark ? '#ffffff' : '#000000';
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ui-is-dark', isDark ? 'true' : 'false');
    }
  }, [isDark]);

  const appIconUrl = isDark ? '/white.png' : '/black.png';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* ヘッダー */}
      <header className="w-full flex items-center justify-between px-4 py-3 sticky top-0 z-30 border-b" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <Image src={appIconUrl} width={40} height={40} alt="MERRILY" className="object-contain" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: textColor }}>
            {appTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border transition"
            style={{ borderColor }}
            onClick={() => setIsDark((prev) => !prev)}
          >
            <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
          </button>
          
          {/* 通知アイコン */}
          <div className="relative">
            <button
              onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
              className="relative p-2 rounded-lg transition"
              aria-label="通知"
            >
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {/* 通知パネル */}
            {notificationPanelOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border shadow-lg z-50" style={{ backgroundColor: bgColor, borderColor }}>
                <div className="p-4 border-b" style={{ borderColor }}>
                  <h3 className="font-semibold">通知</h3>
                </div>
                <div className="divide-y" style={{ borderColor }}>
                  {loadingNotifications ? (
                    <div className="p-4 text-sm" style={{ color: mutedColor }}>読み込み中...</div>
                  ) : unreadNotifications.length === 0 ? (
                    <div className="p-4 text-sm" style={{ color: mutedColor }}>通知はありません</div>
                  ) : (
                    unreadNotifications.map((n) => (
                      <div key={n.id} className="p-4 cursor-pointer" style={{ backgroundColor: bgColor }}>
                        <div className="flex justify-between text-xs mb-1" style={{ color: mutedColor }}>
                          <span>{new Date(n.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                        <p className="font-semibold text-sm">{n.title}</p>
                        {n.detail && <p className="text-xs line-clamp-2" style={{ color: mutedColor }}>{n.detail}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative sm:hidden">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg border p-2"
              style={{ borderColor }}
              aria-label="メニュー"
            >
              <svg className="h-5 w-5" fill="none" stroke={textColor} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-44 space-y-2 rounded-xl border p-3 shadow-lg" style={{ backgroundColor: bgColor, borderColor }}>
                {isAdmin && (
                  <>
                    <Link href="/profile" className="block rounded-lg px-3 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                      プロフィール
                    </Link>
                    <Link href="/admin/users" className="block rounded-lg px-3 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                      メンバー管理
                    </Link>
                  </>
                )}
                <div className="px-3 py-2">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            {isAdmin && (
              <>
                <Link href="/profile" className="text-sm px-3 py-2 rounded-lg border transition" style={{ borderColor }}>
                  プロフィール
                </Link>
                <Link href="/admin/users" className="text-sm px-3 py-2 rounded-lg border transition" style={{ borderColor }}>
                  メンバー管理
                </Link>
              </>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* メインコンテンツ（ブログフィード） - PC版は幅いっぱい */}
      <main className="w-full mx-auto px-0 md:px-4 py-0 md:py-6">
        {loadingBlogs ? (
          <div className="text-center py-8" style={{ color: mutedColor }}>読み込み中...</div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-8" style={{ color: mutedColor }}>まだ投稿はありません</div>
        ) : (
          <div className="space-y-0 md:space-y-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="border-b md:rounded-2xl md:border overflow-hidden" style={{ backgroundColor: bgColor, borderColor }}>
                {/* 投稿ヘッダー */}
                <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: isDark ? '#262626' : '#efefef' }}>
                    {post.author ? post.author[0].toUpperCase() : 'B'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{post.author || 'ブログ'}</p>
                    <p className="text-xs" style={{ color: mutedColor }}>{new Date(post.date).toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>

                {/* 画像 */}
                {post.images && post.images.length > 0 && (
                  <div className="relative w-full" style={{ backgroundColor: isDark ? '#262626' : '#efefef', minHeight: '300px', maxHeight: '600px' }}>
                    <Image
                      src={post.images[0]}
                      alt={post.title}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </div>
                )}

                {/* 投稿内容 */}
                <div className="p-4 space-y-2">
                  <h2 className="text-lg font-bold">{post.title}</h2>
                  <p className="text-sm" style={{ color: textColor }}>{post.body}</p>
                </div>

                {/* 追加の画像 */}
                {post.images && post.images.length > 1 && (
                  <div className="px-4 pb-4 space-y-4">
                    {post.images.slice(1).map((url, idx) => (
                      <div key={`${post.id}-img-${idx + 1}`} className="relative w-full rounded-lg overflow-hidden" style={{ backgroundColor: isDark ? '#262626' : '#efefef', minHeight: '300px', maxHeight: '600px' }}>
                        <Image
                          src={url}
                          alt={`${post.title} - ${idx + 2}`}
                          fill
                          className="object-contain"
                          sizes="100vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 下部固定バー（Instagram風） */}
      <nav className="fixed bottom-0 left-0 right-0 border-t z-40" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition group"
              >
                <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-[10px] font-medium" style={{ color: textColor }}>{item.accent}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
