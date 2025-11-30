'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

type Product = {
  id: number;
  name: string;
  cost_price: number;
  selling_price: number;
  image_url?: string;
};

type ProductCollection = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  products: Product[];
};

type SalesInput = {
  product_id: number;
  quantity_sold: number;
};

export default function DailySalesPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 日付
  const [saleDate, setSaleDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // 商品フォルダと商品
  const [collections, setCollections] = useState<ProductCollection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [salesInputs, setSalesInputs] = useState<Map<number, number>>(new Map());

  // メッセージ
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 既存データの有無
  const [hasExistingData, setHasExistingData] = useState(false);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const cardBg = isDark ? '#121212' : '#fafafa';
  const inputBg = isDark ? '#1a1a1a' : '#ffffff';
  const accentColor = isDark ? '#4ade80' : '#16a34a';

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  useEffect(() => {
    if (mounted && saleDate) {
      fetchCollections();
      checkExistingData();
    }
  }, [mounted, saleDate]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(false);
  };

  // 販売日に対応する商品フォルダを取得
  const fetchCollections = async () => {
    try {
      const res = await fetch(`/api/sales?action=get_collections&sale_date=${saleDate}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setCollections(data);
        
        // フォルダが1つだけなら自動選択
        if (data.length === 1) {
          setSelectedCollectionId(data[0].id);
          initializeSalesInputs(data[0].products);
        } else if (data.length > 1) {
          // 複数ある場合は最初のフォルダを選択
          setSelectedCollectionId(data[0].id);
          initializeSalesInputs(data[0].products);
        } else {
          setSelectedCollectionId(null);
          setSalesInputs(new Map());
        }
      }
    } catch (err) {
      console.error('商品フォルダ取得エラー:', err);
      setError('商品フォルダの取得に失敗しました');
    }
  };

  // 既存の売上データを確認
  const checkExistingData = async () => {
    try {
      const res = await fetch(`/api/sales?action=product_sales&sale_date=${saleDate}`);
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setHasExistingData(true);
        // 既存データで入力欄を初期化
        const existingInputs = new Map<number, number>();
        data.forEach((item: any) => {
          existingInputs.set(item.product_id, item.quantity_sold);
        });
        setSalesInputs(existingInputs);
      } else {
        setHasExistingData(false);
      }
    } catch (err) {
      console.error('既存データ確認エラー:', err);
    }
  };

  // 売上入力欄を初期化
  const initializeSalesInputs = (products: Product[]) => {
    // 既存データがあればそれを優先、なければ0で初期化
    if (!hasExistingData) {
      const newInputs = new Map<number, number>();
      products.forEach(p => {
        newInputs.set(p.id, salesInputs.get(p.id) || 0);
      });
      setSalesInputs(newInputs);
    }
  };

  // フォルダ選択時
  const handleCollectionChange = (collectionId: number) => {
    setSelectedCollectionId(collectionId);
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      initializeSalesInputs(collection.products);
    }
  };

  // 数量変更
  const handleQuantityChange = (productId: number, value: string) => {
    const quantity = parseInt(value) || 0;
    setSalesInputs(prev => {
      const newMap = new Map(prev);
      newMap.set(productId, Math.max(0, quantity));
      return newMap;
    });
  };

  // 数量増減
  const adjustQuantity = (productId: number, delta: number) => {
    setSalesInputs(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(productId) || 0;
      newMap.set(productId, Math.max(0, current + delta));
      return newMap;
    });
  };

  // 売上保存
  const handleSave = async () => {
    if (!selectedCollectionId) {
      setError('商品フォルダを選択してください');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const salesData: SalesInput[] = [];
      salesInputs.forEach((quantity, productId) => {
        salesData.push({ product_id: productId, quantity_sold: quantity });
      });

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_date: saleDate,
          sales_data: salesData
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || '保存に失敗しました');
      }

      setMessage(`売上を登録しました！ 合計: ¥${result.summary.total_sales.toLocaleString()}`);
      setHasExistingData(true);
    } catch (err: any) {
      setError(err.message || '売上の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // 選択中のフォルダ
  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  // 売上合計計算
  const calculateTotals = () => {
    let totalSales = 0;
    let totalCost = 0;
    let itemCount = 0;

    if (selectedCollection) {
      selectedCollection.products.forEach(product => {
        const quantity = salesInputs.get(product.id) || 0;
        totalSales += product.selling_price * quantity;
        totalCost += product.cost_price * quantity;
        itemCount += quantity;
      });
    }

    const grossProfit = totalSales - totalCost;
    const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    return { totalSales, totalCost, itemCount, grossProfit, grossMargin };
  };

  const totals = calculateTotals();

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <p style={{ color: mutedColor }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/accounting" className="p-2">
                <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg font-semibold">売上入力</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !selectedCollectionId}
              className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-all"
              style={{ backgroundColor: accentColor, color: '#ffffff' }}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="pt-20 max-w-3xl mx-auto px-4 py-6">
        {/* メッセージ */}
        {message && (
          <div className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: `${accentColor}20`, borderColor: accentColor, color: accentColor }}>
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: '#ef444420', borderColor: '#ef4444', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* 日付選択 */}
        <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
          <label className="block text-sm font-medium mb-2">販売日</label>
          <input
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-lg"
            style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
          />
          {hasExistingData && (
            <p className="mt-2 text-sm" style={{ color: accentColor }}>
              ✓ この日の売上データが既に存在します（上書き更新されます）
            </p>
          )}
        </div>

        {/* 商品フォルダ選択 */}
        {collections.length > 0 ? (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">商品フォルダ</label>
            <div className="flex flex-wrap gap-2">
              {collections.map(collection => (
                <button
                  key={collection.id}
                  onClick={() => handleCollectionChange(collection.id)}
                  className="px-4 py-2 rounded-xl border transition-all"
                  style={{
                    backgroundColor: selectedCollectionId === collection.id ? accentColor : cardBg,
                    borderColor: selectedCollectionId === collection.id ? accentColor : borderColor,
                    color: selectedCollectionId === collection.id ? '#ffffff' : textColor
                  }}
                >
                  {collection.name}
                  <span className="ml-2 text-xs opacity-70">
                    ({collection.start_date} ～ {collection.end_date})
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 p-6 rounded-xl border text-center" style={{ backgroundColor: cardBg, borderColor }}>
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke={mutedColor} viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p style={{ color: mutedColor }}>この日付に該当する商品フォルダがありません</p>
            <p className="text-sm mt-1" style={{ color: mutedColor }}>
              開発部のメニュー管理で販売期間を設定してください
            </p>
          </div>
        )}

        {/* 商品一覧 */}
        {selectedCollection && selectedCollection.products.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-3">商品別売上入力</h2>
            {selectedCollection.products.map(product => {
              const quantity = salesInputs.get(product.id) || 0;
              const subtotal = product.selling_price * quantity;

              return (
                <div
                  key={product.id}
                  className="p-4 rounded-xl border"
                  style={{ backgroundColor: cardBg, borderColor }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm" style={{ color: mutedColor }}>
                        ¥{product.selling_price.toLocaleString()} / 個
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: accentColor }}>
                        ¥{subtotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustQuantity(product.id, -1)}
                      className="w-12 h-12 rounded-xl border flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                      style={{ borderColor, backgroundColor: inputBg }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl text-center text-xl font-semibold"
                      style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                      min="0"
                    />
                    <button
                      onClick={() => adjustQuantity(product.id, 1)}
                      className="w-12 h-12 rounded-xl border flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                      style={{ borderColor, backgroundColor: inputBg }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => adjustQuantity(product.id, 10)}
                      className="px-3 py-3 rounded-xl border text-sm transition-all active:scale-95"
                      style={{ borderColor, backgroundColor: inputBg }}
                    >
                      +10
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 合計サマリー */}
        {selectedCollection && (
          <div className="mt-6 p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
            <h3 className="font-semibold mb-3">売上サマリー</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span style={{ color: mutedColor }}>販売個数</span>
                <span className="font-medium">{totals.itemCount} 個</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: mutedColor }}>売上合計</span>
                <span className="font-semibold text-lg">¥{totals.totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: mutedColor }}>原価合計</span>
                <span>¥{totals.totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor }}>
                <span style={{ color: mutedColor }}>粗利益</span>
                <span className="font-semibold" style={{ color: accentColor }}>
                  ¥{totals.grossProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: mutedColor }}>粗利率</span>
                <span style={{ color: accentColor }}>{totals.grossMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 下部ナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 border-t z-40" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 h-16">
            <Link href="/dashboard/accounting" className="flex flex-col items-center justify-center gap-1">
              <svg className="w-6 h-6" fill={textColor} stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className="text-xs font-semibold" style={{ color: textColor }}>会計部</span>
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
