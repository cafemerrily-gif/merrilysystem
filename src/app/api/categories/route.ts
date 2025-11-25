import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logActivity } from '@/lib/logger';

// GET: カテゴリー一覧取得
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id, name, description, display_order')
      .is('deleted_at', null)
      .order('display_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'カテゴリーの取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error('カテゴリー取得エラー:', error);
    return NextResponse.json({ error: 'カテゴリーの取得に失敗しました' }, { status: 500 });
  }
}

// POST: カテゴリー作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, display_order } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'カテゴリー名は必須です' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: name.trim(),
        description: description || '',
        display_order: display_order || 0,
        is_seasonal: false,
      })
      .select('id, name')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'カテゴリーの作成に失敗しました' }, { status: 500 });
    }

    await logActivity(`カテゴリ作成: ${data.name}`, null);

    return NextResponse.json({ message: 'カテゴリーを作成しました', categoryId: data.id }, { status: 201 });
  } catch (error) {
    console.error('カテゴリー作成エラー:', error);
    return NextResponse.json({ error: 'カテゴリーの作成に失敗しました' }, { status: 500 });
  }
}

// DELETE: カテゴリー削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id は必須です' }, { status: 400 });
  }

  try {
    // 関連商品がある場合はブロック
    const { count, error: countError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', Number(id));

    if (countError) {
      console.error('カテゴリ削除前チェックエラー:', countError);
      return NextResponse.json({ error: '削除前の確認に失敗しました' }, { status: 500 });
    }

    if ((count || 0) > 0) {
      return NextResponse.json(
        { error: 'このカテゴリーに商品が紐づいているため削除できません。商品を移動・削除してください。' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from('categories').delete().eq('id', Number(id));
    if (error) {
      console.error('カテゴリ削除エラー:', error);
      return NextResponse.json({ error: 'カテゴリーの削除に失敗しました' }, { status: 500 });
    }

    await logActivity(`カテゴリ削除: id=${id}`, null);
    return NextResponse.json({ message: '削除しました', id: Number(id) });
  } catch (error) {
    console.error('カテゴリー削除エラー:', error);
    return NextResponse.json({ error: 'カテゴリーの削除に失敗しました' }, { status: 500 });
  }
}
