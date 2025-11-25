import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// pr_site 1行に payload を保存する API
// create table pr_site (id int primary key, payload jsonb, updated_by text, updated_at timestamptz default now());
const ROW_ID = 1;

async function savePayload(payload: any, updated_by?: string | null) {
  const { data, error } = await supabaseAdmin
    .from('pr_site')
    .upsert({
      id: ROW_ID,
      payload,
      updated_by: updated_by || null,
      updated_at: new Date().toISOString(),
    })
    .select('payload')
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data?.payload || payload;
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('pr_site')
    .select('payload')
    .eq('id', ROW_ID)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data?.payload || null);
}

// PUT / POST どちらでも保存できるようにする（405対策）
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { payload, updated_by } = body;
    if (!payload) return NextResponse.json({ error: 'payload is required' }, { status: 400 });

    const saved = await savePayload(payload, updated_by);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return PUT(req);
}
