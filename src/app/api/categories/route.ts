import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: カテゴリ一覧取得
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .is('deleted_at', null)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Categories GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Categories GET exception:', error);
    return NextResponse.json({ error: 'カテゴリの取得に失敗しました' }, { status: 500 });
  }
}

// POST: カテゴリ追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, display_order } = body;

    if (!name) {
      return NextResponse.json({ error: 'カテゴリ名は必須です' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        description: description || null,
        display_order: display_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Categories POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Categories POST exception:', error);
    return NextResponse.json({ error: 'カテゴリの追加に失敗しました' }, { status: 500 });
  }
}

// PUT: カテゴリ更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, display_order } = body;

    if (!id) {
      return NextResponse.json({ error: 'IDは必須です' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Categories PUT error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Categories PUT exception:', error);
    return NextResponse.json({ error: 'カテゴリの更新に失敗しました' }, { status: 500 });
  }
}

// DELETE: カテゴリ削除（論理削除）
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'IDは必須です' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Categories DELETE error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'カテゴリを削除しました' });
  } catch (error) {
    console.error('Categories DELETE exception:', error);
    return NextResponse.json({ error: 'カテゴリの削除に失敗しました' }, { status: 500 });
  }
}
