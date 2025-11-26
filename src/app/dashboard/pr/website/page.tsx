'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type SiteConfig = {
  siteTitle: string;
  tagline: string;
  headerBg: string;
  headerFg: string;
  primary: string;
  accent: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroBg: string;
  logoUrl?: string;
  heroImage?: string;
};

const defaultConfig: SiteConfig = {
  siteTitle: 'MERRILY CAFE',
  tagline: '学生が運営するカフェの公式サイト',
  headerBg: '#0f172a',
  headerFg: '#e2e8f0',
  primary: '#10b981',
  accent: '#f59e0b',
  heroTitle: 'ようこそ、MERRILYへ',
  heroSubtitle: '季節のドリンクと手作りスイーツを楽しめる学生カフェです。',
  heroCtaText: 'メニューを見る',
  heroCtaLink: '#menu',
  heroBg: '#0b1220',
};

export default function PrWebsiteEditor() {
  const supabase = createClientComponentClient();
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pr/website', { cache: 'no-store' });
        const data = await res.json();
        if (data?.siteConfig) {
          setConfig({ ...defaultConfig, ...data.siteConfig });
        }
      } catch (e: any) {
        setError(e?.message || '設定の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpload = async (field: 'logoUrl' | 'heroImage', file?: File | null) => {
    if (!file) return;
    setError(null);
    setMessage(null);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `${field}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('ui-icons').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('ui-icons').getPublicUrl(fileName);
      setConfig((prev) => ({ ...prev, [field]: data.publicUrl }));
      setMessage('アップロードしました（保存で反映）');
    } catch (e: any) {
      setError(e?.message || 'アップロードに失敗しました');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = { siteConfig: config };
      const res = await fetch('/api/pr/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, updated_by: 'PR website editor' }),
      });
      if (!res.ok) throw new Error(`保存に失敗しました (${res.status})`);
      setMessage('保存しました');
    } catch (e: any) {
      setError(e?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ホームページ編集</h1>
            <p className="text-sm text-muted-foreground">色・見出し・画像を直感的に編集できます。</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/pr/menu" className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm">
              広報トップへ
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 text-sm"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">ブランド設定</h2>
            <label className="text-sm space-y-1 block">
              サイト名
              <input
                value={config.siteTitle}
                onChange={(e) => setConfig((p) => ({ ...p, siteTitle: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm space-y-1 block">
              キャッチコピー
              <input
                value={config.tagline}
                onChange={(e) => setConfig((p) => ({ ...p, tagline: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="space-y-1">
                ヘッダー背景
                <input type="color" value={config.headerBg} onChange={(e) => setConfig((p) => ({ ...p, headerBg: e.target.value }))} />
              </label>
              <label className="space-y-1">
                ヘッダー文字
                <input type="color" value={config.headerFg} onChange={(e) => setConfig((p) => ({ ...p, headerFg: e.target.value }))} />
              </label>
              <label className="space-y-1">
                メイン色
                <input type="color" value={config.primary} onChange={(e) => setConfig((p) => ({ ...p, primary: e.target.value }))} />
              </label>
              <label className="space-y-1">
                アクセント
                <input type="color" value={config.accent} onChange={(e) => setConfig((p) => ({ ...p, accent: e.target.value }))} />
              </label>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>ロゴ</p>
              <div className="flex gap-2 items-center text-xs">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-accent">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload('logoUrl', e.target.files?.[0])} />
                  <span>デバイスからアップロード</span>
                </label>
                {config.logoUrl && <span className="text-foreground">設定済み</span>}
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>ヒーロー画像</p>
              <div className="flex gap-2 items-center text-xs">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-accent">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload('heroImage', e.target.files?.[0])} />
                  <span>デバイスからアップロード</span>
                </label>
                {config.heroImage && <span className="text-foreground">設定済み</span>}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">ヒーローセクション</h2>
            <label className="text-sm space-y-1 block">
              見出し
              <input
                value={config.heroTitle}
                onChange={(e) => setConfig((p) => ({ ...p, heroTitle: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm space-y-1 block">
              説明
              <textarea
                value={config.heroSubtitle}
                onChange={(e) => setConfig((p) => ({ ...p, heroSubtitle: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                rows={3}
              />
            </label>
            <label className="text-sm space-y-1 block">
              ボタン文言
              <input
                value={config.heroCtaText}
                onChange={(e) => setConfig((p) => ({ ...p, heroCtaText: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm space-y-1 block">
              ボタンリンク
              <input
                value={config.heroCtaLink}
                onChange={(e) => setConfig((p) => ({ ...p, heroCtaLink: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm space-y-1 block">
              背景色
              <input type="color" value={config.heroBg} onChange={(e) => setConfig((p) => ({ ...p, heroBg: e.target.value }))} />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">プレビュー</h2>
          <div
            className="rounded-2xl shadow-lg overflow-hidden"
            style={{ border: `1px solid ${config.headerBg}`, background: config.heroBg }}
          >
            <div
              className="px-6 py-3 flex items-center justify-between"
              style={{ background: config.headerBg, color: config.headerFg }}
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-xs font-semibold text-foreground overflow-hidden">
                  {config.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={config.logoUrl} alt="logo" className="w-full h-full object-contain" />
                  ) : (
                    'LOGO'
                  )}
                </div>
                <span className="text-sm font-semibold">{config.siteTitle}</span>
              </div>
              <span className="text-xs opacity-80">{config.tagline}</span>
            </div>
            <div className="px-6 py-10 grid gap-6 md:grid-cols-2 items-center" style={{ color: config.headerFg }}>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: config.accent }}>
                  Welcome
                </p>
                <h3 className="text-3xl font-bold">{config.heroTitle}</h3>
                <p className="text-sm opacity-90">{config.heroSubtitle}</p>
                <a
                  href={config.heroCtaLink || '#'}
                  className="inline-flex px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: config.primary, color: '#0b1220' }}
                >
                  {config.heroCtaText}
                </a>
              </div>
              <div className="w-full rounded-xl border border-border bg-background overflow-hidden">
                {config.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={config.heroImage} alt="hero" className="w-full h-64 object-cover" />
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">ヒーロー画像を設定してください</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
