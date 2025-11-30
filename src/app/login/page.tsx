'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

const DEPARTMENTS = [
  '会計部',
  '開発部',
  'エンジニア部',
  '広報部',
  'マネジメント部',
  '職員',
  'スタッフ',
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // テーマ
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const inputBg = isDark ? '#1a1a1a' : '#fafafa';

  // 既にログインしているかチェック
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push('/');
    }
  };

  const handleDepartmentToggle = (dept: string) => {
    setSelectedDepartments(prev => 
      prev.includes(dept)
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('ログインエラー:', error);
      setError(error.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // パスワード検証（クライアント側）
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new Error('パスワードは英数字を含む8文字以上である必要があります');
      }

      // サインアップAPIを呼び出し
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
          departments: selectedDepartments,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'サインアップに失敗しました');
      }

      // サインアップ成功 → 自動ログイン
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('サインアップエラー:', error);
      setError(error.message || 'サインアップに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: bgColor }}>
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src={isDark ? '/white.png' : '/black.png'}
              alt="MERRILY"
              width={180}
              height={60}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
            {isSignUp ? 'アカウント作成' : 'ログイン'}
          </h1>
          <p className="text-sm" style={{ color: mutedColor }}>
            {isSignUp ? '新しいアカウントを作成' : 'アカウントにログイン'}
          </p>
        </div>

        {/* フォーム */}
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: bgColor, borderColor }}>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            {/* ユーザー名（サインアップのみ） */}
            {isSignUp && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                  ユーザー名 *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none transition-colors"
                  style={{ 
                    backgroundColor: inputBg, 
                    borderColor, 
                    color: textColor 
                  }}
                  placeholder="山田太郎"
                  required
                />
              </div>
            )}

            {/* メールアドレス */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                メールアドレス *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-colors"
                style={{ 
                  backgroundColor: inputBg, 
                  borderColor, 
                  color: textColor 
                }}
                placeholder="example@merrily.cafe"
                required
              />
            </div>

            {/* パスワード */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                パスワード *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none transition-colors pr-12"
                  style={{ 
                    backgroundColor: inputBg, 
                    borderColor, 
                    color: textColor 
                  }}
                  placeholder={isSignUp ? '英数字8文字以上' : '••••••••'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke={mutedColor} viewBox="0 0 24 24" strokeWidth={2}>
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs" style={{ color: mutedColor }}>
                  英数字を含む8文字以上
                </p>
              )}
            </div>

            {/* 部署選択（サインアップのみ） */}
            {isSignUp && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                  所属部署（複数選択可）
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => handleDepartmentToggle(dept)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all border"
                      style={{
                        backgroundColor: selectedDepartments.includes(dept)
                          ? textColor
                          : 'transparent',
                        color: selectedDepartments.includes(dept)
                          ? bgColor
                          : textColor,
                        borderColor: selectedDepartments.includes(dept)
                          ? textColor
                          : borderColor,
                      }}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-opacity disabled:opacity-50"
              style={{ backgroundColor: textColor, color: bgColor }}
            >
              {loading ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
            </button>
          </form>

          {/* 切り替えボタン */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: textColor }}
            >
              {isSignUp ? (
                <>
                  すでにアカウントをお持ちですか？{' '}
                  <span className="font-semibold">ログイン</span>
                </>
              ) : (
                <>
                  アカウントをお持ちでないですか？{' '}
                  <span className="font-semibold">アカウント作成</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: mutedColor }}>
            © 2025 MERRILY. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
