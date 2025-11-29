import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: 商品一覧取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');
  const collectionId = searchParams.get('collection_id');

  try {
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('id', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Products GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Products GET exception:', error);
    return NextResponse.json({ error: '商品の取得に失敗しました' }, { status: 500 });
  }
}

// POST: 商品追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category_id, collection_id, cost_price, selling_price, image_url, description } = body;

    if (!name) {
      return NextResponse.json({ error: '商品名は必須です' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        category_id: category_id || null,
        collection_id: collection_id || null,
        cost_price: cost_price || 0,
        selling_price: selling_price || 0,
        image_url: image_url || null,
        description: description || null
      })
      .select()
      .single();

    if (error) {
      console.error('Products POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Products POST exception:', error);
    return NextResponse.json({ error: '商品の追加に失敗しました' }, { status: 500 });
  }
}

// PUT: 商品更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, category_id, collection_id, cost_price, selling_price, image_url, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'IDは必須です' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (name !== undefined) updateData.name = name;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (collection_id !== undefined) updateData.collection_id = collection_id;
    if (cost_price !== undefined) updateData.cost_price = cost_price;
    if (selling_price !== undefined) updateData.selling_price = selling_price;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (description !== undefined) updateData.description = description;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Products PUT error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Products PUT exception:', error);
    return NextResponse.json({ error: '商品の更新に失敗しました' }, { status: 500 });
  }
}

// DELETE: 商品削除（論理削除）
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'IDは必須です' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Products DELETE error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '商品を削除しました' });
  } catch (error) {
    console.error('Products DELETE exception:', error);
    return NextResponse.json({ error: '商品の削除に失敗しました' }, { status: 500 });
  }
}
