'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

type Product = {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  selling_price: number;
  cost_price: number;
  category_name: string | null;
  collection_name: string | null;
};

export default function MenuPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? '#262626' : '#ddd';
  const mutedColor = isDark ? '#aaa' : '#666';
  const cardBg = isDark ? '#0a0a0a' : '#fafafa';
  const appIconUrl = isDark ? '/white.png' : '/black.png';

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      fetchProducts();
    }
  }, [selectedDate, mounted, loading]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      // 選択日に該当する商品フォルダを取得
      const { data: collections } = await supabase
        .from('product_collections')
        .select('id')
        .lte('start_date', selectedDate)
        .gte('end_date', selectedDate)
        .is('deleted_at', null);

      if (!collections || collections.length === 0) {
        setProducts([]);
        return;
      }

      const collectionIds = collections.map(c => c.id);

      // 該当フォルダの商品を取得
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          image_url,
          selling_price,
          cost_price,
          category_id,
          collection_id,
          categories:category_id (name),
          product_collections:collection_id (name)
        `)
        .in('collection_id', collectionIds)
        .is('deleted_at', null)
        .order('name');

      if (error) {
        console.error('商品取得エラー:', error);
        setProducts([]);
        return;
      }

      const formattedProducts: Product[] = (productsData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        image_url: p.image_url,
        selling_price: p.selling_price || 0,
        cost_price: p.cost_price || 0,
        category_name: p.categories?.name || null,
        collection_name: p.product_collections?.name || null,
      }));

      setProducts(formattedProducts);
    } catch (err) {
      console.error('fetchProducts エラー:', err);
      setProducts([]);
    }
  };

  const getMarginRate = (selling: number, cost: number) => {
    if (selling === 0) return 0;
    return ((selling - cost) / selling * 100).toFixed(1);
  };

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
            <Link href="/menu" className="flex-1 py-2 text-center text-sm font-semibold border-b-2" style={{ borderColor: textColor, color: textColor }}>
              メニュー
            </Link>
            <Link href="/graphs" className="flex-1 py-2 text-center text-sm" style={{ color: mutedColor }}>
              グラフ
            </Link>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="pt-28 max-w-2xl mx-auto px-4">
        {/* 日付選択 */}
        <div className="mb-6 p-4 rounded-2xl border" style={{ backgroundColor: cardBg, borderColor }}>
          <label className="block text-sm mb-2" style={{ color: mutedColor }}>
            📅 日付を選択
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl"
            style={{ 
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              border: `1px solid ${borderColor}`,
              color: textColor
            }}
          />
          <p className="text-xs mt-2" style={{ color: mutedColor }}>
            選択した日付に販売期間が該当する商品を表示します
          </p>
        </div>

        {/* 商品フィード */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke={mutedColor} viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <p style={{ color: mutedColor }}>この日に該当する商品がありません</p>
            <p className="text-sm mt-2" style={{ color: mutedColor }}>
              商品フォルダの販売期間を確認してください
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-xl overflow-hidden"
                style={{ borderColor }}
              >
                {/* 商品ヘッダー */}
                <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? '#1e40af' : '#dbeafe' }}>
                    <svg className="w-6 h-6" fill="none" stroke={isDark ? '#93c5fd' : '#1e40af'} viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {product.category_name && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: isDark ? '#065f46' : '#d1fae5', color: isDark ? '#34d399' : '#059669' }}>
                          {product.category_name}
                        </span>
                      )}
                      {product.collection_name && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: isDark ? '#4c1d95' : '#e9d5ff', color: isDark ? '#c4b5fd' : '#6b21a8' }}>
                          {product.collection_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 商品画像 */}
                {product.image_url && (
                  <div className="relative w-full" style={{ aspectRatio: '1', backgroundColor: isDark ? '#262626' : '#eee' }}>
                    <Image 
                      src={product.image_url} 
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* 商品説明 */}
                {product.description && (
                  <div className="px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm">{product.description}</p>
                  </div>
                )}

                {/* 価格情報 */}
                <div className="px-4 py-3 border-t" style={{ borderColor }}>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs" style={{ color: mutedColor }}>販売価格</p>
                      <p className="text-lg font-bold mt-1">¥{product.selling_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: mutedColor }}>原価</p>
                      <p className="text-lg font-bold mt-1" style={{ color: mutedColor }}>¥{product.cost_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: mutedColor }}>粗利率</p>
                      <p className="text-lg font-bold mt-1" style={{ color: '#22c55e' }}>
                        {getMarginRate(product.selling_price, product.cost_price)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* 利益額 */}
                <div className="px-4 py-3 border-t" style={{ borderColor, backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: mutedColor }}>1個あたりの利益</span>
                    <span className="text-xl font-bold" style={{ color: '#22c55e' }}>
                      ¥{(product.selling_price - product.cost_price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
