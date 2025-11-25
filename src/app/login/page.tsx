'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function LoginPageInner() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const deptOptions = ['会計部', '開発部', '広報部', 'マネジメント部', '職員', 'エンジニアチーム', '店舗スタッフ'];
  const [departments, setDepartments] = useState<string[]>([]);
  // login と signup を切り替え（初回だけ signup を使う運用）
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [hasManualPreference, setHasManualPreference] = useState(false);
  const [routerReady, setRouterReady] = useState(false);
  const [loginIconUrl, setLoginIconUrl] = useState('/MERRILY_Simbol.png');
  const [themeColors, setThemeColors] = useState<{
    light: { background: string; border: string; foreground: string };
    dark: { background: string; border: string; foreground: string };
  } | null>(null);

  const applyColors = useCallback(
    (nextIsDark: boolean, colors: typeof themeColors) => {
      if (!colors) return;
      const root = document.documentElement;
      const mode = nextIsDark ? colors.dark : colors.light;
      root.style.setProperty('--background', mode.background);
      root.style.setProperty('--foreground', mode.foreground);
      root.style.setProperty('--border', mode.border);
      root.style.setProperty('--background-dark', colors.dark.background);
      root.style.setProperty('--foreground-dark', colors.dark.foreground);
      root.style.setProperty('--border-dark', colors.dark.border);
    },
    []
  );

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace(redirectedFrom);
      }
      setRouterReady(true);
    })();
  }, [router, supabase, redirectedFrom]);

  // テーマ: デバイス設定＋PCでは手動トグル
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (next: boolean) => {
      setIsDark(next);
      document.documentElement.classList.toggle('dark', next);
      applyColors(next, themeColors);
    };
    applyTheme(media.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      if (hasManualPreference) return;
      applyTheme(event.matches);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [hasManualPreference, applyColors, themeColors]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pr/website', { cache: 'no-store' });
        const data = await res.json();
        const ui = data?.uiSettings;
        if (ui?.loginIconUrl) setLoginIconUrl(ui.loginIconUrl);
        if (ui) {
          setThemeColors({
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
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setHasManualPreference(true);
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    applyColors(next, themeColors);
  };

  useEffect(() => {
    if (themeColors) applyColors(isDark, themeColors);
  }, [themeColors, isDark, applyColors]);

  const validatePassword = (value: string) => {
    // 要件: 英数字8文字以上（英字・数字を各1文字以上）
    if (value.length < 8) return 'パスワードは8文字以上にしてください';
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return '英字と数字を1文字以上含めてください';
    return '';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
        } else if (data.session) {
          await fetch('/api/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'SIGNED_IN', session: data.session }),
          });
          router.replace(redirectedFrom);
          router.refresh();
        }
      } else {
        if (!fullName || departments.length === 0) {
          setError('氏名と部署を入力してください（部署は1つ以上）');
          setLoading(false);
          return;
        }
        const pwdMsg = validatePassword(password);
        if (pwdMsg) {
          setInfo(null);
          setError(pwdMsg);
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              departments,
            },
          },
        });
        if (error) {
            setError(error.message);
          } else {
            setInfo('確認メールを送信しました。メールを確認してください。');
            setMode('login');
          }
        }
    } catch (err: any) {
      setError(err?.message || '処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const goResetPage = () => {
    setError(null);
    setInfo(null);
    if (!routerReady) return;
    router.push('/reset-password');
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError(null);
    setInfo(null);
    setPassword('');
    setDepartments([]);
    setFullName('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="hidden md:block fixed top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-200 group"
          aria-label="テーマを切り替え"
        >
          {isDark ? (
            <svg className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Image src={loginIconUrl || '/MERRILY_Simbol.png'} alt="MERRILY" width={120} height={120} className="object-contain" priority />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">MERRILY</h1>
          <p className="text-xs uppercase text-muted-foreground tracking-[0.2em]">Cafe Management System</p>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'メールアドレスとパスワードでサインイン' : '初回のみユーザー登録してください'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {mode === 'signup' && (
            <label className="text-sm text-muted-foreground flex flex-col gap-2">
              氏名
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2"
                placeholder="山田 太郎"
              />
            </label>
          )}
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            メールアドレス
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2"
              placeholder="you@example.com"
            />
          </label>
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            パスワード
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-muted-foreground hover:text-accent"
                  aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18M9.88 9.88a3 3 0 104.24 4.24M6.1 6.1A9.53 9.53 0 003 12c1.5 2.5 4.5 5 9 5 1.4 0 2.68-.26 3.82-.72M13.12 7.52A3 3 0 0117 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground">英数字を含む8文字以上で入力してください。</p>
            )}
          </label>
          {mode === 'signup' && (
            <div className="text-sm text-muted-foreground flex flex-col gap-2">
              部署（複数選択可）
              <div className="grid grid-cols-2 gap-2">
                {deptOptions.map((dept) => {
                  const checked = departments.includes(dept);
                  return (
                    <label key={dept} className="flex items-center gap-2 text-foreground border border-border rounded-lg px-3 py-2 bg-card">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...departments, dept]
                            : departments.filter((d) => d !== dept);
                          setDepartments(next);
                        }}
                      />
                      <span>{dept}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {info && <p className="text-sm text-green-600">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (mode === 'login' ? 'サインイン中...' : '登録中...') : mode === 'login' ? 'ログイン' : '登録する'}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>アカウントが無い場合は一度だけ登録してください。</p>
          <button
            type="button"
            onClick={toggleMode}
            className="text-accent hover:underline"
          >
            {mode === 'login' ? '初回登録はこちら' : 'ログイン画面に戻る'}
          </button>
          <div className="pt-2">
            <button
              type="button"
              onClick={goResetPage}
              className="text-accent hover:underline"
            >
              パスワードを忘れた場合はこちら
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 text-center">Loading...</div>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
