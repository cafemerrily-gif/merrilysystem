'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';

const navItems = [
  {
    href: '/dashboard/accounting',
    icon: '📊',
    title: '会計部',
    subtitle: '売上管理・分析',
    desc: '売上入力と日次・月次推移、時間帯、ランキングを確認',
    accent: 'ダッシュボードを見る',
  },
  {
    href: '/dashboard/dev',
    icon: '🛠',
    title: '開発部',
    subtitle: 'メニュー管理',
    desc: 'カテゴリー・商品管理への導線と開発KPIのスペース',
    accent: 'ダッシュボードを見る',
  },
  {
    href: '/dashboard/pr',
    icon: '📣',
    title: '広報部',
    subtitle: '準備中',
    desc: 'SNS/キャンペーン指標の配置スペース（後日追加）',
    accent: 'ダッシュボードを見る',
  },
];

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [hasManualPreference, setHasManualPreference] = useState(false);

  // Follow device preference by default (especially on mobile), but allow manual override.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (next: boolean) => {
      setIsDark(next);
      document.documentElement.classList.toggle('dark', next);
    };

    // initial apply
    applyTheme(media.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      if (hasManualPreference) return;
      applyTheme(event.matches);
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [hasManualPreference]);

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
          <LogoutButton />
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-200 group"
            aria-label="テーマ切り替え"
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

        {/* 左メニュー / 右情報 */}
        <div className="flex flex-col lg:grid lg:grid-cols-[320px,1fr] gap-8">
          {/* 左: ダッシュボードメニュー（モバイルはカードグリッド） */}
          <aside className="space-y-4">
            <div className="hidden lg:block text-sm text-muted-foreground mb-2">ダッシュボードメニュー</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {navItems.map((item) => (
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

          {/* 右: 補足情報 / KPI */}
          <section className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-3">概要</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                会計部・開発部・広報部の3つのダッシュボードで役割を分けました。左のメニューから各部門のダッシュボードへ移動できます。
                スマホではカードが2列→1列に折り返され、タップしやすい配置にしています。
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">操作ログ</h3>
                <span className="text-xs text-muted-foreground">直近の動き</span>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { user: '開発担当A', time: '今日 09:10', msg: '会計部で売上を登録しました' },
                  { user: '開発担当A', time: '今日 08:55', msg: '開発部で「春メニュー」フォルダに商品を追加しました' },
                  { user: '広報担当B', time: '昨日 18:20', msg: '会計部ダッシュボードで集計を確認しました' },
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
              <p className="mt-3 text-xs text-muted-foreground">
                ※現状はサンプル表示です。ログイン実装後は認証情報からユーザー名を紐づけて記録してください。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">3</div>
                <div className="text-xs sm:text-sm text-muted-foreground">アクティブ機能</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">稼働時間</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">✓</div>
                <div className="text-xs sm:text-sm text-muted-foreground">運用準備完了</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
