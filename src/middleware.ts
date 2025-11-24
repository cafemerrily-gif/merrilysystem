import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  // Redirect explicit /login access back to home so the login screen is not shown
  if (req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Keep session refresh for signed-in users but allow anonymous access
  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|auth).*)"],
};
