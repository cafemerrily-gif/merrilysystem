import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/products
 * 商品一覧を取得（カテゴリ名も含む）
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        category_id,
        name,
        selling_price,
        cost_price,
        categories:category_id (
          name
        )
      `)
      .is('deleted_at', null)
      .order('category_id', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabaseエラー:', error);
      return NextResponse.json(
        { error: '商品の取得に失敗しました' },
        { status: 500 }
      );
    }

    // データ整形（カテゴリ名を展開）
    const products = (data || []).map(product => ({
      id: product.id,
      category_id: product.category_id,
      category_name: (product.categories as any)?.name || '未分類',
      name: product.name,
      selling_price: product.selling_price,
      cost_price: product.cost_price,
    }));

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('商品取得エラー:', error);
    return NextResponse.json(
      { error: '商品の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * 新規商品を作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category_id, name, selling_price, cost_price } = body;

    // バリデーション
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: '商品名は必須です' },
        { status: 400 }
      );
    }

    if (!category_id || isNaN(category_id)) {
      return NextResponse.json(
        { error: 'カテゴリは必須です' },
        { status: 400 }
      );
    }

    if (selling_price === undefined || isNaN(selling_price)) {
      return NextResponse.json(
        { error: '販売価格は必須です' },
        { status: 400 }
      );
    }

    if (cost_price === undefined || isNaN(cost_price)) {
      return NextResponse.json(
        { error: '原価は必須です' },
        { status: 400 }
      );
    }

    // Supabaseに挿入
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        category_id,
        name: name.trim(),
        selling_price,
        cost_price,
        is_available: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabaseエラー:', error);
      return NextResponse.json(
        { error: '商品の作成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: '商品を作成しました',
        productId: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('商品作成エラー:', error);
    return NextResponse.json(
      { error: '商品の作成に失敗しました' },
      { status: 500 }
    );
  }
}
