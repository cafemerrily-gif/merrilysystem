'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PrMenu() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const stored = window.localStorage.getItem('ui-is-dark');
    
    const currentIsDark = isMobile ? media.matches : (stored === 'true' ? true : stored === 'false' ? false : media.matches);
    setIsDark(currentIsDark);
    
    document.documentElement.classList.toggle('dark', currentIsDark);
    document.body.style.backgroundColor = currentIsDark ? '#000000' : '#ffffff';
    document.body.style.color = currentIsDark ? '#ffffff' : '#000000';
  }, []);

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="border-b sticky top-0 z-10 backdrop-blur" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bgColor, border: `2px solid ${borderColor}` }}>
              <span className="text-2xl">📢</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: textColor }}>広報部メニュー</h1>
              <p className="text-sm" style={{ color: mutedColor }}>ホームページ・ブログ編集</p>
            </div>
          </div>
          <Link 
            href="/" 
            className="px-4 py-3 rounded-xl border transition-all duration-200 text-sm"
            style={{ borderColor, backgroundColor: bgColor, color: textColor }}
          >
            ホームへ戻る
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl border p-6 space-y-3" style={{ backgroundColor: bgColor, borderColor }}>
            <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>統計</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold" style={{ color: textColor }}>12</div>
                <div className="text-xs" style={{ color: mutedColor }}>公開記事</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: textColor }}>3</div>
                <div className="text-xs" style={{ color: mutedColor }}>下書き</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-6 space-y-3" style={{ backgroundColor: bgColor, borderColor }}>
            <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>訪問者</div>
            <div>
              <div className="text-2xl font-bold" style={{ color: textColor }}>1,234</div>
              <div className="text-xs" style={{ color: mutedColor }}>今月の訪問者数</div>
            </div>
          </div>

          <div className="rounded-2xl border p-6 space-y-3" style={{ backgroundColor: bgColor, borderColor }}>
            <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>ステータス</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#34c759' }}></div>
              <div className="text-sm" style={{ color: textColor }}>すべて正常</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: textColor }}>実装済み機能</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href="/dashboard/pr/website" 
              className="rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg group"
              style={{ backgroundColor: bgColor, borderColor }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa', border: `1px solid ${borderColor}` }}>
                  <span className="text-2xl">🏠</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 group-hover:opacity-70 transition" style={{ color: textColor }}>ホームページ編集</h3>
                  <p className="text-sm" style={{ color: mutedColor }}>サイトのコンテンツとレイアウトを管理</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/dashboard/pr/blogs" 
              className="rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg group"
              style={{ backgroundColor: bgColor, borderColor }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa', border: `1px solid ${borderColor}` }}>
                  <span className="text-2xl">✍️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 group-hover:opacity-70 transition" style={{ color: textColor }}>ブログ編集</h3>
                  <p className="text-sm" style={{ color: mutedColor }}>記事の作成・編集・公開管理</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-4 mt-10">
          <h2 className="text-xl font-semibold" style={{ color: textColor }}>準備中の機能</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-dashed p-6" style={{ borderColor, opacity: 0.5 }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa', border: `1px solid ${borderColor}` }}>
                  <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: mutedColor }}>SNS連携</h3>
                  <p className="text-sm" style={{ color: mutedColor }}>SNSへの自動投稿とスケジュール管理</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed p-6" style={{ borderColor, opacity: 0.5 }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa', border: `1px solid ${borderColor}` }}>
                  <span className="text-2xl">📊</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: mutedColor }}>アクセス解析</h3>
                  <p className="text-sm" style={{ color: mutedColor }}>サイト訪問者の分析とレポート</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed p-6" style={{ borderColor, opacity: 0.5 }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa', border: `1px solid ${borderColor}` }}>
                  <span className="text-2xl">🖼️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: mutedColor }}>メディアライブラリ</h3>
                  <p className="text-sm" style={{ color: mutedColor }}>画像・動画の管理</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed p-6" style={{ borderColor, opacity: 0.5 }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa', border: `1px solid ${borderColor}` }}>
                  <span className="text-2xl">📧</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: mutedColor }}>ニュースレター</h3>
                  <p className="text-sm" style={{ color: mutedColor }}>メールマガジンの作成と配信</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
