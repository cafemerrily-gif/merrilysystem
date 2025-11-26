import { useEffect, useState } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);

  // 画面幅でモバイル判定
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyColors = (isDark: boolean, colors: UiColors) => {
      const root = document.documentElement;
      const mode = isDark ? colors.dark : colors.light;
      root.style.setProperty('--background', normalizeColorValue(mode.background));
      root.style.setProperty('--foreground', normalizeColorValue(mode.foreground));
      root.style.setProperty('--border', normalizeColorValue(mode.border));
      root.style.setProperty('--background-dark', normalizeColorValue(colors.dark.background));
      root.style.setProperty('--foreground-dark', normalizeColorValue(colors.dark.foreground));
      root.style.setProperty('--border-dark', normalizeColorValue(colors.dark.border));
      root.classList.toggle('dark', isDark);
    };

    const loadColorsFromSettings = (ui: UiSettings): UiColors => ({
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
    });

    const cached = window.localStorage.getItem('ui-settings-cache');
    const cachedUi: UiSettings = cached ? (() => { try { return JSON.parse(cached); } catch { return {}; } })() : {};
    const cachedColors = loadColorsFromSettings(cachedUi);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const storedPref = window.localStorage.getItem('ui-is-dark');
    const preferred = storedPref === 'true' ? true : storedPref === 'false' ? false : media.matches;
    const desired = isMobile ? media.matches : preferred;

    // 1) 先にキャッシュを適用
    applyColors(desired, cachedColors);

    // 2) サーバーから取得して上書き
    (async () => {
      try {
        const res = await fetch('/api/pr/website', { cache: 'no-store' });
        const data = await res.json();
        const ui: UiSettings = data?.uiSettings || {};
        const colors = loadColorsFromSettings(ui);
        applyColors(desired, colors);
        window.localStorage.setItem('ui-settings-cache', JSON.stringify(ui));
      } catch (e) {
        console.error('UI settings fetch error', e);
      } finally {
        setLoading(false);
      }
    })();

    // モバイルのみデバイス設定の変化に追従
    const handleChange = (event: MediaQueryListEvent) => {
      if (!isMobile) return;
      applyColors(event.matches, cachedColors);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [isMobile]);

  return { loading };
}
