'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
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
type BlogPost = { id: string; title: string; body: string; date: string; image?: string };

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [hasManualPreference, setHasManualPreference] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userDepartments, setUserDepartments] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const supabase = createClientComponentClient();

  // テーマ: デバイス設定 → PCのみ手動トグル
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (next: boolean) => {
      setIsDark(next);
      document.documentElement.classList.toggle('dark', next);
    };
    applyTheme(media.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      if (hasManualPreference) return;
      applyTheme(event.matches);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [hasManualPreference]);

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
      if (!data.error) setLogs(data);
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
      if (data?.blogPosts) setBlogPosts(data.blogPosts);
      else setBlogPosts([]);
    } catch (e) {
      console.error('ブログ取得エラー', e);
      setBlogPosts([]);
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

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
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white text-foreground flex items-center justify-center text-xl shadow-lg border border-border">
              <Image src="/MERRILY_Simbol.png" width={44} height={44} alt="MERRILY" className="rounded-full object-contain" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cafe Management System</p>
              <h1 className="text-2xl font-bold">MERRILY</h1>
              <p className="text-sm text-muted-foreground">
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
        </header>

        <section className="mb-6 p-[1px] rounded-2xl bg-gradient-to-r from-primary/70 via-primary/60 to-secondary/60 shadow-2xl">
          <div className="rounded-2xl bg-background px-6 py-5 grid gap-3 sm:grid-cols-3 items-center">
            <div className="col-span-2 space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Welcome</p>
              <h2 className="text-2xl font-bold">バー形式で各ダッシュボードをまとめました</h2>
              <p className="text-sm text-muted-foreground">
                部署に合わせて必要なボードだけが左のバーに並びます。操作ログと通知は実データを下部に表示します。
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

        <div className="flex flex-col lg:grid lg:grid-cols-[320px,1fr] gap-8">
          <aside className="space-y-4">
            <div className="hidden lg:block text-sm text-muted-foreground mb-2">ダッシュボード</div>
            <div className="space-y-3">
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
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
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
                        <span>ブログ</span>
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

            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
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

            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
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
      </main>
    </div>
  );
}
