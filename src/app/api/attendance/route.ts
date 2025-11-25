import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logActivity } from '@/lib/logger';

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

// POST: create a new attendance record (clock-in)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { staff_name, work_date, clock_in, clock_out, note } = body;

    if (!work_date || !clock_in) {
      return NextResponse.json({ error: 'work_date, clock_in are required' }, { status: 400 });
    }

    const resolvedName = staff_name || 'ログインユーザー';

    const { data, error } = await supabaseAdmin
      .from('attendance')
      .insert([
        {
          staff_name: resolvedName,
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

    await logActivity(`勤怠: 出勤を記録 (${work_date} ${clock_in})`, resolvedName);

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}

// PATCH: set clock_out to the latest open record for the staff
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { staff_name, clock_out } = body;

    if (!staff_name || !clock_out) {
      return NextResponse.json({ error: 'staff_name and clock_out are required' }, { status: 400 });
    }

    const { data: latest, error: fetchError } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('staff_name', staff_name)
      .is('clock_out', null)
      .order('work_date', { ascending: false })
      .order('clock_in', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    if (!latest) {
      return NextResponse.json({ error: '未退勤の記録が見つかりません' }, { status: 404 });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('attendance')
      .update({ clock_out })
      .eq('id', latest.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await logActivity(`勤怠: 退勤を記録 (${latest.work_date} ${clock_out})`, staff_name);

    return NextResponse.json(updated, { status: 200 });
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

  await logActivity(`勤怠: レコード削除 (id=${id})`, null);

  return NextResponse.json({ ok: true });
}
