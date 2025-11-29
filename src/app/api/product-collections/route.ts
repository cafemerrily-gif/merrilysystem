import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: 商品フォルダ一覧取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeProducts = searchParams.get('include_products') === 'true';
  const activeOnly = searchParams.get('active_only') === 'true';
  const targetDate = searchParams.get('target_date');

  try {
    let query = supabaseAdmin
      .from('product_collections')
      .select(includeProducts ? `
        *,
        products(id, name, cost_price, selling_price, image_url)
      ` : '*')
      .is('deleted_at', null)
      .order('display_order', { ascending: true });

    // 特定日で有効なフォルダのみ取得
    if (targetDate) {
      query = query
        .lte('start_date', targetDate)
        .gte('end_date', targetDate);
    }

    // アクティブなフォルダのみ（現在有効な販売期間）
    if (activeOnly) {
      const today = new Date().toISOString().split('T')[0];
      query = query
        .lte('start_date', today)
        .gte('end_date', today);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: '商品フォルダの取得に失敗しました' }, { status: 500 });
  }
}

// POST: 商品フォルダ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, display_order, start_date, end_date } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'フォルダ名は必須です' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('product_collections')
      .insert({
        name: name.trim(),
        description,
        display_order: display_order || 0,
        start_date,
        end_date
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '商品フォルダの作成に失敗しました' }, { status: 500 });
  }
}

// PUT: 商品フォルダ更新（販売期間含む）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, display_order, start_date, end_date } = body;

    if (!id) {
      return NextResponse.json({ error: 'idは必須です' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;

    const { data, error } = await supabaseAdmin
      .from('product_collections')
      .update(updateData)
      .eq('id', Number(id))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '商品フォルダの更新に失敗しました' }, { status: 500 });
  }
}

// PATCH: 販売期間のみ更新
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, start_date, end_date } = body;

    if (!id) {
      return NextResponse.json({ error: 'idは必須です' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('product_collections')
      .update({
        start_date,
        end_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', Number(id))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '販売期間の更新に失敗しました' }, { status: 500 });
  }
}

// DELETE: 商品フォルダ削除（論理削除）
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'idは必須です' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('product_collections')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', Number(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '削除しました' });
  } catch (error) {
    return NextResponse.json({ error: '商品フォルダの削除に失敗しました' }, { status: 500 });
  }
}
