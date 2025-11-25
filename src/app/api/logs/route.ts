import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: 全件閲覧許可。最新50件を返す
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST: ログ追加（誰でも呼べる前提だが、必要なら認可を追加）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, user_name, message } = body;
    if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .insert([{ user_id: user_id || null, user_name: user_name || null, message }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
