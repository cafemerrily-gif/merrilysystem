import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 未読件数取得
    if (action === 'unread_count') {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      return NextResponse.json({ count: count || 0 });
    }

    // 通知一覧取得
    const limit = parseInt(searchParams.get('limit') || '20');
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json(notifications || []);
  } catch (error: any) {
    console.error('Notifications GET error:', error);
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
    const { action } = body;

    // 通知作成
    if (action === 'create') {
      const { user_id, type, title, message, link, data } = body;

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id,
          type,
          title,
          message,
          link,
          data,
        })
        .select()
        .single();

      if (error) throw error;

      // プッシュ通知送信
      await sendPushNotification(user_id, title, message, link);

      return NextResponse.json(notification);
    }

    // すべて既読
    if (action === 'mark_all_read') {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Notifications POST error:', error);
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
    const { id, is_read } = body;

    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read, 
        read_at: is_read ? new Date().toISOString() : null 
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notifications PUT error:', error);
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

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', parseInt(id))
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notifications DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// プッシュ通知送信関数
async function sendPushNotification(userId: string, title: string, message: string, link?: string) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // ユーザーのプッシュサブスクリプションを取得
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (!subscriptions || subscriptions.length === 0) return;

    // Web Push送信（環境変数が設定されている場合のみ）
    const webpush = require('web-push');
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.log('VAPID keys not configured, skipping push notification');
      return;
    }

    webpush.setVapidDetails(
      'mailto:admin@merrily.cafe',
      vapidPublicKey,
      vapidPrivateKey
    );

    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: { url: link || '/' },
    });

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
        } catch (error: any) {
          console.error('Push notification error:', error);
          // サブスクリプションが無効な場合は削除
          if (error.statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          }
        }
      })
    );
  } catch (error) {
    console.error('sendPushNotification error:', error);
  }
}
