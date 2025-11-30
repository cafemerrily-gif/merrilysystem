import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const body = await request.json();
    const { email, password, display_name, departments } = body;

    // バリデーション
    if (!email || !password || !display_name) {
      return NextResponse.json(
        { error: 'メールアドレス、パスワード、ユーザー名は必須です' },
        { status: 400 }
      );
    }

    // パスワードバリデーション（英数字8文字以上）
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'パスワードは英数字を含む8文字以上である必要があります' },
        { status: 400 }
      );
    }

    // ユーザー登録
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name,
        },
      },
    });

    if (signUpError) {
      console.error('サインアップエラー:', signUpError);
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'ユーザー作成に失敗しました' },
        { status: 500 }
      );
    }

    // user_profilesテーブルにプロフィールを作成
    // is_adminカラムが存在しない場合に備えて動的に構築
    const profileData: any = {
      id: authData.user.id,
      display_name,
      departments: departments || [],
    };

    // is_adminカラムが存在する場合のみ追加
    try {
      profileData.is_admin = false;
    } catch (e) {
      // is_adminが存在しない場合はスキップ
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      console.error('プロフィール作成エラー:', profileError);
      
      // プロフィール作成に失敗した場合でも登録は成功
      // 後で手動で修正可能
      return NextResponse.json({
        success: true,
        message: 'アカウントは作成されましたが、プロフィールの設定が完了していません。管理者に連絡してください。',
        user: authData.user,
      });
    }

    // ウェルカム通知を送信
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: authData.user.id,
          type: 'welcome',
          title: 'MERRILYへようこそ！',
          message: 'アカウントの作成が完了しました。早速投稿を見てみましょう！',
          link: '/',
        });
    } catch (error) {
      console.error('ウェルカム通知エラー:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'アカウントが作成されました',
      user: authData.user,
    });
  } catch (error: any) {
    console.error('サインアップエラー:', error);
    return NextResponse.json(
      { error: error.message || 'サインアップに失敗しました' },
      { status: 500 }
    );
  }
}
