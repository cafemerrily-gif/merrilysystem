'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreatePostPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // テーマを安全に検出
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const checkDark = () =>
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;

      setIsDark(checkDark());

      const observer = new MutationObserver(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
      media.addEventListener('change', handleChange);

      return () => {
        observer.disconnect();
        media.removeEventListener('change', handleChange);
      };
    }
  }, []);

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      alert('画像は最大10枚までです');
      return;
    }

    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(newPreviews).then((previews) => {
      setImagePreviews((prev) => [...prev, ...previews]);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim()) {
      alert('投稿内容を入力してください');
      return;
    }

    try {
      setPosting(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('ログインが必要です');
        router.push('/login');
        return;
      }

      // ------- ここからプロフィール確認・作成（テーブル構造に合わせて修正） -------
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id) // user_id ではなく id で紐付け
        .single();

      if (profileError) {
        // 「行がありません」のエラーも出るのでログだけ
        console.log('Profile load error (may be not found):', profileError);
      }

      if (!profile) {
        console.log('Creating user profile...');
        const displayName =
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'ユーザー';

        const { error: createProfileError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id, // auth.users.id をそのまま使う
            display_name: displayName,
            avatar_url: null,
            bio: null,
          });

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          setError(`プロフィール作成エラー: ${createProfileError.message}`);
          return;
        }
      }
      // ------------------ プロフィール処理ここまで ------------------

      // 画像をアップロード
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, image);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          // 画像アップロードエラーは警告のみ、投稿は続行
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('post-images').getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // 投稿を作成
      const { error: insertError } = await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim(),
        images: imageUrls.length > 0 ? imageUrls : null,
      });

      if (insertError) {
        console.error('Error creating post:', insertError);
        setError(`投稿エラー: ${insertError.message}`);
        return;
      }

      alert('投稿しました！');

      // 投稿一覧ページへ遷移
      router.push('/dashboard/pr/posts');
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(`エラー: ${err.message}`);
    } finally {
      setPosting(false);
    }
  };

  if (!mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: textColor }}
        ></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-all duration-200"
            style={{ color: textColor }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold">新規投稿</h1>
          <button
            onClick={handlePost}
            disabled={posting || !content.trim()}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: isDark ? '#ffffff' : '#000000',
              color: isDark ? '#000000' : '#ffffff',
            }}
          >
            {posting ? '投稿中...' : '投稿'}
          </button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* 投稿フォーム */}
        <div className="space-y-4">
          {/* テキスト入力 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今何してる？"
            rows={8}
            className="w-full px-4 py-3 rounded-lg border outline-none resize-none transition-all duration-200"
            style={{
              backgroundColor: bgColor,
              borderColor,
              color: textColor,
            }}
            maxLength={2000}
          />
          <p
            className="text-xs text-right"
            style={{ color: mutedColor }}
          >
            {content.length} / 2000文字
          </p>

          {/* 画像プレビュー */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: isDark ? '#262626' : '#efefef',
                  }}
                >
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 rounded-full transition-all duration-200"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="#ffffff"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 画像追加ボタン */}
          {images.length < 10 && (
            <label
              className="flex items-center justify-center gap-2 py-3 rounded-lg border cursor-pointer transition-all duration-200"
              style={{ borderColor }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke={textColor}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">画像を追加</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}

          <p className="text-xs" style={{ color: mutedColor }}>
            画像は最大10枚まで添付できます
          </p>
        </div>
      </div>
    </div>
  );
}
