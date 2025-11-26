'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
type BlogPost = { id: string; title: string; body: string; date: string; images?: string[]; image?: string; author?: string };
type SalesSummary = { todayTotal: number; currentMonthSales: number; totalAmount: number };
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
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem('ui-is-dark');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [hasManualPreference, setHasManualPreference] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [appIconUrl, setAppIconUrl] = useState('/MERRILY_Simbol.png');
  const [homeIconUrl, setHomeIconUrl] = useState<string | null>(null);
  const [appTitle, setAppTitle] = useState('MERRILY');
  const [userName, setUserName] = useState<string>('');
  const [userDepartments, setUserDepartments] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [salesSummary, setSalesSummary] = useState<SalesSummary>({ todayTotal: 0, currentMonthSales: 0, totalAmount: 0 });
  const [loadingSales, setLoadingSales] = useState(true);
  const [quickStartKeys, setQuickStartKeys] = useState<string[]>([]);
  const [quickStartEditing, setQuickStartEditing] = useState(false);
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

  const privileged = useMemo(() => ['職員', 'マネジメント部', 'エンジニアチーム'], []);
  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.requiredTags || item.requiredTags.length === 0) return true;
      if (userDepartments.some((d) => privileged.includes(d))) return true;
      return item.requiredTags.some((t) => userDepartments.includes(t));
    });
  }, [userDepartments, privileged]);

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

  // 画面幅でモバイル判定（ボタンはhidden md:flexなのでPCのみ表示）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (next: boolean) => {
      setIsDark(next);
      document.documentElement.classList.toggle('dark', next);
      applyColors(next, themeColors);
    };

    if (isMobile) {
      // モバイル: デバイス設定に従う（ボタン非表示）
      applyTheme(media.matches);
      const handleChange = (event: MediaQueryListEvent) => applyTheme(event.matches);
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }

    // PC: デバイス設定は無視し、現在のisDarkを適用（ボタンで切替）
    applyTheme(isDark);
  }, [isMobile, isDark, applyColors, themeColors]);

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
          .map((p: any) => {
            const images = Array.isArray(p.images) ? p.images : p.image ? [p.image] : [];
            return { ...p, images, author: p.author || '', image: images[0] || '' };
          })
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

  const loadSales = useCallback(async () => {
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
    } catch (e) {
      console.error('売上サマリー取得エラー', e);
    } finally {
      setLoadingSales(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
    loadNotifications();
    loadBlogs();
    loadSales();
  }, [loadLogs, loadNotifications, loadBlogs, loadSales]);

  // QuickStart: 全員に表示。編集は管理者のみ。localStorage に保存し、見える項目だけを採用
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('quickstart-config') : null;
    const parsed: string[] = stored ? JSON.parse(stored) : [];
    // visibleなnavだけに絞り、無ければデフォルト6件
    const visibleHrefs = visibleNavItems.map((n) => n.href);
    const filtered = parsed.filter((href) => visibleHrefs.includes(href));
    const fallback = visibleNavItems.slice(0, 6).map((n) => n.href);
    setQuickStartKeys(filtered.length ? filtered : fallback);
  }, [visibleNavItems]);

  const toggleQuickStartKey = (href: string) => {
    setQuickStartKeys((prev) => (prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]));
  };

  const saveQuickStart = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('quickstart-config', JSON.stringify(quickStartKeys));
    }
    setQuickStartEditing(false);
  };

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
            <div
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
                  blogPosts.map((post) => {
                    const imgs = post.images && post.images.length > 0 ? post.images : post.image ? [post.image] : [];
                    return (
                      <div key={post.id} className="p-3 rounded-xl border border-border bg-muted/30">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
                          <span>{post.author || 'ブログ'}</span>
                        </div>
                        <p className="font-semibold text-foreground">{post.title}</p>
                        {imgs.length > 0 ? (
                          <div className="space-y-2 mb-2">
                            {imgs.map((url: string, idx: number) => (
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
                    );
                  })
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
            </div></section>

        </div>
        </div>
      </main>
    </div>
  );
}



