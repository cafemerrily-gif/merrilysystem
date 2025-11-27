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

const hexToHslTriplet = (hex: string) => {
  const h = hex.replace('#', '');
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
  const safeTriplet = triplet || '0 0% 100%';
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
  const [appIconUrl, setAppIconUrl] = useState('/MERRILY_Simbol.png');
  const [appTitle, setAppTitle] = useState('MERRILY');
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [salesSummary, setSalesSummary] = useState<SalesSummary>({ todayTotal: 0, currentMonthSales: 0, totalAmount: 0 });
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [uiSettings, setUiSettings] = useState<any>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem('ui-is-dark');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const privileged = useMemo(() => ['職員', 'マネジメント部', 'エンジニアチーム'], []);

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.requiredTags || item.requiredTags.length === 0) return true;
      if (userDepartments.some((d) => privileged.includes(d))) return true;
      return item.requiredTags.some((t) => userDepartments.includes(t));
    });
  }, [userDepartments, privileged]);

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
    const loadLogs = async () => {
      try {
        setLoadingLogs(true);
        const res = await fetch('/api/logs');
        const data = await res.json();
        if (!data.error) {
          const sorted = data.slice().sort((a: any, b: any) => (a.created_at > b.created_at ? -1 : 1));
          setLogs(sorted);
        }
      } finally {
        setLoadingLogs(false);
      }
    };

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
          if (data.uiSettings.appIconUrl) setAppIconUrl(data.uiSettings.appIconUrl);
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

    const loadSales = async () => {
      try {
        setLoadingSales(true);
        const res = await fetch('/api/analytics/sales', { cache: 'no-store' });
        const data = await res.json();
        if (!data.error) {
          setSalesSummary({
            todayTotal: Number(data.todayTotal || 0),
            currentMonthSales: Number(data.currentMonthSales || 0),
            totalAmount: Number(data.totalAmount || 0),
          });
        }
      } finally {
        setLoadingSales(false);
      }
    };

    loadLogs();
    loadNotifications();
    loadBlogs();
    loadSales();
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

  const currentWelcome = (() => {
    const ui = uiSettings || {};
    const bg = isDark ? ui.welcomeBgDark || ui.welcomeBackground || '#0f172a' : ui.welcomeBgLight || ui.welcomeBackground || '#ffffff';
    const bgAlpha = isDark ? ui.welcomeBgAlphaDark ?? 1 : ui.welcomeBgAlphaLight ?? 1;
    const bgGradient = isDark ? ui.welcomeBgGradientDark || '' : ui.welcomeBgGradientLight || '';
    const fg = isDark ? ui.welcomeFgDark || ui.welcomeForeground || '#e5e7eb' : ui.welcomeFgLight || ui.welcomeForeground || '#0f172a';
    const border = isDark ? ui.welcomeBorderDark || '#1f2937' : ui.welcomeBorderLight || '#e2e8f0';
    const title = isDark ? ui.welcomeTitleColorDark || fg : ui.welcomeTitleColorLight || fg;
    const body = isDark ? ui.welcomeBodyColorDark || fg : ui.welcomeBodyColorLight || fg;
    const textTitle = ui.welcomeTitleText || 'バー形式で全ダッシュボードをまとめました';
    const textBody = ui.welcomeBodyText || '最新の動きに応じて必要なボードをまとめたバーへ誘導します。最新ログや通知はカード側で閲覧できます。';
    return { bg, bgAlpha, bgGradient, fg, border, title, body, textTitle, textBody };
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

  const welcomeStyle = {
    backgroundImage: currentWelcome.bgGradient || undefined,
    backgroundColor: toHsla(hexToHslTriplet(currentWelcome.bg), currentWelcome.bgAlpha ?? 1),
    color: currentWelcome.fg,
    borderColor: currentWelcome.border,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="w-full flex items-center justify-between py-4 sticky top-0 z-30" style={headerStyle}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white text-foreground flex items-center justify-center text-xl shadow-lg border border-border shrink-0">
            <Image src={appIconUrl || '/MERRILY_Simbol.png'} width={44} height={44} alt="MERRILY" className="rounded-full object-contain" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: currentHeader.subtitle }}>
              Cafe Management System
            </p>
            <h1 className="text-2xl font-bold" style={{ color: currentHeader.title }}>
              {appTitle}
            </h1>
            <p className="text-sm" style={{ color: currentHeader.user }}>
              {userName ? `${userName} / ${userDepartments.join('・') || '部署未設定'}` : 'ログイン情報取得中...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card/70 hover:bg-card transition"
            onClick={() => setIsDark((prev) => !prev)}
          >
            <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
            <span className="text-sm">{isDark ? 'ダーク' : 'ライト'}</span>
          </button>
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
                <button
                  onClick={() => {
                    setIsDark((prev) => !prev);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  {isDark ? 'ライトに切替' : 'ダークに切替'}
                </button>
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
                <div className="px-3 py-2">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 pb-12">

        <section className="mt-6 mb-6 p-[1px] rounded-2xl shadow-lg border" style={welcomeStyle}>
          <div className="rounded-2xl px-6 py-5 grid gap-3 sm:grid-cols-3 items-center">
            <div className="col-span-2 space-y-1">
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: currentHeader.subtitle }}>
                Welcome
              </p>
              <h2 className="text-2xl font-bold" style={{ color: currentWelcome.title }}>
                {currentWelcome.textTitle}
              </h2>
              <p className="text-sm" style={{ color: currentWelcome.body }}>
                {currentWelcome.textBody}
              </p>
            </div>
            <div className="justify-self-end text-sm text-muted-foreground flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Powered by Supabase</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between px-4 py-4 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-lg"
              style={cardStyle}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white text-foreground flex items-center justify-center shadow-lg text-lg group-hover:scale-105 transition-transform border border-border">
                  <span aria-hidden>{item.icon}</span>
                </div>
                <div className="text-left" style={{ color: currentCard.fg }}>
                  <h2 className="text-base font-semibold leading-tight">{item.title}</h2>
                  <p className="text-xs" style={{ color: currentCard.fg }}>
                    {item.subtitle}
                  </p>
                  <p className="text-[11px] line-clamp-1" style={{ color: currentCard.fg }}>
                    {item.desc}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: currentCard.fg }}>
                <span>{item.accent}</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl p-6 shadow-lg border" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold" style={{ color: currentCard.fg }}>
                売上サマリー
              </h3>
              <span className="text-xs" style={{ color: currentCard.fg }}>
                最新データ
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">今日</p>
                <p className="text-xl font-bold">{loadingSales ? '…' : `¥${salesSummary.todayTotal.toLocaleString()}`}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">今月</p>
                <p className="text-xl font-bold">{loadingSales ? '…' : `¥${salesSummary.currentMonthSales.toLocaleString()}`}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">累計</p>
                <p className="text-xl font-bold">{loadingSales ? '…' : `¥${salesSummary.totalAmount.toLocaleString()}`}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold" style={{ color: currentCard.fg }}>
                最新ブログ
              </h3>
              <span className="text-xs" style={{ color: currentCard.fg }}>
                ホームページの投稿を表示
              </span>
            </div>
            <div className="space-y-3 text-sm max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {loadingBlogs ? (
                <p className="text-muted-foreground">読み込み中...</p>
              ) : blogPosts.length === 0 ? (
                <p className="text-muted-foreground">ブログ投稿はまだありません。</p>
              ) : (
                blogPosts.map((post) => (
                  <div key={post.id} className="p-3 rounded-xl border border-border bg-muted/30">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
                      <span>{post.author || 'ブログ'}</span>
                    </div>
                    <p className="font-semibold text-foreground">{post.title}</p>
                    {post.images && post.images.length > 0 ? (
                      <div className="space-y-2 mb-2">
                        {post.images.map((url, idx) => (
                          <img
                            key={`${post.id}-img-${idx}`}
                            src={url}
                            alt={post.title}
                            className="w-full rounded-lg border border-border object-contain max-h-64 bg-background"
                          />
                        ))}
                      </div>
                    ) : null}
                    <p className="text-muted-foreground line-clamp-2">{post.body}</p>
                  </div>
                ))
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">広報部ダッシュボードで編集したブログを表示しています。</p>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold" style={{ color: currentCard.fg }}>
                操作ログ
              </h3>
              <span className="text-xs" style={{ color: currentCard.fg }}>
                最新50件
              </span>
            </div>
            <div className="space-y-3 text-sm max-h-52 overflow-y-auto pr-1 scrollbar-thin">
              {loadingLogs ? (
                <p className="text-muted-foreground">読み込み中...</p>
              ) : logs.length === 0 ? (
                <p className="text-muted-foreground">ログはまだありません。</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-accent"></div>
                    <div>
                      <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString('ja-JP')}</p>
                      <p className="text-foreground">
                        <span className="font-semibold">{log.user_name || '不明なユーザー'}</span>：{log.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">実際のログを表示しています（/api/logs）。</p>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold" style={{ color: currentCard.fg }}>
                通知
              </h3>
              <span className="text-xs" style={{ color: currentCard.fg }}>
                最新50件（全員/個別を含む）
              </span>
            </div>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {loadingNotifications ? (
                <p className="text-muted-foreground">読み込み中...</p>
              ) : notifications.length === 0 ? (
                <p className="text-muted-foreground">通知はまだありません。</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="border border-border rounded-lg p-3 bg-muted/30">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{new Date(n.created_at).toLocaleString('ja-JP')}</span>
                      <span>通知</span>
                    </div>
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <p className="text-muted-foreground">{n.detail || ''}</p>
                  </div>
                ))
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">通知エンドポイントから取得しています（/api/notifications）。</p>
          </div>
        </section>
      </main>
    </div>
  );
}
