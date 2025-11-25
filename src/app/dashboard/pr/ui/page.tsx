'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type UiColors = {
  light: { background: string; border: string; foreground: string };
  dark: { background: string; border: string; foreground: string };
};

type ModeValues = {
  headerBg: string;
  headerFg: string;
  headerTitle: string;
  headerSubtitle: string;
  headerUser: string;
  muted: string;
  welcomeBg: string;
  welcomeFg: string;
  welcomeBorder: string;
  welcomeTitle: string;
  welcomeBody: string;
  cardBg: string;
  cardFg: string;
  cardBorder: string;
};

const defaultModeValues: ModeValues = {
  headerBg: '#0b1220',
  headerFg: '#e5e7eb',
  headerTitle: '#e5e7eb',
  headerSubtitle: '#94a3b8',
  headerUser: '#cbd5e1',
  muted: '#6b7280',
  welcomeBg: '#ffffff',
  welcomeFg: '#0f172a',
  welcomeBorder: '#e2e8f0',
  welcomeTitle: '#0f172a',
  welcomeBody: '#1f2937',
  cardBg: '#0b1220',
  cardFg: '#e5e7eb',
  cardBorder: '#1f2937',
};

const defaultColors: UiColors = {
  light: { background: '#f8fafc', border: '#e2e8f0', foreground: '#0f172a' },
  dark: { background: '#0b1220', border: '#1f2937', foreground: '#e5e7eb' },
};

export default function UiEditor() {
  const supabase = createClientComponentClient();
  const [loginIconUrl, setLoginIconUrl] = useState('/MERRILY_Simbol.png');
  const [appIconUrl, setAppIconUrl] = useState('/MERRILY_Simbol.png');
  const [appTitle, setAppTitle] = useState('MERRILY');
  const [welcomeTitleText, setWelcomeTitleText] = useState('バー形式で全ダッシュボードをまとめました');
  const [welcomeBodyText, setWelcomeBodyText] = useState('最新の動きに応じて必要なボードをまとめたバーへ誘導します。最新ログや通知はカード側で閲覧できます。');
  const [modeValues, setModeValues] = useState<{ light: ModeValues; dark: ModeValues }>({
    light: defaultModeValues,
    dark: defaultModeValues,
  });
  const [colors, setColors] = useState<UiColors>(defaultColors);
  const [selectedMode, setSelectedMode] = useState<'light' | 'dark'>('light');
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
        setLoginIconUrl(ui.loginIconUrl || '/MERRILY_Simbol.png');
        setAppIconUrl(ui.appIconUrl || '/MERRILY_Simbol.png');
        setAppTitle(ui.appTitle || 'MERRILY');
        setWelcomeTitleText(ui.welcomeTitleText || welcomeTitleText);
        setWelcomeBodyText(ui.welcomeBodyText || welcomeBodyText);
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
        setModeValues({
          light: {
            headerBg: ui.headerBgLight || ui.headerBackground || defaultModeValues.headerBg,
            headerFg: ui.headerFgLight || ui.headerForeground || defaultModeValues.headerFg,
            headerTitle: ui.headerTitleColorLight || defaultModeValues.headerTitle,
            headerSubtitle: ui.headerSubtitleColorLight || defaultModeValues.headerSubtitle,
            headerUser: ui.headerUserColorLight || defaultModeValues.headerUser,
            muted: ui.mutedColorLight || ui.mutedColor || defaultModeValues.muted,
            welcomeBg: ui.welcomeBgLight || ui.welcomeBackground || defaultModeValues.welcomeBg,
            welcomeFg: ui.welcomeFgLight || ui.welcomeForeground || defaultModeValues.welcomeFg,
            welcomeBorder: ui.welcomeBorderLight || ui.welcomeBorder || defaultModeValues.welcomeBorder,
            welcomeTitle: ui.welcomeTitleColorLight || defaultModeValues.welcomeTitle,
            welcomeBody: ui.welcomeBodyColorLight || defaultModeValues.welcomeBody,
            cardBg: ui.cardBgLight || ui.cardBackground || defaultModeValues.cardBg,
            cardFg: ui.cardFgLight || ui.cardForeground || defaultModeValues.cardFg,
            cardBorder: ui.cardBorderLight || ui.cardBorder || defaultModeValues.cardBorder,
          },
          dark: {
            headerBg: ui.headerBgDark || ui.headerBackground || defaultModeValues.headerBg,
            headerFg: ui.headerFgDark || ui.headerForeground || defaultModeValues.headerFg,
            headerTitle: ui.headerTitleColorDark || defaultModeValues.headerTitle,
            headerSubtitle: ui.headerSubtitleColorDark || defaultModeValues.headerSubtitle,
            headerUser: ui.headerUserColorDark || defaultModeValues.headerUser,
            muted: ui.mutedColorDark || ui.mutedColor || defaultModeValues.muted,
            welcomeBg: ui.welcomeBgDark || ui.welcomeBackground || defaultModeValues.welcomeBg,
            welcomeFg: ui.welcomeFgDark || ui.welcomeForeground || defaultModeValues.welcomeFg,
            welcomeBorder: ui.welcomeBorderDark || ui.welcomeBorder || defaultModeValues.welcomeBorder,
            welcomeTitle: ui.welcomeTitleColorDark || defaultModeValues.welcomeTitle,
            welcomeBody: ui.welcomeBodyColorDark || defaultModeValues.welcomeBody,
            cardBg: ui.cardBgDark || ui.cardBackground || defaultModeValues.cardBg,
            cardFg: ui.cardFgDark || ui.cardForeground || defaultModeValues.cardFg,
            cardBorder: ui.cardBorderDark || ui.cardBorder || defaultModeValues.cardBorder,
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
          welcomeTitleText,
          welcomeBodyText,
          loginIconUrl,
          appIconUrl,
          lightBackground: colors.light.background,
          lightBorder: colors.light.border,
          lightForeground: colors.light.foreground,
          darkBackground: colors.dark.background,
          darkBorder: colors.dark.border,
          darkForeground: colors.dark.foreground,
          headerBgLight: modeValues.light.headerBg,
          headerFgLight: modeValues.light.headerFg,
          headerBgDark: modeValues.dark.headerBg,
          headerFgDark: modeValues.dark.headerFg,
          headerTitleColorLight: modeValues.light.headerTitle,
          headerSubtitleColorLight: modeValues.light.headerSubtitle,
          headerUserColorLight: modeValues.light.headerUser,
          headerTitleColorDark: modeValues.dark.headerTitle,
          headerSubtitleColorDark: modeValues.dark.headerSubtitle,
          headerUserColorDark: modeValues.dark.headerUser,
          mutedColorLight: modeValues.light.muted,
          mutedColorDark: modeValues.dark.muted,
          welcomeBgLight: modeValues.light.welcomeBg,
          welcomeFgLight: modeValues.light.welcomeFg,
          welcomeBorderLight: modeValues.light.welcomeBorder,
          welcomeTitleColorLight: modeValues.light.welcomeTitle,
          welcomeBodyColorLight: modeValues.light.welcomeBody,
          welcomeBgDark: modeValues.dark.welcomeBg,
          welcomeFgDark: modeValues.dark.welcomeFg,
          welcomeBorderDark: modeValues.dark.welcomeBorder,
          welcomeTitleColorDark: modeValues.dark.welcomeTitle,
          welcomeBodyColorDark: modeValues.dark.welcomeBody,
          cardBgLight: modeValues.light.cardBg,
          cardFgLight: modeValues.light.cardFg,
          cardBorderLight: modeValues.light.cardBorder,
          cardBgDark: modeValues.dark.cardBg,
          cardFgDark: modeValues.dark.cardFg,
          cardBorderDark: modeValues.dark.cardBorder,
        },
      };
      const res = await fetch('/api/pr/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, updated_by: 'UI editor' }),
      });
      if (!res.ok) throw new Error(`保存に失敗しました (${res.status})`);
      setMessage('保存しました。モード別の色が反映されます。');
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

  const currentMode = modeValues[selectedMode];

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
            <p className="text-muted-foreground text-sm">先にライト/ダークを選択し、そのモードの色を編集してください。</p>
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

        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">編集するモード</h2>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedMode === mode ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
                }`}
              >
                {mode === 'light' ? 'ライトモード' : 'ダークモード'}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">選んだモードの色だけが変更されます。</p>
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
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-background px-2 py-1">プレビュー</span>
              <div className="w-10 h-10 rounded-full border border-border bg-white overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={appIconUrl} alt="preview app icon" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">選択中モードのベース色</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              背景色
              <input
                type="color"
                value={colors[selectedMode].background}
                onChange={(e) => setColors((c) => ({ ...c, [selectedMode]: { ...c[selectedMode], background: e.target.value } }))}
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              枠線色
              <input
                type="color"
                value={colors[selectedMode].border}
                onChange={(e) => setColors((c) => ({ ...c, [selectedMode]: { ...c[selectedMode], border: e.target.value } }))}
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              文字色
              <input
                type="color"
                value={colors[selectedMode].foreground}
                onChange={(e) => setColors((c) => ({ ...c, [selectedMode]: { ...c[selectedMode], foreground: e.target.value } }))}
              />
            </label>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">ヘッダーの色</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              背景色
              <input
                type="color"
                value={currentMode.headerBg}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], headerBg: e.target.value },
                  }))
                }
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              文字色（ベース）
              <input
                type="color"
                value={currentMode.headerFg}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], headerFg: e.target.value },
                  }))
                }
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              タイトル色
              <input
                type="color"
                value={currentMode.headerTitle}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], headerTitle: e.target.value },
                  }))
                }
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              サブタイトル色
              <input
                type="color"
                value={currentMode.headerSubtitle}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], headerSubtitle: e.target.value },
                  }))
                }
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              ユーザー行の色
              <input
                type="color"
                value={currentMode.headerUser}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], headerUser: e.target.value },
                  }))
                }
              />
            </label>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">小さい文字（mutedテキスト）</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              色
              <input
                type="color"
                value={currentMode.muted}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], muted: e.target.value },
                  }))
                }
              />
            </label>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">Welcomeカードの内容</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              タイトル
              <input
                value={welcomeTitleText}
                onChange={(e) => setWelcomeTitleText(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              本文
              <textarea
                value={welcomeBodyText}
                onChange={(e) => setWelcomeBodyText(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                rows={3}
              />
            </label>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">Welcomeカードの色</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              背景色
              <input
                type="color"
                value={currentMode.welcomeBg}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], welcomeBg: e.target.value },
                  }))
                }
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              文字色
              <input
                type="color"
                value={currentMode.welcomeFg}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], welcomeFg: e.target.value },
                  }))
                }
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              枠線色
              <input
                type="color"
                value={currentMode.welcomeBorder}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], welcomeBorder: e.target.value },
                  }))
                }
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              タイトル文字色
              <input
                type="color"
                value={currentMode.welcomeTitle}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], welcomeTitle: e.target.value },
                  }))
                }
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              本文字色
              <input
                type="color"
                value={currentMode.welcomeBody}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], welcomeBody: e.target.value },
                  }))
                }
              />
            </label>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">その他カード（ログ/通知など）</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              背景色
              <input
                type="color"
                value={currentMode.cardBg}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], cardBg: e.target.value },
                  }))
                }
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              文字色
              <input
                type="color"
                value={currentMode.cardFg}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], cardFg: e.target.value },
                  }))
                }
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              枠線色
              <input
                type="color"
                value={currentMode.cardBorder}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], cardBorder: e.target.value },
                  }))
                }
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
