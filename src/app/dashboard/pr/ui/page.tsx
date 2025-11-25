'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type UiColors = {
  light: { background: string; border: string; foreground: string };
  dark: { background: string; border: string; foreground: string };
};

const defaultColors: UiColors = {
  light: { background: '#f8fafc', border: '#e2e8f0', foreground: '#0f172a' },
  dark: { background: '#0b1220', border: '#1f2937', foreground: '#e5e7eb' },
};

export default function UiEditor() {
  const supabase = createClientComponentClient();
  const [loginIconUrl, setLoginIconUrl] = useState('');
  const [appIconUrl, setAppIconUrl] = useState('');
  const [appTitle, setAppTitle] = useState('MERRILY');
  const [colors, setColors] = useState<UiColors>(defaultColors);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [basePayload, setBasePayload] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pr/website', { cache: 'no-store' });
        const data = await res.json();
        const ui = data?.uiSettings || {};
        setLoginIconUrl(ui.loginIconUrl || '');
        setAppIconUrl(ui.appIconUrl || '');
        setAppTitle(ui.appTitle || 'MERRILY');
        setColors({
          light: {
            background: ui.lightBackground || defaultColors.light.background,
            border: ui.lightBorder || defaultColors.light.border,
            foreground: ui.lightForeground || defaultColors.light.foreground,
          },
          dark: {
            background: ui.darkBackground || defaultColors.dark.background,
            border: ui.darkBorder || defaultColors.dark.border,
            foreground: ui.darkForeground || defaultColors.dark.foreground,
          },
        });
        setBasePayload(data || {});
      } catch (e: any) {
        setError(e?.message || '設定の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        ...(basePayload || {}),
        uiSettings: {
          appTitle,
          loginIconUrl,
          appIconUrl,
          lightBackground: colors.light.background,
          lightBorder: colors.light.border,
          lightForeground: colors.light.foreground,
          darkBackground: colors.dark.background,
          darkBorder: colors.dark.border,
          darkForeground: colors.dark.foreground,
        },
      };
      const res = await fetch('/api/pr/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, updated_by: 'UI editor' }),
      });
      if (!res.ok) throw new Error(`保存に失敗しました (${res.status})`);
      setMessage('保存しました。ログイン画面・トップのアイコンと配色に反映されます。');
    } catch (e: any) {
      setError(e?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUpload = async (target: 'login' | 'app', file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `${target}-icon-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('ui-icons').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('ui-icons').getPublicUrl(fileName);
      if (target === 'login') setLoginIconUrl(data.publicUrl);
      if (target === 'app') setAppIconUrl(data.publicUrl);
      setMessage('アップロードしました（保存で反映）');
    } catch (e: any) {
      setError(e?.message || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">UI編集（アイコン・配色）</h1>
            <p className="text-muted-foreground text-sm">ログイン画面・ログイン後のアイコン、ライト/ダークの色を変更します。</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <Link
              href="/dashboard/pr"
              className="px-4 py-2 rounded-lg border border-border bg-card hover:border-accent"
            >
              戻る
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">アイコン・題名</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              アプリの題名
              <input
                value={appTitle}
                onChange={(e) => setAppTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="MERRILY"
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              ログイン画面のアイコンURL
              <input
                value={loginIconUrl}
                onChange={(e) => setLoginIconUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://example.com/login-icon.png"
              />
            </label>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-accent">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload('login', e.target.files?.[0])} disabled={uploading} />
                <span>デバイスからアップロード</span>
              </label>
              {uploading && <span>アップロード中...</span>}
            </div>
            <label className="text-sm text-muted-foreground space-y-1 block">
              ログイン後（ヘッダー）のアイコンURL
              <input
                value={appIconUrl}
                onChange={(e) => setAppIconUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://example.com/app-icon.png"
              />
            </label>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-accent">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload('app', e.target.files?.[0])} disabled={uploading} />
                <span>デバイスからアップロード</span>
              </label>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">ライトモードの色</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              背景色
              <input
                type="color"
                value={colors.light.background}
                onChange={(e) => setColors((c) => ({ ...c, light: { ...c.light, background: e.target.value } }))}
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              枠線色
              <input
                type="color"
                value={colors.light.border}
                onChange={(e) => setColors((c) => ({ ...c, light: { ...c.light, border: e.target.value } }))}
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              文字色
              <input
                type="color"
                value={colors.light.foreground}
                onChange={(e) => setColors((c) => ({ ...c, light: { ...c.light, foreground: e.target.value } }))}
              />
            </label>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">ダークモードの色</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              背景色
              <input
                type="color"
                value={colors.dark.background}
                onChange={(e) => setColors((c) => ({ ...c, dark: { ...c.dark, background: e.target.value } }))}
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              枠線色
              <input
                type="color"
                value={colors.dark.border}
                onChange={(e) => setColors((c) => ({ ...c, dark: { ...c.dark, border: e.target.value } }))}
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              文字色
              <input
                type="color"
                value={colors.dark.foreground}
                onChange={(e) => setColors((c) => ({ ...c, dark: { ...c.dark, foreground: e.target.value } }))}
              />
            </label>
          </div>
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
