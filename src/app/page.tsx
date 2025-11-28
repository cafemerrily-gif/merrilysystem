'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

export default function Home() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setLoading(false);
    
    if (!user) {
      router.push('/login');
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const appIconUrl = isDark ? '/white.png' : '/black.png';

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <p style={{ color: mutedColor }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <Image src={appIconUrl} width={32} height={32} alt="MERRILY" className="object-contain" />
              </div>
              <span className="text-xl font-bold" style={{ color: textColor }}>MERRILY</span>
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? '#262626' : '#f0f0f0' }}>
              <Image src={appIconUrl} width={64} height={64} alt="MERRILY" className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold mb-2">MERRILY へようこそ</h1>
            <p style={{ color: mutedColor }}>下部のメニューから各機能にアクセスできます</p>
          </div>
        </div>
      </main>

      {/* 下部固定ナビゲーションバー（ダッシュボードメニュー） */}
      <nav className="fixed bottom-0 left-0 right-0 border-t z-40" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-5 h-16">
            
            {/* 会計部 */}
            <Link
              href="/dashboard/accounting"
              className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>会計部</span>
            </Link>

            {/* 開発部 */}
            <Link
              href="/dashboard/dev/menu"
              className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>開発部</span>
            </Link>

            {/* 広報部 */}
            <Link
              href="/dashboard/pr/menu"
              className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>広報部</span>
            </Link>

            {/* スタッフ管理 */}
            <Link
              href="/dashboard/staff"
              className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>スタッフ</span>
            </Link>

            {/* アカウント */}
            <Link
              href="/account"
              className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>設定</span>
            </Link>

          </div>
        </div>
      </nav>
    </div>
  );
}
