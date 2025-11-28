'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

export default function InstagramNavBar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const appIconUrl = isDark ? '/white.png' : '/black.png';

  // Instagram風ナビバーを表示するページを限定
  // トップページ（SNS）、投稿作成、アカウントページのみで表示
  const showOnPages = ['/', '/post/create', '/account'];
  const shouldShow = showOnPages.includes(pathname);
  
  if (!shouldShow) {
    return null;
  }

  // ハイドレーションミスマッチを防ぐ
  if (!mounted) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t z-40 md:top-0 md:bottom-auto md:border-b md:border-t-0" style={{ backgroundColor: bgColor, borderColor }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around md:justify-between h-14 md:h-16">
          {/* ロゴ（PC/タブレットのみ表示） */}
          <Link href="/" className="hidden md:flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image src={appIconUrl} width={32} height={32} alt="MERRILY" className="object-contain" />
            </div>
            <span className="text-xl font-bold" style={{ color: textColor }}>MERRILY</span>
          </Link>

          {/* ナビゲーションアイテム */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* ホームアイコン */}
            <Link
              href="/"
              className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-10"
              style={{ 
                backgroundColor: pathname === '/' ? (isDark ? '#262626' : '#efefef') : 'transparent'
              }}
              title="ホーム"
            >
              <svg className="w-6 h-6" fill={pathname === '/' ? textColor : 'none'} stroke={textColor} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === '/' ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>

            {/* 検索アイコン（準備中） */}
            <button
              className="p-2 rounded-lg transition-all duration-200 opacity-50 cursor-not-allowed"
              disabled
              title="検索（準備中）"
            >
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* 新規投稿アイコン */}
            <Link
              href="/post/create"
              className="p-2 rounded-lg transition-all duration-200"
              title="新規投稿"
            >
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>

            {/* 通知アイコン */}
            <Link
              href="/#notifications"
              className="p-2 rounded-lg transition-all duration-200"
              title="通知"
            >
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* テーマ切り替え（PC/タブレットのみ） */}
            <button
              onClick={toggleTheme}
              className="hidden md:block p-2 rounded-lg transition-all duration-200 hover:bg-opacity-10"
              title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            >
              {isDark ? (
                <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" strokeWidth={2} />
                  <line x1="12" y1="1" x2="12" y2="3" strokeWidth={2} />
                  <line x1="12" y1="21" x2="12" y2="23" strokeWidth={2} />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth={2} />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth={2} />
                  <line x1="1" y1="12" x2="3" y2="12" strokeWidth={2} />
                  <line x1="21" y1="12" x2="23" y2="12" strokeWidth={2} />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth={2} />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth={2} />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* アカウントアイコン */}
            <Link
              href="/account"
              className="p-2 rounded-lg transition-all duration-200"
              style={{ 
                backgroundColor: pathname === '/account' ? (isDark ? '#262626' : '#efefef') : 'transparent'
              }}
              title="アカウント"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs" style={{ 
                backgroundColor: isDark ? '#262626' : '#dbdbdb',
                color: textColor,
                border: pathname === '/account' ? `2px solid ${textColor}` : 'none'
              }}>
                <svg className="w-4 h-4" fill="none" stroke={textColor} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
