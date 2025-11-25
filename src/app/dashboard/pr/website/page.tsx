'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Section = { id: string; title: string; body: string };
type MenuItem = { id: string; name: string; price: string; desc: string };
type BlogPost = { id: string; title: string; body: string; date: string };

export default function PrWebsiteEditor() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const [heroTitle, setHeroTitle] = useState('MERRILY CAFE');
  const [heroSubtitle, setHeroSubtitle] = useState('季節のブレンドコーヒーと焼き菓子で、ゆったりとした時間を。');
  const [ctaLabel, setCtaLabel] = useState('ご予約・お問い合わせはこちら');

  const [sections, setSections] = useState<Section[]>([
    { id: 'about', title: 'お店について', body: '丁寧に焼き上げたスイーツと自家焙煎のコーヒーをご用意しています。' },
    { id: 'news', title: 'お知らせ', body: '季節限定メニューやイベント情報をお届けします。' },
  ]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 'm1', name: 'ブレンドコーヒー', price: '\\500', desc: '毎日焙煎のフレッシュなコーヒー' },
    { id: 'm2', name: '季節のタルト', price: '\\650', desc: '旬のフルーツを贅沢に使用' },
  ]);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    { id: 'b1', title: '春の新作スイーツ', body: '桜のタルトと苺のショートが登場しました。', date: '2025-03-15' },
  ]);

  const [previewUrl, setPreviewUrl] = useState('https://example.com');
  const [headerColor, setHeaderColor] = useState('#0f172a');
  const [headerTextColor, setHeaderTextColor] = useState('#ffffff');
  const [heroImage, setHeroImage] = useState('/MERRILY_Simbol.png');

  // 読み込み
  useEffect(() => {
    (async () => {
      try {
        const userRes = await supabase.auth.getUser();
        const meta = userRes.data.user?.user_metadata;
        if (meta?.full_name) setUserName(meta.full_name);

        const res = await fetch('/api/pr/website');
        const data = await res.json();
        if (data) {
          setHeroTitle(data.heroTitle ?? heroTitle);
          setHeroSubtitle(data.heroSubtitle ?? heroSubtitle);
          setCtaLabel(data.ctaLabel ?? ctaLabel);
          setSections(data.sections ?? sections);
          setMenuItems(data.menuItems ?? menuItems);
          setBlogPosts(data.blogPosts ?? blogPosts);
          setPreviewUrl(data.previewUrl ?? previewUrl);
          setHeaderColor(data.headerColor ?? headerColor);
          setHeaderTextColor(data.headerTextColor ?? headerTextColor);
          setHeroImage(data.heroImage ?? heroImage);
        }
      } catch (e: any) {
        setError(e?.message || 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addSection = () => setSections((prev) => [...prev, { id: `sec-${prev.length + 1}`, title: '新しいセクション', body: 'ここに本文を入力' }]);
  const updateSection = (id: string, field: 'title' | 'body', value: string) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  const removeSection = (id: string) => setSections((prev) => prev.filter((s) => s.id !== id));

  const addMenuItem = () => setMenuItems((prev) => [...prev, { id: `m-${prev.length + 1}`, name: '新しいメニュー', price: '\\0', desc: '' }]);
  const updateMenuItem = (id: string, field: keyof MenuItem, value: string) =>
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  const removeMenuItem = (id: string) => setMenuItems((prev) => prev.filter((m) => m.id !== id));

  const addBlogPost = () =>
    setBlogPosts((prev) => [...prev, { id: `b-${prev.length + 1}`, title: '新しい記事', body: '', date: new Date().toISOString().slice(0, 10) }]);
  const updateBlogPost = (id: string, field: keyof BlogPost, value: string) =>
    setBlogPosts((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  const removeBlogPost = (id: string) => setBlogPosts((prev) => prev.filter((b) => b.id !== id));

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

  const handleSave = async () => {
    if (saving || cooldown) return; // 連打防止
    setSaving(true);
    setCooldown(true);
    setError(null);
    setInfo(null);
    try {
      const payload = {
        heroTitle,
        heroSubtitle,
        ctaLabel,
        sections,
        menuItems,
        blogPosts,
        previewUrl,
        headerColor,
        headerTextColor,
        heroImage,
      };
      const res = await fetch('/api/pr/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, updated_by: userName || 'unknown' }),
      });
      const data = await res.json();
      if (data?.error) setError(data.error);
      else {
        setInfo('保存しました');
        await logClientActivity('広報: ホームページを保存（ブログ含む）');
      }
    } catch (e: any) {
      setError(e?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
      setTimeout(() => setInfo(null), 3000);
      // 連打防止: 2秒間は再送不可
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
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg text-xl">📣</div>
            <div>
              <h1 className="text-2xl font-bold">広報部ホームページ編集</h1>
              <p className="text-sm text-muted-foreground">宣伝用のページとブログを管理・保存・プレビュー</p>
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

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold">コンテンツ編集</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm text-muted-foreground flex flex-col gap-2">
              ヘッダー色
              <input type="color" value={headerColor} onChange={(e) => setHeaderColor(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background" />
            </label>
            <label className="text-sm text-muted-foreground flex flex-col gap-2">
              ヘッダー文字色
              <input type="color" value={headerTextColor} onChange={(e) => setHeaderTextColor(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background" />
            </label>
          </div>
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            ヘッダーアイコン画像URL
            <input
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
              placeholder="/MERRILY_Simbol.png"
            />
            <span className="text-xs text-muted-foreground">public 配下のパスか、外部URLを指定できます。</span>
          </label>
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            ヒーロータイトル
            <input
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            サブタイトル
            <input
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            CTAボタン
            <input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            プレビュー用URL（任意）
            <input
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
              placeholder="https://example.com"
            />
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">セクション</h3>
              <button onClick={addSection} className="text-xs px-3 py-1 rounded-lg border border-border hover:border-accent">
                追加
              </button>
            </div>
            <div className="space-y-3">
              {sections.map((sec) => (
                <div key={sec.id} className="border border-border rounded-xl p-3 bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      value={sec.title}
                      onChange={(e) => updateSection(sec.id, 'title', e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => removeSection(sec.id)}
                      className="text-xs px-2 py-1 rounded-lg border border-border hover:border-accent"
                    >
                      削除
                    </button>
                  </div>
                  <textarea
                    value={sec.body}
                    onChange={(e) => updateSection(sec.id, 'body', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">メニュー</h3>
              <button onClick={addMenuItem} className="text-xs px-3 py-1 rounded-lg border border-border hover:border-accent">
                メニューを追加
              </button>
            </div>
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div key={item.id} className="border border-border rounded-xl p-3 bg-muted/30 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={item.name}
                      onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="メニュー名"
                    />
                    <input
                      value={item.price}
                      onChange={(e) => updateMenuItem(item.id, 'price', e.target.value)}
                      className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="\\0"
                    />
                    <button onClick={() => removeMenuItem(item.id)} className="text-xs px-2 py-1 rounded-lg border border-border hover:border-accent">
                      削除
                    </button>
                  </div>
                  <textarea
                    value={item.desc}
                    onChange={(e) => updateMenuItem(item.id, 'desc', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    rows={2}
                    placeholder="説明（任意）"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">ブログ記事</h3>
              <button onClick={addBlogPost} className="text-xs px-3 py-1 rounded-lg border border-border hover:border-accent">
                記事を追加
              </button>
            </div>
            <div className="space-y-3">
              {blogPosts.map((post) => (
                <div key={post.id} className="border border-border rounded-xl p-3 bg-muted/30 space-y-2">
                  <div className="flex gap-2">
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
                      className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button onClick={() => removeBlogPost(post.id)} className="text-xs px-2 py-1 rounded-lg border border-border hover:border-accent">
                      削除
                    </button>
                  </div>
                  <textarea
                    value={post.body}
                    onChange={(e) => updateBlogPost(post.id, 'body', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    rows={3}
                    placeholder="本文"
                  />
                </div>
              ))}
            </div>
          </div>

          {info && <p className="text-green-600 text-sm">{info}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <p className="text-xs text-muted-foreground">
            Supabase の pr_site テーブルに保存しています（1行固定）。必要に応じてスキーマを拡張してください。
          </p>
        </div>

        <div className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold">プレビュー</h2>
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="p-6 text-left space-y-3" style={{ backgroundColor: headerColor, color: headerTextColor }}>
              <div className="flex items-center gap-3">
                {heroImage && <img src={heroImage} alt="Header Icon" className="w-12 h-12 rounded-full border border-border bg-white/20" />}
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: headerTextColor }}>
                    {heroTitle}
                  </h3>
                  <p className="text-sm" style={{ color: headerTextColor }}>
                    {heroSubtitle}
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg border border-border bg-white/10" style={{ color: headerTextColor }}>
                {ctaLabel}
              </button>
            </div>

            <div className="p-6 space-y-4">
              {sections.map((sec) => (
                <div key={sec.id} className="space-y-2">
                  <h4 className="text-lg font-semibold">{sec.title}</h4>
                  <p className="text-sm text-muted-foreground">{sec.body}</p>
                </div>
              ))}

              <div className="space-y-2">
                <h4 className="text-lg font-semibold">おすすめメニュー</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {menuItems.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-3 bg-muted/30">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>{item.name}</span>
                        <span>{item.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {!!blogPosts.length && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">ブログ</h4>
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
                  </div>
                </div>
              )}

              {previewUrl && (
                <div className="text-sm">
                  <p className="text-muted-foreground">公開ページURL（任意）:</p>
                  <a className="text-primary underline" href={previewUrl} target="_blank" rel="noreferrer">
                    {previewUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
