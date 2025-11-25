import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  // 認証バイパス（環境変数で有効化）
  const bypass =
    (process.env.AUTH_BYPASS || process.env.NEXT_PUBLIC_AUTH_BYPASS || '').toLowerCase() === 'true';
  if (bypass) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;
  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/auth') || pathname.startsWith('/reset-password');
  const isStaticFile = pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i);
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api') || // APIはサービスロールで保護されているため通す
    Boolean(isStaticFile);

  if (!session && !isAuthPage && !isPublicAsset) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
