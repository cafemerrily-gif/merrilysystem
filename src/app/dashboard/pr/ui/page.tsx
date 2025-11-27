// UI editor with gradients and alpha
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type ModeKey = 'light' | 'dark';

type BaseColors = {
  background: string;
  backgroundAlpha: number;
  backgroundGradient: string;
  border: string;
  foreground: string;
};

type SectionColors = {
  bg: string;
  bgGradient: string;
  bgAlpha: number;
  fg: string;
  border: string;
};

type ModeValues = {
  header: SectionColors & { title: string; subtitle: string; user: string };
  welcome: SectionColors & { title: string; body: string };
  card: SectionColors;
};

const defaultBase: Record<ModeKey, BaseColors> = {
  light: { background: '#f8fafc', backgroundAlpha: 1, backgroundGradient: '', border: '#e2e8f0', foreground: '#0f172a' },
  dark: { background: '#0b1220', backgroundAlpha: 1, backgroundGradient: '', border: '#1f2937', foreground: '#e5e7eb' },
};

const gradientOptions = [
  { label: 'なし', value: '' },
  { label: 'Night sky', value: 'linear-gradient(135deg, #0b1220, #1f2937)' },
  { label: 'Sunset', value: 'linear-gradient(135deg, #ff8a00, #e52e71)' },
  { label: 'Mint', value: 'linear-gradient(135deg, #a8ff78, #78ffd6)' },
  { label: 'Ocean', value: 'linear-gradient(135deg, #00c6ff, #0072ff)' },
];

const defaultModeValues: ModeValues = {
  header: { bg: '#0b1220', bgGradient: '', bgAlpha: 1, fg: '#e5e7eb', border: '#1f2937', title: '#e5e7eb', subtitle: '#94a3b8', user: '#cbd5e1' },
  welcome: { bg: '#ffffff', bgGradient: '', bgAlpha: 1, fg: '#0f172a', border: '#e2e8f0', title: '#0f172a', body: '#1f2937' },
  card: { bg: '#0b1220', bgGradient: '', bgAlpha: 1, fg: '#e5e7eb', border: '#1f2937' },
};
export default function UiEditor() {
  const supabase = createClientComponentClient();
  const [selectedMode, setSelectedMode] = useState<ModeKey>('light');
  const [baseColors, setBaseColors] = useState<Record<ModeKey, BaseColors>>(defaultBase);
  const [sections, setSections] = useState<Record<ModeKey, ModeValues>>({ light: defaultModeValues, dark: defaultModeValues });
  const [appTitle, setAppTitle] = useState('MERRILY');
  const [welcomeTitle, setWelcomeTitle] = useState('バー形式で全ダッシュボードをまとめました');
  const [welcomeBody, setWelcomeBody] = useState('最新の動きに応じて必要なボードをまとめたバーへ誘導します。最新ログや通知はカード側で閲覧できます。');
  const [loginIconUrl, setLoginIconUrl] = useState('/MERRILY_Simbol.png');
  const [appIconUrl, setAppIconUrl] = useState('/MERRILY_Simbol.png');
  const [homeIconUrl, setHomeIconUrl] = useState('/MERRILY_Simbol.png');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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
        setAppTitle(ui.appTitle || 'MERRILY');
        setWelcomeTitle(ui.welcomeTitleText || welcomeTitle);
        setWelcomeBody(ui.welcomeBodyText || welcomeBody);
        setLoginIconUrl(ui.loginIconUrl || '/MERRILY_Simbol.png');
        setAppIconUrl(ui.appIconUrl || '/MERRILY_Simbol.png');
        setHomeIconUrl(ui.homeIconUrl || ui.appIconUrl || '/MERRILY_Simbol.png');
        setBaseColors({
          light: {
            background: ui.lightBackground || defaultBase.light.background,
            backgroundAlpha: ui.lightBackgroundAlpha ?? defaultBase.light.backgroundAlpha,
            backgroundGradient: ui.lightBackgroundGradient || defaultBase.light.backgroundGradient,
            border: ui.lightBorder || defaultBase.light.border,
            foreground: ui.lightForeground || defaultBase.light.foreground,
          },
          dark: {
            background: ui.darkBackground || defaultBase.dark.background,
            backgroundAlpha: ui.darkBackgroundAlpha ?? defaultBase.dark.backgroundAlpha,
            backgroundGradient: ui.darkBackgroundGradient || defaultBase.dark.backgroundGradient,
            border: ui.darkBorder || defaultBase.dark.border,
            foreground: ui.darkForeground || defaultBase.dark.foreground,
          },
        });
        setSections({
          light: {
            header: {
              bg: ui.headerBgLight || ui.headerBackground || defaultModeValues.header.bg,
              bgGradient: ui.headerBgGradientLight || '',
              bgAlpha: ui.headerBgAlphaLight ?? defaultModeValues.header.bgAlpha,
              fg: ui.headerFgLight || ui.headerForeground || defaultModeValues.header.fg,
              border: ui.headerBorderLight || defaultModeValues.header.border,
              title: ui.headerTitleColorLight || defaultModeValues.header.title,
              subtitle: ui.headerSubtitleColorLight || defaultModeValues.header.subtitle,
              user: ui.headerUserColorLight || defaultModeValues.header.user,
            },
            welcome: {
              bg: ui.welcomeBgLight || ui.welcomeBackground || defaultModeValues.welcome.bg,
              bgGradient: ui.welcomeBgGradientLight || '',
              bgAlpha: ui.welcomeBgAlphaLight ?? defaultModeValues.welcome.bgAlpha,
              fg: ui.welcomeFgLight || ui.welcomeForeground || defaultModeValues.welcome.fg,
              border: ui.welcomeBorderLight || ui.welcomeBorder || defaultModeValues.welcome.border,
              title: ui.welcomeTitleColorLight || defaultModeValues.welcome.title,
              body: ui.welcomeBodyColorLight || defaultModeValues.welcome.body,
            },
            card: {
              bg: ui.cardBgLight || ui.cardBackground || defaultModeValues.card.bg,
              bgGradient: ui.cardBgGradientLight || '',
              bgAlpha: ui.cardBgAlphaLight ?? defaultModeValues.card.bgAlpha,
              fg: ui.cardFgLight || ui.cardForeground || defaultModeValues.card.fg,
              border: ui.cardBorderLight || ui.cardBorder || defaultModeValues.card.border,
            },
          },
          dark: {
            header: {
              bg: ui.headerBgDark || ui.headerBackground || defaultModeValues.header.bg,
              bgGradient: ui.headerBgGradientDark || '',
              bgAlpha: ui.headerBgAlphaDark ?? defaultModeValues.header.bgAlpha,
              fg: ui.headerFgDark || ui.headerForeground || defaultModeValues.header.fg,
              border: ui.headerBorderDark || defaultModeValues.header.border,
              title: ui.headerTitleColorDark || defaultModeValues.header.title,
              subtitle: ui.headerSubtitleColorDark || defaultModeValues.header.subtitle,
              user: ui.headerUserColorDark || defaultModeValues.header.user,
            },
            welcome: {
              bg: ui.welcomeBgDark || ui.welcomeBackground || defaultModeValues.welcome.bg,
              bgGradient: ui.welcomeBgGradientDark || '',
              bgAlpha: ui.welcomeBgAlphaDark ?? defaultModeValues.welcome.bgAlpha,
              fg: ui.welcomeFgDark || ui.welcomeForeground || defaultModeValues.welcome.fg,
              border: ui.welcomeBorderDark || ui.welcomeBorder || defaultModeValues.welcome.border,
              title: ui.welcomeTitleColorDark || defaultModeValues.welcome.title,
              body: ui.welcomeBodyColorDark || defaultModeValues.welcome.body,
            },
            card: {
              bg: ui.cardBgDark || ui.cardBackground || defaultModeValues.card.bg,
              bgGradient: ui.cardBgGradientDark || '',
              bgAlpha: ui.cardBgAlphaDark ?? defaultModeValues.card.bgAlpha,
              fg: ui.cardFgDark || ui.cardForeground || defaultModeValues.card.fg,
              border: ui.cardBorderDark || ui.cardBorder || defaultModeValues.card.border,
            },
          },
        });
        const loadedPresets = ui.presets && Array.isArray(ui.presets) ? ui.presets : [];
        setPresets(loadedPresets);
        setBasePayload(data || {});
      } catch (e: any) {
        setError(e?.message || '設定の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
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
          welcomeTitleText: welcomeTitle,
          welcomeBodyText: welcomeBody,
          loginIconUrl,
          appIconUrl,
          lightBackground: baseColors.light.background,
          lightBackgroundAlpha: baseColors.light.backgroundAlpha,
          lightBackgroundGradient: baseColors.light.backgroundGradient,
          lightBorder: baseColors.light.border,
          lightForeground: baseColors.light.foreground,
          darkBackground: baseColors.dark.background,
          darkBackgroundAlpha: baseColors.dark.backgroundAlpha,
          darkBackgroundGradient: baseColors.dark.backgroundGradient,
          darkBorder: baseColors.dark.border,
          darkForeground: baseColors.dark.foreground,
          headerBgLight: sections.light.header.bg,
          headerBgGradientLight: sections.light.header.bgGradient,
          headerBgAlphaLight: sections.light.header.bgAlpha,
          headerFgLight: sections.light.header.fg,
          headerBorderLight: sections.light.header.border,
          headerTitleColorLight: sections.light.header.title,
          headerSubtitleColorLight: sections.light.header.subtitle,
          headerUserColorLight: sections.light.header.user,
          headerBgDark: sections.dark.header.bg,
          headerBgGradientDark: sections.dark.header.bgGradient,
          headerBgAlphaDark: sections.dark.header.bgAlpha,
          headerFgDark: sections.dark.header.fg,
          headerBorderDark: sections.dark.header.border,
          headerTitleColorDark: sections.dark.header.title,
          headerSubtitleColorDark: sections.dark.header.subtitle,
          headerUserColorDark: sections.dark.header.user,
          welcomeBgLight: sections.light.welcome.bg,
          welcomeBgGradientLight: sections.light.welcome.bgGradient,
          welcomeBgAlphaLight: sections.light.welcome.bgAlpha,
          welcomeFgLight: sections.light.welcome.fg,
          welcomeBorderLight: sections.light.welcome.border,
          welcomeTitleColorLight: sections.light.welcome.title,
          welcomeBodyColorLight: sections.light.welcome.body,
          welcomeBgDark: sections.dark.welcome.bg,
          welcomeBgGradientDark: sections.dark.welcome.bgGradient,
          welcomeBgAlphaDark: sections.dark.welcome.bgAlpha,
          welcomeFgDark: sections.dark.welcome.fg,
          welcomeBorderDark: sections.dark.welcome.border,
          welcomeTitleColorDark: sections.dark.welcome.title,
          welcomeBodyColorDark: sections.dark.welcome.body,
          cardBgLight: sections.light.card.bg,
          cardBgGradientLight: sections.light.card.bgGradient,
          cardBgAlphaLight: sections.light.card.bgAlpha,
          cardFgLight: sections.light.card.fg,
          cardBorderLight: sections.light.card.border,
          cardBgDark: sections.dark.card.bg,
          cardBgGradientDark: sections.dark.card.bgGradient,
          cardBgAlphaDark: sections.dark.card.bgAlpha,
          cardFgDark: sections.dark.card.fg,
          cardBorderDark: sections.dark.card.border,
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
  const currentBase = baseColors[selectedMode];
  const currentSection = sections[selectedMode];

  const makePreset = () => ({
    name: presetName || `プリセット${presets.length + 1}`,
    appTitle,
    welcomeTitleText: welcomeTitle,
    welcomeBodyText: welcomeBody,
    loginIconUrl,
    appIconUrl,
    homeIconUrl,
    lightBackground: baseColors.light.background,
    lightBackgroundAlpha: baseColors.light.backgroundAlpha,
    lightBackgroundGradient: baseColors.light.backgroundGradient,
    lightBorder: baseColors.light.border,
    lightForeground: baseColors.light.foreground,
    darkBackground: baseColors.dark.background,
    darkBackgroundAlpha: baseColors.dark.backgroundAlpha,
    darkBackgroundGradient: baseColors.dark.backgroundGradient,
    darkBorder: baseColors.dark.border,
    darkForeground: baseColors.dark.foreground,
    headerBgLight: sections.light.header.bg,
    headerBgGradientLight: sections.light.header.bgGradient,
    headerBgAlphaLight: sections.light.header.bgAlpha,
    headerFgLight: sections.light.header.fg,
    headerBorderLight: sections.light.header.border,
    headerTitleColorLight: sections.light.header.title,
    headerSubtitleColorLight: sections.light.header.subtitle,
    headerUserColorLight: sections.light.header.user,
    headerBgDark: sections.dark.header.bg,
    headerBgGradientDark: sections.dark.header.bgGradient,
    headerBgAlphaDark: sections.dark.header.bgAlpha,
    headerFgDark: sections.dark.header.fg,
    headerBorderDark: sections.dark.header.border,
    headerTitleColorDark: sections.dark.header.title,
    headerSubtitleColorDark: sections.dark.header.subtitle,
    headerUserColorDark: sections.dark.header.user,
    welcomeBgLight: sections.light.welcome.bg,
    welcomeBgGradientLight: sections.light.welcome.bgGradient,
    welcomeBgAlphaLight: sections.light.welcome.bgAlpha,
    welcomeFgLight: sections.light.welcome.fg,
    welcomeBorderLight: sections.light.welcome.border,
    welcomeTitleColorLight: sections.light.welcome.title,
    welcomeBodyColorLight: sections.light.welcome.body,
    welcomeBgDark: sections.dark.welcome.bg,
    welcomeBgGradientDark: sections.dark.welcome.bgGradient,
    welcomeBgAlphaDark: sections.dark.welcome.bgAlpha,
    welcomeFgDark: sections.dark.welcome.fg,
    welcomeBorderDark: sections.dark.welcome.border,
    welcomeTitleColorDark: sections.dark.welcome.title,
    welcomeBodyColorDark: sections.dark.welcome.body,
    cardBgLight: sections.light.card.bg,
    cardBgGradientLight: sections.light.card.bgGradient,
    cardBgAlphaLight: sections.light.card.bgAlpha,
    cardFgLight: sections.light.card.fg,
    cardBorderLight: sections.light.card.border,
    cardBgDark: sections.dark.card.bg,
    cardBgGradientDark: sections.dark.card.bgGradient,
    cardBgAlphaDark: sections.dark.card.bgAlpha,
    cardFgDark: sections.dark.card.fg,
    cardBorderDark: sections.dark.card.border,
  });
  const applyPreset = (p: any) => {
    if (!p) return;
    setAppTitle(p.appTitle || appTitle);
    setWelcomeTitle(p.welcomeTitleText || welcomeTitle);
    setWelcomeBody(p.welcomeBodyText || welcomeBody);
    setLoginIconUrl(p.loginIconUrl || loginIconUrl);
    setAppIconUrl(p.appIconUrl || appIconUrl);
    setHomeIconUrl(p.homeIconUrl || homeIconUrl);
    setBaseColors({
      light: {
        background: p.lightBackground || baseColors.light.background,
        backgroundAlpha: p.lightBackgroundAlpha ?? baseColors.light.backgroundAlpha,
        backgroundGradient: p.lightBackgroundGradient || baseColors.light.backgroundGradient,
        border: p.lightBorder || baseColors.light.border,
        foreground: p.lightForeground || baseColors.light.foreground,
      },
      dark: {
        background: p.darkBackground || baseColors.dark.background,
        backgroundAlpha: p.darkBackgroundAlpha ?? baseColors.dark.backgroundAlpha,
        backgroundGradient: p.darkBackgroundGradient || baseColors.dark.backgroundGradient,
        border: p.darkBorder || baseColors.dark.border,
        foreground: p.darkForeground || baseColors.dark.foreground,
      },
    });
    setSections({
      light: {
        header: {
          bg: p.headerBgLight || sections.light.header.bg,
          bgGradient: p.headerBgGradientLight || sections.light.header.bgGradient,
          bgAlpha: p.headerBgAlphaLight ?? sections.light.header.bgAlpha,
          fg: p.headerFgLight || sections.light.header.fg,
          border: p.headerBorderLight || sections.light.header.border,
          title: p.headerTitleColorLight || sections.light.header.title,
          subtitle: p.headerSubtitleColorLight || sections.light.header.subtitle,
          user: p.headerUserColorLight || sections.light.header.user,
        },
        welcome: {
          bg: p.welcomeBgLight || sections.light.welcome.bg,
          bgGradient: p.welcomeBgGradientLight || sections.light.welcome.bgGradient,
          bgAlpha: p.welcomeBgAlphaLight ?? sections.light.welcome.bgAlpha,
          fg: p.welcomeFgLight || sections.light.welcome.fg,
          border: p.welcomeBorderLight || sections.light.welcome.border,
          title: p.welcomeTitleColorLight || sections.light.welcome.title,
          body: p.welcomeBodyColorLight || sections.light.welcome.body,
        },
        card: {
          bg: p.cardBgLight || sections.light.card.bg,
          bgGradient: p.cardBgGradientLight || sections.light.card.bgGradient,
          bgAlpha: p.cardBgAlphaLight ?? sections.light.card.bgAlpha,
          fg: p.cardFgLight || sections.light.card.fg,
          border: p.cardBorderLight || sections.light.card.border,
        },
      },
      dark: {
        header: {
          bg: p.headerBgDark || sections.dark.header.bg,
          bgGradient: p.headerBgGradientDark || sections.dark.header.bgGradient,
          bgAlpha: p.headerBgAlphaDark ?? sections.dark.header.bgAlpha,
          fg: p.headerFgDark || sections.dark.header.fg,
          border: p.headerBorderDark || sections.dark.header.border,
          title: p.headerTitleColorDark || sections.dark.header.title,
          subtitle: p.headerSubtitleColorDark || sections.dark.header.subtitle,
          user: p.headerUserColorDark || sections.dark.header.user,
        },
        welcome: {
          bg: p.welcomeBgDark || sections.dark.welcome.bg,
          bgGradient: p.welcomeBgGradientDark || sections.dark.welcome.bgGradient,
          bgAlpha: p.welcomeBgAlphaDark ?? sections.dark.welcome.bgAlpha,
          fg: p.welcomeFgDark || sections.dark.welcome.fg,
          border: p.welcomeBorderDark || sections.dark.welcome.border,
          title: p.welcomeTitleColorDark || sections.dark.welcome.title,
          body: p.welcomeBodyColorDark || sections.dark.welcome.body,
        },
        card: {
          bg: p.cardBgDark || sections.dark.card.bg,
          bgGradient: p.cardBgGradientDark || sections.dark.card.bgGradient,
          bgAlpha: p.cardBgAlphaDark ?? sections.dark.card.bgAlpha,
          fg: p.cardFgDark || sections.dark.card.fg,
          border: p.cardBorderDark || sections.dark.card.border,
        },
      },
    });
  };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ui-presets', JSON.stringify(presets));
    }
  }, [presets]);

  const savePresetSnapshot = () => {
    const next = makePreset();
    setPresets((prev) => {
      const filtered = prev.filter((p) => p.name !== next.name);
      return [...filtered, next];
    });
    setMessage('プリセットを保存しました（保存ボタンで反映）');
  };

  const setSection = (key: keyof ModeValues, field: keyof SectionColors | 'title' | 'subtitle' | 'user' | 'body', value: any) => {
    setSections((prev) => ({
      ...prev,
      [selectedMode]: { ...prev[selectedMode], [key]: { ...prev[selectedMode][key], [field]: value } },
    }));
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
            <h1 className="text-2xl font-bold">UI編集（配色・透明度・グラデーション）</h1>
            <p className="text-muted-foreground text-sm">先にライト/ダークを選択し、そのモードの色・透明度・グラデーションを設定してください。</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/pr/menu" className="px-4 py-2 rounded-lg border border-border bg-card hover:border-accent">
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
                className={`px-3 py-2 rounded-lg border ${selectedMode === mode ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}
              >
                {mode === 'light' ? 'ライトモード' : 'ダークモード'}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">選んだモードの色だけが変更されます。</p>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center pt-2">
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
            <label className="text-sm text-muted-foreground space-y-1 block">
              ログイン後（ヘッダー）のアイコンURL
              <input
                value={appIconUrl}
                onChange={(e) => setAppIconUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://example.com/app-icon.png"
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              ホーム追加用アイコンURL
              <input
                value={homeIconUrl}
                onChange={(e) => setHomeIconUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://example.com/home-icon.png"
              />
            </label>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {(['login', 'app', 'home'] as const).map((target) => (
                <label key={target} className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-accent">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(target, e.target.files?.[0])}
                    disabled={uploading}
                  />
                  <span>デバイスからアップロード ({target})</span>
                </label>
              ))}
              {uploading && <span>アップロード中...</span>}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">ベース色（背景/透明度/グラデーション）</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              背景色
              <input
                type="color"
                value={currentBase.background}
                onChange={(e) => setBaseColors((c) => ({ ...c, [selectedMode]: { ...c[selectedMode], background: e.target.value } }))}
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              透明度 (0-1)
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={currentBase.backgroundAlpha}
                onChange={(e) =>
                  setBaseColors((c) => ({
                    ...c,
                    [selectedMode]: { ...c[selectedMode], backgroundAlpha: Number(e.target.value) },
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              グラデーション
              <select
                value={currentBase.backgroundGradient}
                onChange={(e) =>
                  setBaseColors((c) => ({
                    ...c,
                    [selectedMode]: { ...c[selectedMode], backgroundGradient: e.target.value },
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {gradientOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              枠線色
              <input
                type="color"
                value={currentBase.border}
                onChange={(e) => setBaseColors((c) => ({ ...c, [selectedMode]: { ...c[selectedMode], border: e.target.value } }))}
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              文字色
              <input
                type="color"
                value={currentBase.foreground}
                onChange={(e) => setBaseColors((c) => ({ ...c, [selectedMode]: { ...c[selectedMode], foreground: e.target.value } }))}
              />
            </label>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">ヘッダー</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              背景色
              <input type="color" value={currentSection.header.bg} onChange={(e) => setSection('header', 'bg', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              グラデーション
              <select
                value={currentSection.header.bgGradient}
                onChange={(e) => setSection('header', 'bgGradient', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {gradientOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              透明度 (0-1)
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={currentSection.header.bgAlpha}
                onChange={(e) => setSection('header', 'bgAlpha', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              文字色（ベース）
              <input type="color" value={currentSection.header.fg} onChange={(e) => setSection('header', 'fg', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              タイトル色
              <input type="color" value={currentSection.header.title} onChange={(e) => setSection('header', 'title', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              サブタイトル色
              <input type="color" value={currentSection.header.subtitle} onChange={(e) => setSection('header', 'subtitle', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              ユーザー行の色
              <input type="color" value={currentSection.header.user} onChange={(e) => setSection('header', 'user', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              枠線色
              <input type="color" value={currentSection.header.border} onChange={(e) => setSection('header', 'border', e.target.value)} />
            </label>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">Welcomeカードの内容</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              タイトル
              <input
                value={welcomeTitle}
                onChange={(e) => setWelcomeTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              本文
              <textarea
                value={welcomeBody}
                onChange={(e) => setWelcomeBody(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                rows={3}
              />
            </label>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">Welcomeカードの色</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              背景色
              <input type="color" value={currentSection.welcome.bg} onChange={(e) => setSection('welcome', 'bg', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              グラデーション
              <select
                value={currentSection.welcome.bgGradient}
                onChange={(e) => setSection('welcome', 'bgGradient', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {gradientOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              透明度 (0-1)
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={currentSection.welcome.bgAlpha}
                onChange={(e) => setSection('welcome', 'bgAlpha', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              文字色
              <input type="color" value={currentSection.welcome.fg} onChange={(e) => setSection('welcome', 'fg', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              枠線色
              <input type="color" value={currentSection.welcome.border} onChange={(e) => setSection('welcome', 'border', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              タイトル文字色
              <input type="color" value={currentSection.welcome.title} onChange={(e) => setSection('welcome', 'title', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              本文字色
              <input type="color" value={currentSection.welcome.body} onChange={(e) => setSection('welcome', 'body', e.target.value)} />
            </label>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">その他カード（ログ/通知など）</h2>
            <label className="text-sm text-muted-foreground space-y-1 block">
              背景色
              <input type="color" value={currentSection.card.bg} onChange={(e) => setSection('card', 'bg', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              グラデーション
              <select
                value={currentSection.card.bgGradient}
                onChange={(e) => setSection('card', 'bgGradient', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {gradientOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              透明度 (0-1)
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={currentSection.card.bgAlpha}
                onChange={(e) => setSection('card', 'bgAlpha', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              文字色
              <input type="color" value={currentSection.card.fg} onChange={(e) => setSection('card', 'fg', e.target.value)} />
            </label>
            <label className="text-sm text-muted-foreground space-y-1 block">
              枠線色
              <input type="color" value={currentSection.card.border} onChange={(e) => setSection('card', 'border', e.target.value)} />
            </label>
          </div>
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
