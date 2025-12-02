'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[] | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export default function PostsManagementPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [isDark, setIsDark] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // テーマ切替
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

    const handleChange = (e: MediaQueryListEvent) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfiles = async (userIds: string[]) => {
    if (userIds.length === 0) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select<'id, display_name, avatar_url', UserProfile>('id, display_name, avatar_url')
      .in('id', userIds);

    if (error) {
      console.error('Error loading profiles:', error);
      return;
    }

    const map: Record<string, UserProfile> = {};
    (data || []).forEach((p) => {
      map[p.id] = p;
    });

    setProfiles(map);
  };

  const loadPosts = async () => {
    try {
      setLoading(true);

      // ① ログインユーザー取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('auth getUser error:', userError);
      }

      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentUserId(user.id);

      // ② 自分の投稿だけ取得
      const { data, error } = await supabase
        .from('posts')
        .select<'*', Post>('*')
        .eq('user_id', user.id) // ここで自分の投稿に絞る
        .order('created_at', { ascending: false });

      console.log('LOAD POSTS data:', data, 'error:', error);

      if (error) {
        console.error('Error loading posts:', error);
        setPosts([]);
        return;
      }

      const postsData = data || [];
      setPosts(postsData);

      // 投稿に登場する user_id 達からプロフィールをまとめて取得
      const userIds = Array.from(new Set(postsData.map((p) => p.user_id).filter(Boolean)));
      await loadProfiles(userIds);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return;

    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      alert('蜑企勁縺ｫ螟ｱ謨励＠縺ｾ縺励◆');
      return;
    }

    alert('蜑企勁縺励∪縺励◆');
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
        {/* 繝倥ャ繝繝ｼ */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">謚慕ｨｿ邂｡逅・/h1>
            <p className="text-sm mt-1" style={{ color: mutedColor }}>
              謚慕ｨｿ縺ｮ菴懈・繝ｻ邱ｨ髮・・蜑企勁
            </p>
          </div>
          <Link
            href="/account"
            className="px-4 py-2 rounded-lg border font-semibold transition-all duration-200"
            style={{ borderColor, color: textColor }}
          >
            繧｢繧ｫ繧ｦ繝ｳ繝郁ｨｭ螳・          </Link>
        </div>

        {/* 譁ｰ隕乗兜遞ｿ繝懊ち繝ｳ */}
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
          <p className="font-semibold">譁ｰ隕乗兜遞ｿ繧剃ｽ懈・</p>
        </Link>

        {/* 謚慕ｨｿ荳隕ｧ */}
        {loading ? (
          <div className="text-center py-12" style={{ color: mutedColor }}>
            隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12" style={{ color: mutedColor }}>
            謚慕ｨｿ縺後≠繧翫∪縺帙ｓ
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const profile = profiles[post.user_id];

              return (
                <div
                  key={post.id}
                  className="border rounded-2xl overflow-hidden"
                  style={{ backgroundColor: cardBg, borderColor }}
                >
                  {/* 謚慕ｨｿ繝倥ャ繝繝ｼ */}
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
                        {profile?.display_name || '繝ｦ繝ｼ繧ｶ繝ｼ'}
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
                        蜑企勁
                      </button>
                    )}
                  </div>

                  {/* 謚慕ｨｿ蜀・ｮｹ */}
                  <div className="p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* 逕ｻ蜒・*/}
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
                            alt={`謚慕ｨｿ逕ｻ蜒・${idx + 1}`}
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
      <nav className="fixed bottom-0 left-0 right-0 border-t z-40" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 h-16">
            <Link href="/dashboard/accounting" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>莨夊ｨ磯Κ</span>
            </Link>
            <Link href="/dashboard/dev/menu" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>髢狗匱驛ｨ</span>
            </Link>
            <Link href="/dashboard/pr/menu" className="flex flex-col items-center justify-center gap-1">
              <svg className="w-6 h-6" fill={textColor} stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
              <span className="text-xs font-semibold" style={{ color: textColor }}>蠎・ｱ驛ｨ</span>
            </Link>
            <Link href="/dashboard/staff" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>繧ｹ繧ｿ繝・ヵ</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

