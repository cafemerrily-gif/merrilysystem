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
            <h2 className="text-xl font