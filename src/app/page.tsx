'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
  {
    href: '/dashboard/staff',
    icon: '🧑‍🍳',
    title: '店舗スタッフ',
    subtitle: '勤怠管理',
    desc: '出勤・退勤の記録と履歴を管理',
    accent: 'スタッフダッシュボード',
    requiredTags: ['店舗スタッフ'],
  },
  {
    href: '/dashboard/accounting',
    icon: '📈',
    title: '会計部',
    subtitle: '売上ダッシュボード',
    desc: '日次・月次推移やランキングを確認',
    accent: 'ダッシュボードを開く',
    requiredTags: ['会計部'],
  },
  {
    href: '/dashboard/dev',
    icon: '🛠️',
    title: '開発部',
    subtitle: 'メニュー管理',
    desc: 'カテゴリー／商品フォルダ／商品を登録・編集',
    accent: '開発部へ進む',
    requiredTags: ['開発部'],
  },
  {
    href: '/dashboard/pr',
    icon: '📣',
    title: '広報部',
    subtitle: 'ホームページ・キャンペーン',
    desc: '公式サイト編集や宣伝用コンテンツを管理',
    accent: '広報部へ',
    requiredTags: ['広報部'],
  },
  {
    href: '/dashboard/debug',
    icon: '🧪',
    title: 'デバッグ',
    subtitle: '技術検証',
    desc: '検証用のダッシュボード（エンジニアチームのみ）',
    accent: 'デバッグツール',
    requiredTags: ['エンジニアチーム'],
  },
];

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [hasManualPreference, setHasManualPreference] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userDepartments, setUserDepartments] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();

  // デバイス設定＋PCのみ手動トグル
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

  const privilegedTags = ['職員', 'マネジメント部', 'エンジニアチーム'];
  const hasPrivilege = userDepartments.some((d) => privilegedTags.includes(d));
  const visibleNavItems = hasPrivilege
    ? navItems
    : navItems.filter((item) => {
        if (!item.requiredTags || item.requiredTags.length === 0) return true;
        return item.requiredTags.some((tag) => userDepartments.includes(tag));
      });

  const toggleTheme = () => {
    const next = !isDark;
    setHasManualPreference(true);
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoutButton />
            {userName && (
              <div className="hidden sm:flex flex-col items-end text-sm bg-card border border-border px-3 py-2 rounded-xl">
                <span className="font-semibold text-foreground">{userName}</span>
                {userDepartments.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end mt-1">
                    {userDepartments.map((dept) => (
                      <span key={dept} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
                        {dept}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/profile"
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-border bg-card hover:border-accent text-sm"
                >
                  タグ編集
                </Link>
                <Link
                  href="/admin/users"
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-border bg-card hover:border-accent text-sm"
                >
                  メンバー管理
                </Link>
              </div>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="hidden md:inline-flex p-3 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-200 group"
            aria-label="テーマを切り替え"
          >
            {isDark ? (
              <svg className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <section className="text-center mb-12 sm:mb-16 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 mb-4 sm:mb-6">
            <Image
              src="/MERRILY_Simbol.png"
              alt="MERRILY Logo"
              width={128}
              height={128}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-2 tracking-tight">MERRILY</h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 uppercase tracking-widest">
            Cafe Management System
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Powered by Supabase</span>
          </div>
        </section>

        <div className="flex flex-col lg:grid lg:grid-cols-[320px,1fr] gap-8">
          <aside className="space-y-4">
            <div className="hidden lg:block text-sm text-muted-foreground mb-2">ダッシュボードメニュー</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-7 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:border-accent"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform text-xl">
                      <span aria-hidden>{item.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-1">{item.title}</h2>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-4">{item.desc}</p>
                  <div className="flex items-center text-accent text-sm font-medium">
                    <span>{item.accent}</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </aside>

          <section className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-3">概要</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                会計・開発・広報・スタッフの各ダッシュボードで業務をまとめています。右のメニューから該当部門へ進んでください。
                スマホではカードが2列→1列に崩れ、タップしやすいスペースを確保しています。
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">操作ログ</h3>
                <span className="text-xs text-muted-foreground">直近（共通表示）</span>
              </div>
              <div className="space-y-3 text-sm max-h-52 overflow-y-auto pr-1">
                {[
                  { user: '管理者', time: '本日 09:10', msg: '売上ダッシュボードを閲覧しました' },
                  { user: '店舗スタッフA', time: '本日 09:05', msg: '勤怠ダッシュボードで出勤を登録しました' },
                  { user: '広報部B', time: '本日 08:55', msg: 'ホームページ編集を更新しました' },
                  { user: '開発部C', time: '本日 08:40', msg: 'メニュー管理で商品を一括追加しました' },
                  { user: '会計部D', time: '昨日 18:20', msg: '売上データをエクスポートしました' },
                  { user: 'エンジニアチーム', time: '昨日 17:50', msg: 'デバッグツールでAPIテストを実施しました' },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-accent"></div>
                    <div>
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                      <p className="text-foreground">
                        <span className="font-semibold">{log.user}</span>：{log.msg}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">実運用では実ログと連携してください（現在はサンプル）。</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">通知（共通）</h3>
                <span className="text-xs text-muted-foreground">未読/既読は未実装</span>
              </div>
              <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-1">
                {[
                  { title: 'ホームページ編集', detail: '広報部Bが公式サイトのトップを更新しました', time: '本日 09:12' },
                  { title: '勤怠登録', detail: '店舗スタッフAが出勤を登録しました', time: '本日 09:05' },
                  { title: 'メニュー更新', detail: '開発部Cが新メニューを追加しました', time: '本日 08:45' },
                  { title: 'デバッグ', detail: 'エンジニアチームがAPIテストを実施しました', time: '昨日 17:50' },
                ].map((n, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-3 bg-muted/30">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{n.time}</span>
                      <span>通知</span>
                    </div>
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <p className="text-muted-foreground">{n.detail}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">通知はダミーです。必要に応じて実データと連携してください。</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">3</div>
                <div className="text-xs sm:text-sm text-muted-foreground">アクティブな部署</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">稼働予定</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">∞</div>
                <div className="text-xs sm:text-sm text-muted-foreground">成長余白</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
