import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: 予算一覧取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  try {
    let query = supabaseAdmin
      .from('budgets')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .order('category', { ascending: true });

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
    return NextResponse.json({ error: '予算の取得に失敗しました' }, { status: 500 });
  }
}

// POST: 予算登録・更新（UPSERT）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, category, planned_amount, notes, created_by } = body;

    if (!year || !month || !category) {
      return NextResponse.json({ error: '年、月、カテゴリは必須です' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('budgets')
      .upsert(
        {
          year: Number(year),
          month: Number(month),
          category,
          planned_amount: Number(planned_amount) || 0,
          notes,
          created_by,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'year,month,category' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '予算の登録に失敗しました' }, { status: 500 });
  }
}

// PUT: 予算一括更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { budgets } = body; // Array of budget items

    if (!Array.isArray(budgets) || budgets.length === 0) {
      return NextResponse.json({ error: '予算データが必要です' }, { status: 400 });
    }

    const upsertData = budgets.map((b: any) => ({
      year: Number(b.year),
      month: Number(b.month),
      category: b.category,
      planned_amount: Number(b.planned_amount) || 0,
      actual_amount: Number(b.actual_amount) || 0,
      notes: b.notes,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabaseAdmin
      .from('budgets')
      .upsert(upsertData, { onConflict: 'year,month,category' })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '予算の更新に失敗しました' }, { status: 500 });
  }
}

// DELETE: 予算削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'idは必須です' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('budgets')
      .delete()
      .eq('id', Number(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '削除しました' });
  } catch (error) {
    return NextResponse.json({ error: '予算の削除に失敗しました' }, { status: 500 });
  }
}
