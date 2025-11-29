'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

/* ===============================
   型
================================ */
type Post = {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  images: string[] | null;
  created_at: string;
  user_profile: {
    display_name: string;
    avatar_url: string | null;
  } | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
};

type UserProfileRole = {
  role: string | null;
};

/* ===============================
   ホーム画面
================================ */
export default function Home() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileRole | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ===============================
      ログインチェック
  ================================ */
  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    setCurrentUserId(user.id);

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    setUserProfile(profile as UserProfileRole | null);
    setLoading(false);
  };

  /* ===============================
      投稿読み込み
  ================================ */
  const loadPosts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ① 投稿本体
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, user_id, title, content, images, created_at')
        .order('created_at', { ascending: false });

      const rawPosts = postsData || [];

      if (rawPosts.length === 0) {
        setPosts([]);
        return;
      }

      const postIds = rawPosts.map((p) => p.id);
      const userIds = [...new Set(rawPosts.map((p) => p.user_id))];

      // ② いいね
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      // ③ コメント
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds);

      // ④ プロフィール
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      // マップに変換
      const profileMap: Record<
        string,
        { display_name: string; avatar_url: string | null }
      > = {};

      (profilesData || []).forEach((p) => {
        profileMap[p.id] = {
          display_name: p.display_name || 'ユーザー',
          avatar_url: p.avatar_url,
        };
      });

      const formattedPosts: Post[] = rawPosts.map((post) => {
        const likes = (likesData || []).filter((l) => l.post_id === post.id);
        const comments = (commentsData || []).filter(
          (c) => c.post_id === post.id,
        );

        return {
          id: post.id,
          user_id: post.user_id,
          title: post.title,
          content: post.content,
          images: post.images,
          created_at: post.created_at,
          user_profile: profileMap[post.user_id] || null,
          likes_count: likes.length,
          comments_count: comments.length,
          is_liked: user ? likes.some((l) => l.user_id === user.id) : false,
        };
      });

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error in loadPosts:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkUser();
    loadPosts();
  }, []);

  /* ===============================
      いいね処理
  ================================ */
  const handleLike = async (postId: string) => {
    if (!currentUserId) return;

    const target = posts.find((p) => p.id === postId);
    if (!target) return;

    if (target.is_liked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUserId);

      setPosts(
        posts.map((p) =>
          p.id === postId
            ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
            : p,
        ),
      );
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: currentUserId });

      setPosts(
        posts.map((p) =>
          p.id === postId
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p,
        ),
      );
    }
  };

  /* ===============================
      UI 用変数
  ================================ */
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? '#262626' : '#ddd';
  const mutedColor = isDark ? '#aaa' : '#666';
  const appIconUrl = isDark ? '/white.png' : '/black.png';

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

  /* ===============================
      メイン JSX
  ================================ */
  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: bgColor, color: textColor }}>
      
      {/* -------------------------
          ヘッダー
      ------------------------- */}
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image src={appIconUrl} width={40} height={40} alt="Logo" />
            <span className="text-xl font-bold">MERRILY</span>
          </Link>

          <button onClick={() => loadPosts()} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5M4 20v-5h5M20 4v5h-5"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* -------------------------
          投稿一覧
      ------------------------- */}
      <main className="pt-20 max-w-2xl mx-auto">

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: mutedColor }}>まだ投稿がありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-xl overflow-hidden" style={{ borderColor }}>
                
                {/* 投稿ヘッダー */}
                <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor }}>
                  <div className="w-10 h-10 relative rounded-full overflow-hidden">
                    {post.user_profile?.avatar_url ? (
                      <Image
                        src={post.user_profile.avatar_url}
                        alt="avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{post.user_profile?.display_name || 'ユーザー'}</p>
                    <p className="text-xs" style={{ color: mutedColor }}>
                      {new Date(post.created_at).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>

                {/* ★★★ タイトル（画像の上）★★★ */}
                {post.title && (
                  <div className="px-4 pt-4">
                    <h2 className="text-lg font-bold">{post.title}</h2>
                  </div>
                )}

                {/* 画像 */}
                {post.images && post.images.length > 0 && (
                  <ImageSlider images={post.images} isDark={isDark} />
                )}

                {/* ★★★ 本文（画像の下）★★★ */}
                {post.content && (
                  <div className="px-4 py-3">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                )}

                {/* アクション */}
                <div className="px-4 py-3 flex items-center gap-4 border-t" style={{ borderColor }}>
                  {/* いいね */}
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1">
                    <svg
                      className="w-6 h-6"
                      fill={post.is_liked ? '#ff3b30' : 'none'}
                      stroke={post.is_liked ? '#ff3b30' : textColor}
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{post.likes_count}</span>
                  </button>

                  {/* コメント */}
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke={textColor}
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{post.comments_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ===============================
    画像スライダー（スワイプ対応）
================================ */
function ImageSlider({ images, isDark }: { images: string[]; isDark: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const threshold = 50;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const diff = touchStart - touchEnd;

    if (diff > threshold) {
      setCurrentIndex((i) => (i + 1) % images.length);
    } else if (diff < -threshold) {
      setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: isDark ? '#262626' : '#eee',
        aspectRatio: '1',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-300 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="min-w-full h-full relative">
            <Image src={src} alt="投稿画像" fill className="object-contain" />
          </div>
        ))}
      </div>

      {/* インジケーター */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {images.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                i === currentIndex
                  ? isDark
                    ? '#fff'
                    : '#000'
                  : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
