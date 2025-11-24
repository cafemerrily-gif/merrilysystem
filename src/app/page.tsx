'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';

export default function Home() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="fixed top-4 left-0 right-0 z-50 px-4">
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
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-32 h-32 mb-6">
            <Image
              src="/MERRILY_Simbol.png"
              alt="MERRILY Logo"
              width={128}
              height={128}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-2 tracking-tight">
            MERRILY
          </h1>
          <p className="text-lg text-muted-foreground mb-6 uppercase tracking-widest">
            Cafe Management System
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Powered by Supabase</span>
          </div>
        </div>

        {/* 3枚構成：会計部 / 開発部 / 広報部 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link
            href="/dashboard/accounting"
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-accent"
          >
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl" aria-hidden>
                    📊
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">売上ダッシュボード</h2>
                  <p className="text-sm text-muted-foreground">会計部</p>
                </div>
              </div>
              <p className="text-foreground mb-4">売上入力と分析（日次・月次推移、時間帯、ランキング）</p>
              <div className="flex items-center text-accent text-sm font-medium">
                <span>ダッシュボードを見る</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/dev"
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-accent"
          >
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl" aria-hidden>
                    🛠
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">開発部ダッシュボード</h2>
                  <p className="text-sm text-muted-foreground">メニュー管理</p>
                </div>
              </div>
              <p className="text-foreground mb-4">カテゴリー・商品管理への導線と開発KPIのスペース</p>
              <div className="flex items-center text-accent text-sm font-medium">
                <span>ダッシュボードを見る</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/pr"
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-accent"
          >
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl" aria-hidden>
                    📣
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">広報部ダッシュボード</h2>
                  <p className="text-sm text-muted-foreground">準備中</p>
                </div>
              </div>
              <p className="text-foreground mb-4">SNS/キャンペーン指標の配置スペース（後日追加）</p>
              <div className="flex items-center text-accent text-sm font-medium">
                <span>ダッシュボードを見る</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl font-bold text-foreground mb-1">3</div>
            <div className="text-sm text-muted-foreground">アクティブ機能</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl font-bold text-foreground mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">稼働時間</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl font-bold text-accent mb-1">✓</div>
            <div className="text-sm text-muted-foreground">運用準備完了</div>
          </div>
        </div>
      </div>
    </div>
  );
}
