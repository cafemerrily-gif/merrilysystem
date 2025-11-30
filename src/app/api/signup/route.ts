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

    // 部署名を変換（日本語 → 英語キー）
    const departmentMap: { [key: string]: string } = {
      '会計部': 'accounting',
      '開発部': 'dev',
      'エンジニア部': 'engineer',
      '広報部': 'pr',
      'マネジメント部': 'management',
      '職員': 'employee',
      'スタッフ': 'staff',
    };

    const mappedDepartments = (departments || []).map(
      (dept: string) => departmentMap[dept] || dept
    );

    // ユーザー登録（確認メール送信あり）
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          display_name,
          departments: departments || [],
          departments_mapped: mappedDepartments,
          email,
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

    // メール確認が必要な場合は、ここでプロフィール作成はしない
    // 確認後にトリガーで自動作成する
    
    return NextResponse.json({
      success: true,
      message: '確認メールを送信しました。メールのリンクをクリックしてアカウントを有効化してください。',
      email: email,
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
