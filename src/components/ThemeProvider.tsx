'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 初回マウント時にテーマを読み込み
    const initTheme = () => {
      if (typeof window === 'undefined') return 'light';
      
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const stored = window.localStorage.getItem('ui-is-dark');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      let isDark: boolean;
      if (isMobile) {
        isDark = prefersDark;
      } else {
        if (stored === 'true') {
          isDark = true;
        } else if (stored === 'false') {
          isDark = false;
        } else {
          isDark = prefersDark;
        }
      }
      
      return isDark ? 'dark' : 'light';
    };

    const initialTheme = initTheme();
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);

    // システムのカラースキーム変更を監視
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const stored = window.localStorage.getItem('ui-is-dark');
      
      if (isMobile || stored === null) {
        const newTheme = e.matches ? 'dark' : 'light';
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const isDark = newTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = newTheme;
    document.body.style.backgroundColor = isDark ? '#000000' : '#ffffff';
    document.body.style.color = isDark ? '#ffffff' : '#000000';
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    window.localStorage.setItem('ui-is-dark', newTheme === 'dark' ? 'true' : 'false');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // マウント前は何も表示しない（フラッシュ防止）
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
