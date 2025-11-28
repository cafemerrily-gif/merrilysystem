'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type BlogPost = {
  id: string;
  title: string;
  body: string;
  date: string;
  images?: string[];
  author?: string;
};

export default function BlogsPage() {
  const supabase = createClientComponentClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 編集中のポスト
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // 初期読み込み
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pr/website', { cache: 'no-store' });
      const data = await res.json();
      
      if (data?.blogPosts) {
        const sorted = data.blogPosts
          .slice()
          .map((p: any) => ({
            ...p,
            images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
            author: p.author || '',
          }))
          .sort((a: any, b: any) => (a.date > b.date ? -1 : 1));
        setPosts(sorted);
      }
    } catch (e: any) {
      setError(e?.message || 'ブログの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingPost(null);
    setTitle('');
    setBody('');
    setAuthor('');
    setDate(new Date().toISOString().split('T')[0]);
    setImages([]);
    setNewImageUrl('');
    setError(null);
    setMessage(null);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setBody(post.body);
    setAuthor(post.author || '');
    setDate(post.date);
    setImages(post.images || []);
    setNewImageUrl('');
    setError(null);
    setMessage(null);
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    console.log('📤 画像アップロード開始:', file.name, file.type, file.size);
    
    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください');
      return;
    }
    
    // ファイルタイプチェック
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('PNG、JPEG、WebP形式の画像のみアップロード可能です');
      return;
    }
    
    setUploadingImage(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📡 API呼び出し: /api/upload');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log('📥 レスポンス:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ エラー:', errorData);
        throw new Error(errorData.error || 'アップロードに失敗しました');
      }
      
      const data = await response.json();
      console.log('✅ アップロード成功:', data);
      
      if (!data.url) {
        throw new Error('URLが返されませんでした');
      }
      
      // アップロードした画像を追加
      setImages([...images, data.url]);
      setMessage('画像をアップロードしました: ' + data.fileName);
    } catch (e: any) {
      console.error('❌ アップロードエラー:', e);
      setError(e?.message || 'アップロードに失敗しました');
    } finally {
      setUploadingImage(false);
      // ファイル選択をリセット
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) {
      setError('タイトルと本文は必須です');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const newPost: BlogPost = {
        id: editingPost?.id || `post-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        author: author.trim() || 'ブログ',
        date: date || new Date().toISOString().split('T')[0],
        images: images.filter(url => url.trim()),
      };

      let updatedPosts: BlogPost[];
      if (editingPost) {
        // 更新
        updatedPosts = posts.map(p => p.id === editingPost.id ? newPost : p);
      } else {
        // 新規追加
        updatedPosts = [newPost, ...posts];
      }

      // APIに保存
      const res = await fetch('/api/pr/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogPosts: updatedPosts,
        }),
      });

      if (!res.ok) {
        throw new Error('保存に失敗しました');
      }

      setPosts(updatedPosts);
      setMessage(editingPost ? 'ブログを更新しました' : 'ブログを追加しました');
      handleNew();
    } catch (e: any) {
      setError(e?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このブログ記事を削除しますか？')) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const updatedPosts = posts.filter(p => p.id !== id);

      const res = await fetch('/api/pr/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogPosts: updatedPosts,
        }),
      });

      if (!res.ok) {
        throw new Error('削除に失敗しました');
      }

      setPosts(updatedPosts);
      setMessage('ブログを削除しました');
      if (editingPost?.id === id) {
        handleNew();
      }
    } catch (e: any) {
      setError(e?.message || '削除に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ブログ管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ホームページに表示されるブログ記事を管理
            </p>
          </div>
          <Link
            href="/dashboard/pr/menu"
            className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition"
          >
            ← 広報部メニュー
          </Link>
        </div>

        {/* メッセージ */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500 text-green-500">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側: 編集フォーム */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingPost ? 'ブログを編集' : '新規ブログ'}
              </h2>
              {editingPost && (
                <button
                  onClick={handleNew}
                  className="text-sm px-3 py-1 rounded-lg border border-border hover:bg-muted transition"
                >
                  新規作成
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* タイトル */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="ブログのタイトル"
                />
              </div>

              {/* 本文 */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  本文 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[200px]"
                  placeholder="ブログの本文"
                />
              </div>

              {/* 著者 */}
              <div>
                <label className="text-sm font-medium block mb-1">著者</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="著者名（省略可）"
                />
              </div>

              {/* 日付 */}
              <div>
                <label className="text-sm font-medium block mb-1">投稿日</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              {/* 画像 */}
              <div>
                <label className="text-sm font-medium block mb-1">画像</label>
                
                {/* デバイスからアップロード */}
                <div className="mb-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>アップロード中...</span>
                      </>
                    ) : (
                      <>
                        <span>📁</span>
                        <span>デバイスから画像を選択</span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPEG, WebP（最大5MB）</p>
                </div>

                {/* URLで追加 */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="または画像URLを入力"
                  />
                  <button
                    onClick={handleAddImage}
                    className="px-4 py-2 rounded-lg border border-accent bg-accent/10 text-accent hover:bg-accent/20 transition"
                  >
                    追加
                  </button>
                </div>

                {/* 画像一覧 */}
                {images.length > 0 && (
                  <div className="space-y-2">
                    {images.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={url}
                            alt={`Image ${idx + 1}`}
                            width={64}
                            height={64}
                            className="rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.png';
                            }}
                          />
                        </div>
                        <span className="flex-1 text-xs truncate">{url}</span>
                        <button
                          onClick={() => handleRemoveImage(idx)}
                          className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 保存ボタン */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition disabled:opacity-50"
                >
                  {saving ? '保存中...' : editingPost ? '更新' : '追加'}
                </button>
                {editingPost && (
                  <button
                    onClick={() => handleDelete(editingPost.id)}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition disabled:opacity-50"
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右側: ブログ一覧 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">ブログ一覧</h2>
            
            {loading ? (
              <p className="text-muted-foreground">読み込み中...</p>
            ) : posts.length === 0 ? (
              <p className="text-muted-foreground">ブログ記事はまだありません</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      editingPost?.id === post.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    }`}
                    onClick={() => handleEdit(post)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm">{post.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {post.body}
                    </p>
                    {post.images && post.images.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {post.images.map((url, idx) => (
                          <div key={idx} className="relative w-12 h-12">
                            <Image
                              src={url}
                              alt={`${post.title} - Image ${idx + 1}`}
                              width={48}
                              height={48}
                              className="rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.png';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {post.author && (
                      <p className="text-xs text-muted-foreground mt-2">
                        投稿者: {post.author}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
