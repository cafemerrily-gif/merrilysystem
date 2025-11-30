import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

    // コメント一覧を取得
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        user_profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(comments || []);
  } catch (error: any) {
    console.error('コメント取得エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { post_id, content } = body;

    if (!post_id || !content) {
      return NextResponse.json(
        { error: 'post_id and content required' },
        { status: 400 }
      );
    }

    // コメントを作成
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        user_id: user.id,
        content,
      })
      .select(`
        *,
        user_profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // ✨ 投稿者に通知を送信 ✨
    try {
      // 投稿者を取得
      const { data: post } = await supabase
        .from('posts')
        .select('user_id, title, content')
        .eq('id', post_id)
        .single();

      // 自分の投稿にコメントした場合は通知しない
      if (post && post.user_id !== user.id) {
        // コメントしたユーザーの情報を取得
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        const displayName = userProfile?.display_name || 'ユーザー';
        const postPreview = post.title || post.content?.slice(0, 20) || '投稿';
        const commentPreview = content.slice(0, 30);

        // 通知を作成
        await supabase
          .from('notifications')
          .insert({
            user_id: post.user_id,
            type: 'new_comment',
            title: 'コメント',
            message: `${displayName}があなたの投稿「${postPreview}」にコメントしました: ${commentPreview}`,
            link: '/',
          });
      }
    } catch (notifyError) {
      console.error('通知送信エラー:', notifyError);
    }

    return NextResponse.json(comment);
  } catch (error: any) {
    console.error('コメント作成エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, content } = body;

    if (!id || !content) {
      return NextResponse.json(
        { error: 'id and content required' },
        { status: 400 }
      );
    }

    // コメントの所有者確認
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingComment || existingComment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // コメントを更新
    const { data: comment, error } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(comment);
  } catch (error: any) {
    console.error('コメント更新エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // コメントの所有者確認
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingComment || existingComment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // コメントを削除（論理削除）
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('コメント削除エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
