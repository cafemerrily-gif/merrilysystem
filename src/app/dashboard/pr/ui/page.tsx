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
  gradientType?: string;
};

type ModeSections = {
  header: SectionColors & { title: string; subtitle: string; user: string };
  welcome: SectionColors & { title: string; body: string };
  card: SectionColors;
  content: { textColor: string }; // カード以外の本文エリアの文字色
  input: { bgColor: string; textColor: string }; // 入力欄の背景色と文字色
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
    appIconLightUrl?: string;
    appIconDarkUrl?: string;
    homeIconUrl?: string;
    sections?: Record<ModeKey, ModeSections>;
    presets?: Preset[];
    lightBackground?: string;
    lightBackgroundAlpha?: number;
    lightBackgroundGradient?: string;
    darkBackground?: string;
    darkBackgroundAlpha?: number;
    darkBackgroundGradient?: string;
  };
};

type GradientPreset = {
  label: string;
  value: string;
  resolve: (base: string) => string;
  dependsOnBase?: boolean;
};

const hexToRgb = (hex: string) => {
  const safeHex = hex.replace('#', '');
  if (safeHex.length !== 6) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(safeHex.slice(0, 2), 16),
    g: parseInt(safeHex.slice(2, 4), 16),
    b: parseInt(safeHex.slice(4, 6), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((n) => Math.max(0, Math.min(255, Math.round(n))))
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')}`;

const adjustHexColor = (hex: string, amount: number) => {
  const { r, g, b } = hexToRgb(hex);
  if (amount >= 0) {
    return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
  }
  return rgbToHex(r * (1 + amount), g * (1 + amount), b * (1 + amount));
};

const hexToRgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const gradientOptions: GradientPreset[] = [
  { label: 'なし', value: 'none', resolve: () => '' },
  { label: 'Night sky', value: 'nightSky', resolve: () => 'linear-gradient(135deg, #0b1220, #1f2937)' },
  { label: 'Sunrise', value: 'sunrise', resolve: () => 'linear-gradient(135deg, rgba(255,145,0,0.45), rgba(255,72,94,0.35))' },
  { label: 'Pastel glow', value: 'pastelGlow', resolve: () => 'linear-gradient(120deg, rgba(173,212,255,0.45), rgba(255,255,255,0))' },
  { label: 'Soft gradient', value: 'softGradient', resolve: () => 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(15,23,42,0.4))' },
  { label: 'Ocean Breeze', value: 'oceanBreeze', resolve: () => 'linear-gradient(135deg, #38bdf8, #0ea5e9)' },
  { label: 'Sunset Glow', value: 'sunsetGlow', resolve: () => 'linear-gradient(135deg, #f97316, #f43f5e)' },
  { label: 'Aurora Mist', value: 'auroraMist', resolve: () => 'linear-gradient(135deg, #0f172a, #4ade80)' },
  { label: 'Forest Haze', value: 'forestHaze', resolve: () => 'linear-gradient(135deg, #0f172a, #22c55e)' },
  { label: 'Calm Teal', value: 'calmTeal', resolve: () => 'linear-gradient(135deg, #14b8a6, #0ea5e9)' },
  { label: 'Coffee Warmth', value: 'coffeeWarmth', resolve: () => 'linear-gradient(135deg, #3f1d13, #a16207)' },
  {
    label: 'Base glow',
    value: 'baseGlow',
    dependsOnBase: true,
    resolve: (base) => `linear-gradient(135deg, ${base}, ${adjustHexColor(base, 0.15)})`,
  },
  {
    label: 'Base fade',
    value: 'baseFade',
    dependsOnBase: true,
    resolve: (base) => `linear-gradient(180deg, ${adjustHexColor(base, 0.2)}, ${base})`,
  },
  {
    label: 'Base overlay',
    value: 'baseOverlay',
    dependsOnBase: true,
    resolve: (base) => `linear-gradient(180deg, ${base}, ${hexToRgba(base, 0)})`,
  },
];

const getGradientPreset = (value: string) => gradientOptions.find((opt) => opt.value === value) ?? gradientOptions[0];

const resolveGradient = (value: string | undefined, baseColor: string) => getGradientPreset(value || 'none').resolve(baseColor || '#ffffff');

const defaultModeSections: ModeSections = {
  header: {
    bg: '#0b1220',
    bgAlpha: 1,
    gradient: '',
    gradientType: 'none',
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
    gradientType: 'none',
    fg: '#0f172a',
    border: '#e2e8f0',
    title: '#0f172a',
    body: '#1f2937',
  },
  card: {
    bg: '#0f172a',
    bgAlpha: 1,
    gradient: '',
    gradientType: 'none',
    fg: '#e5e7eb',
    border: '#1f2937',
  },
  content: {
    textColor: '#e5e7eb',
  },
  input: {
    bgColor: '#ffffff',
    textColor: '#0f172a',
  },
};

const cloneSections = (sections?: ModeSections): ModeSections => {
  const source = sections || defaultModeSections;
  return {
    header: { ...source.header, gradientType: source.header.gradientType || 'none' },
    welcome: { ...source.welcome, gradientType: source.welcome.gradientType || 'none' },
    card: { ...source.card, gradientType: source.card.gradientType || 'none' },
    content: { textColor: source.content?.textColor || defaultModeSections.content.textColor },
    input: {
      bgColor: source.input?.bgColor || defaultModeSections.input.bgColor,
      textColor: source.input?.textColor || defaultModeSections.input.textColor,
    },
  };
};

const defaultPresets: Preset[] = [
  {
    name: 'Midnight Ocean (default)',
    sections: {
      light: {
        header: { 
          bg: '#0f172a', bgAlpha: 0.95, gradient: 'linear-gradient(135deg, #0f172a, #1e3a8a)', gradientType: 'custom', 
          fg: '#e0e7ff', border: '#3b82f6', title: '#ffffff', subtitle: '#bfdbfe', user: '#dbeafe' 
        },
        welcome: { 
          bg: '#eff6ff', bgAlpha: 1, gradient: '', gradientType: 'none', 
          fg: '#1e3a8a', border: '#93c5fd', title: '#1e3a8a', body: '#3b82f6' 
        },
        card: { 
          bg: '#ffffff', bgAlpha: 0.9, gradient: '', gradientType: 'none', 
          fg: '#1e293b', border: '#cbd5e1' 
        },
        content: { textColor: '#1e293b' },
        input: { bgColor: '#f1f5f9', textColor: '#0f172a' },
      },
      dark: {
        header: { 
          bg: '#0f172a', bgAlpha: 0.95, gradient: 'linear-gradient(135deg, #0a0f1e, #1e3a8a)', gradientType: 'custom', 
          fg: '#e0e7ff', border: '#1e3a8a', title: '#ffffff', subtitle: '#93c5fd', user: '#bfdbfe' 
        },
        welcome: { 
          bg: '#1e3a8a', bgAlpha: 0.8, gradient: '', gradientType: 'none', 
          fg: '#e0e7ff', border: '#3b82f6', title: '#ffffff', body: '#bfdbfe' 
        },
        card: { 
          bg: '#1e293b', bgAlpha: 0.9, gradient: '', gradientType: 'none', 
          fg: '#e2e8f0', border: '#334155' 
        },
        content: { textColor: '#e2e8f0' },
        input: { bgColor: '#0f172a', textColor: '#e2e8f0' },
      },
    },
  },
  {
    name: 'Forest Glow (default)',
    sections: {
      light: {
        header: { 
          bg: '#065f46', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(16,185,129,0.7))', gradientType: 'custom', 
          fg: '#d1fae5', border: '#10b981', title: '#ffffff', subtitle: '#a7f3d0', user: '#d1fae5' 
        },
        welcome: { 
          bg: '#ecfdf5', bgAlpha: 1, gradient: '', gradientType: 'none', 
          fg: '#065f46', border: '#6ee7b7', title: '#065f46', body: '#059669' 
        },
        card: { 
          bg: '#ffffff', bgAlpha: 0.95, gradient: '', gradientType: 'none', 
          fg: '#1e293b', border: '#d1fae5' 
        },
        content: { textColor: '#064e3b' },
        input: { bgColor: '#f0fdf4', textColor: '#064e3b' },
      },
      dark: {
        header: { 
          bg: '#022c22', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(2,44,34,0.95), rgba(6,95,70,0.8))', gradientType: 'custom', 
          fg: '#d1fae5', border: '#065f46', title: '#ffffff', subtitle: '#6ee7b7', user: '#a7f3d0' 
        },
        welcome: { 
          bg: '#065f46', bgAlpha: 0.85, gradient: '', gradientType: 'none', 
          fg: '#d1fae5', border: '#10b981', title: '#ffffff', body: '#a7f3d0' 
        },
        card: { 
          bg: '#1e293b', bgAlpha: 0.9, gradient: '', gradientType: 'none', 
          fg: '#e2e8f0', border: '#065f46' 
        },
        content: { textColor: '#a7f3d0' },
        input: { bgColor: '#064e3b', textColor: '#d1fae5' },
      },
    },
  },
  {
    name: 'Sunset Gradient (default)',
    sections: {
      light: {
        header: { 
          bg: '#c2410c', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(234,88,12,0.9), rgba(251,146,60,0.7))', gradientType: 'custom', 
          fg: '#fed7aa', border: '#f97316', title: '#ffffff', subtitle: '#fdba74', user: '#fed7aa' 
        },
        welcome: { 
          bg: '#fff7ed', bgAlpha: 1, gradient: '', gradientType: 'none', 
          fg: '#c2410c', border: '#fb923c', title: '#c2410c', body: '#ea580c' 
        },
        card: { 
          bg: '#ffffff', bgAlpha: 0.95, gradient: '', gradientType: 'none', 
          fg: '#1e293b', border: '#fed7aa' 
        },
        content: { textColor: '#9a3412' },
        input: { bgColor: '#fff7ed', textColor: '#9a3412' },
      },
      dark: {
        header: { 
          bg: '#7c2d12', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(124,45,18,0.95), rgba(194,65,12,0.8))', gradientType: 'custom', 
          fg: '#fed7aa', border: '#c2410c', title: '#ffffff', subtitle: '#fb923c', user: '#fdba74' 
        },
        welcome: { 
          bg: '#c2410c', bgAlpha: 0.85, gradient: '', gradientType: 'none', 
          fg: '#fed7aa', border: '#f97316', title: '#ffffff', body: '#fdba74' 
        },
        card: { 
          bg: '#1e293b', bgAlpha: 0.9, gradient: '', gradientType: 'none', 
          fg: '#e2e8f0', border: '#c2410c' 
        },
        content: { textColor: '#fdba74' },
        input: { bgColor: '#7c2d12', textColor: '#fed7aa' },
      },
    },
  },
  {
    name: 'Purple Dream (default)',
    sections: {
      light: {
        header: { 
          bg: '#6b21a8', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(107,33,168,0.9), rgba(168,85,247,0.7))', gradientType: 'custom', 
          fg: '#e9d5ff', border: '#a855f7', title: '#ffffff', subtitle: '#d8b4fe', user: '#e9d5ff' 
        },
        welcome: { 
          bg: '#faf5ff', bgAlpha: 1, gradient: '', gradientType: 'none', 
          fg: '#6b21a8', border: '#c084fc', title: '#6b21a8', body: '#9333ea' 
        },
        card: { 
          bg: '#ffffff', bgAlpha: 0.95, gradient: '', gradientType: 'none', 
          fg: '#1e293b', border: '#e9d5ff' 
        },
        content: { textColor: '#581c87' },
        input: { bgColor: '#faf5ff', textColor: '#581c87' },
      },
      dark: {
        header: { 
          bg: '#3b0764', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(59,7,100,0.95), rgba(107,33,168,0.8))', gradientType: 'custom', 
          fg: '#e9d5ff', border: '#6b21a8', title: '#ffffff', subtitle: '#c084fc', user: '#d8b4fe' 
        },
        welcome: { 
          bg: '#6b21a8', bgAlpha: 0.85, gradient: '', gradientType: 'none', 
          fg: '#e9d5ff', border: '#a855f7', title: '#ffffff', body: '#d8b4fe' 
        },
        card: { 
          bg: '#1e293b', bgAlpha: 0.9, gradient: '', gradientType: 'none', 
          fg: '#e2e8f0', border: '#6b21a8' 
        },
        content: { textColor: '#d8b4fe' },
        input: { bgColor: '#581c87', textColor: '#e9d5ff' },
      },
    },
  },
  {
    name: 'Rose Elegance (default)',
    sections: {
      light: {
        header: { 
          bg: '#9f1239', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(159,18,57,0.9), rgba(244,63,94,0.7))', gradientType: 'custom', 
          fg: '#fecdd3', border: '#f43f5e', title: '#ffffff', subtitle: '#fda4af', user: '#fecdd3' 
        },
        welcome: { 
          bg: '#fff1f2', bgAlpha: 1, gradient: '', gradientType: 'none', 
          fg: '#9f1239', border: '#fb7185', title: '#9f1239', body: '#e11d48' 
        },
        card: { 
          bg: '#ffffff', bgAlpha: 0.95, gradient: '', gradientType: 'none', 
          fg: '#1e293b', border: '#fecdd3' 
        },
        content: { textColor: '#881337' },
        input: { bgColor: '#fff1f2', textColor: '#881337' },
      },
      dark: {
        header: { 
          bg: '#4c0519', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(76,5,25,0.95), rgba(159,18,57,0.8))', gradientType: 'custom', 
          fg: '#fecdd3', border: '#9f1239', title: '#ffffff', subtitle: '#fb7185', user: '#fda4af' 
        },
        welcome: { 
          bg: '#9f1239', bgAlpha: 0.85, gradient: '', gradientType: 'none', 
          fg: '#fecdd3', border: '#f43f5e', title: '#ffffff', body: '#fda4af' 
        },
        card: { 
          bg: '#1e293b', bgAlpha: 0.9, gradient: '', gradientType: 'none', 
          fg: '#e2e8f0', border: '#9f1239' 
        },
        content: { textColor: '#fda4af' },
        input: { bgColor: '#881337', textColor: '#fecdd3' },
      },
    },
  },
  {
    name: 'Teal Wave (default)',
    sections: {
      light: {
        header: { 
          bg: '#115e59', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(17,94,89,0.9), rgba(20,184,166,0.7))', gradientType: 'custom', 
          fg: '#ccfbf1', border: '#14b8a6', title: '#ffffff', subtitle: '#99f6e4', user: '#ccfbf1' 
        },
        welcome: { 
          bg: '#f0fdfa', bgAlpha: 1, gradient: '', gradientType: 'none', 
          fg: '#115e59', border: '#5eead4', title: '#115e59', body: '#0f766e' 
        },
        card: { 
          bg: '#ffffff', bgAlpha: 0.95, gradient: '', gradientType: 'none', 
          fg: '#1e293b', border: '#ccfbf1' 
        },
        content: { textColor: '#134e4a' },
        input: { bgColor: '#f0fdfa', textColor: '#134e4a' },
      },
      dark: {
        header: { 
          bg: '#042f2e', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(4,47,46,0.95), rgba(17,94,89,0.8))', gradientType: 'custom', 
          fg: '#ccfbf1', border: '#115e59', title: '#ffffff', subtitle: '#5eead4', user: '#99f6e4' 
        },
        welcome: { 
          bg: '#115e59', bgAlpha: 0.85, gradient: '', gradientType: 'none', 
          fg: '#ccfbf1', border: '#14b8a6', title: '#ffffff', body: '#99f6e4' 
        },
        card: { 
          bg: '#1e293b', bgAlpha: 0.9, gradient: '', gradientType: 'none', 
          fg: '#e2e8f0', border: '#115e59' 
        },
        content: { textColor: '#99f6e4' },
        input: { bgColor: '#134e4a', textColor: '#ccfbf1' },
      },
    },
  },
  {
    name: 'Slate Modern (default)',
    sections: {
      light: {
        header: { 
          bg: '#334155', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(51,65,85,0.9), rgba(100,116,139,0.7))', gradientType: 'custom', 
          fg: '#f1f5f9', border: '#64748b', title: '#ffffff', subtitle: '#cbd5e1', user: '#e2e8f0' 
        },
        welcome: { 
          bg: '#f8fafc', bgAlpha: 1, gradient: '', gradientType: 'none', 
          fg: '#334155', border: '#94a3b8', title: '#1e293b', body: '#475569' 
        },
        card: { 
          bg: '#ffffff', bgAlpha: 0.95, gradient: '', gradientType: 'none', 
          fg: '#1e293b', border: '#e2e8f0' 
        },
        content: { textColor: '#1e293b' },
        input: { bgColor: '#f1f5f9', textColor: '#1e293b' },
      },
      dark: {
        header: { 
          bg: '#1e293b', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(30,41,59,0.95), rgba(51,65,85,0.8))', gradientType: 'custom', 
          fg: '#f1f5f9', border: '#334155', title: '#ffffff', subtitle: '#94a3b8', user: '#cbd5e1' 
        },
        welcome: { 
          bg: '#334155', bgAlpha: 0.85, gradient: '', gradientType: 'none', 
          fg: '#f1f5f9', border: '#64748b', title: '#ffffff', body: '#cbd5e1' 
        },
        card: { 
          bg: '#0f172a', bgAlpha: 0.9, gradient: '', gradientType: 'none', 
          fg: '#e2e8f0', border: '#1e293b' 
        },
        content: { textColor: '#cbd5e1' },
        input: { bgColor: '#1e293b', textColor: '#e2e8f0' },
      },
    },
  },
  {
    name: 'Golden Hour (default)',
    sections: {
      light: {
        header: { 
          bg: '#b45309', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(180,83,9,0.9), rgba(245,158,11,0.7))', gradientType: 'custom', 
          fg: '#fef3c7', border: '#f59e0b', title: '#ffffff', subtitle: '#fde68a', user: '#fef3c7' 
        },
        welcome: { 
          bg: '#fffbeb', bgAlpha: 1, gradient: '', gradientType: 'none', 
          fg: '#b45309', border: '#fbbf24', title: '#b45309', body: '#d97706' 
        },
        card: { 
          bg: '#ffffff', bgAlpha: 0.95, gradient: '', gradientType: 'none', 
          fg: '#1e293b', border: '#fef3c7' 
        },
        content: { textColor: '#92400e' },
        input: { bgColor: '#fffbeb', textColor: '#92400e' },
      },
      dark: {
        header: { 
          bg: '#78350f', bgAlpha: 1, gradient: 'linear-gradient(135deg, rgba(120,53,15,0.95), rgba(180,83,9,0.8))', gradientType: 'custom', 
          fg: '#fef3c7', border: '#b45309', title: '#ffffff', subtitle: '#fbbf24', user: '#fde68a' 
        },
        welcome: { 
          bg: '#b45309', bgAlpha: 0.85, gradient: '', gradientType: 'none', 
          fg: '#fef3c7', border: '#f59e0b', title: '#ffffff', body: '#fde68a' 
        },
        card: { 
          bg: '#1e293b', bgAlpha: 0.9, gradient: '', gradientType: 'none', 
          fg: '#e2e8f0', border: '#b45309' 
        },
        content: { textColor: '#fde68a' },
        input: { bgColor: '#78350f', textColor: '#fef3c7' },
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
    const { header, card, welcome, content, input } = section;

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

    out[`contentTextColor${suffix}`] = content.textColor;
    out[`inputBgColor${suffix}`] = input.bgColor;
    out[`inputTextColor${suffix}`] = input.textColor;
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
  const [previewMode, setPreviewMode] = useState<ModeKey>('light');
  const [appIconLight, setAppIconLight] = useState('/white.png');
  const [appIconDark, setAppIconDark] = useState('/black.png');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [presets, setPresets] = useState<Preset[]>(defaultPresets);
  const [presetName, setPresetName] = useState('Custom Preset');
  const [selectedPreset, setSelectedPreset] = useState<string>(defaultPresets[0].name);
  const [basePayload, setBasePayload] = useState<any>({});

  const iconOptions = [
    { label: 'White', value: '/white.png' },
    { label: 'Black', value: '/black.png' },
  ];

  useEffect(() => {
    (async () => {
      try {
        // UI設定を取得
        const res = await fetch('/api/pr/website', { cache: 'no-store' });
        const data: UiPayload = await res.json();
        const ui = data?.uiSettings || {};
        setAppTitle((prev) => ui.appTitle || prev);
        setAppIconLight((prev) => ui.appIconLightUrl || ui.appIconUrl || prev);
        setAppIconDark((prev) => ui.appIconDarkUrl || ui.appIconUrl || prev);
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
        
        // データベースからプリセットを取得
        const presetsRes = await fetch('/api/presets', { cache: 'no-store' });
        const presetsData = await presetsRes.json();
        
        if (Array.isArray(presetsData) && presetsData.length > 0) {
          // データベースのプリセットを変換
          const loadedPresets: Preset[] = presetsData.map((p: any) => ({
            name: p.name,
            sections: p.sections,
          }));
          setPresets(loadedPresets);
          setSelectedPreset(loadedPresets[0].name);
        } else {
          // データベースにプリセットがない場合はデフォルトを使用
          setPresets(defaultPresets);
          setSelectedPreset(defaultPresets[0].name);
        }
        
        setBasePayload(data || {});
      } catch (e: any) {
        setError(e?.message || '設定の取得に失敗しました');
        // エラー時はデフォルトプリセットを使用
        setPresets(defaultPresets);
        setSelectedPreset(defaultPresets[0].name);
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
  const currentBaseBackground = baseBackgrounds[selectedMode];
  const previewSection = sections[previewMode];
  const previewBase = baseBackgrounds[previewMode];
  const previewSectionStyle = (section: SectionColors) => ({
    backgroundColor: hexToRgba(section.bg, section.bgAlpha),
    color: section.fg,
    borderColor: section.border,
    backgroundImage: section.gradient || undefined,
  });
  const previewContainerStyle = {
    backgroundColor: previewBase.gradient ? 'transparent' : hexToRgba(previewBase.bg, previewBase.bgAlpha),
    backgroundImage: previewBase.gradient || undefined,
    borderColor: previewSection.card.border,
    borderRadius: '24px',
    overflow: 'hidden',
  };

  const updateSection = (section: keyof ModeSections, field: string, value: string | number) => {
    const parsedValue = field === 'bgAlpha' ? Number(value) : value;
    setSections((prev) => {
      const updatedSection = {
        ...prev[selectedMode][section],
        [field]: parsedValue,
      };
      if (field === 'bg' && section !== 'content') {
        const gradientType = (updatedSection as any).gradientType || 'none';
        const preset = getGradientPreset(gradientType);
        if (preset.dependsOnBase) {
          (updatedSection as any).gradient = preset.resolve(String(parsedValue));
        }
      }
      return {
        ...prev,
        [selectedMode]: {
          ...prev[selectedMode],
          [section]: updatedSection,
        },
      };
    });
  };

  const handleGradientSelection = (section: keyof ModeSections, type: string) => {
    if (section === 'content') return;
    setSections((prev) => {
      const sectionState = { ...prev[selectedMode][section] };
      const preset = getGradientPreset(type);
      return {
        ...prev,
        [selectedMode]: {
          ...prev[selectedMode],
          [section]: {
            ...sectionState,
            gradient: preset.resolve((sectionState as any).bg),
            gradientType: type,
          } as any,
        },
      };
    });
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

  const savePreset = async () => {
    try {
      const nextPreset: Preset = {
        name: presetName || `Preset ${presets.length + 1}`,
        sections: {
          light: cloneSections(sections.light),
          dark: cloneSections(sections.dark),
        },
      };
      
      // データベースに保存
      const res = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nextPreset.name,
          sections: nextPreset.sections,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'プリセットの保存に失敗しました');
      }
      
      // ローカル状態を更新
      setPresets((prev) => {
        const filtered = prev.filter((p) => p.name !== nextPreset.name);
        return [...filtered, nextPreset];
      });
      
      setMessage('プリセットを保存しました');
      setPresetName(''); // 入力フィールドをクリア
    } catch (e: any) {
      setError(e?.message || 'プリセットの保存に失敗しました');
    }
  };

  const deletePreset = async (presetName: string) => {
    // defaultプリセットは削除できない
    if (presetName.includes('(default)')) {
      setError('デフォルトプリセットは削除できません');
      return;
    }
    
    try {
      // データベースから該当プリセットのIDを取得
      const presetsRes = await fetch('/api/presets', { cache: 'no-store' });
      const presetsData = await presetsRes.json();
      const presetToDelete = presetsData.find((p: any) => p.name === presetName);
      
      if (!presetToDelete) {
        throw new Error('プリセットが見つかりません');
      }
      
      // データベースから削除
      const res = await fetch(`/api/presets?id=${presetToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'プリセットの削除に失敗しました');
      }
      
      // ローカル状態を更新
      setPresets((prev) => prev.filter((p) => p.name !== presetName));
      
      // 削除したプリセットが選択中の場合、最初のプリセットに切り替え
      if (selectedPreset === presetName) {
        const remaining = presets.filter((p) => p.name !== presetName);
        if (remaining.length > 0) {
          setSelectedPreset(remaining[0].name);
        }
      }
      
      setMessage('プリセットを削除しました');
    } catch (e: any) {
      setError(e?.message || 'プリセットの削除に失敗しました');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...basePayload,
        uiSettings: {
          appTitle,
          appIconLightUrl: appIconLight,
          appIconDarkUrl: appIconDark,
          welcomeTitleText: welcomeTitle,
          welcomeBodyText: welcomeBody,
          sections,
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

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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
          <button
            type="button"
            className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => deletePreset(selectedPreset)}
            disabled={selectedPreset.includes('(default)')}
            title={selectedPreset.includes('(default)') ? 'デフォルトプリセットは削除できません' : 'プリセットを削除'}
          >
            削除
          </button>
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
            保存
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
              <span className="text-xs w-12 text-right" style={{ color: cardTextColor }}>
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

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="rounded-2xl border bg-card p-4 space-y-4 order-first lg:order-last lg:w-1/3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">トップ画面プレビュー</h2>
              <div className="flex gap-2 text-xs">
                {(['light', 'dark'] as ModeKey[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewMode(mode)}
                    className={`rounded-full px-3 py-1 border text-muted-foreground ${previewMode === mode ? 'border-primary text-primary' : 'border-border'}`}
                  >
                    {mode === 'light' ? 'ライト' : 'ダーク'}
                  </button>
                ))}
              </div>
            </div>
            <div style={previewContainerStyle} className="border bg-transparent p-0">
              <div style={previewSectionStyle(previewSection.header)} className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em]" style={{ color: previewSection.header.subtitle }}>
                      Welcome
                    </p>
                    <h3 className="text-lg font-semibold" style={{ color: previewSection.header.title }}>
                      {appTitle}
                    </h3>
                  </div>
                  <span className="text-xs" style={{ color: previewSection.header.user }}>
                    {previewSection.header.user}
                  </span>
                </div>
              </div>
              <div style={previewSectionStyle(previewSection.welcome)} className="px-4 py-3 border-b">
                <p className="text-sm font-semibold">{welcomeTitle || 'MERRILY'}</p>
                <p className="text-xs text-muted-foreground">{welcomeBody || '最新メトリクスを一瞥できます。'}</p>
              </div>
              <div className="p-4" style={{ color: previewSection.content.textColor }}>
                <p className="text-sm mb-2">本文エリアのサンプルテキスト</p>
                <p className="text-xs">カード以外の文字色が適用されます</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border bg-opacity-80 p-3"
                    style={{
                      ...previewSectionStyle(previewSection.card),
                      borderColor: previewSection.card.border,
                    }}
                  >
                    <p className="text-xs uppercase tracking-[0.2em]" style={{ color: previewSection.card.border }}>
                      Card {idx}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: previewSection.card.fg }}>
                      {idx === 1 ? 'Sales' : idx === 2 ? 'Logs' : 'Notifications'}
                    </p>
                    <p className="text-xs" style={{ color: previewSection.card.fg }}>
                      最新アップデート
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4 order-last lg:order-first lg:flex-1">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: cardTextColor }}>
                <h2 className="text-lg font-semibold mb-3">トップページアイコン</h2>
                <label className="text-sm block mb-2">
                  ライトモード
                  <select
                    value={appIconLight}
                    onChange={(e) => setAppIconLight(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm block">
                  ダークモード
                  <select
                    value={appIconDark}
                    onChange={(e) => setAppIconDark(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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
                <label className="text-sm block mb-2">
                  枠線色
                  <input type="color" value={currentSection.card.border} onChange={(e) => updateSection('card', 'border', e.target.value)} className="mt-1 w-full" />
                </label>
                <label className="text-sm block">
                  グラデーション
                  <select
                    value={currentSection.card.gradientType || 'none'}
                    onChange={(e) => handleGradientSelection('card', e.target.value)}
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

              <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: cardTextColor }}>
                <h2 className="text-lg font-semibold mb-3">本文エリア文字色</h2>
                <p className="text-xs text-muted-foreground mb-3">カード以外のページタイトルや説明文の色</p>
                <label className="text-sm block">
                  文字色
                  <input type="color" value={currentSection.content.textColor} onChange={(e) => updateSection('content', 'textColor', e.target.value)} className="mt-1 w-full" />
                </label>
              </div>

              <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor, color: cardTextColor }}>
                <h2 className="text-lg font-semibold mb-3">入力欄の色</h2>
                <p className="text-xs text-muted-foreground mb-3">テキスト入力欄や日付選択などの色</p>
                <label className="text-sm block mb-2">
                  背景色
                  <input type="color" value={currentSection.input.bgColor} onChange={(e) => updateSection('input', 'bgColor', e.target.value)} className="mt-1 w-full" />
                </label>
                <label className="text-sm block">
                  文字色
                  <input type="color" value={currentSection.input.textColor} onChange={(e) => updateSection('input', 'textColor', e.target.value)} className="mt-1 w-full" />
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor }}>
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
                    <span className="text-xs w-12 text-right" style={{ color: cardTextColor }}>{Math.round(currentSection.header.bgAlpha * 100)}%</span>
                  </div>
                </label>
                <label className="text-sm block mb-2">
                  文字色
                  <input type="color" value={currentSection.header.fg} onChange={(e) => updateSection('header', 'fg', e.target.value)} className="mt-1 w-full" />
                </label>
                <label className="text-sm block">
                  グラデーション
                  <select
                    value={currentSection.header.gradientType || 'none'}
                    onChange={(e) => handleGradientSelection('header', e.target.value)}
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

              <div className="rounded-2xl border bg-card p-4" style={{ borderColor: cardBorderColor }}>
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
                    <span className="text-xs w-12 text-right" style={{ color: cardTextColor }}>{Math.round(currentSection.welcome.bgAlpha * 100)}%</span>
                  </div>
                </label>
                <label className="text-sm block mb-2">
                  文字色
                  <input type="color" value={currentSection.welcome.fg} onChange={(e) => updateSection('welcome', 'fg', e.target.value)} className="mt-1 w-full" />
                </label>
                <label className="text-sm block mb-2">
                  枠線色
                  <input type="color" value={currentSection.welcome.border} onChange={(e) => updateSection('welcome', 'border', e.target.value)} className="mt-1 w-full" />
                </label>
                <label className="text-sm block">
                  グラデーション
                  <select
                    value={currentSection.welcome.gradientType || 'none'}
                    onChange={(e) => handleGradientSelection('welcome', e.target.value)}
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
