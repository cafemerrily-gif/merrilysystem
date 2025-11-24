'use client';

import { useState, useEffect } from 'react';
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

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    display_order: 0,
  });

  const [productForm, setProductForm] = useState({
    category_id: '',
    name: '',
    selling_price: '',
    cost_price: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('カテゴリー取得エラー:', error);
      alert('カテゴリーの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('商品取得エラー:', error);
      alert('商品の取得に失敗しました');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert('カテゴリー名を入力してください');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        alert('カテゴリーを追加しました');
        setCategoryForm({ name: '', description: '', display_order: 0 });
        fetchCategories();
      } else {
        const error = await res.json();
        alert(`エラー: ${error.error}`);
      }
    } catch (error) {
      console.error('カテゴリー追加エラー:', error);
      alert('カテゴリーの追加に失敗しました');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.category_id) {
      alert('必須項目を入力してください');
      return;
    }

    try {
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
        alert('商品を追加しました');
        setProductForm({ category_id: '', name: '', selling_price: '', cost_price: '' });
        fetchProducts();
      } else {
        const error = await res.json();
        alert(`エラー: ${error.error}`);
      }
    } catch (error) {
      console.error('商品追加エラー:', error);
      alert('商品の追加に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-4"></div>
          <div className="text-xl text-muted-foreground">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <span className="text-2xl" aria-hidden>
                🍽
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">メニュー管理</h1>
              <p className="text-sm text-muted-foreground">商品カテゴリと商品リストの編集</p>
            </div>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-card border border-border hover:border-accent hover:shadow-lg rounded-xl transition-all duration-200 flex items-center gap-2 text-foreground"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームへ戻る
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
            <h2 className="text-2xl font-bold">カテゴリー管理</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                カテゴリー一覧
              </h3>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">名前</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">説明</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">表示順</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4 text-sm text-foreground">{cat.id}</td>
                        <td className="px-4 py-4 text-sm font-medium">{cat.name}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{cat.description}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{cat.display_order}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新規カテゴリー追加
              </h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    カテゴリー名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="例: ドリンク"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">説明</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="カテゴリーの補足説明"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">表示順</label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  カテゴリーを追加
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full"></div>
            <h2 className="text-2xl font-bold">商品管理</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                商品一覧
              </h3>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">商品名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">カテゴリー</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">売価</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">原価</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">粗利率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map((product) => {
                      const profitRate = ((product.selling_price - product.cost_price) / product.selling_price) * 100;
                      return (
                        <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-4 text-sm text-foreground">{product.id}</td>
                          <td className="px-4 py-4 text-sm font-medium">{product.name}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium border border-accent/30">
                              {product.category_name}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-foreground">\{product.selling_price.toLocaleString()}</td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">\{product.cost_price.toLocaleString()}</td>
                          <td className="px-4 py-4 text-sm text-green-500 font-semibold">{profitRate.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    カテゴリー <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    商品名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    placeholder="例: アイスコーヒー"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    売価(円) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.selling_price}
                    onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    原価(円) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.cost_price}
                    onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    placeholder="200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent to-primary text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  商品を追加
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
