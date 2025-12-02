'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

type InventoryItem = {
  id: string;
  name: string;
  category: string | null;
  unit: string | null;
  quantity: number;
  threshold: number | null;
  updated_at: string | null;
};

export default function InventoryPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    unit: '',
    quantity: 0,
    threshold: 10,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const cardBg = isDark ? '#111111' : '#fafafa';

  useEffect(() => {
    setMounted(true);
    void init();
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    await loadItems();
    setLoading(false);
  };

  const loadItems = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory_items')
        .select<InventoryItem>('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (e: any) {
      console.error('在庫取得エラー', e);
      setError(e?.message || '在庫の取得に失敗しました');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (!form.name.trim()) {
        throw new Error('品目名を入力してください');
      }
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || null,
        unit: form.unit.trim() || null,
        quantity: form.quantity,
        threshold: form.threshold ?? null,
      };
      const { error: insertError } = await supabase
        .from('inventory_items')
        .insert(payload);
      if (insertError) throw insertError;
      setForm({ name: '', category: '', unit: '', quantity: 0, threshold: 10 });
      await loadItems();
    } catch (e: any) {
      console.error('在庫追加エラー', e);
      setError(e?.message || '在庫の追加に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const updateQuantity = async (id: string, newQty: number) => {
    try {
      const { error: upsertError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQty })
        .eq('id', id);
      if (upsertError) throw upsertError;
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)),
      );
    } catch (e: any) {
      console.error('数量更新エラー', e);
      setError(e?.message || '数量の更新に失敗しました');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('この在庫を削除しますか？')) return;
    try {
      const { error: deleteError } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      console.error('在庫削除エラー', e);
      setError(e?.message || '削除に失敗しました');
    }
  };

  const lowStockIds = useMemo(
    () =>
      new Set(
        items
          .filter((i) => typeof i.threshold === 'number' && i.quantity <= (i.threshold ?? 0))
          .map((i) => i.id),
      ),
    [items],
  );

  if (!mounted || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: textColor }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-lg border"
              style={{ borderColor }}
              onClick={() => router.push('/dashboard/accounting/menu')}
            >
              ←
            </button>
            <h1 className="text-xl font-bold">在庫管理</h1>
          </div>
          <span className="text-sm" style={{ color: mutedColor }}>
            会計部
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div
            className="p-3 rounded-xl border text-sm"
            style={{ borderColor, color: '#f87171' }}
          >
            {error}
          </div>
        )}

        <section
          className="rounded-2xl border p-4 space-y-4"
          style={{ backgroundColor: cardBg, borderColor }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">在庫を追加</h2>
            <span className="text-xs" style={{ color: mutedColor }}>
              新規アイテムの登録
            </span>
          </div>
          <form
            className="grid grid-cols-1 md:grid-cols-5 gap-3"
            onSubmit={handleCreate}
          >
            <input
              type="text"
              placeholder="品目名 *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ backgroundColor: bgColor, borderColor, color: textColor }}
              required
            />
            <input
              type="text"
              placeholder="カテゴリ"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ backgroundColor: bgColor, borderColor, color: textColor }}
            />
            <input
              type="text"
              placeholder="単位 (例: 個, kg)"
              value={form.unit}
              onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ backgroundColor: bgColor, borderColor, color: textColor }}
            />
            <input
              type="number"
              placeholder="数量"
              value={form.quantity}
              onChange={(e) =>
                setForm((p) => ({ ...p, quantity: Number(e.target.value) }))
              }
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ backgroundColor: bgColor, borderColor, color: textColor }}
            />
            <input
              type="number"
              placeholder="しきい値"
              value={form.threshold}
              onChange={(e) =>
                setForm((p) => ({ ...p, threshold: Number(e.target.value) }))
              }
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ backgroundColor: bgColor, borderColor, color: textColor }}
            />
            <button
              type="submit"
              disabled={saving}
              className="md:col-span-5 w-full py-2 rounded-lg font-semibold transition-opacity disabled:opacity-50 border"
              style={{ backgroundColor: textColor, color: bgColor, borderColor }}
            >
              {saving ? '保存中...' : '追加する'}
            </button>
          </form>
        </section>

        <section
          className="rounded-2xl border p-4"
          style={{ backgroundColor: cardBg, borderColor }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">在庫一覧</h2>
            <span className="text-xs" style={{ color: mutedColor }}>
              クリックで数量を調整
            </span>
          </div>

          {items.length === 0 ? (
            <p className="text-sm" style={{ color: mutedColor }}>
              まだ在庫がありません
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    {['品目', 'カテゴリ', '数量', 'しきい値', '最終更新', '操作'].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left font-semibold px-3 py-2"
                          style={{ color: mutedColor }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const low = lowStockIds.has(item.id);
                    return (
                      <tr
                        key={item.id}
                        className="border-t"
                        style={{ borderColor }}
                      >
                        <td className="px-3 py-2 font-semibold">
                          {item.name}
                          {low && (
                            <span className="ml-2 text-xs rounded-full px-2 py-0.5 bg-red-500 text-white">
                              要補充
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {item.category || '-'}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              className="w-8 h-8 rounded-lg border"
                              style={{ borderColor }}
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(0, (item.quantity || 0) - 1),
                                )
                              }
                            >
                              -
                            </button>
                            <span className="min-w-[60px] text-center">
                              {item.quantity} {item.unit || ''}
                            </span>
                            <button
                              className="w-8 h-8 rounded-lg border"
                              style={{ borderColor }}
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  (item.quantity || 0) + 1,
                                )
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {item.threshold ?? '-'}
                        </td>
                        <td className="px-3 py-2" style={{ color: mutedColor }}>
                          {item.updated_at
                            ? new Date(item.updated_at).toLocaleString('ja-JP')
                            : '-'}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            className="text-sm text-red-500"
                            onClick={() => deleteItem(item.id)}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
