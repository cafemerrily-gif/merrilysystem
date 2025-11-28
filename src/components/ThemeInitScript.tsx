export function ThemeInitScript() {
  const themeScript = `
    (function() {
      function getTheme() {
        if (typeof window === 'undefined') return 'light';
        
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const stored = window.localStorage.getItem('ui-is-dark');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let isDark;
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
      }
      
      const theme = getTheme();
      const isDark = theme === 'dark';
      
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = theme;
      document.documentElement.style.backgroundColor = isDark ? '#000000' : '#ffffff';
      document.documentElement.style.color = isDark ? '#ffffff' : '#000000';
      document.body.style.backgroundColor = isDark ? '#000000' : '#ffffff';
      document.body.style.color = isDark ? '#ffffff' : '#000000';
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
