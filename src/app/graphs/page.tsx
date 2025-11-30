'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

export default function GraphsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // グラフ用ダミーデータ
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [hourlySales, setHourlySales] = useState<any[]>([]);
  const [productSales, setProductSales] = useState<any[]>([]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? '#262626' : '#ddd';
  const mutedColor = isDark ? '#aaa' : '#666';
  const appIconUrl = isDark ? '/white.png' : '/black.png';
  const accentColor = '#22c55e';
  const secondaryColor = '#3b82f6';

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    // ダミーデータ生成
    generateDummyData();
    setLoading(false);
  };

  const generateDummyData = () => {
    // 日別売上（直近7日）
    const daily = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 30000) + 10000,
      };
    });
    setDailySales(daily);

    // 時間帯別売上（11-16時）
    const hourly = [11, 12, 13, 14, 15, 16].map(hour => ({
      hour,
      sales: Math.floor(Math.random() * 15000) + 5000,
    }));
    setHourlySales(hourly);

    // 商品別売上（TOP5）
    const products = ['コーヒー', '紅茶', 'ケーキ', 'サンドイッチ', 'クッキー'].map((name, i) => ({
      name,
      sales: Math.floor(Math.random() * 50000) + 10000,
    })).sort((a, b) => b.sales - a.sales);
    setProductSales(products);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <p style={{ color: mutedColor }}>読み込み中...</p>
      </div>
    );
  }

  const dailyMax = Math.max(...dailySales.map(d => d.sales), 1);
  const hourlyMax = Math.max(...hourlySales.map(h => h.sales), 1);
  const productMax = Math.max(...productSales.map(p => p.sales), 1);

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image src={appIconUrl} width={40} height={40} alt="Logo" />
            <span className="text-xl font-bold">MERRILY</span>
          </Link>
          <Link href="/account" className="p-2">
            <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* タブナビゲーション */}
      <nav className="fixed top-16 left-0 right-0 z-30 border-b" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            <Link href="/" className="flex-1 py-2 text-center text-sm" style={{ color: mutedColor }}>
              投稿
            </Link>
            <button className="flex-1 py-2 text-center text-sm" style={{ color: mutedColor }}>
              進捗
            </button>
            <button className="flex-1 py-2 text-center text-sm" style={{ color: mutedColor }}>
              メニュー
            </button>
            <Link href="/graphs" className="flex-1 py-2 text-center text-sm font-semibold border-b-2" style={{ borderColor: textColor, color: textColor }}>
              グラフ
            </Link>
          </div>
        </div>
      </nav>

      {/* グラフフィード */}
      <main className="pt-28 max-w-2xl mx-auto px-4">
        <div className="space-y-6">
          
          {/* 日別売上グラフ */}
          <div className="border rounded-xl overflow-hidden" style={{ borderColor }}>
            <div className="p-4 border-b" style={{ borderColor }}>
              <h2 className="text-lg font-bold">📊 日別売上推移</h2>
              <p className="text-sm mt-1" style={{ color: mutedColor }}>直近7日間の売上</p>
            </div>
            
            <div className="p-6">
              {/* 棒グラフ */}
              <div className="flex items-end justify-between gap-2 h-48">
                {dailySales.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                      <div
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${(item.sales / dailyMax) * 100}%`,
                          backgroundColor: secondaryColor,
                          minHeight: '4px'
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium">{item.date.split('-')[1]}/{item.date.split('-')[2]}</div>
                      <div className="text-xs mt-1" style={{ color: mutedColor }}>¥{(item.sales / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-3 border-t flex justify-between items-center" style={{ borderColor }}>
              <span style={{ color: mutedColor }}>期間合計</span>
              <span className="text-xl font-bold" style={{ color: secondaryColor }}>
                ¥{dailySales.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 時間帯別売上グラフ */}
          <div className="border rounded-xl overflow-hidden" style={{ borderColor }}>
            <div className="p-4 border-b" style={{ borderColor }}>
              <h2 className="text-lg font-bold">🕐 時間帯別売上</h2>
              <p className="text-sm mt-1" style={{ color: mutedColor }}>本日の営業時間（11:00〜16:00）</p>
            </div>
            
            <div className="p-6">
              {/* 棒グラフ */}
              <div className="flex items-end justify-between gap-2 h-48">
                {hourlySales.map((item) => (
                  <div key={item.hour} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                      <div
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${(item.sales / hourlyMax) * 100}%`,
                          backgroundColor: accentColor,
                          minHeight: '4px'
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium">{item.hour}時</div>
                      <div className="text-xs mt-1" style={{ color: mutedColor }}>¥{(item.sales / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-3 border-t flex justify-between items-center" style={{ borderColor }}>
              <span style={{ color: mutedColor }}>本日合計</span>
              <span className="text-xl font-bold" style={{ color: accentColor }}>
                ¥{hourlySales.reduce((sum, h) => sum + h.sales, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 商品別売上ランキング */}
          <div className="border rounded-xl overflow-hidden" style={{ borderColor }}>
            <div className="p-4 border-b" style={{ borderColor }}>
              <h2 className="text-lg font-bold">🏆 商品別売上ランキング</h2>
              <p className="text-sm mt-1" style={{ color: mutedColor }}>今月のTOP5</p>
            </div>
            
            <div className="p-4 space-y-3">
              {productSales.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      backgroundColor: index < 3 ? accentColor : borderColor,
                      color: index < 3 ? '#ffffff' : textColor
                    }}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm font-semibold">¥{item.sales.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#333' : '#e5e7eb' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.sales / productMax) * 100}%`,
                          backgroundColor: index < 3 ? accentColor : secondaryColor
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t flex justify-between items-center" style={{ borderColor }}>
              <span style={{ color: mutedColor }}>TOP5合計</span>
              <span className="text-xl font-bold" style={{ color: secondaryColor }}>
                ¥{productSales.reduce((sum, p) => sum + p.sales, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 詳細リンク */}
          <Link 
            href="/dashboard/accounting/sales-graph"
            className="block p-4 border rounded-xl text-center transition-opacity hover:opacity-70"
            style={{ borderColor }}
          >
            <span className="text-sm font-semibold">すべてのグラフを見る →</span>
          </Link>

        </div>
      </main>

      {/* 下部ナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 border-t z-40" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 h-16">
            <Link href="/dashboard/accounting/menu" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>会計部</span>
            </Link>
            <Link href="/dashboard/dev/menu" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>開発部</span>
            </Link>
            <Link href="/dashboard/pr/menu" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>広報部</span>
            </Link>
            <Link href="/dashboard/staff" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>スタッフ</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
