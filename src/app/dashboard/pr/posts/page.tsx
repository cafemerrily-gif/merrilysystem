'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';

interface UserProfile {
  display_name: string;
  avatar_url: string | null;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[] | null;
  created_at: string;
  user_profiles?: UserProfile | null;
}

export default function PostsManagementPage() {
  const supabase = createClientComponentClient();
  const [isDark, setIsDark] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // テーマ
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const stored = window.localStorage.getItem('ui-is-dark');

    const currentIsDark = isMobile
      ? media.matches
      : stored === 'true'
      ? true
      : stored === 'false'
      ? false
      : media.matches;

    setIsDark(currentIsDark);

    const handleChange = (e: any) => {
      const isMob = window.matchMedia('(max-width: 768px)').matches;
      const str = window.localStorage.getItem('ui-is-dark');
      if (isMob || str === null) {
        setIsDark(e.matches);
      }
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = isDark ? '#000000' : '#ffffff';
    document.body.style.color = isDark ? '#ffffff' : '#000000';
  }, [isDark]);

  useEffect(() => {
    loadPosts();
    getCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadPosts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          user_id,
          content,
          images,
          created_at,
          user_profiles:user_profiles!posts_user_id_fkey (
            display_name,
            avatar_url
          )
        `,
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading posts:', error);
        setPosts([]);
        return;
      }

      setPosts((data || []) as Post[]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return;

    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      alert('削除に失敗しました');
      return;
    }

    alert('削除しました');
    loadPosts();
  };

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const cardBg = isDark ? '#000000' : '#ffffff';

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">投稿管理</h1>
            <p className="text-sm mt-1" style={{ color: mutedColor }}>
              投稿の作成・編集・削除
            </p>
          </div>
          <Link
            href="/account"
            className="px-4 py-2 rounded-lg border font-semibold transition-all duration-200"
            style={{ borderColor, color: textColor }}
          >
            アカウント設定
          </Link>
        </div>

        {/* 新規投稿ボタン */}
        <Link
          href="/dashboard/pr/posts/create"
          className="block border rounded-2xl p-6 text-center transition-all duration-200 hover:scale-[1.02]"
          style={{ backgroundColor: cardBg, borderColor, borderStyle: 'dashed' }}
        >
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke={textColor}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="font-semibold">新規投稿を作成</p>
        </Link>

        {/* 投稿一覧 */}
        {loading ? (
          <div className="text-center py-12" style={{ color: mutedColor }}>
            読み込み中...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12" style={{ color: mutedColor }}>
            投稿がありません
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const profile = post.user_profiles ?? null;

              return (
                <div
                  key={post.id}
                  className="border rounded-2xl overflow-hidden"
                  style={{ backgroundColor: cardBg, borderColor }}
                >
                  {/* 投稿ヘッダー */}
                  <div
                    className="flex items-center gap-3 p-4 border-b"
                    style={{ borderColor }}
                  >
                    <div
                      className="relative w-10 h-10 rounded-full overflow-hidden"
                      style={{
                        backgroundColor: isDark ? '#262626' : '#efefef',
                      }}
                    >
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.display_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6"
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
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {profile?.display_name || 'ユーザー'}
                      </p>
                      <p className="text-xs" style={{ color: mutedColor }}>
                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    {post.user_id === currentUserId && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{ backgroundColor: '#ff3b30', color: '#ffffff' }}
                      >
                        削除
                      </button>
                    )}
                  </div>

                  {/* 投稿内容 */}
                  <div className="p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* 画像 */}
                  {post.images && post.images.length > 0 && (
                    <div
                      className={
                        post.images.length === 1
                          ? 'px-4 pb-4'
                          : 'grid grid-cols-2 gap-1 px-4 pb-4'
                      }
                    >
                      {post.images.map((imageUrl, idx) => (
                        <div
                          key={idx}
                          className="relative w-full aspect-square rounded-lg overflow-hidden"
                          style={{
                            backgroundColor: isDark ? '#262626' : '#efefef',
                          }}
                        >
                          <Image
                            src={imageUrl}
                            alt={`投稿画像 ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
