import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/collections/[id]/products
 * 指定コレクションに属する商品一覧を取得
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collectionId = parseInt(params.id, 10);
    if (isNaN(collectionId)) {
      return NextResponse.json({ error: '無効なコレクションIDです' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('collection_products')
      .select(
        `
        product_id,
        products:product_id (
          id,
          name,
          selling_price,
          cost_price,
          categories:category_id (name)
        )
      `
      )
      .eq('collection_id', collectionId)
      .is('deleted_at', null);

    if (error) {
      console.error('Supabaseエラー:', error);
      return NextResponse.json({ error: 'コレクション商品取得に失敗しました' }, { status: 500 });
    }

    const products = (data || []).map((item) => {
      const product: any = item.products;
      return {
        id: product.id,
        name: product.name,
        category_name: product.categories?.name || '未分類',
        selling_price: product.selling_price,
        cost_price: product.cost_price,
      };
    });

    return NextResponse.json({ collectionId, products, count: products.length });
  } catch (error) {
    console.error('コレクション商品取得エラー:', error);
    return NextResponse.json({ error: 'コレクション商品取得に失敗しました' }, { status: 500 });
  }
}

/**
 * POST /api/collections/[id]/products
 * 指定コレクションに商品を追加（複数対応）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collectionId = parseInt(params.id, 10);
    if (isNaN(collectionId)) {
      return NextResponse.json({ error: '無効なコレクションIDです' }, { status: 400 });
    }

    const body = await request.json();
    const productIds: number[] = Array.isArray(body.productIds)
      ? body.productIds.map((n: any) => Number(n)).filter((n: number) => !isNaN(n))
      : body.productId
      ? [Number(body.productId)]
      : [];

    if (!productIds.length) {
      return NextResponse.json({ error: 'productId または productIds が必要です' }, { status: 400 });
    }

    const rows = productIds.map((pid) => ({
      collection_id: collectionId,
      product_id: pid,
    }));

    const { error } = await supabaseAdmin
      .from('collection_products')
      .insert(rows);

    if (error) {
      console.error('コレクション商品追加エラー:', error);
      return NextResponse.json(
        { error: 'コレクション商品追加に失敗しました。重複や外部キー制約の可能性があります。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '追加しました', count: productIds.length }, { status: 201 });
  } catch (error) {
    console.error('コレクション商品追加エラー:', error);
    return NextResponse.json({ error: 'コレクション商品追加に失敗しました' }, { status: 500 });
  }
}
