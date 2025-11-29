'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Category = {
  id: number;
  name: string;
  description?: string;
  display_order: number;
};

type Product = {
  id: number;
  name: string;
  category_id: number;
  cost_price: number;
  selling_price: number;
  image_url?: string;
  collection_id?: number;
};

type ProductCollection = {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  start_date?: string;
  end_date?: string;
  products?: Product[];
};

export default function MenuManagementPage() {
  // テーマ
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const stored = window.localStorage.getItem('ui-is-dark');
    
    const currentIsDark = isMobile ? media.matches : (stored === 'true' ? true : stored === 'false' ? false : media.matches);
    setIsDark(currentIsDark);
    
    document.documentElement.classList.toggle('dark', currentIsDark);
    document.body.style.backgroundColor = currentIsDark ? '#000000' : '#ffffff';

    if (!isMobile) {
      const listener = (e: MediaQueryListEvent) => {
        if (window.localStorage.getItem('ui-is-dark') === null) {
          setIsDark(e.matches);
          document.documentElement.classList.toggle('dark', e.matches);
          document.body.style.backgroundColor = e.matches ? '#000000' : '#ffffff';
        }
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      const listener = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
        document.body.style.backgroundColor = e.matches ? '#000000' : '#ffffff';
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    window.localStorage.setItem('ui-is-dark', String(newIsDark));
    document.documentElement.classList.toggle('dark', newIsDark);
    document.body.style.backgroundColor = newIsDark ? '#000000' : '#ffffff';
  };

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const cardBg = isDark ? '#121212' : '#fafafa';
  const inputBg = isDark ? '#1a1a1a' : '#ffffff';

  // タブ管理
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'collections'>('products');

  // データ
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<ProductCollection[]>([]);

  // ローディング
  const [loading, setLoading] = useState(false);

  // モーダル
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // 編集対象
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCollection, setEditingCollection] = useState<ProductCollection | null>(null);

  // フォーム
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    cost_price: '',
    selling_price: '',
    collection_id: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    display_order: '0'
  });

  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: '',
    display_order: '0',
    start_date: '',
    end_date: ''
  });

  // データ取得
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchCollections();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('カテゴリ取得エラー:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('商品取得エラー:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/product-collections?include_products=true');
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('商品フォルダ取得エラー:', error);
    }
  };

  // 商品追加・編集
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: productForm.name,
        category_id: productForm.category_id ? Number(productForm.category_id) : null,
        cost_price: Number(productForm.cost_price) || 0,
        selling_price: Number(productForm.selling_price) || 0,
        collection_id: productForm.collection_id ? Number(productForm.collection_id) : null
      };

      if (editingProduct) {
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload })
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', category_id: '', cost_price: '', selling_price: '', collection_id: '' });
      fetchProducts();
    } catch (error) {
      console.error('商品保存エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductDelete = async (id: number) => {
    if (!confirm('この商品を削除しますか？')) return;

    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error('商品削除エラー:', error);
    }
  };

  // カテゴリ追加・編集
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: categoryForm.name,
        description: categoryForm.description,
        display_order: Number(categoryForm.display_order) || 0
      };

      if (editingCategory) {
        await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCategory.id, ...payload })
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', display_order: '0' });
      fetchCategories();
    } catch (error) {
      console.error('カテゴリ保存エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDelete = async (id: number) => {
    if (!confirm('このカテゴリを削除しますか？')) return;

    try {
      await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (error) {
      console.error('カテゴリ削除エラー:', error);
    }
  };

  // 商品フォルダ追加・編集
  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: collectionForm.name,
        description: collectionForm.description,
        display_order: Number(collectionForm.display_order) || 0,
        start_date: collectionForm.start_date || null,
        end_date: collectionForm.end_date || null
      };

      if (editingCollection) {
        await fetch('/api/product-collections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCollection.id, ...payload })
        });
      } else {
        await fetch('/api/product-collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setShowCollectionModal(false);
      setEditingCollection(null);
      setCollectionForm({ name: '', description: '', display_order: '0', start_date: '', end_date: '' });
      fetchCollections();
    } catch (error) {
      console.error('商品フォルダ保存エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionDelete = async (id: number) => {
    if (!confirm('この商品フォルダを削除しますか？')) return;

    try {
      await fetch(`/api/product-collections?id=${id}`, { method: 'DELETE' });
      fetchCollections();
    } catch (error) {
      console.error('商品フォルダ削除エラー:', error);
    }
  };

  // 編集モーダルを開く
  const openProductEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category_id: product.category_id?.toString() || '',
      cost_price: product.cost_price?.toString() || '',
      selling_price: product.selling_price?.toString() || '',
      collection_id: product.collection_id?.toString() || ''
    });
    setShowProductModal(true);
  };

  const openCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      display_order: category.display_order?.toString() || '0'
    });
    setShowCategoryModal(true);
  };

  const openCollectionEdit = (collection: ProductCollection) => {
    setEditingCollection(collection);
    setCollectionForm({
      name: collection.name,
      description: collection.description || '',
      display_order: collection.display_order?.toString() || '0',
      start_date: collection.start_date || '',
      end_date: collection.end_date || ''
    });
    setShowCollectionModal(true);
  };

  // 原価率計算
  const calcCostRate = (cost: number, price: number) => {
    if (price <= 0) return 0;
    return Math.round((cost / price) * 100 * 10) / 10;
  };

  // カテゴリ名取得
  const getCategoryName = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || '未分類';
  };

  // コレクション名取得
  const getCollectionName = (collectionId: number | undefined) => {
    if (!collectionId) return '-';
    const col = collections.find(c => c.id === collectionId);
    return col?.name || '-';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* 上部ナビゲーション (PC) */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b z-50 hidden md:block" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/dev/menu" className="p-2">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isDark ? '/white.png' : '/black.png'}
              alt="Logo"
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard/accounting" className="flex items-center gap-2 hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className="text-sm">会計部</span>
            </Link>
            <Link href="/dashboard/dev/menu" className="flex items-center gap-2 hover:opacity-70">
              <svg className="w-6 h-6" fill={textColor} stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-semibold">開発部</span>
            </Link>
            <Link href="/dashboard/pr/menu" className="flex items-center gap-2 hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
              <span className="text-sm">広報部</span>
            </Link>
            <Link href="/dashboard/staff" className="flex items-center gap-2 hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="text-sm">スタッフ</span>
            </Link>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:opacity-70">
              {isDark ? (
                <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <Link href="/account" className="p-2 rounded-lg hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="pt-20 pb-24 md:pb-8 px-4 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">メニュー管理</h1>

        {/* タブ */}
        <div className="flex border-b mb-6" style={{ borderColor }}>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium transition-all ${activeTab === 'products' ? 'border-b-2' : 'opacity-50'}`}
            style={{ borderColor: activeTab === 'products' ? textColor : 'transparent' }}
          >
            商品
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 font-medium transition-all ${activeTab === 'categories' ? 'border-b-2' : 'opacity-50'}`}
            style={{ borderColor: activeTab === 'categories' ? textColor : 'transparent' }}
          >
            カテゴリ
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-4 py-2 font-medium transition-all ${activeTab === 'collections' ? 'border-b-2' : 'opacity-50'}`}
            style={{ borderColor: activeTab === 'collections' ? textColor : 'transparent' }}
          >
            商品フォルダ
          </button>
        </div>

        {/* 商品タブ */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">商品一覧</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', category_id: '', cost_price: '', selling_price: '', collection_id: '' });
                  setShowProductModal(true);
                }}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{ backgroundColor: textColor, color: bgColor }}
              >
                + 商品追加
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${borderColor}` }}>
              <table className="w-full">
                <thead style={{ backgroundColor: cardBg }}>
                  <tr>
                    <th className="p-3 text-left border-b" style={{ borderColor }}>商品名</th>
                    <th className="p-3 text-left border-b" style={{ borderColor }}>カテゴリ</th>
                    <th className="p-3 text-left border-b" style={{ borderColor }}>フォルダ</th>
                    <th className="p-3 text-right border-b" style={{ borderColor }}>原価</th>
                    <th className="p-3 text-right border-b" style={{ borderColor }}>売価</th>
                    <th className="p-3 text-right border-b" style={{ borderColor }}>原価率</th>
                    <th className="p-3 text-center border-b" style={{ borderColor }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="hover:opacity-80">
                      <td className="p-3 border-b" style={{ borderColor }}>{product.name}</td>
                      <td className="p-3 border-b" style={{ borderColor }}>{getCategoryName(product.category_id)}</td>
                      <td className="p-3 border-b" style={{ borderColor }}>{getCollectionName(product.collection_id)}</td>
                      <td className="p-3 text-right border-b" style={{ borderColor }}>¥{product.cost_price?.toLocaleString() || 0}</td>
                      <td className="p-3 text-right border-b" style={{ borderColor }}>¥{product.selling_price?.toLocaleString() || 0}</td>
                      <td className="p-3 text-right border-b" style={{ borderColor }}>{calcCostRate(product.cost_price, product.selling_price)}%</td>
                      <td className="p-3 text-center border-b" style={{ borderColor }}>
                        <button onClick={() => openProductEdit(product)} className="text-blue-500 hover:underline mr-2">編集</button>
                        <button onClick={() => handleProductDelete(product.id)} className="text-red-500 hover:underline">削除</button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center opacity-50">商品がありません</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* カテゴリタブ */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">カテゴリ一覧</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', description: '', display_order: '0' });
                  setShowCategoryModal(true);
                }}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{ backgroundColor: textColor, color: bgColor }}
              >
                + カテゴリ追加
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${borderColor}` }}>
              <table className="w-full">
                <thead style={{ backgroundColor: cardBg }}>
                  <tr>
                    <th className="p-3 text-left border-b" style={{ borderColor }}>カテゴリ名</th>
                    <th className="p-3 text-left border-b" style={{ borderColor }}>説明</th>
                    <th className="p-3 text-center border-b" style={{ borderColor }}>表示順</th>
                    <th className="p-3 text-center border-b" style={{ borderColor }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id} className="hover:opacity-80">
                      <td className="p-3 border-b" style={{ borderColor }}>{category.name}</td>
                      <td className="p-3 border-b" style={{ borderColor }}>{category.description || '-'}</td>
                      <td className="p-3 text-center border-b" style={{ borderColor }}>{category.display_order}</td>
                      <td className="p-3 text-center border-b" style={{ borderColor }}>
                        <button onClick={() => openCategoryEdit(category)} className="text-blue-500 hover:underline mr-2">編集</button>
                        <button onClick={() => handleCategoryDelete(category.id)} className="text-red-500 hover:underline">削除</button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center opacity-50">カテゴリがありません</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 商品フォルダタブ */}
        {activeTab === 'collections' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">商品フォルダ一覧</h2>
              <button
                onClick={() => {
                  setEditingCollection(null);
                  setCollectionForm({ name: '', description: '', display_order: '0', start_date: '', end_date: '' });
                  setShowCollectionModal(true);
                }}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{ backgroundColor: textColor, color: bgColor }}
              >
                + フォルダ追加
              </button>
            </div>

            <div className="space-y-4">
              {collections.map(collection => (
                <div key={collection.id} className="rounded-lg p-4" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{collection.name}</h3>
                      {collection.description && <p className="opacity-60 text-sm">{collection.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openCollectionEdit(collection)} className="text-blue-500 hover:underline text-sm">編集</button>
                      <button onClick={() => handleCollectionDelete(collection.id)} className="text-red-500 hover:underline text-sm">削除</button>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm mb-3 opacity-70">
                    <span>販売期間: {collection.start_date || '未設定'} ～ {collection.end_date || '未設定'}</span>
                    <span>表示順: {collection.display_order}</span>
                  </div>

                  {collection.products && collection.products.length > 0 ? (
                    <div className="rounded-lg p-2" style={{ backgroundColor: bgColor }}>
                      <p className="text-sm opacity-60 mb-1">含まれる商品:</p>
                      <div className="flex flex-wrap gap-2">
                        {collection.products.map(product => (
                          <span key={product.id} className="px-2 py-1 rounded text-sm" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                            {product.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm opacity-40">商品がありません</p>
                  )}
                </div>
              ))}
              {collections.length === 0 && (
                <p className="text-center opacity-50 py-8">商品フォルダがありません</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 下部ナビゲーション (モバイル) */}
      <nav className="fixed bottom-0 left-0 right-0 border-t z-40 md:hidden" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-5 h-16">
            <Link href="/dashboard/accounting" className="flex flex-col items-center justify-center gap-1">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className="text-xs">会計部</span>
            </Link>
            <Link href="/dashboard/dev/menu" className="flex flex-col items-center justify-center gap-1">
              <svg className="w-6 h-6" fill={textColor} stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-semibold">開発部</span>
            </Link>
            <Link href="/dashboard/pr/menu" className="flex flex-col items-center justify-center gap-1">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
              <span className="text-xs">広報部</span>
            </Link>
            <Link href="/dashboard/staff" className="flex flex-col items-center justify-center gap-1">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="text-xs">スタッフ</span>
            </Link>
            <Link href="/account" className="flex flex-col items-center justify-center gap-1">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">設定</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 商品モーダル */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-6 w-full max-w-md" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
            <h3 className="text-lg font-semibold mb-4">{editingProduct ? '商品編集' : '商品追加'}</h3>
            <form onSubmit={handleProductSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">商品名 *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">カテゴリ</label>
                  <select
                    value={productForm.category_id}
                    onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                  >
                    <option value="">選択してください</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">商品フォルダ</label>
                  <select
                    value={productForm.collection_id}
                    onChange={e => setProductForm({ ...productForm, collection_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                  >
                    <option value="">選択してください</option>
                    {collections.map(col => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">原価</label>
                    <input
                      type="number"
                      value={productForm.cost_price}
                      onChange={e => setProductForm({ ...productForm, cost_price: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">販売価格</label>
                    <input
                      type="number"
                      value={productForm.selling_price}
                      onChange={e => setProductForm({ ...productForm, selling_price: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                      min="0"
                    />
                  </div>
                </div>
                {productForm.cost_price && productForm.selling_price && (
                  <p className="text-sm opacity-60">
                    原価率: {calcCostRate(Number(productForm.cost_price), Number(productForm.selling_price))}%
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-lg"
                  style={{ border: `1px solid ${borderColor}` }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  style={{ backgroundColor: textColor, color: bgColor }}
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* カテゴリモーダル */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-6 w-full max-w-md" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
            <h3 className="text-lg font-semibold mb-4">{editingCategory ? 'カテゴリ編集' : 'カテゴリ追加'}</h3>
            <form onSubmit={handleCategorySubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">カテゴリ名 *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">説明</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">表示順</label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={e => setCategoryForm({ ...categoryForm, display_order: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-lg"
                  style={{ border: `1px solid ${borderColor}` }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  style={{ backgroundColor: textColor, color: bgColor }}
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 商品フォルダモーダル */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-6 w-full max-w-md" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
            <h3 className="text-lg font-semibold mb-4">{editingCollection ? 'フォルダ編集' : 'フォルダ追加'}</h3>
            <form onSubmit={handleCollectionSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">フォルダ名 *</label>
                  <input
                    type="text"
                    value={collectionForm.name}
                    onChange={e => setCollectionForm({ ...collectionForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">説明</label>
                  <textarea
                    value={collectionForm.description}
                    onChange={e => setCollectionForm({ ...collectionForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">販売開始日</label>
                    <input
                      type="date"
                      value={collectionForm.start_date}
                      onChange={e => setCollectionForm({ ...collectionForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">販売終了日</label>
                    <input
                      type="date"
                      value={collectionForm.end_date}
                      onChange={e => setCollectionForm({ ...collectionForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">表示順</label>
                  <input
                    type="number"
                    value={collectionForm.display_order}
                    onChange={e => setCollectionForm({ ...collectionForm, display_order: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCollectionModal(false)}
                  className="px-4 py-2 rounded-lg"
                  style={{ border: `1px solid ${borderColor}` }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  style={{ backgroundColor: textColor, color: bgColor }}
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
