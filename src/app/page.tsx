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
    return (
  <div className="min-h-screen bg-background text-foreground">
    <main className="max-w-6xl mx-auto px-4 pb-12">
      <section className="space-y-6 mt-4">
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
        </div>
      </section>
    </main>
  </div>
);
}
