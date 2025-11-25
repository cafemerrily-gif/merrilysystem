import { supabaseAdmin } from '@/lib/supabase';

export async function logActivity(message: string, userName?: string | null, userId?: string | null) {
  try {
    await supabaseAdmin.from('activity_logs').insert({
      user_name: userName ?? null,
      user_id: userId ?? null,
      message,
    });
  } catch (err) {
    console.error('log insert failed', err);
  }
}
