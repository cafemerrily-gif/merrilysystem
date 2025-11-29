'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

export default function PostCreatePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';

  // ログインチェック
  useEffect(() => {
    setMounted(true);
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentUserId(user.id);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    const allFiles = [...files, ...newFiles];
    setFiles(allFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      alert('ログイン情報を取得できませんでした');
      return;
    }
    if (!title.trim() && !content.trim() && files.length === 0) {
      alert('タイトル・本文・画像のいずれかは入力してください');
      return;
    }

    setSubmitting(true);

    try {
      // 1. 画像を Storage にアップロード
      const imageUrls: string[] = [];

      for (const file of files) {
        const ext = file.name.split('.').pop();
        const fileName = `${currentUserId}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('image upload error:', uploadError);
          alert('画像のアップロードに失敗しました');
          setSubmitting(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('post-images').getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      // 2. posts テーブルに INSERT（ここで user_id を保存）
      const { error: insertError } = await supabase.from('posts').insert({
        user_id: currentUserId, // ★ ユーザーごとに保存する肝
        title: title.trim() || null,
        content: content.trim(),
        images: imageUrls.length > 0 ? imageUrls : null,
      });

      if (insertError) {
        console.error('insert post error:', insertError);
        alert('投稿の保存に失敗しました');
        setSubmitting(false);
        return;
      }

      alert('投稿しました');
      router.push('/dashboard/pr/posts'); // 投稿管理画面へ戻るなど
    } finally {
      setSubmitting(false);
    }
  };

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
              <Link href="/dashboard/pr/posts" className="p-2">
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
              <h1 className="text-lg font-semibold">新規投稿</h1>
            </div>
          </div>
        </div>
      </header>

      {/* フォーム本体 */}
      <main className="pt-20 max-w-2xl mx-auto px-4 py-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium mb-1">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                borderColor,
              }}
              placeholder="タイトルを入力"
            />
          </div>

          {/* 画像 */}
          <div>
            <label className="block text-sm font-medium mb-1">画像</label>
            <label
              className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer"
              style={{ borderColor }}
            >
              <svg
                className="w-8 h-8 mb-2"
                fill="none"
                stroke={mutedColor}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 9.75L12 5.25m0 0L7.5 9.75M12 5.25V15"
                />
              </svg>
              <span className="text-sm" style={{ color: mutedColor }}>
                画像を選択（複数可）
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {previewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-full aspect-square">
                    <Image
                      src={url}
                      alt={`preview-${i}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 本文 */}
          <div>
            <label className="block text-sm font-medium mb-1">本文</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border min-h-[120px]"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                borderColor,
              }}
              placeholder="本文を入力"
            />
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            style={{
              backgroundColor: isDark ? '#ffffff' : '#000000',
              color: isDark ? '#000000' : '#ffffff',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            {submitting ? '投稿中...' : '投稿する'}
          </button>
        </form>
      </main>
    </div>
  );
}
