import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: fetch latest attendance records
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('*')
    .order('work_date', { ascending: false })
    .order('clock_in', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

// POST: create a new attendance record
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { staff_name, work_date, clock_in, clock_out, note } = body;

    if (!staff_name || !work_date || !clock_in) {
      return NextResponse.json({ error: 'staff_name, work_date, clock_in are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('attendance')
      .insert([
        {
          staff_name,
          work_date,
          clock_in,
          clock_out: clock_out || null,
          note: note || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}

// DELETE: delete by id
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from('attendance').delete().eq('id', Number(id));
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
