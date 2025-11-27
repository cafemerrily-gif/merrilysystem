import { useEffect, useState } from 'react';

type UiSettings = {
  lightBackground?: string;
  lightBackgroundAlpha?: number;
  lightBackgroundGradient?: string;
  lightBorder?: string;
  lightForeground?: string;
  darkBackground?: string;
  darkBackgroundAlpha?: number;
  darkBackgroundGradient?: string;
  darkBorder?: string;
  darkForeground?: string;
  cardBgLight?: string;
  cardFgLight?: string;
  cardBorderLight?: string;
  cardBgDark?: string;
  cardFgDark?: string;
  cardBorderDark?: string;
  cardBackground?: string;
  cardForeground?: string;
  cardBorder?: string;
  primary?: string;
  primaryForeground?: string;
  accent?: string;
  accentForeground?: string;
  mutedColor?: string;
  mutedColorLight?: string;
  mutedColorDark?: string;
  inputBgColorLight?: string;
  inputTextColorLight?: string;
  inputBgColorDark?: string;
  inputTextColorDark?: string;
};

type UiColors = {
  light: {
    background: string;
    border: string;
    foreground: string;
    backgroundAlpha: number;
    backgroundGradient: string;
    cardBg: string;
    cardFg: string;
    cardBorder: string;
    muted: string;
    accent: string;
    primary: string;
  };
  dark: {
    background: string;
    border: string;
    foreground: string;
    backgroundAlpha: number;
    backgroundGradient: string;
    cardBg: string;
    cardFg: string;
    cardBorder: string;
    muted: string;
    accent: string;
    primary: string;
  };
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

const hexToRgba = (hex: string, alpha = 1) => {
  const safeHex = hex.replace('#', '');
  if (safeHex.length !== 6) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(safeHex.slice(0, 2), 16);
  const g = parseInt(safeHex.slice(2, 4), 16);
  const b = parseInt(safeHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function useUiTheme() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyColors = (isDark: boolean, colors: UiColors) => {
      const root = document.documentElement;
      const mode = isDark ? colors.dark : colors.light;
      
      // CSS変数を設定
      root.style.setProperty('--background', normalizeColorValue(mode.background));
      root.style.setProperty('--foreground', normalizeColorValue(mode.foreground));
      root.style.setProperty('--border', normalizeColorValue(mode.border));
      root.style.setProperty('--card', normalizeColorValue(mode.cardBg));
      root.style.setProperty('--card-foreground', normalizeColorValue(mode.cardFg));
      root.style.setProperty('--muted', normalizeColorValue(mode.muted));
      root.style.setProperty('--muted-foreground', normalizeColorValue(mode.muted));
      root.style.setProperty('--accent', normalizeColorValue(mode.accent));
      root.style.setProperty('--primary', normalizeColorValue(mode.primary));
      root.style.setProperty('--background-dark', normalizeColorValue(colors.dark.background));
      root.style.setProperty('--foreground-dark', normalizeColorValue(colors.dark.foreground));
      root.style.setProperty('--border-dark', normalizeColorValue(colors.dark.border));
      root.style.setProperty('--card-background-hex', mode.cardBg);
      root.style.setProperty('--card-foreground-hex', mode.cardFg);
      
      // darkクラスを切り替え
      root.classList.toggle('dark', isDark);

      // 背景を適用
      if (mode.backgroundGradient) {
        document.body.style.backgroundImage = mode.backgroundGradient;
        document.body.style.backgroundColor = 'transparent';
      } else {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = hexToRgba(mode.background, mode.backgroundAlpha ?? 1);
      }
      
      // 読み込み完了のマーク
      document.body.classList.remove('loading');
      document.body.classList.add('loaded');
    };

    const loadColorsFromSettings = (ui: UiSettings): UiColors => {
      const inputBgLight = ui.inputBgColorLight || '#ffffff';
      const inputTextLight = ui.inputTextColorLight || '#0f172a';
      const inputBgDark = ui.inputBgColorDark || '#1f2937';
      const inputTextDark = ui.inputTextColorDark || '#e5e7eb';
      
      return {
        light: {
          background: ui.lightBackground || '#f8fafc',
          border: ui.lightBorder || '#e2e8f0',
          foreground: ui.lightForeground || '#0f172a',
          backgroundAlpha: ui.lightBackgroundAlpha ?? 1,
          backgroundGradient: ui.lightBackgroundGradient || '',
          cardBg: ui.cardBgLight || ui.cardBackground || '#ffffff',
          cardFg: ui.cardFgLight || ui.cardForeground || '#0f172a',
          cardBorder: ui.cardBorderLight || ui.cardBorder || '#e2e8f0',
          muted: ui.mutedColorLight || ui.mutedColor || '#64748b',
          accent: ui.accent || ui.primary || '#0f172a',
          primary: ui.primary || '#0f172a',
        },
        dark: {
          background: ui.darkBackground || '#0b1220',
          border: ui.darkBorder || '#1f2937',
          foreground: ui.darkForeground || '#e5e7eb',
          backgroundAlpha: ui.darkBackgroundAlpha ?? 1,
          backgroundGradient: ui.darkBackgroundGradient || '',
          cardBg: ui.cardBgDark || ui.cardBackground || '#0f172a',
          cardFg: ui.cardFgDark || ui.cardForeground || '#e5e7eb',
          cardBorder: ui.cardBorderDark || ui.cardBorder || '#1f2937',
          muted: ui.mutedColorDark || ui.mutedColor || '#94a3b8',
          accent: ui.accent || ui.primary || '#e5e7eb',
          primary: ui.primary || '#e5e7eb',
        },
      };
    };

    // 初期テーマ決定
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const storedPref = window.localStorage.getItem('ui-is-dark');
    
    // スマホは常にデバイス設定、PC/タブレットは保存された設定またはデバイス設定
    const initialIsDark = isMobile ? media.matches : (storedPref === 'true' ? true : storedPref === 'false' ? false : media.matches);

    // キャッシュから即座に適用（ThemeScriptで既に適用済みだが、再度確実に）
    const cached = window.localStorage.getItem('ui-settings-cache');
    const cachedUi: UiSettings = cached ? (() => { try { return JSON.parse(cached); } catch { return {}; } })() : {};
    const cachedColors = loadColorsFromSettings(cachedUi);
    applyColors(initialIsDark, cachedColors);

    // サーバーから最新設定を取得して上書き
    let latestColors = cachedColors;
    (async () => {
      try {
        const res = await fetch('/api/pr/website', { cache: 'no-store' });
        const data = await res.json();
        const ui: UiSettings = data?.uiSettings || {};
        latestColors = loadColorsFromSettings(ui);
        
        // 現在のテーマ設定を再確認して適用
        const currentPref = window.localStorage.getItem('ui-is-dark');
        const isMobileNow = window.matchMedia('(max-width: 768px)').matches;
        const currentIsDark = isMobileNow ? media.matches : (currentPref === 'true' ? true : currentPref === 'false' ? false : media.matches);
        applyColors(currentIsDark, latestColors);
        
        window.localStorage.setItem('ui-settings-cache', JSON.stringify(ui));
      } catch (e) {
        console.error('UI settings fetch error', e);
      } finally {
        setLoading(false);
      }
    })();

    // デバイス設定変更時の処理
    // スマホ: 常にデバイス設定に従う
    // PC/タブレット: 手動設定がない場合のみデバイス設定に従う
    const handleChange = (event: MediaQueryListEvent) => {
      const isMobileNow = window.matchMedia('(max-width: 768px)').matches;
      const currentPref = window.localStorage.getItem('ui-is-dark');
      
      if (isMobileNow || currentPref === null) {
        applyColors(event.matches, latestColors);
      }
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return { loading };
}
