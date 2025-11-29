import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: 売上目標取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  try {
    let query = supabaseAdmin
      .from('sales_targets')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (year) {
      query = query.eq('year', Number(year));
    }
    if (month) {
      query = query.eq('month', Number(month));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: '売上目標の取得に失敗しました' }, { status: 500 });
  }
}

// POST: 売上目標登録・更新（UPSERT）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, target_amount, target_customers, notes } = body;

    if (!year || !month) {
      return NextResponse.json({ error: '年と月は必須です' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('sales_targets')
      .upsert(
        {
          year: Number(year),
          month: Number(month),
          target_amount: Number(target_amount) || 0,
          target_customers: Number(target_customers) || 0,
          notes,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'year,month' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '売上目標の登録に失敗しました' }, { status: 500 });
  }
}

// DELETE: 売上目標削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'idは必須です' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('sales_targets')
      .delete()
      .eq('id', Number(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '削除しました' });
  } catch (error) {
    return NextResponse.json({ error: '売上目標の削除に失敗しました' }, { status: 500 });
  }
}
