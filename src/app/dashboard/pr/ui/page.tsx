'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
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
  base: { background: string; foreground: string; border: string };
};

type UiPayload = {
  uiSettings?: {
    [key: string]: any;
    presets?: Preset[];
  };
};

const gradientOptions = [
  { label: 'なし', value: '' },
  { label: 'Night sky', value: 'linear-gradient(135deg, #0b1220, #1f2937)' },
  { label: 'Sunrise', value: 'linear-gradient(135deg, rgba(255, 145, 0, 0.45), rgba(255, 72, 94, 0.35))' },
  { label: 'Pastel glow', value: 'linear-gradient(120deg, rgba(173, 212, 255, 0.45), rgba(255, 255, 255, 0))' },
  { label: 'Soft gradient', value: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(15, 23, 42, 0.4))' },
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

const defaultPresets: Preset[] = [
  {
    name: 'Default',
    sections: { light: defaultModeSections, dark: defaultModeSections },
    base: { background: '#0b1220', foreground: '#e5e7eb', border: '#1f2937' },
  },
];

export default function UiEditor() {
  const supabase = createClientComponentClient();
  const [selectedMode, setSelectedMode] = useState<ModeKey>('light');
  const [sections, setSections] = useState<Record<ModeKey, ModeSections>>({
    light: defaultModeSections,
    dark: defaultModeSections,
  });
  const [appTitle, setAppTitle] = useState('MERRILY');
  const [welcomeTitle, setWelcomeTitle] = useState('バーとログが一目でわかるダッシュボード');
  const [welcomeBody, setWelcomeBody] = useState('色やアイコン、グラデーションを自由に編集できます。');
  const [loginIconUrl, setLoginIconUrl] = useState('/MERRILY_Simbol.png');
  const [appIconUrl, setAppIconUrl] = useState('/MERRILY_Simbol.png');
  const [homeIconUrl, setHomeIconUrl] = useState('/MERRILY_Simbol.png');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [presets, setPresets] = useState<Preset[]>(defaultPresets);
  const [presetName, setPresetName] = useState('Custom Preset');
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
        const loadedSections = ui.sections || sections;
        setSections((prev) => ({
          light: loadedSections.light || prev.light,
          dark: loadedSections.dark || prev.dark,
        }));
        if (Array.isArray(ui.presets) && ui.presets.length > 0) {
          setPresets(ui.presets);
        }
        setBasePayload(data || {});
      } catch (e: any) {
        setError(e?.message || '設定の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentSection = sections[selectedMode];
  const cardTextColor = currentSection.card.fg;
  const cardBorderColor = currentSection.card.border;
  const headerTextColor = currentSection.header.fg;
  const welcomeTextColor = currentSection.welcome.fg;

  const updateSection = (section: keyof ModeSections, field: keyof SectionColors, value: string) => {
    setSections((prev) => ({
      ...prev,
      [selectedMode]: {
        ...prev[selectedMode],
        [section]: {
          ...prev[selectedMode][section],
          [field]: value,
        },
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
      const { data } = await supabase.storage.from('ui-icons').getPublicUrl(fileName);
      if (target === 'login') setLoginIconUrl(data.publicUrl);
      if (target === 'app') setAppIconUrl(data.publicUrl);
      if (target === 'home') setHomeIconUrl(data.publicUrl);
    } catch (e: any) {
      setError(e?.message || 'アイコンのアップロードに失敗しました');
    }
  };

  const [selectedPreset, setSelectedPreset] = useState<string>('Default');
  useEffect(() => {
    const preset = presets.find((p) => p.name === selectedPreset);
    if (preset) {
      setSections(preset.sections);
    }
  }, [selectedPreset, presets]);

  const savePreset = () => {
    const nextPreset: Preset = {
      name: presetName || `Preset ${presets.length + 1}`,
      sections,
      base: {
        background: currentSection.card.bg,
        foreground: currentSection.card.fg,
        border: currentSection.card.border,
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
          presets: [...presets],
          sections,
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
          <h1 className="text-2xl font-semibold">UI編集</h1>
          <div className="flex gap-3">
            <select value={selectedPreset} onChange={(e) => setSelectedPreset(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {presets.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="プリセット名"
            />
            <button onClick={savePreset} className="rounded-lg border border-accent px-3 py-2 text-sm text-accent hover:bg-accent/10">
              保存
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {(['light', 'dark'] as ModeKey[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${selectedMode === mode ? 'border-accent bg-accent/10' : 'border-border'}`}
            >
              {mode === 'light' ? 'ライトモード' : 'ダークモード'}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: cardTextColor }}>
            <p className="text-sm font-semibold mb-2">アイコン</p>
            <label className="text-sm mb-1 block">
              ログイン画面アイコン
              <input type="file" accept="image/*" className="mt-1 w-full" onChange={(e) => handleUpload('login', e.target.files?.[0])} />
            </label>
            <label className="text-sm mb-1 block">
              ログイン後アイコン
              <input type="file" accept="image/*" className="mt-1 w-full" onChange={(e) => handleUpload('app', e.target.files?.[0])} />
            </label>
            <label className="text-sm block">
              ホーム追加用アイコン
              <input type="file" accept="image/*" className="mt-1 w-full" onChange={(e) => handleUpload('home', e.target.files?.[0])} />
            </label>
          </div>

          <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: cardTextColor }}>
            <p className="text-sm font-semibold mb-2">ベースカラー</p>
            <label className="text-sm block">
              文字色
              <input type="color" value={currentSection.card.fg} onChange={(e) => updateSection('card', 'fg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm block">
              背景色
              <input type="color" value={currentSection.card.bg} onChange={(e) => updateSection('card', 'bg', e.target.value)} className="mt-1 w-full" />
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
            <p className="text-sm font-semibold mb-2">ウェルカムテキスト</p>
            <input className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={welcomeTitle} onChange={(e) => setWelcomeTitle(e.target.value)} placeholder="ウェルカムタイトル" />
            <textarea className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" rows={3} value={welcomeBody} onChange={(e) => setWelcomeBody(e.target.value)} placeholder="ウェルカム本文" />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: headerTextColor }}>
          <h2 className="text-lg font-semibold mb-2">ヘッダー</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              背景色
              <input type="color" value={currentSection.header.bg} onChange={(e) => updateSection('header', 'bg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm">
              文字色
              <input type="color" value={currentSection.header.fg} onChange={(e) => updateSection('header', 'fg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm">
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
        </div>

        <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: welcomeTextColor }}>
          <h2 className="text-lg font-semibold mb-2">ウェルカムカード</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              背景色
              <input type="color" value={currentSection.welcome.bg} onChange={(e) => updateSection('welcome', 'bg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm">
              文字色
              <input type="color" value={currentSection.welcome.fg} onChange={(e) => updateSection('welcome', 'fg', e.target.value)} className="mt-1 w-full" />
            </label>
            <label className="text-sm">
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
