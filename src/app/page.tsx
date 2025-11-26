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

const hexToRgba = (hex: string, alpha = 1) => {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const navItems: NavItem[] = [
  { href: "/dashboard/staff/menu", icon: "👥", title: "店舗スタッフ", subtitle: "勤怠・シフト", desc: "出勤/退勤の記録とシフト確認", accent: "スタッフ", requiredTags: ["店舗スタッフ"] },
  { href: "/dashboard/accounting/menu", icon: "📊", title: "会計部", subtitle: "会計メニュー", desc: "売上ダッシュボードや入力", accent: "会計", requiredTags: ["会計部"] },
  { href: "/dashboard/dev/menu", icon: "🛠️", title: "開発部", subtitle: "メニュー管理", desc: "カテゴリ/フォルダ/商品を管理", accent: "開発", requiredTags: ["開発部"] },
  { href: "/dashboard/pr/menu", icon: "📣", title: "広報部", subtitle: "ホームページ編集", desc: "配色・アイコン・ブログ編集", accent: "広報", requiredTags: ["広報部"] },
  { href: "/dashboard/debug/menu", icon: "🐛", title: "デバッグ", subtitle: "テスト/チェック", desc: "APIテストやヘルスチェック", accent: "デバッグ", requiredTags: ["エンジニアチーム"] },
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
  const root = document.documentElement;
  const bgColor = mode.backgroundGradient ? undefined : hexToRgba(mode.background, mode.backgroundAlpha);
  if (bgColor) root.style.setProperty('--background', bgColor);
  if (mode.backgroundGradient) {
    root.style.setProperty('--background-gradient', mode.backgroundGradient);
    document.body.style.backgroundImage = mode.backgroundGradient;
  } else {
    root.style.removeProperty('--background-gradient');
    document.body.style.backgroundImage = 'none';
  }
  root.style.setProperty('--foreground', mode.foreground);
  root.style.setProperty('--border', mode.border);
  root.style.setProperty('--card', mode.cardBg);
  root.style.setProperty('--card-foreground', mode.cardFg);
  root.style.setProperty('--muted', mode.muted);
  root.style.setProperty('--muted-foreground', mode.cardFg);
  root.style.setProperty('--accent', ui.accent || mode.foreground);
  root.style.setProperty('--primary', ui.primary || mode.foreground);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <header className="flex items-center justify-between py-4 sticky top-0 z-30 bg-background">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white text-foreground flex items-center justify-center text-xl shadow-lg border border-border shrink-0">
              <Image src={appIconUrl || '/MERRILY_Simbol.png'} width={44} height={44} alt="MERRILY" className="rounded-full object-contain" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cafe Management System</p>
              <h1 className="text-2xl font-bold">{appTitle}</h1>
              <p className="text-sm text-muted-foreground">
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
              <LogoutButton />
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between px-4 py-4 rounded-xl border border-border bg-card hover:bg-muted transition-all duration-200 shadow-sm hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white text-foreground flex items-center justify-center shadow-lg text-lg group-hover:scale-105 transition-transform border border-border">
                  <span aria-hidden>{item.icon}</span>
                </div>
              <p className="text-sm text-muted-foreground">{userName ? `${userName} / ${userDepartments.join("・") || "部署未設定"}` : "ログイン情報取得中..."}</p>
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
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl p-6 shadow-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">売上サマリー</h3>
              <span className="text-xs text-muted-foreground">最新データ</span>
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

          <div className="rounded-2xl p-6 shadow-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">最新ブログ</h3>
              <span className="text-xs text-muted-foreground">広報ページの投稿を表示</span>
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

          <div className="rounded-2xl p-6 shadow-lg border border-border bg-card">
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

          <div className="rounded-2xl p-6 shadow-lg border border-border bg-card">
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
      </main>
    </div>
  );
}

