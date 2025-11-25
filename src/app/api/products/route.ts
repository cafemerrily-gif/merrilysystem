import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logActivity } from '@/lib/logger';

// GET /api/products : 商品一覧を取得（カテゴリー名付き）
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(
        `
        id,
        category_id,
        name,
        selling_price,
        cost_price,
        categories:category_id ( name )
      `
      )
      .is('deleted_at', null)
      .order('category_id', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: '商品の取得に失敗しました' }, { status: 500 });
    }

    const products = (data || []).map((product: any) => ({
      id: product.id,
      category_id: product.category_id,
      category_name: product.categories?.name || '未設定',
      name: product.name,
      selling_price: product.selling_price,
      cost_price: product.cost_price,
    }));

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('商品取得エラー:', error);
    return NextResponse.json({ error: '商品の取得に失敗しました' }, { status: 500 });
  }
}

// POST /api/products : 商品を作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category_id, name, selling_price, cost_price } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: '商品名は必須です' }, { status: 400 });
    }
    if (!category_id || isNaN(Number(category_id))) {
      return NextResponse.json({ error: 'カテゴリーは必須です' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        category_id: Number(category_id),
        name: name.trim(),
        selling_price: selling_price || 0,
        cost_price: cost_price || 0,
        is_menu_product: true,
      })
      .select('id, name')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: '商品の作成に失敗しました' }, { status: 500 });
    }

    await logActivity(`商品作成: ${data.name}`, null);

    return NextResponse.json({ message: '商品を作成しました', productId: data.id }, { status: 201 });
  } catch (error) {
    console.error('商品作成エラー:', error);
    return NextResponse.json({ error: '商品の作成に失敗しました' }, { status: 500 });
  }
}

// DELETE /api/products?id=123 : 商品削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id は必須です' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', Number(id));
    if (error) {
      console.error('商品削除エラー:', error);
      return NextResponse.json({ error: '商品の削除に失敗しました' }, { status: 500 });
    }
    await logActivity(`商品削除: id=${id}`, null);
    return NextResponse.json({ message: '削除しました', id: Number(id) });
  } catch (error) {
    console.error('商品削除エラー:', error);
    return NextResponse.json({ error: '商品の削除に失敗しました' }, { status: 500 });
  }
}
