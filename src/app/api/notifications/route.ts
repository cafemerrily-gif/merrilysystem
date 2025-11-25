import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: 全件閲覧（最新50件）
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST: 通知追加（全員閲覧想定）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, detail } = body;
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert([{ title, detail: detail || null }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
