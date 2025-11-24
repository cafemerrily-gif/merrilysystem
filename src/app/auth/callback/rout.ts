import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Session } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { event, session }: { event: string; session: Session | null } =
    await request.json();

  const supabase = createRouteHandlerClient({ cookies });

  if (event === "SIGNED_IN" && session) {
    await supabase.auth.setSession(session);
  }

  if (event === "SIGNED_OUT") {
    await supabase.auth.signOut();
  }

  return NextResponse.json({ success: true });
}