'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function AccountPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const cardBg = isDark ? '#000000' : '#ffffff';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name);
        setBio(data.bio || '');
        setAvatarPreview(data.avatar_url);
      } else {
        // プロフィールが存在しない場合、デフォルト値を設定
        setDisplayName(user.email?.split('@')[0] || 'ユーザー');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      let avatarUrl = profile?.avatar_url || null;

      // アバター画像をアップロード
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          alert('アバター画像のアップロードに失敗しました');
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      // プロフィールを保存
      const profileData = {
        id: user.id,
        display_name: displayName,
        bio: bio || null,
        avatar_url: avatarUrl,
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData);

      if (error) {
        console.error('Error saving profile:', error);
        alert('プロフィールの保存に失敗しました');
        return;
      }

      alert('プロフィールを保存しました！');
      loadProfile();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor, color: textColor }}>
        <p style={{ color: mutedColor }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">アカウント設定</h1>
          <p className="text-sm mt-1" style={{ color: mutedColor }}>
            投稿時に表示される名前とアイコンを設定できます
          </p>
        </div>

        {/* プロフィール編集カード */}
        <div className="border rounded-2xl p-6 space-y-6" style={{ backgroundColor: cardBg, borderColor }}>
          {/* アバター */}
          <div>
            <label className="block text-sm font-semibold mb-3">プロフィール画像</label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#262626' : '#efefef' }}>
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12" fill="none" stroke={mutedColor} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer px-4 py-2 rounded-lg border transition-all duration-200 inline-block" style={{ borderColor }}>
                  <span className="text-sm font-medium">画像を選択</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs mt-2" style={{ color: mutedColor }}>
                  JPG、PNG、GIF（最大5MB）
                </p>
              </div>
            </div>
          </div>

          {/* 表示名 */}
          <div>
            <label className="block text-sm font-semibold mb-2">表示名</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名を入力"
              className="w-full px-4 py-3 rounded-lg border outline-none transition-all duration-200"
              style={{
                backgroundColor: bgColor,
                borderColor,
                color: textColor,
              }}
              maxLength={50}
            />
            <p className="text-xs mt-1" style={{ color: mutedColor }}>
              投稿時に表示される名前です
            </p>
          </div>

          {/* 自己紹介 */}
          <div>
            <label className="block text-sm font-semibold mb-2">自己紹介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="自己紹介を入力（任意）"
              rows={4}
              className="w-full px-4 py-3 rounded-lg border outline-none resize-none transition-all duration-200"
              style={{
                backgroundColor: bgColor,
                borderColor,
                color: textColor,
              }}
              maxLength={200}
            />
            <p className="text-xs mt-1" style={{ color: mutedColor }}>
              {bio.length} / 200文字
            </p>
          </div>

          {/* 保存ボタン */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
              className="w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: isDark ? '#ffffff' : '#000000',
                color: isDark ? '#000000' : '#ffffff',
              }}
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>

        {/* プレビュー */}
        <div className="mt-6 border rounded-2xl p-6" style={{ backgroundColor: cardBg, borderColor }}>
          <h2 className="text-sm font-semibold mb-4">プレビュー</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#262626' : '#efefef' }}>
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke={mutedColor} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{displayName || '表示名未設定'}</p>
              {bio && (
                <p className="text-xs line-clamp-1" style={{ color: mutedColor }}>
                  {bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
