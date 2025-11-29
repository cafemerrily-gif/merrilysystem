'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role?: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // 初期ロード
  useEffect(() => {
    setMounted(true);
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('auth error:', userError);
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url, bio, role')
      .eq('id', user.id)
      .maybeSingle();

    // 行が存在しないときだけ新規作成（PGRST116）
    if (error) {
      const code = (error as any).code;
      if (code === 'PGRST116') {
        const defaultName =
          (user.user_metadata as any)?.full_name ||
          user.email?.split('@')[0] ||
          'ユーザー';

        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            display_name: defaultName,
            avatar_url: null,
            bio: null,
          })
          .select('id, display_name, avatar_url, bio, role')
          .single();

        if (insertError) {
          console.error('create profile error:', insertError);
          alert(`プロフィール作成に失敗しました: ${insertError.message}`);
          setLoading(false);
          return;
        }

        setProfile(newProfile as UserProfile);
        setDisplayName(newProfile.display_name || '');
        setLoading(false);
        return;
      } else {
        console.error('loadProfile error:', error);
        alert(`プロフィール取得に失敗しました: ${error.message}`);
        setLoading(false);
        return;
      }
    }

    if (profileData) {
      setProfile(profileData as UserProfile);
      setDisplayName(profileData.display_name || '');
    } else {
      // ここに来ることはほぼないけどガード
      alert('プロフィール情報が取得できませんでした');
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) {
      alert('プロフィール情報が読み込まれていません');
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('user_profiles')
      .update({ display_name: displayName })
      .eq('id', profile.id);

    if (error) {
      console.error('save error:', error);
      alert(`保存に失敗しました: ${error.message}`);
      setSaving(false);
      return;
    }

    alert('保存しました');
    await loadProfile();
    setSaving(false);
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!profile) {
      alert('プロフィール情報が読み込まれていません');
      return;
    }

    try {
      setAvatarUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Storage にアップロード（avatars バケット）
      const { error: uploadError } = await supabase.storage
        .from('avatars') // ←バケット名ここ
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error('avatar upload error:', uploadError);
        alert(`アイコンのアップロードに失敗しました: ${uploadError.message}`);
        return;
      }

      // 公開URL取得
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // プロフィールに保存
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        console.error('avatar url update error:', updateError);
        alert(`アイコンURLの保存に失敗しました: ${updateError.message}`);
        return;
      }

      // プレビュー更新（即反映）
      setProfile((prev) =>
        prev ? { ...prev, avatar_url: publicUrl } : prev,
      );
      alert('アイコンを更新しました');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';

  if (!mounted || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <p style={{ color: mutedColor }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-16"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* ヘッダー */}
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke={textColor}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-lg font-semibold">アカウント設定</h1>
            </div>
          </div>
        </div>
      </header>

      {/* メイン */}
      <main className="pt-20 max-w-2xl mx-auto px-4 py-6">
        {/* プロフィールカード */}
        <div
          className="border rounded-2xl overflow-hidden mb-6"
          style={{ borderColor }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: isDark ? '#262626' : '#efefef',
                  }}
                >
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke={mutedColor}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* アイコン変更ボタン */}
                <label className="absolute -bottom-2 -right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full cursor-pointer">
                  {avatarUploading ? '変更中…' : '変更'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">
                  {displayName || '名前未設定'}
                </h2>
                <p className="text-sm" style={{ color: mutedColor }}>
                  {profile?.role === 'admin' ? '管理者' : 'メンバー'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  表示名
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    borderColor,
                  }}
                  placeholder="表示名を入力"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                style={{
                  backgroundColor: isDark ? '#ffffff' : '#000000',
                  color: isDark ? '#000000' : '#ffffff',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? '保存中...' : '変更を保存'}
              </button>
            </div>
          </div>
        </div>

        {/* その他設定 */}
        <div
          className="border rounded-2xl overflow-hidden mb-6"
          style={{ borderColor }}
        >
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 border-b transition-opacity hover:opacity-70"
            style={{ borderColor }}
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke={textColor}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
              <span>ダークモード</span>
            </div>
            <div
              className="px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor: isDark ? '#262626' : '#efefef',
              }}
            >
              {isDark ? 'ON' : 'OFF'}
            </div>
          </button>

          <Link
            href="/account/change-password"
            className="flex items-center justify-between p-4 transition-opacity hover:opacity-70"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke={textColor}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                />
              </svg>
              <span>パスワード変更</span>
            </div>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke={mutedColor}
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* ログアウト */}
        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 border"
          style={{
            borderColor,
            color: '#ff3b30',
          }}
        >
          ログアウト
        </button>
      </main>

      {/* 下部ナビ */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t z-40"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-5 h-16">
            <Link
              href="/dashboard/accounting"
              className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={textColor}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>
                会計部
              </span>
            </Link>

            <Link
              href="/dashboard/dev/menu"
              className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={textColor}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>
                開発部
              </span>
            </Link>

            <Link
              href="/dashboard/pr/menu"
              className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={textColor}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
                />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>
                広報部
              </span>
            </Link>

            <Link
              href="/dashboard/staff"
              className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={textColor}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>
                スタッフ
              </span>
            </Link>

            <Link
              href="/account"
              className="flex flex-col items-center justify-center gap-1"
            >
              <svg
                className="w-6 h-6"
                fill={textColor}
                stroke={textColor}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span
                className="text-xs font-semibold"
                style={{ color: textColor }}
              >
                設定
              </span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
