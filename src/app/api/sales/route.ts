import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface SaleItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

interface SaleRequest {
  saleDate: string;
  saleTime: string;
  staffId: number;
  locationId?: number;
  items?: SaleItem[];
  totalAmount?: number;
  paymentMethod?: string;
}

/**
 * GET /api/sales
 * 売上サマリ（グラフ用）
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('sales')
      .select('id,sale_date,sale_time,time_slot,total_amount,payment_method')
      .order('sale_date', { ascending: true });

    if (error) {
      console.error('売上取得エラー:', error);
      return NextResponse.json(
        { error: '売上の取得に失敗しました' },
        { status: 500 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const dailyMap: Record<string, number> = {};
    const timeSlotMap: Record<string, number> = {
      morning: 0,
      lunch: 0,
      afternoon: 0,
      evening: 0,
    };

    let total = 0;
    let todayTotal = 0;

    data.forEach((sale) => {
      const amt = sale.total_amount || 0;
      total += amt;
      if (sale.sale_date === today) todayTotal += amt;
      dailyMap[sale.sale_date] = (dailyMap[sale.sale_date] || 0) + amt;
      if (sale.time_slot) {
        timeSlotMap[sale.time_slot] = (timeSlotMap[sale.time_slot] || 0) + amt;
      }
    });

    const dailySales = Object.entries(dailyMap).map(([date, amount]) => ({
      date,
      total: amount,
    }));

    const recentSales = data
      .slice()
      .sort((a, b) => (a.sale_date < b.sale_date ? 1 : -1))
      .slice(0, 15);

    return NextResponse.json({
      totalAmount: total,
      todayTotal,
      dailySales,
      timeSlots: timeSlotMap,
      recentSales,
    });
  } catch (error) {
    console.error('売上サマリ取得エラー:', error);
    return NextResponse.json(
        { error: '売上の取得に失敗しました' },
        { status: 500 }
    );
  }
}

/**
 * DELETE /api/sales?saleId=123
 * 売上データを削除（sale_items は ON DELETE CASCADE）
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const saleId = searchParams.get('saleId');

  if (!saleId) {
    return NextResponse.json({ error: 'saleId が必要です' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin.from('sales').delete().eq('id', Number(saleId));

    if (error) {
      console.error('売上削除エラー:', error);
      return NextResponse.json({ error: '売上の削除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ message: '削除しました', saleId: Number(saleId) });
  } catch (error) {
    console.error('売上削除エラー:', error);
    return NextResponse.json({ error: '売上の削除に失敗しました' }, { status: 500 });
  }
}

/**
 * POST /api/sales
 * 売上データを登録（手動入力も想定）
 */
export async function POST(request: NextRequest) {
  try {
    const body: SaleRequest = await request.json();
    const { saleDate, saleTime, staffId, items, totalAmount, paymentMethod } = body;

    if (!saleDate || !saleTime) {
      return NextResponse.json(
        { error: '日付と時間は必須です' },
        { status: 400 }
      );
    }

    const hasItems = !!items && items.length > 0;
    if (!hasItems && (totalAmount === undefined || Number.isNaN(Number(totalAmount)))) {
      return NextResponse.json(
        { error: '売上金額を入力してください' },
        { status: 400 }
      );
    }

    const computedTotal = hasItems
      ? items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      : Number(totalAmount);

    const hour = parseInt(saleTime.split(':')[0], 10);
    let timeSlot: 'morning' | 'lunch' | 'afternoon' | 'evening';
    if (hour >= 6 && hour < 11) {
      timeSlot = 'morning';
    } else if (hour >= 11 && hour < 14) {
      timeSlot = 'lunch';
    } else if (hour >= 14 && hour < 18) {
      timeSlot = 'afternoon';
    } else {
      timeSlot = 'evening';
    }

    const { data: saleData, error: saleError } = await supabaseAdmin
      .from('sales')
      .insert({
        sale_date: saleDate,
        sale_time: saleTime,
        time_slot: timeSlot,
        total_amount: computedTotal,
        payment_method: paymentMethod || 'cash',
        entered_by: staffId || 1,
      })
      .select('id')
      .single();

    if (saleError) {
      console.error('売上登録エラー:', saleError);
      return NextResponse.json(
        { error: '売上の登録に失敗しました' },
        { status: 500 }
      );
    }

    const saleId = saleData.id;

    if (hasItems) {
      const saleItems = items!.map(item => ({
        sale_id: saleId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('明細登録エラー:', itemsError);
        await supabaseAdmin.from('sales').delete().eq('id', saleId);

        return NextResponse.json(
          { error: '明細の登録に失敗しました' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message: '売上を登録しました',
        saleId,
        totalAmount: computedTotal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('売上登録エラー:', error);
    return NextResponse.json(
      { error: '売上の登録に失敗しました' },
      { status: 500 }
    );
  }
}
