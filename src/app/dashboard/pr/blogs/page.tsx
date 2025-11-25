'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type BlogPost = { id: string; title: string; body: string; date: string };

export default function PrBlogsEditor() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [payload, setPayload] = useState<any>({});

  // ログ記録（クライアントから）
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

        const res = await fetch('/api/pr/website');
        const data = await res.json();
        if (data) {
          setPayload(data);
          setBlogPosts(data.blogPosts ?? []);
        }
      } catch (e: any) {
        setError(e?.message || 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addBlogPost = () =>
    setBlogPosts((prev) => [
      ...prev,
      { id: `b-${prev.length + 1}`, title: '新しい記事', body: '', date: new Date().toISOString().slice(0, 10) },
    ]);
  const updateBlogPost = (id: string, field: keyof BlogPost, value: string) =>
    setBlogPosts((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  const removeBlogPost = (id: string) => setBlogPosts((prev) => prev.filter((b) => b.id !== id));

  const handleSave = async () => {
    if (saving || cooldown) return;
    setSaving(true);
    setCooldown(true);
    setError(null);
    setInfo(null);
    try {
      const newPayload = { ...(payload || {}), blogPosts };
      const res = await fetch('/api/pr/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: newPayload, updated_by: userName || 'unknown' }),
      });
      const data = await res.json();
      if (data?.error) {
        setError(data.error);
      } else {
        setInfo('保存しました');
        setPayload(data);
        await logClientActivity('広報: ブログを保存');
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
              <h1 className="text-2xl font-bold">広報部 ブログ編集</h1>
              <p className="text-sm text-muted-foreground">ブログ記事のみを編集・保存します</p>
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
            <Link href="/dashboard/pr" className="px-4 py-2 rounded-xl border border-border bg-card hover:border-accent text-sm">
              広報部トップへ
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">ブログ記事</h2>
            <button onClick={addBlogPost} className="text-xs px-3 py-2 rounded-lg border border-border hover:border-accent">
              記事を追加
            </button>
          </div>

          <div className="space-y-3">
            {blogPosts.map((post) => (
              <div key={post.id} className="border border-border rounded-xl p-4 bg-muted/30 space-y-2">
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
                <textarea
                  value={post.body}
                  onChange={(e) => updateBlogPost(post.id, 'body', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  rows={4}
                  placeholder="本文"
                />
              </div>
            ))}
            {blogPosts.length === 0 && <p className="text-muted-foreground text-sm">まだ記事がありません。追加してください。</p>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold">プレビュー</h2>
          <div className="space-y-3">
            {blogPosts.map((post) => (
              <div key={post.id} className="border border-border rounded-lg p-3 bg-muted/30 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
                  <span>ブログ</span>
                </div>
                <p className="font-semibold text-foreground">{post.title}</p>
                <p className="text-sm text-muted-foreground">{post.body}</p>
              </div>
            ))}
            {blogPosts.length === 0 && <p className="text-muted-foreground text-sm">プレビューする記事がありません。</p>}
          </div>
        </div>

        {info && <p className="text-green-600 text-sm">{info}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
