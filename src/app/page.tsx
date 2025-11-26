'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
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

const navItems: NavItem[] = [
  { href: '/dashboard/staff', icon: '👥', title: '店舗スタッフ', subtitle: '勤怠管理', desc: '出勤・退勤を記録', accent: 'スタッフ', requiredTags: ['店舗スタッフ'] },
  { href: '/dashboard/accounting', icon: '📊', title: '会計部', subtitle: '売上ダッシュボード', desc: '売上/客数/ランキング/時間帯', accent: '会計', requiredTags: ['会計部'] },
  { href: '/dashboard/dev', icon: '🛠️', title: '開発部', subtitle: 'メニュー管理', desc: 'カテゴリ・フォルダ・商品を管理', accent: '開発', requiredTags: ['開発部'] },
  { href: '/dashboard/pr', icon: '📣', title: '広報部', subtitle: 'ホームページ編集', desc: '宣伝・ブログ・メニュー掲載', accent: '広報', requiredTags: ['広報部'] },
  { href: '/dashboard/debug', icon: '🐛', title: 'デバッグ', subtitle: 'エンジニアチーム', desc: 'テスト・API・フラグ切替', accent: 'デバッグ', requiredTags: ['エンジニアチーム'] },
];

type LogItem = { id: number; user_name: string | null; message: string; created_at: string };
type NotificationItem = { id: number; title: string; detail: string | null; created_at: string };
type BlogPost = { id: string; title: string; body: string; date: string; image?: string; author?: string };
type UiColors = {
  light: { background: string; border: string; foreground: string };
  dark: { background: string; border: string; foreground: string };
};
type UiHeader = { background: string; foreground: string };
type UiMuted = { color: string };
type UiCard = { background: string; foreground: string; border: string };
type UiWelcome = { background: string; foreground: string; border: string };
type UiHeaderText = { title: string; subtitle: string; user: string };
type UiWelcomeText = { title: string; body: string };

const normalizeColorValue = (value: string) => {
  // Tailwindのhsl(var(--background))形式に合わせるため、hexをH S L三要素に変換
  if (!value) return '210 40% 98%';
  if (value.includes('%')) return value; // 既に "210 40% 98%" のような形式
  const hex = value.replace('#', '');
  if (hex.length !== 6) return '210 40% 98%';
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const hexToRgb = (hex: string) => {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
};

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [hasManualPreference, setHasManualPreference] = useState(false);
  const [appIconUrl, setAppIconUrl] = useState('/MERRILY_Simbol.png');
  const [homeIconUrl, setHomeIconUrl] = useState<string | null>(null);
  const [appTitle, setAppTitle] = useState('MERRILY');
  const [userName, setUserName] = useState<string>('');
  const [userDepartments, setUserDepartments] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [themeColors, setThemeColors] = useState<UiColors | null>(null);
  const [headerColors, setHeaderColors] = useState<UiHeader>({ background: '', foreground: '' });
  const [mutedColor, setMutedColor] = useState<UiMuted>({ color: '' });
  const [cardColors, setCardColors] = useState<UiCard>({ background: '', foreground: '', border: '' });
  const [welcomeColors, setWelcomeColors] = useState<UiWelcome>({ background: '', foreground: '', border: '' });
  const [headerTextColors, setHeaderTextColors] = useState<UiHeaderText>({ title: '', subtitle: '', user: '' });
  const [welcomeTextColors, setWelcomeTextColors] = useState<UiWelcomeText>({ title: '', body: '' });
  const [welcomeTextContent, setWelcomeTextContent] = useState<UiWelcomeText>({
    title: 'バー形式で全ダッシュボードをまとめました',
    body: '最新の動きに応じて必要なボードをまとめたバーへ誘導します。最新ログや通知はカード側で閲覧できます。',
  });
  const [uiSettingsRaw, setUiSettingsRaw] = useState<any>({});
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const supabase = createClientComponentClient();

  // テーマ: デバイス設定 → PCのみ手動トグル
  const applyColors = useCallback(
    (nextIsDark: boolean, colors: UiColors | null) => {
      if (!colors) return;
      const root = document.documentElement;
      const mode = nextIsDark ? colors.dark : colors.light;
      root.style.setProperty('--background', normalizeColorValue(mode.background));
      root.style.setProperty('--foreground', normalizeColorValue(mode.foreground));
      root.style.setProperty('--border', normalizeColorValue(mode.border));
      root.style.setProperty('--primary', normalizeColorValue(mode.foreground));
      root.style.setProperty('--primary-foreground', normalizeColorValue(mode.background));
      root.style.setProperty('--accent', normalizeColorValue(mode.foreground));
      root.style.setProperty('--accent-foreground', normalizeColorValue(mode.background));
      root.style.setProperty('--secondary', normalizeColorValue(mode.background));
      root.style.setProperty('--secondary-foreground', normalizeColorValue(mode.foreground));
      // 併せてダーク側も上書き
      root.style.setProperty('--background-dark', normalizeColorValue(colors.dark.background));
      root.style.setProperty('--foreground-dark', normalizeColorValue(colors.dark.foreground));
      root.style.setProperty('--border-dark', normalizeColorValue(colors.dark.border));
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (next: boolean) => {
      setIsDark(next);
      document.documentElement.classList.toggle('dark', next);
      applyColors(next, themeColors);
    };
    applyTheme(media.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      if (hasManualPreference) return;
      applyTheme(event.matches);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [hasManualPreference, applyColors, themeColors]);

  const applyUiSettings = useCallback(
    (ui: any, shouldPersist = true) => {
      if (!ui) return;
      setUiSettingsRaw(ui);
      if (ui.appIconUrl) setAppIconUrl(ui.appIconUrl);
        if (ui.appTitle) setAppTitle(ui.appTitle);
        if (ui.homeIconUrl) setHomeIconUrl(ui.homeIconUrl);
      if (ui.headerBackground || ui.headerForeground) {
        setHeaderColors({
          background: ui.headerBackground || '',
          foreground: ui.headerForeground || '',
        });
      }
      if (ui.mutedColor) {
        setMutedColor({ color: ui.mutedColor });
      }
      if (ui.cardBackground || ui.cardForeground || ui.cardBorder) {
        setCardColors({
          background: ui.cardBackground || '',
          foreground: ui.cardForeground || '',
          border: ui.cardBorder || '',
        });
      }
      if (ui.welcomeBackground || ui.welcomeForeground || ui.welcomeBorder) {
        setWelcomeColors({
          background: ui.welcomeBackground || '',
          foreground: ui.welcomeForeground || '',
          border: ui.welcomeBorder || '',
        });
      }
      setHeaderTextColors({
        title: ui.headerTitleColorLight || ui.headerTitleColorDark || '',
        subtitle: ui.headerSubtitleColorLight || ui.headerSubtitleColorDark || '',
        user: ui.headerUserColorLight || ui.headerUserColorDark || '',
      });
      setWelcomeTextColors({
        title: ui.welcomeTitleColorLight || ui.welcomeTitleColorDark || '',
        body: ui.welcomeBodyColorLight || ui.welcomeBodyColorDark || '',
      });
      setWelcomeTextContent({
        title: ui.welcomeTitleText || 'バー形式で全ダッシュボードをまとめました',
        body: ui.welcomeBodyText || '最新の動きに応じて必要なボードをまとめたバーへ誘導します。最新ログや通知はカード側で閲覧できます。',
      });
      const themes = {
        light: {
          background: ui.lightBackground || '#f8fafc',
          border: ui.lightBorder || '#e2e8f0',
          foreground: ui.lightForeground || '#0f172a',
        },
        dark: {
          background: ui.darkBackground || '#0b1220',
          border: ui.darkBorder || '#1f2937',
          foreground: ui.darkForeground || '#e5e7eb',
        },
      };
      setThemeColors(themes);
      applyColors(isDark, themes);
      if (shouldPersist && typeof window !== 'undefined') {
        window.localStorage.setItem('ui-settings-cache', JSON.stringify(ui));
      }
    },
    [applyColors, isDark]
  );

  // ローカルキャッシュを即適用してフラッシュを抑える
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const cached = window.localStorage.getItem('ui-settings-cache');
    if (!cached) return;
    try {
      const ui = JSON.parse(cached);
      applyUiSettings(ui, false);
    } catch (e) {
      console.error('UI cache parse error', e);
    }
  }, [applyUiSettings]);

  // ユーザー情報取得
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const meta = data.user?.user_metadata;
      if (meta?.full_name) setUserName(meta.full_name);
      if (Array.isArray(meta?.departments)) setUserDepartments(meta.departments);
      if (meta?.is_admin === true || meta?.role === 'admin') setIsAdmin(true);
    })();
  }, [supabase]);

  const loadLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (!data.error) {
        const sorted = data.slice().sort((a: any, b: any) => (a.created_at > b.created_at ? -1 : 1));
        setLogs(sorted);
      }
    } catch (e) {
      console.error('ログ取得エラー', e);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (!data.error) setNotifications(data);
    } catch (e) {
      console.error('通知取得エラー', e);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  const loadBlogs = useCallback(async () => {
    try {
      setLoadingBlogs(true);
      const res = await fetch('/api/pr/website', { cache: 'no-store' });
      const data = await res.json();
      if (data?.blogPosts) {
        const sorted = data.blogPosts
          .slice()
          .map((p: any) => ({ ...p, author: p.author || '' }))
          .sort((a: any, b: any) => (a.date > b.date ? -1 : 1));
        setBlogPosts(sorted);
      } else setBlogPosts([]);
      if (data?.uiSettings) {
        applyUiSettings(data.uiSettings, true);
      }
    } catch (e) {
      console.error('ブログ取得エラー', e);
      setBlogPosts([]);
    } finally {
      setLoadingBlogs(false);
    }
  }, [applyUiSettings]);

  useEffect(() => {
    loadLogs();
    loadNotifications();
    loadBlogs();
  }, [loadLogs, loadNotifications, loadBlogs]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        loadLogs();
        loadNotifications();
        loadBlogs();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [loadLogs, loadNotifications, loadBlogs]);

  const privileged = ['職員', 'マネジメント部', 'エンジニアチーム'];
  const visibleNavItems = navItems.filter((item) => {
    if (!item.requiredTags || item.requiredTags.length === 0) return true;
    if (userDepartments.some((d) => privileged.includes(d))) return true;
    return item.requiredTags.some((t) => userDepartments.includes(t));
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    setHasManualPreference(true);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
    }
    applyColors(next, themeColors);
  };

  useEffect(() => {
    if (themeColors) {
      applyColors(isDark, themeColors);
    }
  }, [themeColors, isDark, applyColors]);

  // アップロードしたアイコンをそのままホーム画面アイコンに反映
  useEffect(() => {
    if (!appIconUrl || typeof document === 'undefined') return;
    const ensureLink = (rel: string) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = targetIcon;
    };
    const targetIcon = homeIconUrl || appIconUrl;
    if (!targetIcon) return;
    ensureLink('icon');
    ensureLink('apple-touch-icon');
  }, [appIconUrl, homeIconUrl]);

  const currentHeader = {
    background: isDark
      ? uiSettingsRaw.headerBgDark || uiSettingsRaw.headerBackground || headerColors.background
      : uiSettingsRaw.headerBgLight || uiSettingsRaw.headerBackground || headerColors.background,
    backgroundAlpha: isDark ? uiSettingsRaw.headerBgAlphaDark ?? 1 : uiSettingsRaw.headerBgAlphaLight ?? 1,
    foreground: isDark
      ? uiSettingsRaw.headerFgDark || uiSettingsRaw.headerForeground || headerColors.foreground
      : uiSettingsRaw.headerFgLight || uiSettingsRaw.headerForeground || headerColors.foreground,
    title: isDark ? uiSettingsRaw.headerTitleColorDark || headerTextColors.title : uiSettingsRaw.headerTitleColorLight || headerTextColors.title,
    subtitle: isDark ? uiSettingsRaw.headerSubtitleColorDark || headerTextColors.subtitle : uiSettingsRaw.headerSubtitleColorLight || headerTextColors.subtitle,
    user: isDark ? uiSettingsRaw.headerUserColorDark || headerTextColors.user : uiSettingsRaw.headerUserColorLight || headerTextColors.user,
  };

  const currentMuted = {
    color: isDark ? uiSettingsRaw.mutedColorDark || uiSettingsRaw.mutedColor || mutedColor.color : uiSettingsRaw.mutedColorLight || uiSettingsRaw.mutedColor || mutedColor.color,
  };

  const currentWelcome = {
    background: isDark ? uiSettingsRaw.welcomeBgDark || welcomeColors.background : uiSettingsRaw.welcomeBgLight || welcomeColors.background,
    backgroundAlpha: isDark ? uiSettingsRaw.welcomeBgAlphaDark ?? 1 : uiSettingsRaw.welcomeBgAlphaLight ?? 1,
    foreground: isDark ? uiSettingsRaw.welcomeFgDark || welcomeColors.foreground : uiSettingsRaw.welcomeFgLight || welcomeColors.foreground,
    border: isDark ? uiSettingsRaw.welcomeBorderDark || welcomeColors.border : uiSettingsRaw.welcomeBorderLight || welcomeColors.border,
    title: isDark ? uiSettingsRaw.welcomeTitleColorDark || welcomeTextColors.title : uiSettingsRaw.welcomeTitleColorLight || welcomeTextColors.title,
    body: isDark ? uiSettingsRaw.welcomeBodyColorDark || welcomeTextColors.body : uiSettingsRaw.welcomeBodyColorLight || welcomeTextColors.body,
    textTitle: uiSettingsRaw.welcomeTitleText || welcomeTextContent.title,
    textBody: uiSettingsRaw.welcomeBodyText || welcomeTextContent.body,
  };

  const currentCard = {
    background: isDark ? uiSettingsRaw.cardBgDark || cardColors.background : uiSettingsRaw.cardBgLight || cardColors.background,
    backgroundAlpha: isDark ? uiSettingsRaw.cardBgAlphaDark ?? 1 : uiSettingsRaw.cardBgAlphaLight ?? 1,
    foreground: isDark ? uiSettingsRaw.cardFgDark || cardColors.foreground : uiSettingsRaw.cardFgLight || cardColors.foreground,
    border: isDark ? uiSettingsRaw.cardBorderDark || cardColors.border : uiSettingsRaw.cardBorderLight || cardColors.border,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="w-full max-w-none mx-0 px-0 pb-16">
        <header
          className="flex items-center justify-between py-4 px-0 sticky top-0 z-30"
          style={{
            backgroundColor: currentHeader.background ? `rgba(${hexToRgb(currentHeader.background)}, ${currentHeader.backgroundAlpha ?? 1})` : undefined,
            color: currentHeader.foreground || undefined,
            margin: 0,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white text-foreground flex items-center justify-center text-xl shadow-lg border border-border shrink-0">
              <Image src={appIconUrl || '/MERRILY_Simbol.png'} width={44} height={44} alt="MERRILY" className="rounded-full object-contain" />
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: currentHeader.subtitle || currentMuted.color || undefined }}
              >
                Cafe Management System
              </p>
              <h1 className="text-2xl font-bold" style={{ color: currentHeader.title || undefined }}>{appTitle}</h1>
              <p className="text-sm" style={{ color: currentHeader.user || undefined }}>
                {userName ? `${userName} / ${userDepartments.join('・') || '部署未設定'}` : 'ログイン情報取得中...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card/70 hover:bg-card transition"
              onClick={toggleTheme}
            >
              <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
              <span className="text-sm">{isDark ? 'ダーク' : 'ライト'}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              {isAdmin && (
                <>
                  <Link
                    href="/profile"
                    className="text-sm px-3 py-2 rounded-lg border border-border bg-card/70 hover:bg-card transition"
                  >
                    プロフィール
                  </Link>
                  <Link
                    href="/admin/users"
                    className="text-sm px-3 py-2 rounded-lg border border-border bg-card/70 hover:bg-card transition"
                  >
                    メンバー管理
                  </Link>
                </>
              )}
              <LogoutButton />
            </div>
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="px-3 py-2 rounded-lg border border-border bg-card/70 hover:bg-card transition text-sm"
                aria-label="メニュー"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card shadow-lg p-2 space-y-1 z-10">
                  <button
                    onClick={toggleTheme}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm"
                  >
                    テーマ切替
                  </button>
                  {isAdmin && (
                    <>
                      <Link
                        href="/profile"
                        className="block px-3 py-2 rounded-lg hover:bg-muted text-sm"
                        onClick={() => setShowMenu(false)}
                      >
                        プロフィール
                      </Link>
                      <Link
                        href="/admin/users"
                        className="block px-3 py-2 rounded-lg hover:bg-muted text-sm"
                        onClick={() => setShowMenu(false)}
                      >
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-6 p-[1px] rounded-2xl bg-gradient-to-r from-primary/70 via-primary/60 to-secondary/60 shadow-2xl mt-4">
          <div
            className="rounded-2xl px-6 py-5 grid gap-3 sm:grid-cols-3 items-center"
            style={{
              backgroundColor: currentWelcome.background ? `rgba(${hexToRgb(currentWelcome.background)}, ${currentWelcome.backgroundAlpha ?? 1})` : undefined,
              color: currentWelcome.foreground || undefined,
              border: currentWelcome.border ? `1px solid ${currentWelcome.border}` : undefined,
            }}
          >
            <div className="col-span-2 space-y-1">
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: currentMuted.color || undefined }}>Welcome</p>
              <h2 className="text-2xl font-bold" style={{ color: currentWelcome.title || undefined }}>{currentWelcome.textTitle}</h2>
              <p className="text-sm" style={{ color: currentWelcome.body || currentMuted.color || undefined }}>{currentWelcome.textBody}</p>
            </div>
            <div className="justify-self-end text-sm text-muted-foreground flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Powered by Supabase</span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:grid lg:grid-cols-[320px,1fr] gap-8">
          <aside className="space-y-4">
            <div className="hidden lg:block text-sm text-muted-foreground mb-2">ダッシュボード</div>
            <div className="space-y-3">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between px-4 py-4 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-lg"
                  style={{
                    backgroundColor: currentCard.background || undefined,
                    color: currentCard.foreground || undefined,
                    borderColor: currentCard.border || undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white text-foreground flex items-center justify-center shadow-lg text-lg group-hover:scale-105 transition-transform border border-border">
                      <span aria-hidden>{item.icon}</span>
                    </div>
                    <div className="text-left">
                      <h2 className="text-base font-semibold text-foreground leading-tight">{item.title}</h2>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary text-xs font-semibold">
                    <span>{item.accent}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </aside>

          <section className="space-y-6">
            <div
              className="rounded-2xl p-6 shadow-lg border"
              style={{
                backgroundColor: currentCard.background ? `rgba(${hexToRgb(currentCard.background)}, ${currentCard.backgroundAlpha ?? 1})` : undefined,
                color: currentCard.foreground || undefined,
                borderColor: currentCard.border || undefined,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">最新ブログ</h3>
                <span className="text-xs text-muted-foreground">ホームページの投稿を表示</span>
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
                      {post.image ? <img src={post.image} alt={post.title} className="w-full rounded-lg border border-border object-contain max-h-64 bg-background mb-2" /> : null}
                      <p className="text-muted-foreground line-clamp-2">{post.body}</p>
                    </div>
                  ))
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">広報部ダッシュボードで編集したブログを表示しています。</p>
            </div>

            <div
              className="rounded-2xl p-6 shadow-lg border"
              style={{
                backgroundColor: currentCard.background ? `rgba(${hexToRgb(currentCard.background)}, ${currentCard.backgroundAlpha ?? 1})` : undefined,
                color: currentCard.foreground || undefined,
                borderColor: currentCard.border || undefined,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">操作ログ</h3>
                <span className="text-xs text-muted-foreground">最新50件</span>
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

            <div
              className="rounded-2xl p-6 shadow-lg border"
              style={{
                backgroundColor: currentCard.background ? `rgba(${hexToRgb(currentCard.background)}, ${currentCard.backgroundAlpha ?? 1})` : undefined,
                color: currentCard.foreground || undefined,
                borderColor: currentCard.border || undefined,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">通知</h3>
                <span className="text-xs text-muted-foreground">最新50件（全員/個別を含む）</span>
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

        </div>
        </div>
      </main>
    </div>
  );
}


