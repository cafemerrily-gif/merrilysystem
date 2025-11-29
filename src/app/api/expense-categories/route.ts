import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: 経費カテゴリ一覧取得
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('expense_categories')
      .select('*')
      .is('deleted_at', null)
      .order('display_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: '経費カテゴリの取得に失敗しました' }, { status: 500 });
  }
}

// POST: 経費カテゴリ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, display_order } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'カテゴリ名は必須です' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('expense_categories')
      .insert({ name: name.trim(), description, display_order: display_order || 0 })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '経費カテゴリの作成に失敗しました' }, { status: 500 });
  }
}

// DELETE: 経費カテゴリ削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'idは必須です' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('expense_categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', Number(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '削除しました' });
  } catch (error) {
    return NextResponse.json({ error: '経費カテゴリの削除に失敗しました' }, { status: 500 });
  }
}
