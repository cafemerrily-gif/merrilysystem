import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/collections/[id]/products
 * 指定されたコレクションに属する商品一覧を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collectionId = parseInt(params.id);

    if (isNaN(collectionId)) {
      return NextResponse.json(
        { error: '無効なコレクションIDです' },
        { status: 400 }
      );
    }

    // コレクションに属する商品を取得
    const { data, error } = await supabaseAdmin
      .from('collection_products')
      .select(`
        product_id,
        products:product_id (
          id,
          name,
          selling_price,
          cost_price,
          categories:category_id (
            name
          )
        )
      `)
      .eq('collection_id', collectionId)
      .is('deleted_at', null);

    if (error) {
      console.error('Supabaseエラー:', error);
      return NextResponse.json(
        { error: 'コレクション商品の取得に失敗しました' },
        { status: 500 }
      );
    }

    // データ整形
    const products = (data || []).map(item => {
      const product = item.products as any;
      return {
        id: product.id,
        name: product.name,
        category_name: product.categories?.name || '未分類',
        selling_price: product.selling_price,
        cost_price: product.cost_price,
      };
    });

    return NextResponse.json(
      {
        collectionId,
        products,
        count: products.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('コレクション商品取得エラー:', error);
    return NextResponse.json(
      { error: 'コレクション商品の取得に失敗しました' },
      { status: 500 }
    );
  }
}
