'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';

const navItems = [
  {
    href: '/dashboard/accounting',
    icon: '📈',
    title: '会計部',
    subtitle: '売上ダッシュボード',
    desc: '売上推移・時間帯別・ランキングを確認',
    accent: 'ダッシュボードを開く',
  },
  {
    href: '/dashboard/dev',
    icon: '🛠️',
    title: '開発部',
    subtitle: 'メニュー管理',
    desc: 'カテゴリー／商品フォルダ／商品を登録・編集',
    accent: '開発部へ進む',
  },
  {
    href: '/dashboard/pr',
    icon: '📣',
    title: '広報部',
    subtitle: 'キャンペーン枠',
    desc: 'SNSやキャンペーン指標を置くスペース（準備中）',
    accent: '広報部へ',
  },
];

export default function Home() {
  const [isDark, setIsDark] = useState(true);

  // デバイス設定に従ってライト/ダークを適用（手動トグルなし）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (next: boolean) => {
      setIsDark(next);
      document.documentElement.classList.toggle('dark', next);
    };
    applyTheme(media.matches);
    const handleChange = (event: MediaQueryListEvent) => applyTheme(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <LogoutButton />
          {/* テーマはデバイス設定に従うため切り替えボタンなし */}
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

          <section className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-3">概要</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                会計・開発・広報の3つのダッシュボードで業務をまとめています。右のメニューから各部のダッシュボードへ進めます。
                スマホではカードが2列→1列に崩れ、タップしやすいスペースを確保しています。
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">操作ログ（ダミー表示）</h3>
                <span className="text-xs text-muted-foreground">直近</span>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { user: '会計部Aさん', time: '本日 09:10', msg: '売上を登録しました' },
                  { user: '開発部Aさん', time: '本日 08:55', msg: '「夏フェス」商品フォルダに商品を一括追加しました' },
                  { user: '広報部Bさん', time: '昨日 18:20', msg: '売上ダッシュボードで推移を確認しました' },
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
                ※ログイン機能実装後は実ユーザー情報で置き換えます。
              </p>
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
