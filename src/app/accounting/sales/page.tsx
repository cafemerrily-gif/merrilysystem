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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollections, setActiveCollections] = useState<CollectionWithProducts[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [saleTime, setSaleTime] = useState(() => new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);

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
    // 既存数量をリセットして入力ミスを防ぐ
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
          paymentMethod,
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <span className="text-2xl" aria-hidden>
                📥
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">売上入力</h1>
              <p className="text-sm text-muted-foreground">販売日を指定すると該当フォルダの商品が自動で表示されます</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/accounting"
              className="px-4 py-3 bg-card border border-border hover:border-accent rounded-xl transition-all duration-200 text-sm font-semibold text-center"
            >
              会計部ダッシュボード
            </Link>
            <Link
              href="/"
              className="px-4 py-3 bg-card border border-border hover:border-accent rounded-xl transition-all duration-200 flex items-center gap-2 text-sm"
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
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold">販売日・時間を指定</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">日付</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => {
                  setSaleDate(e.target.value);
                  updateActiveCollections(e.target.value);
                }}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">時間</label>
              <input
                type="time"
                value={saleTime}
                onChange={(e) => setSaleTime(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">支払い方法</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              >
                <option value="cash">現金</option>
                <option value="card">クレジット/デビット</option>
                <option value="qr">QR/電子マネー</option>
                <option value="other">その他</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            該当フォルダ: {activeCollections.length ? activeCollections.map((c) => c.collection.name).join(', ') : 'なし'}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold">該当フォルダの商品一覧</h2>
            <div className="text-sm text-muted-foreground">
              選択中の商品数: {items.length} / 合計 ¥{totalAmount.toLocaleString()}
            </div>
          </div>

          {activeCollections.length === 0 ? (
            <p className="text-muted-foreground text-sm">指定日が期間内のフォルダがありません</p>
          ) : (
            <div className="space-y-6">
              {activeCollections.map((cp) => (
                <div key={cp.collection.id} className="border border-border rounded-xl">
                  <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-muted/40">
                    <div className="font-semibold">{cp.collection.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {cp.collection.start_date || '未設定'}~{cp.collection.end_date || '未設定'}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/20">
                        <tr className="text-left">
                          <th className="px-4 py-3">商品名</th>
                          <th className="px-4 py-3">カテゴリ</th>
                          <th className="px-4 py-3">単価</th>
                          <th className="px-4 py-3">数量</th>
                          <th className="px-4 py-3">小計</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {cp.products.map((p) => {
                          const qty = quantities[p.id] || 0;
                          const subtotal = qty * p.selling_price;
                          return (
                            <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3">{p.name}</td>
                              <td className="px-4 py-3 text-muted-foreground">{p.category_name}</td>
                              <td className="px-4 py-3 font-semibold">¥{p.selling_price.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min={0}
                                  value={qty}
                                  onChange={(e) => handleQuantity(p.id, Number(e.target.value))}
                                  className="w-full max-w-[100px] px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                />
                              </td>
                              <td className="px-4 py-3 font-semibold">¥{subtotal.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                        {!cp.products.length && (
                          <tr>
                            <td className="px-4 py-3 text-muted-foreground" colSpan={5}>
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
            <div className="text-sm text-muted-foreground">
              選択中の商品数: {items.length} 件 / 合計金額: ¥{totalAmount.toLocaleString()}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60"
            >
              {loading ? '登録中...' : '売上を登録'}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">最近の登録</h2>
            <span className="text-sm text-muted-foreground">直近15件</span>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-muted-foreground text-sm">データがありません</p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground uppercase tracking-wider">
                    <th className="px-3 py-2">日付</th>
                    <th className="px-3 py-2">時間</th>
                    <th className="px-3 py-2">金額</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-3">{sale.sale_date}</td>
                      <td className="px-3 py-3">{sale.sale_time}</td>
                      <td className="px-3 py-3 font-semibold">¥{Number(sale.total_amount || 0).toLocaleString()}</td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-red-500 hover:text-red-400 text-xs font-semibold"
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
