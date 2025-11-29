import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: 売上データ取得 or 販売期間で該当フォルダ取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const saleDate = searchParams.get('sale_date');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  try {
    // 販売期間で該当する商品フォルダを取得
    if (action === 'get_collections') {
      if (!saleDate) {
        return NextResponse.json({ error: '販売日を指定してください' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('product_collections')
        .select(`
          id,
          name,
          start_date,
          end_date,
          products(
            id,
            name,
            cost_price,
            selling_price,
            image_url
          )
        `)
        .is('deleted_at', null)
        .lte('start_date', saleDate)
        .gte('end_date', saleDate);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    // 日別売上サマリー取得
    if (action === 'daily_summary') {
      let query = supabaseAdmin
        .from('daily_sales_summary')
        .select('*')
        .order('sale_date', { ascending: false });

      if (startDate) {
        query = query.gte('sale_date', startDate);
      }
      if (endDate) {
        query = query.lte('sale_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    // 商品別売上取得
    if (action === 'product_sales') {
      let query = supabaseAdmin
        .from('product_sales_summary')
        .select(`
          *,
          products(id, name, category_id)
        `)
        .order('sale_date', { ascending: false });

      if (saleDate) {
        query = query.eq('sale_date', saleDate);
      }
      if (startDate) {
        query = query.gte('sale_date', startDate);
      }
      if (endDate) {
        query = query.lte('sale_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'actionパラメータを指定してください' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

// POST: 売上一括入力
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sale_date, sales_data } = body;
    // sales_data: Array of { product_id, quantity_sold }

    if (!sale_date || !Array.isArray(sales_data)) {
      return NextResponse.json({ error: '販売日と売上データは必須です' }, { status: 400 });
    }

    // 商品情報を取得して原価・売価を計算
    const productIds = sales_data.map((s: any) => s.product_id);
    const { data: products, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, cost_price, selling_price')
      .in('id', productIds);

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    const productMap = new Map(products?.map((p: any) => [p.id, p]) || []);

    // 商品別売上サマリーを作成
    const productSalesSummaries = sales_data
      .filter((s: any) => s.quantity_sold > 0)
      .map((s: any) => {
        const product = productMap.get(s.product_id);
        const costPrice = product?.cost_price || 0;
        const sellingPrice = product?.selling_price || 0;
        const quantity = Number(s.quantity_sold);

        return {
          sale_date,
          product_id: s.product_id,
          quantity_sold: quantity,
          total_sales: sellingPrice * quantity,
          total_cost: costPrice * quantity
        };
      });

    // 商品別売上をUPSERT
    if (productSalesSummaries.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from('product_sales_summary')
        .upsert(productSalesSummaries, { onConflict: 'sale_date,product_id' });

      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }
    }

    // 日次サマリーを計算して更新
    const totalSales = productSalesSummaries.reduce((sum, p) => sum + p.total_sales, 0);
    const totalCost = productSalesSummaries.reduce((sum, p) => sum + p.total_cost, 0);
    const itemCount = productSalesSummaries.reduce((sum, p) => sum + p.quantity_sold, 0);
    const grossProfit = totalSales - totalCost;
    const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    const { error: dailyError } = await supabaseAdmin
      .from('daily_sales_summary')
      .upsert({
        sale_date,
        total_sales: totalSales,
        total_cost: totalCost,
        item_count: itemCount,
        gross_profit: grossProfit,
        gross_margin: Math.round(grossMargin * 100) / 100,
        updated_at: new Date().toISOString()
      }, { onConflict: 'sale_date' });

    if (dailyError) {
      return NextResponse.json({ error: dailyError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: '売上を登録しました',
      summary: {
        sale_date,
        total_sales: totalSales,
        total_cost: totalCost,
        item_count: itemCount,
        gross_profit: grossProfit,
        gross_margin: Math.round(grossMargin * 100) / 100
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '売上の登録に失敗しました' }, { status: 500 });
  }
}

// DELETE: 日次売上削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const saleDate = searchParams.get('sale_date');

  if (!saleDate) {
    return NextResponse.json({ error: 'sale_dateは必須です' }, { status: 400 });
  }

  try {
    // 商品別売上削除
    await supabaseAdmin
      .from('product_sales_summary')
      .delete()
      .eq('sale_date', saleDate);

    // 日次サマリー削除
    await supabaseAdmin
      .from('daily_sales_summary')
      .delete()
      .eq('sale_date', saleDate);

    return NextResponse.json({ message: '削除しました' });
  } catch (error) {
    return NextResponse.json({ error: '売上の削除に失敗しました' }, { status: 500 });
  }
}
