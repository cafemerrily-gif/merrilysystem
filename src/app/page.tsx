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
    <div
      className="min-h-screen pb-16"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
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

          {/* 右側：設定アイコン */}
          <Link href="/account" className="p-2">
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
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
        </div>
      </header>

      {/* -------------------------
          ヘッダー直下のタブナビ
          （投稿 / 進捗 / メニュー / グラフ）
      ------------------------- */}
      <nav
        className="fixed top-16 left-0 right-0 z-30 border-b"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            {/* 投稿（現在の画面） */}
            <Link
              href="/"
              className="flex-1 py-2 text-center text-sm font-semibold border-b-2"
              style={{
                borderColor: textColor,
                color: textColor,
              }}
            >
              投稿
            </Link>

            {/* 進捗 */}
            <button
              className="flex-1 py-2 text-center text-sm"
              style={{
                color: mutedColor,
                borderColor: 'transparent',
              }}
            >
              進捗
            </button>

            {/* メニュー */}
            <Link
              href="/menu"
              className="flex-1 py-2 text-center text-sm transition-opacity hover:opacity-70"
              style={{
                color: mutedColor,
                borderColor: 'transparent',
              }}
            >
              メニュー
            </Link>

            {/* グラフ */}
            <Link
              href="/graphs"
              className="flex-1 py-2 text-center text-sm transition-opacity hover:opacity-70"
              style={{
                color: mutedColor,
                borderColor: 'transparent',
              }}
            >
              グラフ
            </Link>
          </div>
        </div>
      </nav>

      {/* -------------------------
          投稿一覧
      ------------------------- */}
      <main className="pt-28 max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: mutedColor }}>まだ投稿がありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border rounded-xl overflow-hidden"
                style={{ borderColor }}
              >
                {/* 投稿ヘッダー */}
                <div
                  className="flex items-center gap-3 p-4 border-b"
                  style={{ borderColor }}
                >
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
                    <p className="font-semibold">
                      {post.user_profile?.display_name || 'ユーザー'}
                    </p>
                    <p className="text-xs" style={{ color: mutedColor }}>
                      {new Date(post.created_at).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>

                {/* タイトル（画像の上） */}
                {post.title && (
                  <div className="px-4 pt-4">
                    <h2 className="text-lg font-bold">{post.title}</h2>
                  </div>
                )}

                {/* 画像（スワイプ） */}
                {post.images && post.images.length > 0 && (
                  <ImageSlider images={post.images} isDark={isDark} />
                )}

                {/* 本文（画像の下） */}
                {post.content && (
                  <div className="px-4 py-3">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                )}

                {/* アクション */}
                <div
                  className="px-4 py-3 flex items-center gap-4 border-t"
                  style={{ borderColor }}
                >
                  {/* いいね */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1"
                  >
                    <svg
                      className="w-6 h-6"
                      fill={post.is_liked ? '#ff3b30' : 'none'}
                      stroke={post.is_liked ? '#ff3b30' : textColor}
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{post.likes_count}</span>
                  </button>

                  {/* コメント数表示 */}
                  <div className="flex items-center gap-1">
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

      {/* -------------------------
          下部固定ナビゲーション＋真ん中の＋ボタン
      ------------------------- */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t z-40"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div className="relative max-w-7xl mx-auto">
          {/* ナビ本体（設定は削除して4つに） */}
          <div className="grid grid-cols-4 h-16">
            {/* 会計部 */}
            <Link
              href="/dashboard/accounting/menu"
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

            {/* 開発部（高さはそのまま） */}
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

            {/* 広報部（高さはそのまま） */}
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

            {/* スタッフ */}
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
          </div>

          {/* 真ん中の＋ボタン（角丸四角＆中の＋をもっと大きく / 位置も少し上へ） */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="absolute -top-9 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center shadow-lg border transition-transform active:scale-95 rounded-2xl"
            style={{
              backgroundColor: textColor,
              color: bgColor,
              borderColor,
            }}
          >
            <span className="text-5xl leading-none">+</span>
          </button>

          {/* ＋メニュー */}
          {menuOpen && (
            <div
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-60 rounded-2xl shadow-lg border p-3 space-y-2"
              style={{ backgroundColor: bgColor, borderColor }}
            >
              {/* 新規投稿 */}
              <button
                className="w-full px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-between hover:opacity-80"
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/dashboard/pr/posts/create');
                }}
              >
                <span>新規投稿</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke={textColor}
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  {/* プラス入り四角 */}
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="4"
                    ry="4"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v8M8 12h8"
                  />
                </svg>
              </button>

              {/* 売上入力（会計部） */}
              <button
                className="w-full px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-between hover:opacity-80"
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/dashboard/accounting/menu');
                }}
              >
                <span>売上入力（会計部）</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke={textColor}
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  {/* 棒グラフ */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 19h16"
                  />
                  <rect x="6" y="10" width="2.5" height="6" rx="0.5" />
                  <rect x="10.75" y="7" width="2.5" height="9" rx="0.5" />
                  <rect x="15.5" y="12" width="2.5" height="4" rx="0.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

/* ===============================
    画像スライダー（スワイプ対応）
================================ */
function ImageSlider({
  images,
  isDark,
}: {
  images: string[];
  isDark: boolean;
}) {
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
