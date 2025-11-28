'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Product = {
  id: number;
  name: string;
  category_name: string;
  selling_price: number;
};

type Collection = {
  id: number;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
};

type CollectionWithProducts = {
  collection: Collection;
  products: Product[];
};

type RecentSale = {
  id: number;
  sale_date: string;
  sale_time: string;
  total_amount: number;
};

export default function SalesInputPage() {
  const [isDark, setIsDark] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollections, setActiveCollections] = useState<CollectionWithProducts[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [saleTime, setSaleTime] = useState(() => {
    const h = new Date().getHours();
    return `${String(h).padStart(2, '0')}:00`;
  });
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`), []);
  const [loading, setLoading] = useState(false);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);

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
  const cardBg = isDark ? '#000000' : '#ffffff';

  useEffect(() => {
    fetchCollections();
    fetchRecent();
  }, []);

  useEffect(() => {
    if (!collections.length) return;
    updateActiveCollections(saleDate);
  }, [collections, saleDate]);

  const fetchCollections = async () => {
    const res = await fetch('/api/collections');
    const data = await res.json();
    setCollections(data.collections || []);
  };

  const fetchCollectionProducts = async (collectionId: number) => {
    const res = await fetch(`/api/collections/${collectionId}/products`);
    if (res.ok) {
      const data = await res.json();
      return data.products || [];
    }
    return [];
  };

  const updateActiveCollections = async (targetDate: string) => {
    const matched = collections.filter((c) => {
      const startOk = !c.start_date || c.start_date <= targetDate;
      const endOk = !c.end_date || c.end_date >= targetDate;
      return startOk && endOk;
    });
    const results: CollectionWithProducts[] = [];
    for (const c of matched) {
      const prods = await fetchCollectionProducts(c.id);
      results.push({ collection: c, products: prods });
    }
    setActiveCollections(results);
    setQuantities({});
  };

  const fetchRecent = async () => {
    const res = await fetch('/api/sales');
    const data = await res.json();
    if (!data.error) setRecentSales(data.recentSales || []);
  };

  const items = useMemo(() => {
    return activeCollections
      .flatMap((cp) => cp.products)
      .filter((p) => quantities[p.id] > 0)
      .map((p) => ({
        productId: p.id,
        name: p.name,
        quantity: quantities[p.id],
        unitPrice: p.selling_price,
      }));
  }, [activeCollections, quantities]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [items]);

  const handleQuantity = (id: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('数量を1つ以上入力してください');
    setLoading(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleDate,
          saleTime,
          staffId: 1,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
        }),
      });
      if (res.ok) {
        alert('売上を登録しました');
        setQuantities({});
        fetchRecent();
      } else {
        const error = await res.json();
        alert(error.error || '登録に失敗しました');
      }
    } catch (error) {
      console.error('売上登録エラー:', error);
      alert('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (saleId: number) => {
    if (!confirm('この売上を削除しますか？')) return;
    try {
      const res = await fetch(`/api/sales?saleId=${saleId}`, { method: 'DELETE' });
      if (res.ok) {
        setRecentSales((prev) => prev.filter((s) => s.id !== saleId));
      } else {
        const error = await res.json();
        alert(error.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="border-b sticky top-0 z-10 backdrop-blur" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cardBg, border: `2px solid ${borderColor}` }}>
              <span className="text-2xl">📥</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: textColor }}>売上入力</h1>
              <p className="text-sm" style={{ color: mutedColor }}>販売日を指定すると該当フォルダの商品が自動で表示されます</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/accounting"
              className="px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold text-center"
              style={{ backgroundColor: cardBg, borderColor, color: textColor }}
            >
              会計部ダッシュボード
            </Link>
            <Link
              href="/"
              className="px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 text-sm"
              style={{ backgroundColor: cardBg, borderColor, color: textColor }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ホームへ
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: cardBg, borderColor }}>
          <h2 className="text-xl font-semibold" style={{ color: textColor }}>販売日・時間を指定</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>日付</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => {
                  setSaleDate(e.target.value);
                  updateActiveCollections(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border transition-all"
                style={{ backgroundColor: bgColor, borderColor, color: textColor }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>時間</label>
              <select
                value={saleTime}
                onChange={(e) => setSaleTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border transition-all"
                style={{ backgroundColor: bgColor, borderColor, color: textColor }}
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm" style={{ color: mutedColor }}>
            該当フォルダ: {activeCollections.length ? activeCollections.map((c) => c.collection.name).join(', ') : 'なし'}
          </div>
        </div>

        <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold" style={{ color: textColor }}>該当フォルダの商品一覧</h2>
            <div className="text-sm" style={{ color: mutedColor }}>
              選択中の商品数: {items.length} / 合計 ¥{totalAmount.toLocaleString()}
            </div>
          </div>

          {activeCollections.length === 0 ? (
            <p className="text-sm" style={{ color: mutedColor }}>指定日が期間内のフォルダがありません</p>
          ) : (
            <div className="space-y-6">
              {activeCollections.map((cp) => (
                <div key={cp.collection.id} className="border rounded-xl" style={{ borderColor }}>
                  <div className="flex flex-wrap items-center justify-between px-4 py-3" style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}>
                    <div className="font-semibold" style={{ color: textColor }}>{cp.collection.name}</div>
                    <div className="text-xs" style={{ color: mutedColor }}>
                      {cp.collection.start_date || '未設定'}~{cp.collection.end_date || '未設定'}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}>
                        <tr className="text-left">
                          <th className="px-4 py-3" style={{ color: textColor }}>商品名</th>
                          <th className="px-4 py-3" style={{ color: textColor }}>カテゴリ</th>
                          <th className="px-4 py-3" style={{ color: textColor }}>単価</th>
                          <th className="px-4 py-3" style={{ color: textColor }}>数量</th>
                          <th className="px-4 py-3" style={{ color: textColor }}>小計</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cp.products.map((p) => {
                          const qty = quantities[p.id] || 0;
                          const subtotal = qty * p.selling_price;
                          return (
                            <tr key={p.id} className="border-t transition" style={{ borderColor }}>
                              <td className="px-4 py-3" style={{ color: textColor }}>{p.name}</td>
                              <td className="px-4 py-3" style={{ color: mutedColor }}>{p.category_name}</td>
                              <td className="px-4 py-3 font-semibold" style={{ color: textColor }}>¥{p.selling_price.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min={0}
                                  value={qty}
                                  onChange={(e) => handleQuantity(p.id, Number(e.target.value))}
                                  className="w-full max-w-[100px] px-3 py-2 rounded-lg border transition-all"
                                  style={{ backgroundColor: bgColor, borderColor, color: textColor }}
                                />
                              </td>
                              <td className="px-4 py-3 font-semibold" style={{ color: textColor }}>¥{subtotal.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                        {!cp.products.length && (
                          <tr>
                            <td className="px-4 py-3" style={{ color: mutedColor }} colSpan={5}>
                              商品がありません
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm" style={{ color: mutedColor }}>
              選択中の商品数: {items.length} 件 / 合計金額: ¥{totalAmount.toLocaleString()}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto font-bold py-3 px-5 rounded-xl transition-all duration-200 disabled:opacity-60"
              style={{ backgroundColor: textColor, color: bgColor }}
            >
              {loading ? '登録中...' : '売上を登録'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: textColor }}>最近の登録</h2>
            <span className="text-sm" style={{ color: mutedColor }}>直近15件</span>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-sm" style={{ color: mutedColor }}>データがありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left uppercase tracking-wider" style={{ borderColor, color: mutedColor }}>
                    <th className="px-3 py-2">日付</th>
                    <th className="px-3 py-2">時間</th>
                    <th className="px-3 py-2">金額</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="border-t transition" style={{ borderColor }}>
                      <td className="px-3 py-3" style={{ color: textColor }}>{sale.sale_date}</td>
                      <td className="px-3 py-3" style={{ color: textColor }}>{sale.sale_time}</td>
                      <td className="px-3 py-3 font-semibold" style={{ color: textColor }}>¥{Number(sale.total_amount || 0).toLocaleString()}</td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-xs font-semibold"
                          style={{ color: '#ff3b30' }}
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
