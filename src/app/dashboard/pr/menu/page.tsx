'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PRMenuPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const stored = window.localStorage.getItem('ui-is-dark');
    
    const currentIsDark = isMobile ? media.matches : (stored === 'true' ? true : stored === 'false' ? false : media.matches);
    setIsDark(currentIsDark);

    const handleChange = (e: MediaQueryListEvent) => {
      const isMob = window.matchMedia('(max-width: 768px)').matches;
      const str = window.localStorage.getItem('ui-is-dark');
      if (isMob || str === null) {
        setIsDark(e.matches);
      }
    };
    
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = isDark ? '#000000' : '#ffffff';
    document.body.style.color = isDark ? '#ffffff' : '#000000';
  }, [isDark]);

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const cardBg = isDark ? '#000000' : '#ffffff';

  const implementedFeatures = [
    {
      title: 'ホームページ編集',
      description: 'メインページのコンテンツを編集',
      href: '/dashboard/pr/website',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: '投稿管理',
      description: '投稿の作成・編集・削除',
      href: '/dashboard/pr/posts',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  const comingSoonFeatures = [
    {
      title: 'SNS連携',
      description: 'ソーシャルメディアとの連携',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke={mutedColor} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
    },
    {
      title: 'アクセス解析',
      description: 'サイト訪問者の分析',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke={mutedColor} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'メディアライブラリ',
      description: '画像・動画の管理',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke={mutedColor} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'ニュースレター',
      description: 'メール配信の管理',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke={mutedColor} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const stats = [
    { label: '公開投稿', value: '12' },
    { label: '下書き', value: '3' },
    { label: '今月の訪問者', value: '1,234' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">広報部メニュー</h1>
            <p className="text-sm mt-1" style={{ color: mutedColor }}>
              Webサイトと投稿の管理
            </p>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border rounded-2xl p-6"
              style={{ backgroundColor: cardBg, borderColor }}
            >
              <p className="text-sm" style={{ color: mutedColor }}>
                {stat.label}
              </p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 実装済み機能 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {implementedFeatures.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="border rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: cardBg, borderColor }}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">{feature.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm" style={{ color: mutedColor }}>
                      {feature.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 shrink-0"
                    fill="none"
                    stroke={mutedColor}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 準備中の機能 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">準備中</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comingSoonFeatures.map((feature) => (
              <div
                key={feature.title}
                className="border rounded-2xl p-6"
                style={{
                  backgroundColor: cardBg,
                  borderColor,
                  borderStyle: 'dashed',
                  opacity: 0.5,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">{feature.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm" style={{ color: mutedColor }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
