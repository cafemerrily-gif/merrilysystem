import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '@/lib/supabase';

async function ensureAdmin() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { ok: false, status: 401, message: 'Unauthorized' };
  const meta = data.user.user_metadata || {};
  const isAdmin = meta.is_admin === true || meta.role === 'admin';
  if (!isAdmin) return { ok: false, status: 403, message: 'Forbidden' };
  return { ok: true };
}

export async function GET() {
  const guard = await ensureAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email,
    full_name: u.user_metadata?.full_name || '',
    departments: Array.isArray(u.user_metadata?.departments) ? u.user_metadata.departments : [],
    is_admin: u.user_metadata?.is_admin === true || u.user_metadata?.role === 'admin',
  }));

  return NextResponse.json(users);
}

export async function PUT(req: Request) {
  const guard = await ensureAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const body = await req.json();
    const { userId, full_name, departments, is_admin } = body;
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: full_name || '',
        departments: Array.isArray(departments) ? departments : [],
        is_admin: !!is_admin,
      },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      id: data.user?.id,
      email: data.user?.email,
      full_name: data.user?.user_metadata?.full_name || '',
      departments: Array.isArray(data.user?.user_metadata?.departments) ? data.user?.user_metadata?.departments : [],
      is_admin: data.user?.user_metadata?.is_admin === true || data.user?.user_metadata?.role === 'admin',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
