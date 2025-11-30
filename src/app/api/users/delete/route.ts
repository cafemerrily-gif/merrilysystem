import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    // 現在のユーザーが管理者か確認
    const { data: currentUser } = await supabase
      .from('staff_info')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!currentUser?.is_admin) {
      return NextResponse.json(
        { error: '管理者のみがメンバーを削除できます' },
        { status: 403 }
      );
    }

    // 自分自身は削除できない
    if (user.id === user_id) {
      return NextResponse.json(
        { error: '自分自身は削除できません' },
        { status: 400 }
      );
    }

    // Service Role Clientを作成（auth.usersを削除するため）
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // auth.users から削除（これによりカスケード削除でuser_profilesも削除される）
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      user_id
    );

    if (authError) {
      console.error('auth.users削除エラー:', authError);
      
      // Service Role Keyが設定されていない場合のフォールバック
      if (authError.message.includes('service_role')) {
        // 手動で各テーブルから削除
        await supabase.from('staff_info').delete().eq('user_id', user_id);
        await supabase.from('user_profiles').delete().eq('id', user_id);
        await supabase.from('notifications').delete().eq('user_id', user_id);
        await supabase.from('posts').update({ deleted_at: new Date().toISOString() }).eq('user_id', user_id).is('deleted_at', null);
        
        return NextResponse.json({ 
          success: true,
          message: 'メンバー情報を削除しました。認証ユーザーはSupabase管理画面で手動削除してください。',
          warning: 'Service Role Keyが設定されていないため、auth.usersは削除されませんでした。'
        });
      }
      
      throw authError;
    }

    // staff_info から削除（念のため、カスケード削除されない場合）
    await supabase.from('staff_info').delete().eq('user_id', user_id);

    // notifications から削除
    await supabase.from('notifications').delete().eq('user_id', user_id);

    // posts を論理削除
    await supabase.from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', user_id)
      .is('deleted_at', null);

    return NextResponse.json({ 
      success: true,
      message: 'メンバーを完全に削除しました'
    });
  } catch (error: any) {
    console.error('メンバー削除エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
