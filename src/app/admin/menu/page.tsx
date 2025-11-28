'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  description: string;
  display_order: number;
}

interface Product {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  selling_price: number;
  cost_price: number;
}

interface Collection {
  id: number;
  name: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
}

export default function MenuManagementPage() {
  const [isDark, setIsDark] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionProducts, setCollectionProducts] = useState<Record<number, Product[]>>({});
  const [viewCollectionId, setViewCollectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', display_order: 0 });
  const [productForm, setProductForm] = useState({ category_id: '', name: '', selling_price: '', cost_price: '' });
  const [collectionForm, setCollectionForm] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [assignForm, setAssignForm] = useState({ collectionId: '', productIds: [] as number[] });

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
  const inputBg = isDark ? '#000000' : '#ffffff';

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchCategories(), fetchProducts(), fetchCollections()]);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    setCategories(await res.json());
  };

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    setProducts(await res.json());
  };

  const fetchCollections = async () => {
    const res = await fetch('/api/collections');
    const data = await res.json();
    setCollections(data.collections || []);
  };

  const loadCollectionProducts = async (collectionId: number) => {
    const res = await fetch(`/api/collections/${collectionId}/products`);
    if (res.ok) {
      const data = await res.json();
      setCollectionProducts((prev) => ({ ...prev, [collectionId]: data.products || [] }));
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return alert('カテゴリー名を入力してください');
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryForm),
    });
    if (res.ok) {
      setCategoryForm({ name: '', description: '', display_order: 0 });
      fetchCategories();
    } else {
      const error = await res.json();
      alert(error.error || 'カテゴリー追加に失敗しました');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.category_id) return alert('必須項目を入力してください');
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: parseInt(productForm.category_id),
        name: productForm.name,
        selling_price: parseFloat(productForm.selling_price),
        cost_price: parseFloat(productForm.cost_price),
      }),
    });
    if (res.ok) {
      setProductForm({ category_id: '', name: '', selling_price: '', cost_price: '' });
      fetchProducts();
    } else {
      const error = await res.json();
      alert(error.error || '商品追加に失敗しました');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('この商品を削除しますか？（関連する売上明細がある場合は削除できません）')) return;
    const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      const error = await res.json();
      alert(error.error || '商品の削除に失敗しました');
    }
  };

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionForm.name.trim()) return alert('フォルダ名を入力してください');
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectionForm),
    });
    if (res.ok) {
      setCollectionForm({ name: '', description: '', startDate: '', endDate: '' });
      fetchCollections();
    } else {
      const error = await res.json();
      alert(error.error || 'フォルダ作成に失敗しました');
    }
  };

  const handleAssignProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.collectionId || !assignForm.productIds.length) return alert('フォルダと商品を選択してください');
    const res = await fetch(`/api/collections/${assignForm.collectionId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: assignForm.productIds }),
    });
    if (res.ok) {
      setAssignForm({ collectionId: '', productIds: [] });
      loadCollectionProducts(Number(assignForm.collectionId));
    } else {
      const error = await res.json();
      alert(error.error || 'フォルダへの追加に失敗しました');
    }
  };

  const handleDeleteCollection = async (id: number) => {
    if (!confirm('このフォルダを削除しますか？')) return;
    const res = await fetch(`/api/collections?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCollections((prev) => prev.filter((c) => c.id !== id));
      setCollectionProducts((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      if (viewCollectionId === id) setViewCollectionId(null);
    } else {
      const error = await res.json();
      alert(error.error || 'フォルダの削除に失敗しました');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('このカテゴリーを削除しますか？（商品が残っている場合は削除できません）')) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      const error = await res.json();
      alert(error.error || 'カテゴリーの削除に失敗しました');
    }
  };

  const toggleProductSelection = (productId: number) => {
    setAssignForm((prev) => {
      const exists = prev.productIds.includes(productId);
      const nextIds = exists ? prev.productIds.filter((id) => id !== productId) : [...prev.productIds, productId];
      return { ...prev, productIds: nextIds };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor, color: textColor }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mb-4" style={{ borderColor: borderColor }}></div>
          <div className="text-xl" style={{ color: mutedColor }}>読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="border-b sticky top-0 z-10 backdrop-blur" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cardBg, border: `2px solid ${borderColor}` }}>
              <span className="text-2xl">🍽</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: textColor }}>メニュー管理</h1>
              <p className="text-sm" style={{ color: mutedColor }}>商品フォルダと販売期間を設定</p>
            </div>
          </div>
          <Link
            href="/dashboard/dev/menu"
            className="px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold text-center"
            style={{ backgroundColor: cardBg, borderColor, color: textColor }}
          >
            開発部メニューへ
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {/* フォルダ作成 */}
        <section className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-xl font-semibold" style={{ color: textColor }}>商品フォルダ（販売期間）</h2>
            <span className="text-sm" style={{ color: mutedColor }}>販売期間を設定してフォルダ作成</span>
          </div>
          <form onSubmit={handleAddCollection} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>フォルダ名</label>
              <input
                type="text"
                value={collectionForm.name}
                onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border transition-all"
                style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                placeholder="例: 春メニュー"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>説明（任意）</label>
              <input
                type="text"
                value={collectionForm.description}
                onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border transition-all"
                style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                placeholder="例: 春限定ドリンク"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>開始日</label>
              <input
                type="date"
                value={collectionForm.startDate}
                onChange={(e) => setCollectionForm({ ...collectionForm, startDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border transition-all"
                style={{ backgroundColor: inputBg, borderColor, color: textColor }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>終了日</label>
              <input
                type="date"
                value={collectionForm.endDate}
                onChange={(e) => setCollectionForm({ ...collectionForm, endDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border transition-all"
                style={{ backgroundColor: inputBg, borderColor, color: textColor }}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="w-full md:w-auto font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                style={{ backgroundColor: textColor, color: bgColor }}
              >
                フォルダを作成
              </button>
            </div>
          </form>

          <div className="overflow-x-auto border rounded-xl" style={{ borderColor }}>
            <table className="min-w-full text-sm">
              <thead style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}>
                <tr className="text-left">
                  <th className="px-4 py-3" style={{ color: textColor }}>フォルダ名</th>
                  <th className="px-4 py-3" style={{ color: textColor }}>期間</th>
                  <th className="px-4 py-3" style={{ color: textColor }}>説明</th>
                  <th className="px-4 py-3 w-28 text-right" style={{ color: textColor }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: textColor }}>{c.name}</td>
                    <td className="px-4 py-3" style={{ color: mutedColor }}>
                      {c.start_date || '未設定'} ～ {c.end_date || '未設定'}
                    </td>
                    <td className="px-4 py-3" style={{ color: mutedColor }}>{c.description || '-'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setViewCollectionId(c.id);
                          loadCollectionProducts(c.id);
                        }}
                        className="text-xs font-semibold"
                        style={{ color: textColor }}
                      >
                        中身を見る
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(c.id)}
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

          {viewCollectionId && (
            <div className="border rounded-2xl p-4" style={{ borderColor, backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold" style={{ color: textColor }}>
                  {collections.find((c) => c.id === viewCollectionId)?.name || 'フォルダ'}
                </h4>
                <button
                  className="text-sm hover:opacity-70"
                  style={{ color: mutedColor }}
                  onClick={() => setViewCollectionId(null)}
                >
                  閉じる
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left uppercase tracking-wider" style={{ borderColor, color: mutedColor }}>
                      <th className="px-3 py-2">商品名</th>
                      <th className="px-3 py-2">カテゴリ</th>
                      <th className="px-3 py-2">売価</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(collectionProducts[viewCollectionId] || []).map((p) => (
                      <tr key={p.id} className="border-t" style={{ borderColor }}>
                        <td className="px-3 py-2" style={{ color: textColor }}>{p.name}</td>
                        <td className="px-3 py-2" style={{ color: mutedColor }}>{p.category_name}</td>
                        <td className="px-3 py-2 font-semibold" style={{ color: textColor }}>¥{p.selling_price.toLocaleString()}</td>
                      </tr>
                    ))}
                    {!(collectionProducts[viewCollectionId] || []).length && (
                      <tr>
                        <td className="px-3 py-3" style={{ color: mutedColor }} colSpan={3}>
                          商品がありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* フォルダへ商品を追加 */}
        <section className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-xl font-semibold" style={{ color: textColor }}>フォルダに商品を登録</h2>
            <span className="text-sm" style={{ color: mutedColor }}>販売期間と紐づけて売上入力を効率化</span>
          </div>
          <form onSubmit={handleAssignProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>フォルダ</label>
                <select
                  value={assignForm.collectionId}
                  onChange={(e) => setAssignForm({ ...assignForm, collectionId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                  required
                >
                  <option value="">選択してください</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.start_date || '未設定'}~{c.end_date || '未設定'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>商品（複数選択可）</label>
                <div className="h-48 overflow-y-auto border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ borderColor }}>
                  {products.map((p) => {
                    const checked = assignForm.productIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 cursor-pointer"
                        style={{ backgroundColor: inputBg, borderColor }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProductSelection(p.id)}
                        />
                        <span className="flex-1">
                          <span className="font-semibold" style={{ color: textColor }}>{p.name}</span>
                          <span className="block text-xs" style={{ color: mutedColor }}>{p.category_name}</span>
                        </span>
                        <span className="text-xs" style={{ color: mutedColor }}>¥{p.selling_price.toLocaleString()}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full md:w-auto font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                style={{ backgroundColor: textColor, color: bgColor }}
              >
                まとめて追加
              </button>
            </div>
          </form>
        </section>

        {/* カテゴリー・商品管理 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>カテゴリー一覧</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left uppercase tracking-wider" style={{ borderColor, color: mutedColor }}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">名前</th>
                    <th className="px-4 py-3">説明</th>
                    <th className="px-4 py-3">表示順</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-t transition" style={{ borderColor }}>
                      <td className="px-4 py-3" style={{ color: textColor }}>{cat.id}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: textColor }}>{cat.name}</td>
                      <td className="px-4 py-3" style={{ color: mutedColor }}>{cat.description}</td>
                      <td className="px-4 py-3" style={{ color: mutedColor }}>{cat.display_order}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
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
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>新規カテゴリー追加</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                  カテゴリー名 <span style={{ color: '#ff3b30' }}>*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                  placeholder="例: ドリンク"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>説明</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all resize-none"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                  rows={3}
                  placeholder="カテゴリーの補足説明"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>表示順</label>
                <input
                  type="number"
                  value={categoryForm.display_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                />
              </div>
              <button
                type="submit"
                className="w-full font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                style={{ backgroundColor: textColor, color: bgColor }}
              >
                カテゴリーを追加
              </button>
            </form>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>商品一覧</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left uppercase tracking-wider" style={{ borderColor, color: mutedColor }}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">商品名</th>
                    <th className="px-4 py-3">カテゴリー</th>
                    <th className="px-4 py-3">売価</th>
                    <th className="px-4 py-3">原価</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t transition" style={{ borderColor }}>
                      <td className="px-4 py-3" style={{ color: textColor }}>{p.id}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: textColor }}>{p.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs border" style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa', borderColor }}>
                          {p.category_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: textColor }}>¥{p.selling_price.toLocaleString()}</td>
                      <td className="px-4 py-3" style={{ color: mutedColor }}>¥{p.cost_price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
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
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>新規商品追加</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                  カテゴリー <span style={{ color: '#ff3b30' }}>*</span>
                </label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                >
                  <option value="">選択してください</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                  商品名 <span style={{ color: '#ff3b30' }}>*</span>
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                  placeholder="例: アイスコーヒー"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                    売価(円) <span style={{ color: '#ff3b30' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.selling_price}
                    onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all"
                    style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                    原価(円) <span style={{ color: '#ff3b30' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.cost_price}
                    onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all"
                    style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                    placeholder="200"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                style={{ backgroundColor: textColor, color: bgColor }}
              >
                商品を追加
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
