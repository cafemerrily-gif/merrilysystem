'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

type Post = {
  id: string;
  user_id: string;
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

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    setCurrentUserId(user.id);

    // user_profiles.id = auth.uid() で紐付けている想定
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('User profile load error:', error);
    }

    setUserProfile(profile as UserProfileRole | null);
    setLoading(false);
  };

  const loadPosts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ① 投稿本体を取得（JOIN しない）
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, user_id, content, images, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) {
        console.error('Error loading posts:', postsError);
        setPosts([]);
        return;
      }

      const rawPosts = (postsData || []) as {
        id: string;
        user_id: string;
        content: string;
        images: string[] | null;
        created_at: string;
      }[];

      if (rawPosts.length === 0) {
        setPosts([]);
        return;
      }

      // ② いいね / コメント / プロフィール用の id 一覧
      const postIds = rawPosts.map((p) => p.id);
      const userIds = Array.from(
        new Set(rawPosts.map((p) => p.user_id).filter(Boolean)),
      );

      // ③ いいね
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      if (likesError) {
        console.error('Error loading likes:', likesError);
      }

      // ④ コメント数
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds);

      if (commentsError) {
        console.error('Error loading comments:', commentsError);
      }

      // ⑤ ユーザープロフィール（id = auth.uid() に紐付け）
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      const likesArr =
        (likesData as { post_id: string; user_id: string }[]) || [];
      const commentsArr = (commentsData as { post_id: string }[]) || [];
      const profilesArr =
        (profilesData as {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
        }[]) || [];

      // id → プロフィール のマップ
      const profileMap: Record<
        string,
        { display_name: string; avatar_url: string | null }
      > = {};
      profilesArr.forEach((p) => {
        profileMap[p.id] = {
          display_name: p.display_name || 'ユーザー',
          avatar_url: p.avatar_url,
        };
      });

      // ⑥ 最終的な Post[] に整形
      const formattedPosts: Post[] = rawPosts.map((post) => {
        const likes = likesArr.filter((l) => l.post_id === post.id);
        const comments = commentsArr.filter((c) => c.post_id === post.id);
        const profile = profileMap[post.user_id] || null;

        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          images: post.images,
          created_at: post.created_at,
          user_profile: profile,
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

    // 10秒ごとに投稿を再読み込み
    const interval = setInterval(() => {
      loadPosts();
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLike = async (postId: string) => {
    if (!currentUserId) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.is_liked) {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const appIconUrl = isDark ? '/white.png' : '/black.png';

  const isAdmin = userProfile?.role === 'admin';

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
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image
                  src={appIconUrl}
                  width={48}
                  height={48}
                  alt="MERRILY"
                  className="object-contain"
                />
              </div>
              <span
                className="text-xl font-bold"
                style={{ color: textColor }}
              >
                MERRILY
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {/* リフレッシュボタン */}
              <button
                onClick={() => loadPosts()}
                className="p-2"
                aria-label="更新"
              >
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
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>

              {/* ハンバーガーメニューボタン */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2"
                aria-label="メニュー"
              >
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
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ハンバーガーメニュー */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-16 right-4 w-64 rounded-lg shadow-lg border overflow-hidden"
            style={{ backgroundColor: bgColor, borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {isAdmin && (
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-4 py-3 border-b transition-opacity hover:opacity-70"
                style={{ borderColor }}
                onClick={() => setMenuOpen(false)}
              >
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
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              <span style={{ color: textColor }}>メンバー管理</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left transition-opacity hover:opacity-70"
            >
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
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              <span style={{ color: textColor }}>ログアウト</span>
            </button>
          </div>
        </div>
      )}

      {/* メインコンテンツ（投稿フィード） */}
      <main className="pt-16 max-w-2xl mx-auto px-0 md:px-4 py-0 md:py-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p style={{ color: mutedColor }} className="mb-4">
              まだ投稿がありません
            </p>
            <Link
              href="/dashboard/pr/posts/create"
              className="inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                backgroundColor: isDark ? '#ffffff' : '#000000',
                color: isDark ? '#000000' : '#ffffff',
              }}
            >
              最初の投稿を作成
            </Link>
          </div>
        ) : (
          <div className="space-y-0 md:space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border-b md:rounded-2xl md:border overflow-hidden"
                style={{ backgroundColor: bgColor, borderColor }}
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
                    {post.user_profile?.avatar_url ? (
                      <Image
                        src={post.user_profile.avatar_url}
                        alt={post.user_profile.display_name}
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
                      {post.user_profile?.display_name || 'ユーザー'}
                    </p>
                    <p className="text-xs" style={{ color: mutedColor }}>
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>

                {/* 投稿内容 */}
                {post.content && (
                  <div className="px-4 py-3">
                    <p className="text-sm whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* 画像（スライド対応） */}
                {post.images && post.images.length > 0 && (
                  <ImageSlider images={post.images} isDark={isDark} />
                )}

                {/* アクション */}
                <div
                  className="px-4 py-3 flex items-center gap-4 border-t"
                  style={{ borderColor }}
                >
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 transition-all duration-200"
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
                    <span className="text-sm font-medium">
                      {post.likes_count}
                    </span>
                  </button>

                  <button className="flex items-center gap-2">
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
                    <span className="text-sm font-medium">
                      {post.comments_count}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 下部固定ナビゲーションバー */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t z-40"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-5 h-16">
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

            {/* 開発部 */}
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

            {/* 広報部 */}
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

            {/* スタッフ管理 */}
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

            {/* アカウント */}
            <Link
              href="/account"
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
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>
                設定
              </span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

// 画像スライダーコンポーネント
function ImageSlider({
  images,
  isDark,
}: {
  images: string[];
  isDark: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 1) {
    return (
      <div
        className="relative w-full bg-black"
        style={{
          backgroundColor: isDark ? '#262626' : '#efefef',
          minHeight: '300px',
          maxHeight: '600px',
        }}
      >
        <Image
          src={images[0]}
          alt="投稿画像"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="relative w-full overflow-hidden"
        style={{
          backgroundColor: isDark ? '#262626' : '#efefef',
          aspectRatio: '1',
        }}
      >
        <div
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((imageUrl, idx) => (
            <div key={idx} className="min-w-full h-full relative">
              <Image
                src={imageUrl}
                alt={`投稿画像 ${idx + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          ))}
        </div>

        {/* 前へボタン */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="#ffffff"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* 次へボタン */}
        {currentIndex < images.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="#ffffff"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* インジケーター */}
      <div className="flex justify-center gap-1 py-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{
              backgroundColor:
                idx === currentIndex
                  ? isDark
                    ? '#ffffff'
                    : '#000000'
                  : isDark
                  ? '#555555'
                  : '#cccccc',
            }}
          />
        ))}
      </div>
    </div>
  );
}
