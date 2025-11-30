import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerComponentClient({ cookies });
    
    // トークンをセッションと交換
    await supabase.auth.exchangeCodeForSession(code);
  }

  // ログインページにリダイレクト（成功メッセージ付き）
  return NextResponse.redirect(new URL('/login?confirmed=true', request.url));
}
