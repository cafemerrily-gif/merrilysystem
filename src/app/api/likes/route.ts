import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { post_id } = body;

    if (!post_id) {
      return NextResponse.json({ error: 'post_id required' }, { status: 400 });
    }

    // 既にいいねしているか確認
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // いいね解除
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post_id)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({ liked: false });
    } else {
      // いいね追加
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id,
          user_id: user.id,
        });

      if (error) throw error;

      // ✨ 投稿者に通知を送信 ✨
      try {
        // 投稿者を取得
        const { data: post } = await supabase
          .from('posts')
          .select('user_id, title, content')
          .eq('id', post_id)
          .single();

        // 自分の投稿にいいねした場合は通知しない
        if (post && post.user_id !== user.id) {
          // いいねしたユーザーの情報を取得
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();

          const displayName = userProfile?.display_name || 'ユーザー';
          const postPreview = post.title || post.content?.slice(0, 20) || '投稿';

          // 通知を作成
          await supabase
            .from('notifications')
            .insert({
              user_id: post.user_id,
              type: 'new_like',
              title: 'いいね',
              message: `${displayName}があなたの投稿「${postPreview}」にいいねしました`,
              link: '/',
            });
        }
      } catch (notifyError) {
        console.error('通知送信エラー:', notifyError);
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    console.error('いいねエラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('post_id');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!postId) {
      return NextResponse.json({ error: 'post_id required' }, { status: 400 });
    }

    // いいねしたユーザー一覧を取得
    const { data: likes, error } = await supabase
      .from('post_likes')
      .select(`
        user_id,
        created_at,
        user_profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(likes || []);
  } catch (error: any) {
    console.error('いいね取得エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
