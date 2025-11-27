'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type ModeKey = 'light' | 'dark';

type SectionColors = {
  bg: string;
  bgAlpha: number;
  gradient: string;
  fg: string;
  border: string;
};

type ModeSections = {
  header: SectionColors & { title: string; subtitle: string; user: string };
  welcome: SectionColors & { title: string; body: string };
  card: SectionColors;
};

type Preset = {
  name: string;
  sections: Record<ModeKey, ModeSections>;
};

type UiPayload = {
  uiSettings?: {
    appTitle?: string;
    loginIconUrl?: string;
    appIconUrl?: string;
    homeIconUrl?: string;
    sections?: Record<ModeKey, ModeSections>;
    presets?: Preset[];
  };
};

const gradientOptions = [
  { label: 'なし', value: '' },
  { label: 'Night sky', value: 'linear-gradient(135deg, #0b1220, #1f2937)' },
  { label: 'Sunrise', value: 'linear-gradient(135deg, rgba(255,145,0,0.45), rgba(255,72,94,0.35))' },
  { label: 'Pastel glow', value: 'linear-gradient(120deg, rgba(173,212,255,0.45), rgba(255,255,255,0))' },
  { label: 'Soft gradient', value: 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(15,23,42,0.4))' },
  { label: 'Ocean Breeze', value: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' },
  { label: 'Sunset Glow', value: 'linear-gradient(135deg, #f97316, #f43f5e)' },
  { label: 'Aurora Mist', value: 'linear-gradient(135deg, #0f172a, #4ade80)' },
  { label: 'Forest Haze', value: 'linear-gradient(135deg, #0f172a, #22c55e)' },
  { label: 'Calm Teal', value: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' },
  { label: 'Coffee Warmth', value: 'linear-gradient(135deg, #3f1d13, #a16207)' },
];

const defaultModeSections: ModeSections = {
  header: {
    bg: '#0b1220',
    bgAlpha: 1,
    gradient: '',
    fg: '#e5e7eb',
    border: '#1f2937',
    title: '#e5e7eb',
    subtitle: '#94a3b8',
    user: '#cbd5e1',
  },
  welcome: {
    bg: '#ffffff',
    bgAlpha: 1,
    gradient: '',
    fg: '#0f172a',
    border: '#e2e8f0',
    title: '#0f172a',
    body: '#1f2937',
  },
  card: {
    bg: '#0f172a',
    bgAlpha: 1,
    gradient: '',
    fg: '#e5e7eb',
    border: '#1f2937',
  },
};

const cloneSections = (sections?: ModeSections): ModeSections => {
  const source = sections || defaultModeSections;
  return {
    header: { ...source.header },
    welcome: { ...source.welcome },
    card: { ...source.card },
  };
};

const defaultPresets: Preset[] = [
  {
    name: 'Default',
    sections: {
      light: cloneSections(defaultModeSections),
      dark: cloneSections(defaultModeSections),
    },
  },
  {
    name: 'Sunrise',
    sections: {
      light: {
        header: { ...defaultModeSections.header, bg: '#ffe3b8', fg: '#1f2937', gradient: 'linear-gradient(135deg, #ffe29f, #ff7a18)' },
        welcome: { ...defaultModeSections.welcome, bg: '#fff9f1', fg: '#1f2937', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,170,0,0.2))' },
        card: { ...defaultModeSections.card, bg: '#fff5ed', fg: '#1f2937', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,110,64,0.25))' },
      },
      dark: {
        header: { ...defaultModeSections.header, bg: '#1f1c2c', fg: '#f0c987', gradient: 'linear-gradient(145deg, #1f1c2c, #3a4c63)' },
        welcome: { ...defaultModeSections.welcome, bg: '#0d0b19', fg: '#f0c987', gradient: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(240,201,135,0.2))' },
        card: { ...defaultModeSections.card, bg: '#0f1220', fg: '#f0c987', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(240,201,135,0.25))' },
      },
    },
  },
  {
    name: 'Midnight Bloom',
    sections: {
      light: {
        header: { ...defaultModeSections.header, bg: '#f0f4ff', fg: '#1f2937', gradient: 'linear-gradient(135deg, #f0f4ff, #cfd3ff)' },
        welcome: { ...defaultModeSections.welcome, bg: '#ffffff', fg: '#1f2937', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(99,102,241,0.1))' },
        card: { ...defaultModeSections.card, bg: '#eff1ff', fg: '#1f2937', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(79,70,229,0.2))' },
      },
      dark: {
        header: { ...defaultModeSections.header, bg: '#0f172a', fg: '#a5b4fc', gradient: 'linear-gradient(135deg, #0f172a, #312e81)' },
        welcome: { ...defaultModeSections.welcome, bg: '#090e1a', fg: '#a5b4fc', gradient: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(165,180,252,0.2))' },
        card: { ...defaultModeSections.card, bg: '#0b1220', fg: '#c7d2fe', gradient: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(255,255,255,0.1))' },
      },
    },
  },
  {
    name: 'Coastal Mist',
    sections: {
      light: {
        header: { ...defaultModeSections.header, bg: '#d7efff', fg: '#0c1e2a', gradient: 'linear-gradient(135deg, #d7efff, #7dc0ff)' },
        welcome: { ...defaultModeSections.welcome, bg: '#ecf6ff', fg: '#0c1e2a', gradient: 'linear-gradient(135deg, rgba(237,246,255,0.7), rgba(124,192,255,0.25))' },
        card: { ...defaultModeSections.card, bg: '#f5fbff', fg: '#0c1e2a', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(124,192,255,0.2))' },
      },
      dark: {
        header: { ...defaultModeSections.header, bg: '#0b1f2f', fg: '#b3d4ff', gradient: 'linear-gradient(135deg, #0b1f2f, #1f3f5f)' },
        welcome: { ...defaultModeSections.welcome, bg: '#09121f', fg: '#b3d4ff', gradient: 'linear-gradient(135deg, rgba(9,18,31,0.9), rgba(179,212,255,0.2))' },
        card: { ...defaultModeSections.card, bg: '#0f1825', fg: '#d6e6ff', gradient: 'linear-gradient(135deg, rgba(179,212,255,0.25), rgba(255,255,255,0.05))' },
      },
    },
  },
  {
    name: 'Solar Harvest',
    sections: {
      light: {
        header: { ...defaultModeSections.header, bg: '#fff4e1', fg: '#4b2e0f', gradient: 'linear-gradient(135deg, #fff4e1, #ffc166)' },
        welcome: { ...defaultModeSections.welcome, bg: '#fff9f1', fg: '#4b2e0f', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,177,58,0.25))' },
        card: { ...defaultModeSections.card, bg: '#fff7ee', fg: '#4b2e0f', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,177,58,0.2))' },
      },
      dark: {
        header: { ...defaultModeSections.header, bg: '#2b1f00', fg: '#ffe9d5', gradient: 'linear-gradient(135deg, #2b1f00, #5c3610)' },
        welcome: { ...defaultModeSections.welcome, bg: '#1a1204', fg: '#ffe9d5', gradient: 'linear-gradient(135deg, rgba(0,0,0,0.85), rgba(255,233,213,0.2))' },
        card: { ...defaultModeSections.card, bg: '#1c1004', fg: '#ffe9d5', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,233,213,0.25))' },
      },
    },
  },
];

const mergePresetsWithDefaults = (storedPresets?: Preset[]) => {
  const merged = [...defaultPresets];
  if (Array.isArray(storedPresets) && storedPresets.length) {
    storedPresets.forEach((preset) => {
      const existingIndex = merged.findIndex((p) => p.name === preset.name);
      if (existingIndex >= 0) {
        merged[existingIndex] = preset;
      } else {
        merged.push(preset);
      }
    });
  }
  return merged;
};

const selectInitialPresetName = (storedPresets?: Preset[]) => {
  if (Array.isArray(storedPresets) && storedPresets.length) {
    return storedPresets[storedPresets.length - 1].name;
  }
  return defaultPresets[0].name;
};

type BaseBackgroundSettings = {
  bg: string;
  bgAlpha: number;
  gradient: string;
};

const defaultBaseBackgrounds: Record<ModeKey, BaseBackgroundSettings> = {
  light: { bg: '#f8fafc', bgAlpha: 1, gradient: '' },
  dark: { bg: '#0b1220', bgAlpha: 1, gradient: '' },
};

const createDefaultBaseBackgrounds = () => ({
  light: { ...defaultBaseBackgrounds.light },
  dark: { ...defaultBaseBackgrounds.dark },
});

const sectionsToUiSettings = (sections: Record<ModeKey, ModeSections>) => {
  const out: Record<string, string | number> = {};
  (['light', 'dark'] as ModeKey[]).forEach((mode) => {
    const suffix = mode === 'light' ? 'Light' : 'Dark';
    const section = sections[mode];
    const { header, card, welcome } = section;

    out[`headerBg${suffix}`] = header.bg;
    out[`headerBgAlpha${suffix}`] = header.bgAlpha;
    out[`headerBgGradient${suffix}`] = header.gradient;
    out[`headerFg${suffix}`] = header.fg;
    out[`headerBorder${suffix}`] = header.border;
    out[`headerTitleColor${suffix}`] = header.title;
    out[`headerSubtitleColor${suffix}`] = header.subtitle;
    out[`headerUserColor${suffix}`] = header.user;

    out[`cardBg${suffix}`] = card.bg;
    out[`cardBgAlpha${suffix}`] = card.bgAlpha;
    out[`cardBgGradient${suffix}`] = card.gradient;
    out[`cardFg${suffix}`] = card.fg;
    out[`cardBorder${suffix}`] = card.border;

    out[`welcomeBg${suffix}`] = welcome.bg;
    out[`welcomeBgAlpha${suffix}`] = welcome.bgAlpha;
    out[`welcomeBgGradient${suffix}`] = welcome.gradient;
    out[`welcomeFg${suffix}`] = welcome.fg;
    out[`welcomeBorder${suffix}`] = welcome.border;
    out[`welcomeTitleColor${suffix}`] = welcome.title;
    out[`welcomeBodyColor${suffix}`] = welcome.body;
  });

  return out;
};

const baseBackgroundsToUiSettings = (backgrounds: Record<ModeKey, BaseBackgroundSettings>) => ({
  lightBackground: backgrounds.light.bg,
  lightBackgroundAlpha: backgrounds.light.bgAlpha,
  lightBackgroundGradient: backgrounds.light.gradient,
  darkBackground: backgrounds.dark.bg,
  darkBackgroundAlpha: backgrounds.dark.bgAlpha,
  darkBackgroundGradient: backgrounds.dark.gradient,
});

export default function UiEditor() {
  const supabase = createClientComponentClient();
  const [selectedMode, setSelectedMode] = useState<ModeKey>('light');
  const [sections, setSections] = useState<Record<ModeKey, ModeSections>>({
    light: cloneSections(defaultModeSections),
    dark: cloneSections(defaultModeSections),
  });
  const [baseBackgrounds, setBaseBackgrounds] = useState<Record<ModeKey, BaseBackgroundSettings>>(createDefaultBaseBackgrounds());
  const [appTitle, setAppTitle] = useState('MERRILY');
  const [welcomeTitle, setWelcomeTitle] = useState('バーとログがひと目でわかるダッシュボード');
  const [welcomeBody, setWelcomeBody] = useState('色やアイコン、グラデーションを自由に設定できます。');
  const [loginIconUrl, setLoginIconUrl] = useState('/MERRILY_Simbol.png');
  const [appIconUrl, setAppIconUrl] = useState('/MERRILY_Simbol.png');
  const [homeIconUrl, setHomeIconUrl] = useState('/MERRILY_Simbol.png');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [presets, setPresets] = useState<Preset[]>(defaultPresets);
  const [presetName, setPresetName] = useState('Custom Preset');
  const [selectedPreset, setSelectedPreset] = useState<string>(defaultPresets[0].name);
  const [basePayload, setBasePayload] = useState<any>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pr/website', { cache: 'no-store' });
      const data: UiPayload = await res.json();
      const ui = data?.uiSettings || {};
      setAppTitle(ui.appTitle || appTitle);
      setLoginIconUrl(ui.loginIconUrl || loginIconUrl);
      setAppIconUrl(ui.appIconUrl || appIconUrl);
      setHomeIconUrl(ui.homeIconUrl || homeIconUrl);
      setSections({
        light: cloneSections(ui.sections?.light),
        dark: cloneSections(ui.sections?.dark),
      });
      setBaseBackgrounds({
        light: {
          bg: ui.lightBackground || defaultBaseBackgrounds.light.bg,
          bgAlpha: typeof ui.lightBackgroundAlpha === 'number' ? ui.lightBackgroundAlpha : defaultBaseBackgrounds.light.bgAlpha,
          gradient: ui.lightBackgroundGradient || defaultBaseBackgrounds.light.gradient,
        },
        dark: {
          bg: ui.darkBackground || defaultBaseBackgrounds.dark.bg,
          bgAlpha: typeof ui.darkBackgroundAlpha === 'number' ? ui.darkBackgroundAlpha : defaultBaseBackgrounds.dark.bgAlpha,
          gradient: ui.darkBackgroundGradient || defaultBaseBackgrounds.dark.gradient,
        },
      });
      const mergedPresets = mergePresetsWithDefaults(ui.presets);
      setPresets(mergedPresets);
        setSelectedPreset(selectInitialPresetName(ui.presets));
        setBasePayload(data || {});
      } catch (e: any) {
        setError(e?.message || '設定の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const preset = presets.find((p) => p.name === selectedPreset);
    if (preset) {
      setSections({
        light: cloneSections(preset.sections.light),
        dark: cloneSections(preset.sections.dark),
      });
    }
  }, [presets, selectedPreset]);

  useEffect(() => {
    if (!presets.length) return;
    if (!presets.some((p) => p.name === selectedPreset)) {
      setSelectedPreset(presets[0].name);
    }
  }, [presets, selectedPreset]);

  const currentSection = sections[selectedMode];
  const cardTextColor = currentSection.card.fg;
  const cardBorderColor = currentSection.card.border;
  const headerTextColor = currentSection.header.fg;
  const welcomeTextColor = currentSection.welcome.fg;
  const currentBaseBackground = baseBackgrounds[selectedMode];

  const updateSection = (section: keyof ModeSections, field: keyof SectionColors, value: string | number) => {
    const parsedValue = field === 'bgAlpha' ? Number(value) : value;
    setSections((prev) => ({
      ...prev,
      [selectedMode]: {
        ...prev[selectedMode],
        [section]: {
          ...prev[selectedMode][section],
          [field]: parsedValue,
        },
      },
    }));
  };

  const updateBaseBackground = (mode: ModeKey, field: keyof BaseBackgroundSettings, value: string | number) => {
    const parsedValue = field === 'bgAlpha' ? Number(value) : value;
    setBaseBackgrounds((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [field]: parsedValue,
      },
    }));
  };

  const handleUpload = async (target: 'login' | 'app' | 'home', file?: File | null) => {
    if (!file) return;
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `${target}-icon-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('ui-icons').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('ui-icons').getPublicUrl(fileName);
      if (target === 'login') setLoginIconUrl(data.publicUrl);
      if (target === 'app') setAppIconUrl(data.publicUrl);
      if (target === 'home') setHomeIconUrl(data.publicUrl);
    } catch (e: any) {
      setError(e?.message || 'アイコンのアップロードに失敗しました');
    }
  };

  const savePreset = () => {
    const nextPreset: Preset = {
      name: presetName || `Preset ${presets.length + 1}`,
      sections: {
        light: cloneSections(sections.light),
        dark: cloneSections(sections.dark),
      },
    };
    setPresets((prev) => {
      const filtered = prev.filter((p) => p.name !== nextPreset.name);
      return [...filtered, nextPreset];
    });
    setMessage('プリセットを保存しました');
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...basePayload,
        uiSettings: {
          appTitle,
          loginIconUrl,
          appIconUrl,
          homeIconUrl,
          welcomeTitleText: welcomeTitle,
          welcomeBodyText: welcomeBody,
          sections,
          presets,
          ...sectionsToUiSettings(sections),
          ...baseBackgroundsToUiSettings(baseBackgrounds),
        },
      };
      const res = await fetch('/api/pr/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, updated_by: 'UI editor' }),
      });
      if (!res.ok) throw new Error(`保存に失敗しました (${res.status})`);
      setMessage('保存しました');
    } catch (e: any) {
      setError(e?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">UI編集</h1>
          <Link href="/dashboard/pr/menu" className="text-sm text-muted-foreground hover:text-accent">
            広報トップへ戻る
          </Link>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm flex-1"
          >
            {presets.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
          <input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm flex-1"
            placeholder="新規プリセット名"
          />
          <button
            type="button"
            className="rounded-lg border border-accent px-3 py-2 text-sm text-accent hover:bg-accent/10"
            onClick={savePreset}
          >
            プリセット保存
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {(['light', 'dark'] as ModeKey[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSelectedMode(mode)}
              className={`rounded-xl border px-4 py-2 text-sm font-bold ${selectedMode === mode ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              {mode === 'light' ? 'ライトモード' : 'ダークモード'}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: cardTextColor }}>
          <h2 className="text-lg font-semibold mb-3">ベース背景 ({selectedMode === 'light' ? 'ライト' : 'ダーク'})</h2>
          <label className="text-sm block mb-2">
            背景色
            <input
              type="color"
              value={currentBaseBackground.bg}
              onChange={(e) => updateBaseBackground(selectedMode, 'bg', e.target.value)}
              className="mt-1 w-full"
            />
          </label>
          <label className="text-sm block mb-2">
            透明度
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(currentBaseBackground.bgAlpha * 100)}
                onChange={(e) => updateBaseBackground(selectedMode, 'bgAlpha', Number(e.target.value) / 100)}
                className="mt-1 w-full"
              />
              <span className="text-xs text-muted-foreground w-12 text-right">
                {Math.round(currentBaseBackground.bgAlpha * 100)}%
              </span>
            </div>
          </label>
          <label className="text-sm block">
            グラデーション
            <select
              value={currentBaseBackground.gradient}
              onChange={(e) => updateBaseBackground(selectedMode, 'gradient', e.target.value)}
              className="mt-1 w-full"
            >
              {gradientOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: cardTextColor }}>
            <h2 className="text-lg font-semibold mb-3">アイコンアップロード</h2>
            <label className="text-sm block mb-2">
              ログイン画面アイコン
              <input type="file" accept="image/*" className="mt-1 w-full text-xs" onChange={(e) => handleUpload('login', e.target.files?.[0])} />
            </label>
            <label className="text-sm block mb-2">
              透明度
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(currentSection.card.bgAlpha * 100)}
                  onChange={(e) => updateSection('card', 'bgAlpha', Number(e.target.value) / 100)}
                  className="mt-1 w-full"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">{Math.round(currentSection.card.bgAlpha * 100)}%</span>
              </div>
            </label>
            <label className="text-sm block mb-2">
              ログイン後アイコン
              <input type="file" accept="image/*" className="mt-1 w-full text-xs" onChange={(e) => handleUpload('app', e.target.files?.[0])} />
            </label>
            <label className="text-sm block">
              ホーム追加用アイコン
              <input type="file" accept="image/*" className="mt-1 w-full text-xs" onChange={(e) => handleUpload('home', e.target.files?.[0])} />
            </label>
          </div>

          <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: cardTextColor }}>
            <h2 className="text-lg font-semibold mb-3">カード全体</h2>
            <label className="text-sm block mb-2">
              背景色
              <input type="color" value={currentSection.card.bg} onChange={(e) => updateSection('card', 'bg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm block mb-2">
              文字色
              <input type="color" value={currentSection.card.fg} onChange={(e) => updateSection('card', 'fg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm block">
              グラデーション
              <select value={currentSection.card.gradient} onChange={(e) => updateSection('card', 'gradient', e.target.value)} className="mt-1 w-full">
                {gradientOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: cardTextColor }}>
            <h2 className="text-lg font-semibold mb-3">ウェルカムテキスト</h2>
            <input
              className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              placeholder="ウェルカムタイトル"
            />
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              rows={3}
              value={welcomeBody}
              onChange={(e) => setWelcomeBody(e.target.value)}
              placeholder="ウェルカム本文"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: headerTextColor }}>
            <h2 className="text-lg font-semibold mb-3">ヘッダー</h2>
            <label className="text-sm block mb-2">
              背景色
              <input type="color" value={currentSection.header.bg} onChange={(e) => updateSection('header', 'bg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm block mb-2">
              透明度
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(currentSection.header.bgAlpha * 100)}
                  onChange={(e) => updateSection('header', 'bgAlpha', Number(e.target.value) / 100)}
                  className="mt-1 w-full"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">{Math.round(currentSection.header.bgAlpha * 100)}%</span>
              </div>
            </label>
            <label className="text-sm block mb-2">
              文字色
              <input type="color" value={currentSection.header.fg} onChange={(e) => updateSection('header', 'fg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm block">
              グラデーション
              <select value={currentSection.header.gradient} onChange={(e) => updateSection('header', 'gradient', e.target.value)} className="mt-1 w-full">
                {gradientOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: welcomeTextColor }}>
            <h2 className="text-lg font-semibold mb-3">ウェルカムカード</h2>
            <label className="text-sm block mb-2">
              背景色
              <input type="color" value={currentSection.welcome.bg} onChange={(e) => updateSection('welcome', 'bg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm block mb-2">
              透明度
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(currentSection.welcome.bgAlpha * 100)}
                  onChange={(e) => updateSection('welcome', 'bgAlpha', Number(e.target.value) / 100)}
                  className="mt-1 w-full"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">{Math.round(currentSection.welcome.bgAlpha * 100)}%</span>
              </div>
            </label>
            <label className="text-sm block mb-2">
              文字色
              <input type="color" value={currentSection.welcome.fg} onChange={(e) => updateSection('welcome', 'fg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm block">
              グラデーション
              <select value={currentSection.welcome.gradient} onChange={(e) => updateSection('welcome', 'gradient', e.target.value)} className="mt-1 w-full">
                {gradientOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? '保存中...' : '設定を保存'}
        </button>
        {message && <p className="text-sm text-foreground">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
