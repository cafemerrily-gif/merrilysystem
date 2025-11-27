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
        header: {
          ...defaultModeSections.header,
          bg: '#ffe3b8',
          fg: '#1f2937',
          gradient: 'linear-gradient(135deg, #ffe29f, #ff7a18)',
        },
        welcome: {
          ...defaultModeSections.welcome,
          bg: '#fff9f1',
          fg: '#1f2937',
          gradient: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,170,0,0.2))',
        },
        card: {
          ...defaultModeSections.card,
          bg: '#fff5ed',
          fg: '#1f2937',
          gradient: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,110,64,0.25))',
        },
      },
      dark: {
        header: {
          ...defaultModeSections.header,
          bg: '#1f1c2c',
          fg: '#f0c987',
          gradient: 'linear-gradient(145deg, #1f1c2c, #3a4c63)',
        },
        welcome: {
          ...defaultModeSections.welcome,
          bg: '#0d0b19',
          fg: '#f0c987',
          gradient: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(240,201,135,0.2))',
        },
        card: {
          ...defaultModeSections.card,
          bg: '#0f1220',
          fg: '#f0c987',
          gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(240,201,135,0.25))',
        },
      },
    },
  },
  {
    name: 'Midnight Bloom',
    sections: {
      light: {
        header: {
          ...defaultModeSections.header,
          bg: '#f0f4ff',
          fg: '#1f2937',
          gradient: 'linear-gradient(135deg, #f0f4ff, #cfd3ff)',
        },
        welcome: {
          ...defaultModeSections.welcome,
          bg: '#ffffff',
          fg: '#1f2937',
          gradient: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(99,102,241,0.1))',
        },
        card: {
          ...defaultModeSections.card,
          bg: '#eff1ff',
          fg: '#1f2937',
          gradient: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(79,70,229,0.2))',
        },
      },
      dark: {
        header: {
          ...defaultModeSections.header,
          bg: '#0f172a',
          fg: '#a5b4fc',
          gradient: 'linear-gradient(135deg, #0f172a, #312e81)',
        },
        welcome: {
          ...defaultModeSections.welcome,
          bg: '#090e1a',
          fg: '#a5b4fc',
          gradient: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(165,180,252,0.2))',
        },
        card: {
          ...defaultModeSections.card,
          bg: '#0b1220',
          fg: '#c7d2fe',
          gradient: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(255,255,255,0.1))',
        },
      },
    },
  },
  {
    name: 'Coastal Mist',
    sections: {
      light: {
        header: {
          ...defaultModeSections.header,
          bg: '#d7efff',
          fg: '#0c1e2a',
          gradient: 'linear-gradient(135deg, #d7efff, #7dc0ff)',
        },
        welcome: {
          ...defaultModeSections.welcome,
          bg: '#ecf6ff',
          fg: '#0c1e2a',
          gradient: 'linear-gradient(135deg, rgba(237,246,255,0.7), rgba(124,192,255,0.25))',
        },
        card: {
          ...defaultModeSections.card,
          bg: '#f5fbff',
          fg: '#0c1e2a',
          gradient: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(124,192,255,0.2))',
        },
      },
      dark: {
        header: {
          ...defaultModeSections.header,
          bg: '#0b1f2f',
          fg: '#b3d4ff',
          gradient: 'linear-gradient(135deg, #0b1f2f, #1f3f5f)',
        },
        welcome: {
          ...defaultModeSections.welcome,
          bg: '#09121f',
          fg: '#b3d4ff',
          gradient: 'linear-gradient(135deg, rgba(9,18,31,0.9), rgba(179,212,255,0.2))',
        },
        card: {
          ...defaultModeSections.card,
          bg: '#0f1825',
          fg: '#d6e6ff',
          gradient: 'linear-gradient(135deg, rgba(179,212,255,0.25), rgba(255,255,255,0.05))',
        },
      },
    },
  },
  {
    name: 'Solar Harvest',
    sections: {
      light: {
        header: {
          ...defaultModeSections.header,
          bg: '#fff4e1',
          fg: '#4b2e0f',
          gradient: 'linear-gradient(135deg, #fff4e1, #ffc166)',
        },
        welcome: {
          ...defaultModeSections.welcome,
          bg: '#fff9f1',
          fg: '#4b2e0f',
          gradient: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,177,58,0.25))',
        },
        card: {
          ...defaultModeSections.card,
          bg: '#fff7ee',
          fg: '#4b2e0f',
          gradient: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,177,58,0.2))',
        },
      },
      dark: {
        header: {
          ...defaultModeSections.header,
          bg: '#2b1f00',
          fg: '#ffe9d5',
          gradient: 'linear-gradient(135deg, #2b1f00, #5c3610)',
        },
        welcome: {
          ...defaultModeSections.welcome,
          bg: '#1a1204',
          fg: '#ffe9d5',
          gradient: 'linear-gradient(135deg, rgba(0,0,0,0.85), rgba(255,233,213,0.2))',
        },
        card: {
          ...defaultModeSections.card,
          bg: '#1c1004',
          fg: '#ffe9d5',
          gradient: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,233,213,0.25))',
        },
      },
    },
  },
];

