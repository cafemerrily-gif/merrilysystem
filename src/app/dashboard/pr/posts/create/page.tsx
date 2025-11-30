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
      <nav className="fixed bottom-0 left-0 right-0 border-t z-40" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 h-16">
            <Link href="/dashboard/accounting" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>会計部</span>
            </Link>
            <Link href="/dashboard/dev/menu" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>開発部</span>
            </Link>
            <Link href="/dashboard/pr/menu" className="flex flex-col items-center justify-center gap-1">
              <svg className="w-6 h-6" fill={textColor} stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
              <span className="text-xs font-semibold" style={{ color: textColor }}>広報部</span>
            </Link>
            <Link href="/dashboard/staff" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>スタッフ</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
