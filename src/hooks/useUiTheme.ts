import { useEffect, useState, useCallback } from 'react';

type UiSettings = {
  lightBackground?: string;
  lightBorder?: string;
  lightForeground?: string;
  darkBackground?: string;
  darkBorder?: string;
  darkForeground?: string;
};

type UiColors = {
  light: { background: string; border: string; foreground: string };
  dark: { background: string; border: string; foreground: string };
};

const normalizeColorValue = (value: string) => {
  if (!value) return '210 40% 98%';
  if (value.includes('%')) return value;
  const hex = value.replace('#', '');
  if (hex.length !== 6) return '210 40% 98%';
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export function useUiTheme() {
  const [loading, setLoading] = useState(true);

  const applyColors = useCallback((isDark: boolean, colors: UiColors) => {
    const root = document.documentElement;
    const mode = isDark ? colors.dark : colors.light;
    root.style.setProperty('--background', normalizeColorValue(mode.background));
    root.style.setProperty('--foreground', normalizeColorValue(mode.foreground));
    root.style.setProperty('--border', normalizeColorValue(mode.border));
    root.style.setProperty('--background-dark', normalizeColorValue(colors.dark.background));
    root.style.setProperty('--foreground-dark', normalizeColorValue(colors.dark.foreground));
    root.style.setProperty('--border-dark', normalizeColorValue(colors.dark.border));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1) ローカルキャッシュを先に適用してチラつきを抑える
    const cached = window.localStorage.getItem('ui-settings-cache');
    let cachedColors: UiColors | null = null;
    if (cached) {
      try {
        const ui: UiSettings = JSON.parse(cached);
        cachedColors = {
          light: {
            background: ui.lightBackground || '#f8fafc',
            border: ui.lightBorder || '#e2e8f0',
            foreground: ui.lightForeground || '#0f172a',
          },
          dark: {
            background: ui.darkBackground || '#0b1220',
            border: ui.darkBorder || '#1f2937',
            foreground: ui.darkForeground || '#e5e7eb',
          },
        };
      } catch (e) {
        console.error('UI cache parse error', e);
      }
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const initialIsDark = media.matches;
    if (cachedColors) {
      document.documentElement.classList.toggle('dark', initialIsDark);
      applyColors(initialIsDark, cachedColors);
    }

    // 2) サーバーから取得して上書き
    (async () => {
      try {
        const res = await fetch('/api/pr/website', { cache: 'no-store' });
        const data = await res.json();
        const ui: UiSettings = data?.uiSettings || {};
        const colors: UiColors = {
          light: {
            background: ui.lightBackground || '#f8fafc',
            border: ui.lightBorder || '#e2e8f0',
            foreground: ui.lightForeground || '#0f172a',
          },
          dark: {
            background: ui.darkBackground || '#0b1220',
            border: ui.darkBorder || '#1f2937',
            foreground: ui.darkForeground || '#e5e7eb',
          },
        };
        document.documentElement.classList.toggle('dark', initialIsDark);
        applyColors(initialIsDark, colors);
        window.localStorage.setItem('ui-settings-cache', JSON.stringify(ui));
      } catch (e) {
        console.error('UI settings fetch error', e);
      } finally {
        setLoading(false);
      }
    })();

    const handleChange = (event: MediaQueryListEvent) => {
      const ui = cachedColors;
      if (!ui) return;
      document.documentElement.classList.toggle('dark', event.matches);
      applyColors(event.matches, ui);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [applyColors]);

  return { loading };
}
