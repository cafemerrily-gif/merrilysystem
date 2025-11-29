'use client';

import { useState, useEffect } from 'react';

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
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">メニュー管理</h1>

      {/* タブ */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          商品
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium ${activeTab === 'categories' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          カテゴリ
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-4 py-2 font-medium ${activeTab === 'collections' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              + 商品追加
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-2 text-left">商品名</th>
                  <th className="border p-2 text-left">カテゴリ</th>
                  <th className="border p-2 text-left">フォルダ</th>
                  <th className="border p-2 text-right">原価</th>
                  <th className="border p-2 text-right">売価</th>
                  <th className="border p-2 text-right">原価率</th>
                  <th className="border p-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="border p-2">{product.name}</td>
                    <td className="border p-2">{getCategoryName(product.category_id)}</td>
                    <td className="border p-2">{getCollectionName(product.collection_id)}</td>
                    <td className="border p-2 text-right">¥{product.cost_price?.toLocaleString() || 0}</td>
                    <td className="border p-2 text-right">¥{product.selling_price?.toLocaleString() || 0}</td>
                    <td className="border p-2 text-right">{calcCostRate(product.cost_price, product.selling_price)}%</td>
                    <td className="border p-2 text-center">
                      <button onClick={() => openProductEdit(product)} className="text-blue-500 hover:underline mr-2">編集</button>
                      <button onClick={() => handleProductDelete(product.id)} className="text-red-500 hover:underline">削除</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={7} className="border p-4 text-center text-gray-500">商品がありません</td></tr>
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              + カテゴリ追加
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-2 text-left">カテゴリ名</th>
                  <th className="border p-2 text-left">説明</th>
                  <th className="border p-2 text-center">表示順</th>
                  <th className="border p-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="border p-2">{category.name}</td>
                    <td className="border p-2">{category.description || '-'}</td>
                    <td className="border p-2 text-center">{category.display_order}</td>
                    <td className="border p-2 text-center">
                      <button onClick={() => openCategoryEdit(category)} className="text-blue-500 hover:underline mr-2">編集</button>
                      <button onClick={() => handleCategoryDelete(category.id)} className="text-red-500 hover:underline">削除</button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={4} className="border p-4 text-center text-gray-500">カテゴリがありません</td></tr>
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              + フォルダ追加
            </button>
          </div>

          <div className="space-y-4">
            {collections.map(collection => (
              <div key={collection.id} className="bg-white shadow rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{collection.name}</h3>
                    {collection.description && <p className="text-gray-500 text-sm">{collection.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openCollectionEdit(collection)} className="text-blue-500 hover:underline text-sm">編集</button>
                    <button onClick={() => handleCollectionDelete(collection.id)} className="text-red-500 hover:underline text-sm">削除</button>
                  </div>
                </div>

                <div className="flex gap-4 text-sm mb-3">
                  <span className="text-gray-600">
                    販売期間: {collection.start_date || '未設定'} ～ {collection.end_date || '未設定'}
                  </span>
                  <span className="text-gray-600">表示順: {collection.display_order}</span>
                </div>

                {collection.products && collection.products.length > 0 ? (
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-sm text-gray-600 mb-1">含まれる商品:</p>
                    <div className="flex flex-wrap gap-2">
                      {collection.products.map(product => (
                        <span key={product.id} className="bg-white px-2 py-1 rounded text-sm border">
                          {product.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">商品がありません</p>
                )}
              </div>
            ))}
            {collections.length === 0 && (
              <p className="text-center text-gray-500 py-8">商品フォルダがありません</p>
            )}
          </div>
        </div>
      )}

      {/* 商品モーダル */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{editingProduct ? '商品編集' : '商品追加'}</h3>
            <form onSubmit={handleProductSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">商品名 *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">カテゴリ</label>
                  <select
                    value={productForm.category_id}
                    onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full border rounded p-2"
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
                    className="w-full border rounded p-2"
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
                      className="w-full border rounded p-2"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">販売価格</label>
                    <input
                      type="number"
                      value={productForm.selling_price}
                      onChange={e => setProductForm({ ...productForm, selling_price: e.target.value })}
                      className="w-full border rounded p-2"
                      min="0"
                    />
                  </div>
                </div>
                {productForm.cost_price && productForm.selling_price && (
                  <p className="text-sm text-gray-500">
                    原価率: {calcCostRate(Number(productForm.cost_price), Number(productForm.selling_price))}%
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{editingCategory ? 'カテゴリ編集' : 'カテゴリ追加'}</h3>
            <form onSubmit={handleCategorySubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">カテゴリ名 *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">説明</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full border rounded p-2"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">表示順</label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={e => setCategoryForm({ ...categoryForm, display_order: e.target.value })}
                    className="w-full border rounded p-2"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{editingCollection ? 'フォルダ編集' : 'フォルダ追加'}</h3>
            <form onSubmit={handleCollectionSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">フォルダ名 *</label>
                  <input
                    type="text"
                    value={collectionForm.name}
                    onChange={e => setCollectionForm({ ...collectionForm, name: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">説明</label>
                  <textarea
                    value={collectionForm.description}
                    onChange={e => setCollectionForm({ ...collectionForm, description: e.target.value })}
                    className="w-full border rounded p-2"
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
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">販売終了日</label>
                    <input
                      type="date"
                      value={collectionForm.end_date}
                      onChange={e => setCollectionForm({ ...collectionForm, end_date: e.target.value })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">表示順</label>
                  <input
                    type="number"
                    value={collectionForm.display_order}
                    onChange={e => setCollectionForm({ ...collectionForm, display_order: e.target.value })}
                    className="w-full border rounded p-2"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCollectionModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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
