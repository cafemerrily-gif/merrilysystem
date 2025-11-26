'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUiTheme } from '@/hooks/useUiTheme';

type BlogPost = {
  id: string;
  title: string;
  body: string;
  date: string;
  images: string[];
  author?: string;
};

type Blog = { id: string; name: string; posts: BlogPost[] };

export default function PrBlogsEditor() {
  useUiTheme();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeBlogId, setActiveBlogId] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>({});

  const activeBlog = useMemo(() => blogs.find((b) => b.id === activeBlogId) || blogs[0], [blogs, activeBlogId]);

  const logClientActivity = async (message: string) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: userName || null, message }),
      });
    } catch (err) {
      console.error('ログ記録失敗', err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const userRes = await supabase.auth.getUser();
        const meta = userRes.data.user?.user_metadata;
        if (meta?.full_name) setUserName(meta.full_name);

        const res = await fetch('/api/pr/website', { cache: 'no-store' });
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (data) {
          setPayload(data);
          if (Array.isArray(data.blogs) && data.blogs.length > 0) {
            const normalized = data.blogs.map((blog: any, idx: number) => ({
              id: blog.id || `blog-${idx + 1}`,
              name: blog.name || `ブログ${idx + 1}`,
              posts: (blog.posts ?? []).map((p: any, pIdx: number) => ({
                id: p.id || `post-${pIdx + 1}`,
                title: p.title || 'タイトル未設定',
                body: p.body || '',
                date: p.date || new Date().toISOString().slice(0, 10),
                images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
                author: p.author || p.updated_by || meta?.full_name || '',
              })),
            }));
            setBlogs(normalized);
            setActiveBlogId(normalized[0]?.id ?? null);
          } else {
            const fallbackPosts: BlogPost[] = (data.blogPosts ?? []).map((p: any, idx: number) => ({
              id: p.id || `post-${idx + 1}`,
              title: p.title || 'タイトル未設定',
              body: p.body || '',
              date: p.date || new Date().toISOString().slice(0, 10),
              images: p.image ? [p.image] : [],
              author: p.author || meta?.full_name || '',
            }));
            const defaultBlog: Blog = { id: 'blog-1', name: '既存ブログ', posts: fallbackPosts };
            setBlogs([defaultBlog]);
            setActiveBlogId('blog-1');
          }
        }
      } catch (e: any) {
        setError(e?.message || 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const addBlog = () => {
    const id = `blog-${blogs.length + 1}`;
    const next = [...blogs, { id, name: `新規ブログ ${blogs.length + 1}`, posts: [] }];
    setBlogs(next);
    setActiveBlogId(id);
  };

  const removeBlog = (id: string) => {
    const next = blogs.filter((b) => b.id !== id);
    setBlogs(next);
    if (activeBlogId === id) {
      setActiveBlogId(next[0]?.id ?? null);
    }
  };

  const updateBlogName = (id: string, name: string) => {
    setBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b)));
  };

  const addBlogPost = () => {
    if (!activeBlog) return;
    const id = `p-${activeBlog.posts.length + 1}-${Date.now()}`;
    const nextPosts = [
      ...activeBlog.posts,
      {
        id,
        title: '新しい記事',
        body: '',
        date: new Date().toISOString().slice(0, 10),
        images: [],
        author: userName || 'unknown',
      },
    ];
    setBlogs((prev) => prev.map((b) => (b.id === activeBlog.id ? { ...b, posts: nextPosts } : b)));
  };

  const updateBlogPost = (postId: string, field: keyof BlogPost, value: any) => {
    if (!activeBlog) return;
    const nextPosts = activeBlog.posts.map((p) => (p.id === postId ? { ...p, [field]: value } : p));
    setBlogs((prev) => prev.map((b) => (b.id === activeBlog.id ? { ...b, posts: nextPosts } : b)));
  };

  const removeBlogPost = (postId: string) => {
    if (!activeBlog) return;
    const nextPosts = activeBlog.posts.filter((p) => p.id !== postId);
    setBlogs((prev) => prev.map((b) => (b.id === activeBlog.id ? { ...b, posts: nextPosts } : b)));
  };

  const removeImage = (postId: string, idx: number) => {
    if (!activeBlog) return;
    const nextPosts = activeBlog.posts.map((p) =>
      p.id === postId ? { ...p, images: p.images.filter((_, i) => i !== idx) } : p
    );
    setBlogs((prev) => prev.map((b) => (b.id === activeBlog.id ? { ...b, posts: nextPosts } : b)));
  };

  const handleUpload = async (postId: string, files?: FileList | null) => {
    if (!files || files.length === 0 || !activeBlog) return;
    try {
      setUploading(true);
      setError(null);
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `blog-${postId}-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
        urls.push(data.publicUrl);
      }
      const target = activeBlog.posts.find((p) => p.id === postId);
      const nextImages = [...(target?.images ?? []), ...urls];
      updateBlogPost(postId, 'images', nextImages);
      setInfo('画像をアップロードしました（保存で反映）');
    } catch (e: any) {
      setError(e?.message || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
      setTimeout(() => setInfo(null), 3000);
    }
  };

  const handleSave = async () => {
    if (saving || cooldown) return;
    setSaving(true);
    setCooldown(true);
    setError(null);
    setInfo(null);
    try {
      const flatPosts = blogs
        .flatMap((b) => b.posts)
        .sort((a, b) => (a.date > b.date ? -1 : 1))
        .map((p) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images : [],
          author: p.author || userName || 'unknown',
        }));

      const newPayload = { ...(payload || {}), blogs, blogPosts: flatPosts };
      const res = await fetch('/api/pr/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: newPayload, updated_by: userName || 'unknown' }),
      });
      if (!res.ok) {
        setError(`保存に失敗しました(${res.status})`);
        return;
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (data?.error) {
        setError(data.error);
      } else {
        setInfo('保存しました');
        setPayload(data || {});
        if (data?.blogs) {
          const sortedBlogs = data.blogs.map((b: any, idx: number) => ({
            id: b.id || `blog-${idx + 1}`,
            name: b.name || `ブログ${idx + 1}`,
            posts: (b.posts ?? []).map((p: any, pIdx: number) => ({
              id: p.id || `post-${pIdx + 1}`,
              title: p.title || 'タイトル未設定',
              body: p.body || '',
              date: p.date || new Date().toISOString().slice(0, 10),
              images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
              author: p.author || userName || '',
            })),
          }));
          setBlogs(sortedBlogs);
          setActiveBlogId(sortedBlogs[0]?.id ?? null);
        }
        await logClientActivity('PR: ブログを保存');
      }
    } catch (e: any) {
      setError(e?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
      setTimeout(() => setInfo(null), 3000);
      setTimeout(() => setCooldown(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg text-xl">📰</div>
            <div>
              <h1 className="text-2xl font-bold">広報 ブログ管理</h1>
              <p className="text-sm text-muted-foreground">複数のブログを作成し、記事を管理できます。</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || cooldown}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <Link href="/dashboard/pr/menu" className="px-4 py-2 rounded-xl border border-border bg-card hover:border-accent text-sm">
              広報部へ戻る
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">ブログ一覧</h2>
            <button onClick={addBlog} className="text-xs px-3 py-2 rounded-lg border border-border hover:border-accent">
              ブログを追加
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {blogs.map((b) => (
              <div
                key={b.id}
                className={`rounded-xl border p-3 ${activeBlog?.id === b.id ? 'border-primary' : 'border-border'} bg-muted/30 space-y-2`}
              >
                <input
                  value={b.name}
                  onChange={(e) => updateBlogName(b.id, e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>記事数: {b.posts.length}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveBlogId(b.id)} className="px-2 py-1 rounded-lg border border-border hover:border-accent">
                      編集
                    </button>
                    <button
                      onClick={() => removeBlog(b.id)}
                      className="px-2 py-1 rounded-lg border border-destructive text-destructive hover:border-accent"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeBlog ? (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">編集中: {activeBlog.name}</h2>
              <button onClick={addBlogPost} className="text-xs px-3 py-2 rounded-lg border border-border hover:border-accent">
                記事を追加
              </button>
            </div>

            <div className="space-y-3">
              {activeBlog.posts.map((post) => (
                <div key={post.id} className="border border-border rounded-xl p-4 bg-muted/30 space-y-3">
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <input
                      value={post.title}
                      onChange={(e) => updateBlogPost(post.id, 'title', e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="タイトル"
                    />
                    <input
                      type="date"
                      value={post.date}
                      onChange={(e) => updateBlogPost(post.id, 'date', e.target.value)}
                      className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button onClick={() => removeBlogPost(post.id)} className="text-xs px-3 py-2 rounded-lg border border-border hover:border-accent">
                      削除
                    </button>
                  </div>
                  <input
                    value={post.author || userName}
                    onChange={(e) => updateBlogPost(post.id, 'author', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="執筆者"
                  />
                  <div className="flex flex-wrap gap-2">
                    {(post.images || []).map((url, idx) => (
                      <div key={`${post.id}-img-${idx}`} className="relative">
                        <img src={url} alt={`${post.title}-${idx}`} className="h-20 w-28 object-cover rounded-lg border border-border" />
                        <button
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 text-xs"
                          onClick={() => removeImage(post.id, idx)}
                          aria-label="削除"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-accent">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleUpload(post.id, e.target.files)}
                        disabled={uploading}
                      />
                      <span>画像をアップロード（複数可）</span>
                    </label>
                    {uploading && <span>アップロード中...</span>}
                  </div>
                  <textarea
                    value={post.body}
                    onChange={(e) => updateBlogPost(post.id, 'body', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    rows={4}
                    placeholder="本文"
                  />
                </div>
              ))}
              {activeBlog.posts.length === 0 && <p className="text-muted-foreground text-sm">まだ記事がありません。追加してください。</p>}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg text-muted-foreground">編集対象のブログがありません。</div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold">プレビュー</h2>
          {blogs.map((blog) => (
            <div key={blog.id} className="space-y-2 border border-border rounded-xl p-3 bg-muted/30">
              <h3 className="text-lg font-semibold">{blog.name}</h3>
              <div className="space-y-4">
                {blog.posts
                  .slice()
                  .sort((a, b) => (a.date > b.date ? -1 : 1))
                  .map((post) => (
                    <div key={post.id} className="rounded-lg bg-card border border-border space-y-2 p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
                        <span>{post.author || userName || '不明なユーザー'}</span>
                      </div>
                      <p className="font-semibold text-foreground">{post.title}</p>
                      {(post.images || []).length > 0 && (
                        <div className="space-y-3">
                          {post.images.map((url, idx) => (
                            <img key={`${post.id}-preview-${idx}`} src={url} alt={post.title} className="w-full max-h-[420px] object-contain rounded-lg" />
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed">{post.body}</p>
                    </div>
                  ))}
                {blog.posts.length === 0 && <p className="text-muted-foreground text-sm">この記事はまだありません。</p>}
              </div>
            </div>
          ))}
          {blogs.length === 0 && <p className="text-muted-foreground text-sm">ブログがありません。追加してください。</p>}
        </div>

        {info && <p className="text-green-600 text-sm">{info}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
