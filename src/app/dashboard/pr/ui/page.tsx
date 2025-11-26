'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUiTheme } from '@/hooks/useUiTheme';

type UiColors = {
  light: { background: string; border: string; foreground: string };
  dark: { background: string; border: string; foreground: string };
};

type ModeValues = {
  headerBg: string;
  headerBgAlpha: number;
  headerFg: string;
  headerTitle: string;
  headerSubtitle: string;
  headerUser: string;
  muted: string;
  welcomeBg: string;
  welcomeBgAlpha: number;
  welcomeFg: string;
  welcomeBorder: string;
  welcomeTitle: string;
  welcomeBody: string;
  cardBg: string;
  cardBgAlpha: number;
  cardFg: string;
  cardBorder: string;
};

const defaultModeValues: ModeValues = {
  headerBg: '#0b1220',
  headerBgAlpha: 1,
  headerFg: '#e5e7eb',
  headerTitle: '#e5e7eb',
  headerSubtitle: '#94a3b8',
  headerUser: '#cbd5e1',
  muted: '#6b7280',
  welcomeBg: '#ffffff',
  welcomeBgAlpha: 1,
  welcomeFg: '#0f172a',
  welcomeBorder: '#e2e8f0',
  welcomeTitle: '#0f172a',
  welcomeBody: '#1f2937',
  cardBg: '#0b1220',
  cardBgAlpha: 1,
  cardFg: '#e5e7eb',
  cardBorder: '#1f2937',
};

const defaultColors: UiColors = {
  light: { background: '#f8fafc', border: '#e2e8f0', foreground: '#0f172a' },
  dark: { background: '#0b1220', border: '#1f2937', foreground: '#e5e7eb' },
};

// 初期から選べるプリセット（必要に応じて上書き保存可）
const defaultPresets = [
  {
    name: 'ダークベース',
    appTitle: 'MERRILY',
    loginIconUrl: '/MERRILY_Simbol.png',
    appIconUrl: '/MERRILY_Simbol.png',
    lightBackground: '#f8fafc',
    lightBorder: '#e2e8f0',
    lightForeground: '#0f172a',
    darkBackground: '#0b1220',
    darkBorder: '#1f2937',
    darkForeground: '#e5e7eb',
    headerBgLight: '#f8fafc',
    headerFgLight: '#0f172a',
    headerTitleColorLight: '#0f172a',
    headerSubtitleColorLight: '#475569',
    headerUserColorLight: '#334155',
    headerBgDark: '#0b1220',
    headerFgDark: '#e5e7eb',
    welcomeBgDark: '#0f172a',
    welcomeFgDark: '#e5e7eb',
    welcomeTitleColorDark: '#f8fafc',
    welcomeBodyColorDark: '#cbd5e1',
    headerTitleColorDark: '#e5e7eb',
    headerSubtitleColorDark: '#cbd5e1',
    headerUserColorDark: '#cbd5e1',
    cardBgLight: '#ffffff',
    cardFgLight: '#0f172a',
    cardBorderLight: '#e2e8f0',
    cardBgDark: '#0f172a',
    cardFgDark: '#e5e7eb',
    cardBorderDark: '#1f2937',
    welcomeBgLight: '#ffffff',
    welcomeFgLight: '#0f172a',
  },
  {
    name: 'ライト&グリーン',
    appTitle: 'MERRILY',
    lightBackground: '#f6fff8',
    lightBorder: '#cfe8d7',
    lightForeground: '#0f172a',
    darkBackground: '#0b1220',
    darkBorder: '#1f2937',
    darkForeground: '#e5e7eb',
    headerBgLight: '#ecfdf3',
    headerFgLight: '#0f172a',
    headerTitleColorLight: '#0f172a',
    headerSubtitleColorLight: '#46644f',
    headerUserColorLight: '#1f2937',
    cardBgLight: '#ffffff',
    cardFgLight: '#0f172a',
    cardBorderLight: '#cfe8d7',
    welcomeBgLight: '#ffffff',
    welcomeFgLight: '#0f172a',
    welcomeBgDark: '#0b1220',
    welcomeFgDark: '#e5e7eb',
    welcomeTitleColorDark: '#e5e7eb',
    welcomeBodyColorDark: '#cbd5e1',
  },
  {
    name: 'モノトーン',
    appTitle: 'MERRILY',
    lightBackground: '#f5f5f5',
    lightBorder: '#d4d4d4',
    lightForeground: '#111827',
    darkBackground: '#0f172a',
    darkBorder: '#1f2937',
    darkForeground: '#e5e7eb',
    headerBgLight: '#ffffff',
    headerFgLight: '#111827',
    headerTitleColorLight: '#111827',
    headerSubtitleColorLight: '#4b5563',
    headerUserColorLight: '#374151',
    cardBgLight: '#ffffff',
    cardFgLight: '#111827',
    cardBorderLight: '#d4d4d4',
    welcomeBgLight: '#ffffff',
    welcomeFgLight: '#111827',
    welcomeBgDark: '#0f172a',
    welcomeFgDark: '#e5e7eb',
    welcomeTitleColorDark: '#e5e7eb',
    welcomeBodyColorDark: '#cbd5e1',
  },
  {
    name: 'ウォームベージュ',
    appTitle: 'MERRILY',
    lightBackground: '#fdf7f2',
    lightBorder: '#e8d9c7',
    lightForeground: '#2d1f10',
    darkBackground: '#1a1410',
    darkBorder: '#2a221c',
    darkForeground: '#f1e4d7',
    headerBgLight: '#fff7ed',
    headerFgLight: '#2d1f10',
    headerTitleColorLight: '#2d1f10',
    headerSubtitleColorLight: '#5c4635',
    headerUserColorLight: '#3b2a1d',
    cardBgLight: '#ffffff',
    cardFgLight: '#2d1f10',
    cardBorderLight: '#e8d9c7',
    welcomeBgLight: '#fff7ed',
    welcomeFgLight: '#2d1f10',
    welcomeBgDark: '#1a1410',
    welcomeFgDark: '#f1e4d7',
    welcomeTitleColorDark: '#f1e4d7',
    welcomeBodyColorDark: '#e6d5c1',
  },
];

export default function UiEditor() {
  useUiTheme();
  const supabase = createClientComponentClient();
  const [loginIconUrl, setLoginIconUrl] = useState('/MERRILY_Simbol.png');
  const [appIconUrl, setAppIconUrl] = useState('/MERRILY_Simbol.png');
  const [homeIconUrl, setHomeIconUrl] = useState('/MERRILY_Simbol.png');
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
  const [presets, setPresets] = useState<any[]>([]);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pr/website', { cache: 'no-store' });
        const data = await res.json();
        const ui = data?.uiSettings || {};
        const localPresets = typeof window !== 'undefined' ? window.localStorage.getItem('ui-presets') : null;
        const parsedLocalPresets = localPresets ? JSON.parse(localPresets) : [];
        setLoginIconUrl(ui.loginIconUrl || '/MERRILY_Simbol.png');
        setAppIconUrl(ui.appIconUrl || '/MERRILY_Simbol.png');
        setAppTitle(ui.appTitle || 'MERRILY');
        setHomeIconUrl(ui.homeIconUrl || ui.appIconUrl || '/MERRILY_Simbol.png');
        setWelcomeTitleText(ui.welcomeTitleText || welcomeTitleText);
        setWelcomeBodyText(ui.welcomeBodyText || welcomeBodyText);
        const mergedPresets = (ui.presets && ui.presets.length ? ui.presets : parsedLocalPresets) || [];
        const mergedWithDefaults = [...defaultPresets, ...mergedPresets].reduce((acc: any[], curr: any) => {
          if (!acc.some((p) => p.name === curr.name)) acc.push(curr);
          return acc;
        }, []);
        setPresets(mergedWithDefaults);
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
            headerBgAlpha: ui.headerBgAlphaLight ?? defaultModeValues.headerBgAlpha,
            headerFg: ui.headerFgLight || ui.headerForeground || defaultModeValues.headerFg,
            headerTitle: ui.headerTitleColorLight || defaultModeValues.headerTitle,
            headerSubtitle: ui.headerSubtitleColorLight || defaultModeValues.headerSubtitle,
            headerUser: ui.headerUserColorLight || defaultModeValues.headerUser,
            muted: ui.mutedColorLight || ui.mutedColor || defaultModeValues.muted,
            welcomeBg: ui.welcomeBgLight || ui.welcomeBackground || defaultModeValues.welcomeBg,
            welcomeBgAlpha: ui.welcomeBgAlphaLight ?? defaultModeValues.welcomeBgAlpha,
            welcomeFg: ui.welcomeFgLight || ui.welcomeForeground || defaultModeValues.welcomeFg,
            welcomeBorder: ui.welcomeBorderLight || ui.welcomeBorder || defaultModeValues.welcomeBorder,
            welcomeTitle: ui.welcomeTitleColorLight || defaultModeValues.welcomeTitle,
            welcomeBody: ui.welcomeBodyColorLight || defaultModeValues.welcomeBody,
            cardBg: ui.cardBgLight || ui.cardBackground || defaultModeValues.cardBg,
            cardBgAlpha: ui.cardBgAlphaLight ?? defaultModeValues.cardBgAlpha,
            cardFg: ui.cardFgLight || ui.cardForeground || defaultModeValues.cardFg,
            cardBorder: ui.cardBorderLight || ui.cardBorder || defaultModeValues.cardBorder,
          },
          dark: {
            headerBg: ui.headerBgDark || ui.headerBackground || defaultModeValues.headerBg,
            headerBgAlpha: ui.headerBgAlphaDark ?? defaultModeValues.headerBgAlpha,
            headerFg: ui.headerFgDark || ui.headerForeground || defaultModeValues.headerFg,
            headerTitle: ui.headerTitleColorDark || defaultModeValues.headerTitle,
            headerSubtitle: ui.headerSubtitleColorDark || defaultModeValues.headerSubtitle,
            headerUser: ui.headerUserColorDark || defaultModeValues.headerUser,
            muted: ui.mutedColorDark || ui.mutedColor || defaultModeValues.muted,
            welcomeBg: ui.welcomeBgDark || ui.welcomeBackground || defaultModeValues.welcomeBg,
            welcomeBgAlpha: ui.welcomeBgAlphaDark ?? defaultModeValues.welcomeBgAlpha,
            welcomeFg: ui.welcomeFgDark || ui.welcomeForeground || defaultModeValues.welcomeFg,
            welcomeBorder: ui.welcomeBorderDark || ui.welcomeBorder || defaultModeValues.welcomeBorder,
            welcomeTitle: ui.welcomeTitleColorDark || defaultModeValues.welcomeTitle,
            welcomeBody: ui.welcomeBodyColorDark || defaultModeValues.welcomeBody,
            cardBg: ui.cardBgDark || ui.cardBackground || defaultModeValues.cardBg,
            cardBgAlpha: ui.cardBgAlphaDark ?? defaultModeValues.cardBgAlpha,
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
          homeIconUrl,
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
          headerBgAlphaLight: modeValues.light.headerBgAlpha,
          headerFgLight: modeValues.light.headerFg,
          headerBgDark: modeValues.dark.headerBg,
          headerBgAlphaDark: modeValues.dark.headerBgAlpha,
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
          welcomeBgAlphaLight: modeValues.light.welcomeBgAlpha,
          welcomeFgLight: modeValues.light.welcomeFg,
          welcomeBorderLight: modeValues.light.welcomeBorder,
          welcomeTitleColorLight: modeValues.light.welcomeTitle,
          welcomeBodyColorLight: modeValues.light.welcomeBody,
          welcomeBgDark: modeValues.dark.welcomeBg,
          welcomeBgAlphaDark: modeValues.dark.welcomeBgAlpha,
          welcomeFgDark: modeValues.dark.welcomeFg,
          welcomeBorderDark: modeValues.dark.welcomeBorder,
          welcomeTitleColorDark: modeValues.dark.welcomeTitle,
          welcomeBodyColorDark: modeValues.dark.welcomeBody,
          cardBgLight: modeValues.light.cardBg,
          cardBgAlphaLight: modeValues.light.cardBgAlpha,
          cardFgLight: modeValues.light.cardFg,
          cardBorderLight: modeValues.light.cardBorder,
          cardBgDark: modeValues.dark.cardBg,
          cardBgAlphaDark: modeValues.dark.cardBgAlpha,
          cardFgDark: modeValues.dark.cardFg,
          cardBorderDark: modeValues.dark.cardBorder,
          presets,
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

  const handleUpload = async (target: 'login' | 'app' | 'home', file?: File | null) => {
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
      if (target === 'home') setHomeIconUrl(data.publicUrl);
      setMessage('アップロードしました（保存で反映）');
    } catch (e: any) {
      setError(e?.message || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const snapshotSettings = () => ({
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
    headerBgAlphaLight: modeValues.light.headerBgAlpha,
    headerBgAlphaDark: modeValues.dark.headerBgAlpha,
    headerTitleColorLight: modeValues.light.headerTitle,
    headerSubtitleColorLight: modeValues.light.headerSubtitle,
    headerUserColorLight: modeValues.light.headerUser,
    headerTitleColorDark: modeValues.dark.headerTitle,
    headerSubtitleColorDark: modeValues.dark.headerSubtitle,
    headerUserColorDark: modeValues.dark.headerUser,
    mutedColorLight: modeValues.light.muted,
    mutedColorDark: modeValues.dark.muted,
    welcomeBgLight: modeValues.light.welcomeBg,
    welcomeBgAlphaLight: modeValues.light.welcomeBgAlpha,
    welcomeFgLight: modeValues.light.welcomeFg,
    welcomeBorderLight: modeValues.light.welcomeBorder,
    welcomeTitleColorLight: modeValues.light.welcomeTitle,
    welcomeBodyColorLight: modeValues.light.welcomeBody,
    welcomeBgDark: modeValues.dark.welcomeBg,
    welcomeBgAlphaDark: modeValues.dark.welcomeBgAlpha,
    welcomeFgDark: modeValues.dark.welcomeFg,
    welcomeBorderDark: modeValues.dark.welcomeBorder,
    welcomeTitleColorDark: modeValues.dark.welcomeTitle,
    welcomeBodyColorDark: modeValues.dark.welcomeBody,
    cardBgLight: modeValues.light.cardBg,
    cardBgAlphaLight: modeValues.light.cardBgAlpha,
    cardFgLight: modeValues.light.cardFg,
    cardBorderLight: modeValues.light.cardBorder,
    cardBgDark: modeValues.dark.cardBg,
    cardBgAlphaDark: modeValues.dark.cardBgAlpha,
    cardFgDark: modeValues.dark.cardFg,
    cardBorderDark: modeValues.dark.cardBorder,
  });

  const applyPreset = (preset: any) => {
    if (!preset) return;
    setAppTitle(preset.appTitle || appTitle);
    setWelcomeTitleText(preset.welcomeTitleText || welcomeTitleText);
    setWelcomeBodyText(preset.welcomeBodyText || welcomeBodyText);
    setLoginIconUrl(preset.loginIconUrl || loginIconUrl);
    setAppIconUrl(preset.appIconUrl || appIconUrl);
    setColors({
      light: {
        background: preset.lightBackground || colors.light.background,
        border: preset.lightBorder || colors.light.border,
        foreground: preset.lightForeground || colors.light.foreground,
      },
      dark: {
        background: preset.darkBackground || colors.dark.background,
        border: preset.darkBorder || colors.dark.border,
        foreground: preset.darkForeground || colors.dark.foreground,
      },
    });
    setModeValues({
      light: {
        headerBg: preset.headerBgLight || modeValues.light.headerBg,
        headerBgAlpha: preset.headerBgAlphaLight ?? modeValues.light.headerBgAlpha ?? 1,
        headerFg: preset.headerFgLight || modeValues.light.headerFg,
        headerTitle: preset.headerTitleColorLight || modeValues.light.headerTitle,
        headerSubtitle: preset.headerSubtitleColorLight || modeValues.light.headerSubtitle,
        headerUser: preset.headerUserColorLight || modeValues.light.headerUser,
        muted: preset.mutedColorLight || modeValues.light.muted,
        welcomeBg: preset.welcomeBgLight || modeValues.light.welcomeBg,
        welcomeBgAlpha: preset.welcomeBgAlphaLight ?? modeValues.light.welcomeBgAlpha ?? 1,
        welcomeFg: preset.welcomeFgLight || modeValues.light.welcomeFg,
        welcomeBorder: preset.welcomeBorderLight || modeValues.light.welcomeBorder,
        welcomeTitle: preset.welcomeTitleColorLight || modeValues.light.welcomeTitle,
        welcomeBody: preset.welcomeBodyColorLight || modeValues.light.welcomeBody,
        cardBg: preset.cardBgLight || modeValues.light.cardBg,
        cardBgAlpha: preset.cardBgAlphaLight ?? modeValues.light.cardBgAlpha ?? 1,
        cardFg: preset.cardFgLight || modeValues.light.cardFg,
        cardBorder: preset.cardBorderLight || modeValues.light.cardBorder,
      },
      dark: {
        headerBg: preset.headerBgDark || modeValues.dark.headerBg,
        headerBgAlpha: preset.headerBgAlphaDark ?? modeValues.dark.headerBgAlpha ?? 1,
        headerFg: preset.headerFgDark || modeValues.dark.headerFg,
        headerTitle: preset.headerTitleColorDark || modeValues.dark.headerTitle,
        headerSubtitle: preset.headerSubtitleColorDark || modeValues.dark.headerSubtitle,
        headerUser: preset.headerUserColorDark || modeValues.dark.headerUser,
        muted: preset.mutedColorDark || modeValues.dark.muted,
        welcomeBg: preset.welcomeBgDark || modeValues.dark.welcomeBg,
        welcomeBgAlpha: preset.welcomeBgAlphaDark ?? modeValues.dark.welcomeBgAlpha ?? 1,
        welcomeFg: preset.welcomeFgDark || modeValues.dark.welcomeFg,
        welcomeBorder: preset.welcomeBorderDark || modeValues.dark.welcomeBorder,
        welcomeTitle: preset.welcomeTitleColorDark || modeValues.dark.welcomeTitle,
        welcomeBody: preset.welcomeBodyColorDark || modeValues.dark.welcomeBody,
        cardBg: preset.cardBgDark || modeValues.dark.cardBg,
        cardBgAlpha: preset.cardBgAlphaDark ?? modeValues.dark.cardBgAlpha ?? 1,
        cardFg: preset.cardFgDark || modeValues.dark.cardFg,
        cardBorder: preset.cardBorderDark || modeValues.dark.cardBorder,
      },
    });
  };

  const savePresetSnapshot = () => {
    if (!presetName.trim()) return;
    const snapshot = snapshotSettings();
    const next = [...presets.filter((p) => p.name !== presetName.trim()), { name: presetName.trim(), ...snapshot }];
    setPresets(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ui-presets', JSON.stringify(next));
    }
    setPresetName('');
    setMessage('プリセットを保存しました（UI設定の保存も行ってください）');
  };

  // プリセットをローカルにも保持しておき、サーバーから返らなかった場合のバックアップにする
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('ui-presets', JSON.stringify(presets));
  }, [presets]);

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
            <Link
              href="/dashboard/pr/menu"
              className="px-4 py-2 rounded-lg border border-border bg-card hover:border-accent"
            >
              広報トップへ
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {saving ? '保存中...' : '保存'}
            </button>
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
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm w-full sm:w-48"
              placeholder="プリセット名"
            />
            <div className="flex gap-2">
              <button onClick={savePresetSnapshot} className="px-3 py-2 rounded-lg border border-border bg-card hover:border-accent text-sm">
                プリセット保存
              </button>
              {presets.length > 0 && (
                <select
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    const p = presets.find((pr) => pr.name === e.target.value);
                    applyPreset(p);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    適用するプリセット
                  </option>
                  {presets.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
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
            <label className="text-sm text-muted-foreground space-y-1 block">
              ホーム画面追加用アイコンURL
              <input
                value={homeIconUrl}
                onChange={(e) => setHomeIconUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://example.com/home-icon.png"
              />
            </label>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-accent">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload('home', e.target.files?.[0])} disabled={uploading} />
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
              背景の透明度 (0-1)
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={currentMode.headerBgAlpha}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], headerBgAlpha: Number(e.target.value) },
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
              背景の透明度 (0-1)
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={currentMode.welcomeBgAlpha}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], welcomeBgAlpha: Number(e.target.value) },
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
              背景の透明度 (0-1)
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={currentMode.cardBgAlpha}
                onChange={(e) =>
                  setModeValues((prev) => ({
                    ...prev,
                    [selectedMode]: { ...prev[selectedMode], cardBgAlpha: Number(e.target.value) },
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
