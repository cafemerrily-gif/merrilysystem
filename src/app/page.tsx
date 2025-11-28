'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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

export default function Home() {
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';

  useEffect(() => {
    loadPosts();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // 投稿を取得
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles!inner(display_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) {
        console.error('Error loading posts:', postsError);
        return;
      }

      // いいね数を取得
      const postIds = postsData?.map(p => p.id) || [];
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      // コメント数を取得
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds);

      // データを整形
      const formattedPosts: Post[] = (postsData || []).map(post => {
        const likes = likesData?.filter(l => l.post_id === post.id) || [];
        const comments = commentsData?.filter(c => c.post_id === post.id) || [];
        
        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          images: post.images,
          created_at: post.created_at,
          user_profile: post.user_profiles,
          likes_count: likes.length,
          comments_count: comments.length,
          is_liked: user ? likes.some(l => l.user_id === user.id) : false,
        };
      });

      setPosts(formattedPosts);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUserId) {
      alert('ログインが必要です');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.is_liked) {
      // いいねを削除
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUserId);

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
          : p
      ));
    } else {
      // いいねを追加
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: currentUserId });

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
          : p
      ));
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor, color: textColor }}>
        <p style={{ color: mutedColor }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      <main className="w-full mx-auto px-0 md:px-4 py-0 md:py-6 max-w-2xl">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: mutedColor }}>まだ投稿がありません</p>
            <Link
              href="/post/create"
              className="inline-block mt-4 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
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
              <div key={post.id} className="border-b md:rounded-2xl md:border overflow-hidden" style={{ backgroundColor: bgColor, borderColor }}>
                {/* 投稿ヘッダー */}
                <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor }}>
                  <div className="relative w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#262626' : '#efefef' }}>
                    {post.user_profile?.avatar_url ? (
                      <Image src={post.user_profile.avatar_url} alt={post.user_profile.display_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke={mutedColor} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{post.user_profile?.display_name || 'ユーザー'}</p>
                    <p className="text-xs" style={{ color: mutedColor }}>{formatDate(post.created_at)}</p>
                  </div>
                </div>

                {/* 投稿内容 */}
                <div className="p-4">
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* 画像 */}
                {post.images && post.images.length > 0 && (
                  <div className={post.images.length === 1 ? '' : 'grid grid-cols-2 gap-1'}>
                    {post.images.map((imageUrl, idx) => (
                      <div key={idx} className="relative w-full bg-black" style={{ 
                        backgroundColor: isDark ? '#262626' : '#efefef',
                        aspectRatio: post.images!.length === 1 ? 'auto' : '1',
                        minHeight: post.images!.length === 1 ? '300px' : 'auto',
                        maxHeight: post.images!.length === 1 ? '600px' : 'auto'
                      }}>
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
                )}

                {/* アクション */}
                <div className="px-4 py-3 flex items-center gap-4 border-t" style={{ borderColor }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 transition-all duration-200"
                  >
                    <svg 
                      className="w-6 h-6" 
                      fill={post.is_liked ? '#ff3b30' : 'none'} 
                      stroke={post.is_liked ? '#ff3b30' : textColor} 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">{post.likes_count}</span>
                  </button>

                  <button className="flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">{post.comments_count}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
