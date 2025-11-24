import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/categories
 * カテゴリ一覧を取得
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id, name, description, display_order')
      .is('deleted_at', null)
      .order('display_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabaseエラー:', error);
      return NextResponse.json(
        { error: 'カテゴリの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error('カテゴリ取得エラー:', error);
    return NextResponse.json(
      { error: 'カテゴリの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * 新規カテゴリを作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, display_order } = body;

    // バリデーション
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'カテゴリ名は必須です' },
        { status: 400 }
      );
    }

    // Supabaseに挿入
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: name.trim(),
        description: description || '',
        display_order: display_order || 0,
        is_seasonal: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabaseエラー:', error);
      return NextResponse.json(
        { error: 'カテゴリの作成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'カテゴリを作成しました',
        categoryId: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('カテゴリ作成エラー:', error);
    return NextResponse.json(
      { error: 'カテゴリの作成に失敗しました' },
      { status: 500 }
    );
  }
}
