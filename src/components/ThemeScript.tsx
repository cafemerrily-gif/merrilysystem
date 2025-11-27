// このスクリプトをルートlayout.tsxの<body>タグ直後に配置してください

export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        // スマホ判定
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        // デバイス設定
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // 保存された設定
        const stored = localStorage.getItem('ui-is-dark');
        
        // テーマ決定（スマホは常にデバイス設定、PC/タブレットは保存された設定またはデバイス設定）
        let isDark;
        if (isMobile) {
          isDark = prefersDark;
        } else {
          isDark = stored === 'true' ? true : stored === 'false' ? false : prefersDark;
        }
        
        // darkクラスを即座に適用
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // キャッシュから色設定を読み込んで即座に適用
        const cached = localStorage.getItem('ui-settings-cache');
        if (cached) {
          const ui = JSON.parse(cached);
          
          const hexToHsl = function(hex) {
            if (!hex) return '210 40% 98%';
            if (hex.includes('%')) return hex;
            const h = hex.replace('#', '');
            if (h.length !== 6) return '210 40% 98%';
            const r = parseInt(h.slice(0, 2), 16) / 255;
            const g = parseInt(h.slice(2, 4), 16) / 255;
            const b = parseInt(h.slice(4, 6), 16) / 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let hue = 0, sat = 0;
            const l = (max + min) / 2;
            const d = max - min;
            if (d !== 0) {
              sat = d / (1 - Math.abs(2 * l - 1));
              switch (max) {
                case r: hue = ((g - b) / d) % 6; break;
                case g: hue = (b - r) / d + 2; break;
                default: hue = (r - g) / d + 4; break;
              }
              hue = Math.round(hue * 60);
              if (hue < 0) hue += 360;
            }
            return Math.round(hue) + ' ' + Math.round(sat * 100) + '% ' + Math.round(l * 100) + '%';
          };
          
          const hexToRgba = function(hex, alpha) {
            const h = hex.replace('#', '');
            if (h.length !== 6) return 'rgba(0, 0, 0, ' + alpha + ')';
            const r = parseInt(h.slice(0, 2), 16);
            const g = parseInt(h.slice(2, 4), 16);
            const b = parseInt(h.slice(4, 6), 16);
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
          };
          
          // ライト/ダークモードの設定
          const light = {
            bg: ui.lightBackground || '#f8fafc',
            bgAlpha: ui.lightBackgroundAlpha ?? 1,
            bgGradient: ui.lightBackgroundGradient || '',
            fg: ui.lightForeground || '#0f172a',
            border: ui.lightBorder || '#e2e8f0',
            cardBg: ui.cardBgLight || ui.cardBackground || '#ffffff',
            cardFg: ui.cardFgLight || ui.cardForeground || '#0f172a',
            muted: ui.mutedColorLight || ui.mutedColor || '#64748b',
          };
          
          const dark = {
            bg: ui.darkBackground || '#0b1220',
            bgAlpha: ui.darkBackgroundAlpha ?? 1,
            bgGradient: ui.darkBackgroundGradient || '',
            fg: ui.darkForeground || '#e5e7eb',
            border: ui.darkBorder || '#1f2937',
            cardBg: ui.cardBgDark || ui.cardBackground || '#0f172a',
            cardFg: ui.cardFgDark || ui.cardForeground || '#e5e7eb',
            muted: ui.mutedColorDark || ui.mutedColor || '#94a3b8',
          };
          
          const mode = isDark ? dark : light;
          const root = document.documentElement;
          
          // CSS変数を設定
          root.style.setProperty('--background', hexToHsl(mode.bg));
          root.style.setProperty('--foreground', hexToHsl(mode.fg));
          root.style.setProperty('--border', hexToHsl(mode.border));
          root.style.setProperty('--card', hexToHsl(mode.cardBg));
          root.style.setProperty('--card-foreground', hexToHsl(mode.cardFg));
          root.style.setProperty('--muted', hexToHsl(mode.muted));
          
          // 背景を適用
          if (mode.bgGradient) {
            document.body.style.backgroundImage = mode.bgGradient;
            document.body.style.backgroundColor = 'transparent';
          } else {
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = hexToRgba(mode.bg, mode.bgAlpha);
          }
        }
      } catch (e) {
        // エラーが起きても続行
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  );
}
