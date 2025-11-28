'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LogoutButton from '@/components/LogoutButton';

type NavItem = {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  desc: string;
  accent: string;
  requiredTags?: string[];
};

type LogItem = { id: number; user_name: string | null; message: string; created_at: string };
type NotificationItem = { id: number; title: string; detail: string | null; created_at: string };
type BlogPost = { id: string; title: string; body: string; date: string; images?: string[]; author?: string };
type SalesSummary = { todayTotal: number; currentMonthSales: number; totalAmount: number };

const hexToHslTriplet = (hex: string = '#ffffff') => {
  const safeHex = (hex ?? '#ffffff').trim();
  if (!safeHex) return '0 0% 100%';
  const h = safeHex.replace('#', '');
  if (h.length !== 6) return '0 0% 100%';
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hDeg = 0;
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        hDeg = ((g - b) / d) % 6;
        break;
      case g:
        hDeg = (b - r) / d + 2;
        break;
      default:
        hDeg = (r - g) / d + 4;
    }
    hDeg = Math.round(hDeg * 60);
    if (hDeg < 0) hDeg += 360;
  }
  return `${Math.round(hDeg)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const toHsla = (triplet: string = '0 0% 100%', alpha = 1) => {
  const safeTriplet = (triplet ?? '0 0% 100%').trim() || '0 0% 100%';
  const normalized = safeTriplet.replace(/\s+/g, ', ');
  return `hsla(${normalized}, ${alpha})`;
};

const navItems: NavItem[] = [
  { href: '/dashboard/staff/menu', icon: '👥', title: '店舗スタッフ', subtitle: '勤怠・シフト', desc: '出勤/退勤の記録とシフト確認', accent: 'スタッフ', requiredTags: ['店舗スタッフ'] },
  { href: '/dashboard/accounting/menu', icon: '📊', title: '会計部', subtitle: '売上メニュー', desc: '売上・分析ダッシュボードへ', accent: '会計', requiredTags: ['会計部'] },
  { href: '/dashboard/dev/menu', icon: '🛠️', title: '開発部', subtitle: 'メニュー管理', desc: 'カテゴリ/フォルダ/商品を管理', accent: '開発', requiredTags: ['開発部'] },
  { href: '/dashboard/pr/menu', icon: '📣', title: '広報部', subtitle: 'ホームページ編集', desc: '配色・アイコン・ブログ編集', accent: '広報', requiredTags: ['広報部'] },
  { href: '/dashboard/debug/menu', icon: '🐛', title: 'デバッグ', subtitle: 'テスト/チェック', desc: 'APIテストやスイッチ検証', accent: 'デバッグ', requiredTags: ['エンジニアチーム'] },
];

const applyUiToDocument = (ui: any, isDark: boolean) => {
  if (typeof document === 'undefined' || !ui) return;
  const light = {
    background: ui.lightBackground || '#f8fafc',
    backgroundAlpha: ui.lightBackgroundAlpha ?? 1,
    backgroundGradient: ui.lightBackgroundGradient || '',
    foreground: ui.lightForeground || '#0f172a',
    border: ui.lightBorder || '#e2e8f0',
    cardBg: ui.cardBgLight || ui.cardBackground || '#ffffff',
    cardFg: ui.cardFgLight || ui.cardForeground || '#0f172a',
    cardBorder: ui.cardBorderLight || ui.cardBorder || '#e2e8f0',
    muted: ui.mutedColorLight || ui.mutedColor || '#64748b',
    inputBg: ui.inputBgColorLight || '#ffffff',
    inputText: ui.inputTextColorLight || '#0f172a',
  };
  const dark = {
    background: ui.darkBackground || '#0b1220',
    backgroundAlpha: ui.darkBackgroundAlpha ?? 1,
    backgroundGradient: ui.darkBackgroundGradient || '',
    foreground: ui.darkForeground || '#e5e7eb',
    border: ui.darkBorder || '#1f2937',
    cardBg: ui.cardBgDark || ui.cardBackground || '#0f172a',
    cardFg: ui.cardFgDark || ui.cardForeground || '#e5e7eb',
    cardBorder: ui.cardBorderDark || ui.cardBorder || '#1f2937',
    muted: ui.mutedColorDark || ui.mutedColor || '#94a3b8',
    inputBg: ui.inputBgColorDark || '#1f2937',
    inputText: ui.inputTextColorDark || '#e5e7eb',
  };
  const mode = isDark ? dark : light;
  const headerBg = isDark ? ui.headerBgDark || ui.headerBackground : ui.headerBgLight || ui.headerBackground;
  const headerAlpha = isDark ? ui.headerBgAlphaDark ?? 1 : ui.headerBgAlphaLight ?? 1;
  const headerGradient = isDark ? ui.headerBgGradientDark || '' : ui.headerBgGradientLight || '';
  const headerFg = isDark ? ui.headerFgDark || ui.headerForeground : ui.headerFgLight || ui.headerForeground;
  const cardGradient = isDark ? ui.cardBgGradientDark || '' : ui.cardBgGradientLight || '';
  const cardAlpha = isDark ? ui.cardBgAlphaDark ?? 1 : ui.cardBgAlphaLight ?? 1;

  const root = document.documentElement;
  root.style.setProperty('--background', hexToHslTriplet(mode.background));
  root.style.setProperty('--foreground', hexToHslTriplet(mode.foreground));
  root.style.setProperty('--border', hexToHslTriplet(mode.border));
  root.style.setProperty('--card', hexToHslTriplet(mode.cardBg));
  root.style.setProperty('--card-foreground', hexToHslTriplet(mode.cardFg));
  root.style.setProperty('--muted', hexToHslTriplet(mode.muted));
  root.style.setProperty('--muted-foreground', hexToHslTriplet(mode.muted));
  root.style.setProperty('--accent', hexToHslTriplet(ui.accent || mode.foreground));
  root.style.setProperty('--primary', hexToHslTriplet(ui.primary || mode.foreground));
  root.style.setProperty('--card-foreground-hex', mode.cardFg);
  root.style.setProperty('--card-background-hex', mode.cardBg);
  root.style.setProperty('--card-gradient', cardGradient || 'none');
  root.style.setProperty('--card-alpha', cardAlpha.toString());
  root.style.setProperty('--header-bg', hexToHslTriplet(headerBg));
  root.style.setProperty('--header-bg-alpha', headerAlpha.toString());
  root.style.setProperty('--header-gradient', headerGradient || 'none');
  root.style.setProperty('--header-fg', hexToHslTriplet(headerFg));
  root.style.setProperty('--input-bg', mode.inputBg);
  root.style.setProperty('--input-text', mode.inputText);

  if (mode.backgroundGradient) {
    document.body.style.backgroundImage = mode.backgroundGradient;
    document.body.style.backgroundColor = 'transparent';
  } else {
    const hsl = hexToHslTriplet(mode.background);
    const alpha = mode.backgroundAlpha ?? 1;
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = `hsla(${hsl}, ${alpha})`;
  }
  root.classList.toggle('dark', isDark);
};

export default function Home() {
  const supabase = createClientComponentClient();
  const [userName, setUserName] = useState('');
  const [userDepartments, setUserDepartments] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appIconLightUrl, setAppIconLightUrl] = useState('/white.png');
  const [appIconDarkUrl, setAppIconDarkUrl] = useState('/black.png');
  const [appTitle, setAppTitle] = useState('MERRILY');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [uiSettings, setUiSettings] = useState<any>(null);
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

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.requiredTags || item.requiredTags.length === 0) return true;
      if (userDepartments.some((d) => privileged.includes(d))) return true;
      return item.requiredTags.some((t) => userDepartments.includes(t));
    });
  }, [userDepartments, privileged]);

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
        if (uiSettings) applyUiToDocument(uiSettings, e.matches);
      }
    };
    
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [uiSettings]);

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
        if (data?.uiSettings) {
          setUiSettings(data.uiSettings);
          applyUiToDocument(data.uiSettings, isDark);
          if (data.uiSettings.appIconLightUrl) setAppIconLightUrl(data.uiSettings.appIconLightUrl);
          if (data.uiSettings.appIconDarkUrl) setAppIconDarkUrl(data.uiSettings.appIconDarkUrl);
          if (data.uiSettings.appTitle) setAppTitle(data.uiSettings.appTitle);
        }
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
  }, [isDark]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDark);
    if (uiSettings) applyUiToDocument(uiSettings, isDark);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ui-is-dark', isDark ? 'true' : 'false');
    }
  }, [isDark, uiSettings]);

  const currentHeader = (() => {
    const ui = uiSettings || {};
    const bg = isDark ? ui.headerBgDark || ui.headerBackground || '#0b1220' : ui.headerBgLight || ui.headerBackground || '#f8fafc';
    const bgAlpha = isDark ? ui.headerBgAlphaDark ?? 1 : ui.headerBgAlphaLight ?? 1;
    const bgGradient = isDark ? ui.headerBgGradientDark || '' : ui.headerBgGradientLight || '';
    const fg = isDark ? ui.headerFgDark || ui.headerForeground || '#e5e7eb' : ui.headerFgLight || ui.headerForeground || '#0f172a';
    const border = isDark ? ui.headerBorderDark || '#1f2937' : ui.headerBorderLight || '#e2e8f0';
    const title = isDark ? ui.headerTitleColorDark || fg : ui.headerTitleColorLight || fg;
    const subtitle = isDark ? ui.headerSubtitleColorDark || fg : ui.headerSubtitleColorLight || fg;
    const user = isDark ? ui.headerUserColorDark || fg : ui.headerUserColorLight || fg;
    return { bg, bgAlpha, bgGradient, fg, border, title, subtitle, user };
  })();

  const currentCard = (() => {
    const ui = uiSettings || {};
    const bg = isDark ? ui.cardBgDark || ui.cardBackground || '#0f172a' : ui.cardBgLight || ui.cardBackground || '#ffffff';
    const bgAlpha = isDark ? ui.cardBgAlphaDark ?? 1 : ui.cardBgAlphaLight ?? 1;
    const bgGradient = isDark ? ui.cardBgGradientDark || '' : ui.cardBgGradientLight || '';
    const fg = isDark ? ui.cardFgDark || ui.cardForeground || '#e5e7eb' : ui.cardFgLight || ui.cardForeground || '#0f172a';
    const border = isDark ? ui.cardBorderDark || '#1f2937' : ui.cardBorderLight || '#e2e8f0';
    return { bg, bgAlpha, bgGradient, fg, border };
  })();

  const cardStyle = {
    backgroundImage: currentCard.bgGradient || 'var(--card-gradient)',
    backgroundColor: toHsla(hexToHslTriplet(currentCard.bg), currentCard.bgAlpha ?? 1),
    color: currentCard.fg || `hsla(var(--card-foreground), 1)`,
    borderColor: currentCard.border,
  };

  const headerStyle = {
    backgroundImage: currentHeader.bgGradient || 'var(--header-gradient)',
    backgroundColor: toHsla(hexToHslTriplet(currentHeader.bg), currentHeader.bgAlpha ?? 1),
    backgroundBlendMode: currentHeader.bgGradient ? 'overlay' : 'normal',
    backgroundRepeat: 'no-repeat',
    color: currentHeader.fg || `hsla(var(--header-fg), 1)`,
    borderColor: currentHeader.border,
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ヘッダー */}
      <header className="w-full flex items-center justify-between px-4 py-3 sticky top-0 z-30 border-b" style={headerStyle}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <Image src={isDark ? appIconDarkUrl : appIconLightUrl} width={40} height={40} alt="MERRILY" className="object-contain" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: currentHeader.title }}>
            {appTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card/70 hover:bg-card transition"
            onClick={() => setIsDark((prev) => !prev)}
          >
            <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
          </button>
          
          {/* 通知アイコン */}
          <div className="relative">
            <button
              onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
              className="relative p-2 rounded-lg hover:bg-card/70 transition"
              aria-label="通知"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {/* 通知パネル */}
            {notificationPanelOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border shadow-lg z-50" style={cardStyle}>
                <div className="p-4 border-b" style={{ borderColor: currentCard.border }}>
                  <h3 className="font-semibold">通知</h3>
                </div>
                <div className="divide-y" style={{ borderColor: currentCard.border }}>
                  {loadingNotifications ? (
                    <div className="p-4 text-sm text-muted-foreground">読み込み中...</div>
                  ) : unreadNotifications.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">通知はありません</div>
                  ) : (
                    unreadNotifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-muted/30 transition cursor-pointer">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{new Date(n.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                        <p className="font-semibold text-sm">{n.title}</p>
                        {n.detail && <p className="text-xs text-muted-foreground line-clamp-2">{n.detail}</p>}
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
              className="rounded-lg border border-border bg-card/60 p-2"
              aria-label="メニュー"
            >
              <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-44 space-y-2 rounded-xl border border-border bg-card p-3 shadow-lg">
                {isAdmin && (
                  <>
                    <Link href="/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                      プロフィール
                    </Link>
                    <Link href="/admin/users" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                      メンバー管理
                    </Link>
                  </>
                )}
                <Link href="/dashboard/pr/ui" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                  UI編集
                </Link>
                <div className="px-3 py-2">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            {isAdmin && (
              <>
                <Link href="/profile" className="text-sm px-3 py-2 rounded-lg border border-border bg-card/70 hover:bg-card transition">
                  プロフィール
                </Link>
                <Link href="/admin/users" className="text-sm px-3 py-2 rounded-lg border border-border bg-card/70 hover:bg-card transition">
                  メンバー管理
                </Link>
              </>
            )}
            <Link
              href="/dashboard/pr/ui"
              className="text-sm px-3 py-2 rounded-lg border border-border bg-card/70 hover:bg-card transition"
            >
              UI編集
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* メインコンテンツ（ブログフィード） */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loadingBlogs ? (
          <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">まだ投稿はありません</div>
        ) : (
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="rounded-2xl border shadow-sm overflow-hidden" style={cardStyle}>
                {/* 投稿ヘッダー */}
                <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: currentCard.border }}>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                    {post.author ? post.author[0].toUpperCase() : 'B'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{post.author || 'ブログ'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>

                {/* 画像 */}
                {post.images && post.images.length > 0 && (
                  <div className="relative w-full bg-muted" style={{ minHeight: '300px', maxHeight: '500px' }}>
                    <Image
                      src={post.images[0]}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 672px"
                    />
                  </div>
                )}

                {/* 投稿内容 */}
                <div className="p-4 space-y-2">
                  <h2 className="text-lg font-bold">{post.title}</h2>
                  <p className="text-sm" style={{ color: currentCard.fg }}>{post.body}</p>
                </div>

                {/* 追加の画像 */}
                {post.images && post.images.length > 1 && (
                  <div className="px-4 pb-4 space-y-4">
                    {post.images.slice(1).map((url, idx) => (
                      <div key={`${post.id}-img-${idx + 1}`} className="relative w-full bg-muted rounded-lg overflow-hidden" style={{ minHeight: '300px', maxHeight: '500px' }}>
                        <Image
                          src={url}
                          alt={`${post.title} - ${idx + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 672px"
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
      <nav className="fixed bottom-0 left-0 right-0 border-t z-40" style={headerStyle}>
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-card/30 transition group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform" aria-hidden>{item.icon}</span>
                <span className="text-[10px] font-medium" style={{ color: currentHeader.fg }}>{item.accent}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
