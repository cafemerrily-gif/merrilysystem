'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const cardBg = isDark ? '#121212' : '#fafafa';
  const inputBg = isDark ? '#1a1a1a' : '#ffffff';
  const accentColor = '#22c55e';

  // ダークモードに応じたアイコンを選択
  const logoSrc = isDark ? '/white.png' : '/black.png';

  // リダイレクト先
  // 🔥 ← ホーム画面に固定
  const redirectedFrom = searchParams.get('redirectedFrom') || '/';


  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('メールアドレスまたはパスワードが正しくありません');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        router.push(redirectedFrom);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: textColor }}></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* ロゴ - 大きく表示 */}
      <div className="mb-6">
        <img
          src={logoSrc}
          alt="MERRILY"
          className="w-32 h-32 object-contain"
          onError={(e) => {
            // フォールバック: テキストロゴを表示
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold';
              fallback.style.backgroundColor = accentColor;
              fallback.style.color = '#ffffff';
              fallback.textContent = 'M';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>

      {/* タイトル */}
      <h1 className="text-3xl font-bold mb-2">MERRILY</h1>
      <p className="text-sm mb-8" style={{ color: mutedColor }}>
        カフェ管理システム
      </p>

      {/* ログインフォーム */}
      <div 
        className="w-full max-w-sm p-6 rounded-2xl border"
        style={{ backgroundColor: cardBg, borderColor }}
      >
        <form onSubmit={handleLogin} className="space-y-4">
          {/* エラーメッセージ */}
          {error && (
            <div className="p-3 rounded-xl text-sm text-red-500 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {/* メールアドレス */}
          <div>
            <label className="block text-sm mb-2" style={{ color: mutedColor }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-base"
              style={{ 
                backgroundColor: inputBg, 
                border: `1px solid ${borderColor}`, 
                color: textColor 
              }}
              placeholder="example@email.com"
              required
              autoComplete="email"
            />
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-sm mb-2" style={{ color: mutedColor }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-base"
              style={{ 
                backgroundColor: inputBg, 
                border: `1px solid ${borderColor}`, 
                color: textColor 
              }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {/* ログインボタン */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                ログイン中...
              </span>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        {/* パスワードリセットリンク */}
        <div className="mt-4 text-center">
          <a 
            href="/reset-password" 
            className="text-sm hover:underline"
            style={{ color: accentColor }}
          >
            パスワードを忘れた方
          </a>
        </div>
      </div>

      {/* フッター */}
      <p className="mt-8 text-xs" style={{ color: mutedColor }}>
        © 2025 MERRILY Cafe Management System
      </p>
    </div>
  );
}
