import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('id');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 特定の投稿を取得
    if (postId) {
      const { data: post, error } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles:user_id (
            display_name,
            avatar_url
          ),
          likes:post_likes (
            user_id
          ),
          comments (
            id
          )
        `)
        .eq('id', postId)
        .is('deleted_at', null)
        .single();

      if (error) throw error;

      return NextResponse.json(post);
    }

    // 投稿一覧を取得
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        user_profiles:user_id (
          display_name,
          avatar_url
        ),
        likes:post_likes (
          user_id
        ),
        comments (
          id
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 投稿データを整形
    const formattedPosts = (posts || []).map((post: any) => ({
      ...post,
      user_profile: post.user_profiles,
      likes_count: post.likes?.length || 0,
      is_liked: post.likes?.some((like: any) => like.user_id === user.id) || false,
      comments_count: post.comments?.length || 0,
    }));

    return NextResponse.json(formattedPosts);
  } catch (error: any) {
    console.error('投稿取得エラー:', error);
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

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const images = formData.getAll('images') as File[];

    // 画像アップロード処理
    const imageUrls: string[] = [];
    
    for (const image of images) {
      if (image && image.size > 0) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('画像アップロードエラー:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }
    }

    // 投稿を作成
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: title || null,
        content: content || null,
        images: imageUrls.length > 0 ? imageUrls : null,
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

    // ✨ 通知送信 ✨
    try {
      const displayName = post.user_profiles?.display_name || 'ユーザー';
      
      // notify_all_users 関数を使用して全ユーザーに通知
      const { error: notifyError } = await supabase.rpc('notify_all_users', {
        notification_type: 'new_post',
        notification_title: '新しい投稿',
        notification_message: `${displayName}が投稿しました`,
        notification_link: '/',
        exclude_user_id: user.id,
      });

      if (notifyError) {
        console.error('通知送信エラー:', notifyError);
        // 通知エラーは投稿成功に影響させない
      }
    } catch (notifyError) {
      console.error('通知送信エラー:', notifyError);
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('投稿作成エラー:', error);
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
    const { id, title, content } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // 投稿の所有者確認
    const { data: existingPost } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingPost || existingPost.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 投稿を更新
    const { data: post, error } = await supabase
      .from('posts')
      .update({
        title: title || null,
        content: content || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('投稿更新エラー:', error);
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

    // 投稿の所有者確認
    const { data: existingPost } = await supabase
      .from('posts')
      .select('user_id, images')
      .eq('id', id)
      .single();

    if (!existingPost || existingPost.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 画像削除（ストレージから）
    if (existingPost.images && Array.isArray(existingPost.images)) {
      for (const imageUrl of existingPost.images) {
        try {
          // URL から ファイルパスを抽出
          const urlParts = imageUrl.split('/post-images/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage.from('post-images').remove([filePath]);
          }
        } catch (error) {
          console.error('画像削除エラー:', error);
        }
      }
    }

    // 投稿を削除（論理削除）
    const { error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('投稿削除エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
