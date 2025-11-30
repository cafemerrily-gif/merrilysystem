import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * 全ユーザーに通知を送信（投稿者本人は除く）
 */
export async function notifyAllUsers(params: {
  type: string;
  title: string;
  message: string;
  link?: string;
  excludeUserId?: string;
}) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // notify_all_users 関数を呼び出し
    const { data, error } = await supabase.rpc('notify_all_users', {
      notification_type: params.type,
      notification_title: params.title,
      notification_message: params.message,
      notification_link: params.link || '/',
      exclude_user_id: params.excludeUserId || null,
    });

    if (error) {
      console.error('通知送信エラー:', error);
      return { success: false, error };
    }

    console.log(`${data}件の通知を送信しました`);
    return { success: true, count: data };
  } catch (error) {
    console.error('通知送信エラー:', error);
    return { success: false, error };
  }
}

/**
 * 特定のユーザーに通知を送信
 */
export async function notifyUser(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: any;
}) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || '/',
        data: params.data || null,
      });

    if (error) {
      console.error('通知送信エラー:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('通知送信エラー:', error);
    return { success: false, error };
  }
}
