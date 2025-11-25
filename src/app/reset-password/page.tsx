'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function ResetPasswordInner() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'update'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validatePassword = (value: string) => {
    // 要件: 英数字8文字以上（英字・数字を各1文字以上）
    if (value.length < 8) return 'パスワードは8文字以上にしてください';
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return '英字と数字を1文字以上含めてください';
    return '';
  };

  // If redirected from email link, exchange code and move to update step
  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(error.message);
        } else if (data?.session) {
          setStep('update');
          setInfo('新しいパスワードを入力してください。');
        }
      } catch (err: any) {
        setError(err?.message || 'セッションの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, supabase]);

  const requestMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setError(error.message);
      else setInfo('パスワード再設定メールを送信しました。メールを確認してください。');
    } catch (err: any) {
      setError(err?.message || 'メール送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdMsg = validatePassword(password);
    if (pwdMsg) {
      setInfo(null);
      setError(pwdMsg);
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setError(error.message);
      else {
        setInfo('パスワードを更新しました。ログインし直してください。');
        setTimeout(() => router.replace('/login'), 1000);
      }
    } catch (err: any) {
      setError(err?.message || 'パスワード更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">{step === 'request' ? 'パスワード再設定' : '新しいパスワード'}</h1>
          <p className="text-sm text-muted-foreground">
            {step === 'request' ? '登録メールアドレスを入力してください' : '要件: 英数字を含む8文字以上'}
          </p>
        </div>

        {step === 'request' ? (
          <form className="space-y-4" onSubmit={requestMail}>
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
              <p className="text-xs text-muted-foreground">英数字を含む8文字以上で入力してください。</p>
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {info && <p className="text-sm text-green-600">{info}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? '送信中...' : '再設定メールを送る'}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={updatePassword}>
            <label className="text-sm text-muted-foreground flex flex-col gap-2">
              新しいパスワード
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2"
                placeholder="••••••••"
              />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {info && <p className="text-sm text-green-600">{info}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? '更新中...' : 'パスワードを更新'}
            </button>
          </form>
        )}
        <div className="text-center text-xs text-muted-foreground">
          <a href="/login" className="text-accent hover:underline">ログインに戻る</a>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
