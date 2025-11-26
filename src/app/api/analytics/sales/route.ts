import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 直近データを都度取得するためキャッシュを無効化
export const revalidate = 0;
export const dynamic = 'force-dynamic';

type SaleRow = {
  id: number;
  sale_date: string;
  sale_time: string;
  time_slot: string;
  total_amount: number | string;
};

type SaleItemRow = {
  product_id: number;
  quantity: number;
  unit_price: number;
  product: { name: string; cost_price: number } | { name: string; cost_price: number }[] | null;
};

// Build YYYY-MM keys (e.g. 2025-03)
const toMonthKey = (dateStr: string) => dateStr.slice(0, 7);

export async function GET(_req: NextRequest) {
  try {
    const [{ data: sales, error: salesError }, { data: items, error: itemsError }] = await Promise.all([
      supabaseAdmin.from('sales').select('id,sale_date,sale_time,time_slot,total_amount').order('sale_date', { ascending: true }),
      supabaseAdmin.from('sale_items').select('product_id,quantity,unit_price,product:products(name,cost_price)'),
    ]);

    if (salesError) {
      console.error('売上取得エラー:', salesError);
      return NextResponse.json({ error: '売上の取得に失敗しました' }, { status: 500 });
    }
    if (itemsError) {
      console.error('明細取得エラー:', itemsError);
      return NextResponse.json({ error: '売上明細の取得に失敗しました' }, { status: 500 });
    }

    const todayKey = new Date().toISOString().split('T')[0];
    const dailyMap: Record<string, number> = {};
    const monthlyMap: Record<string, number> = {};
    // フロントは「時間=11〜16」などのキーを期待するので sale_time を時単位で集計する
    const timeSlotMap: Record<string, number> = {};

    let totalAmount = 0;
    let todayTotal = 0;

    (sales || []).forEach((sale: SaleRow) => {
      const amt = Number(sale.total_amount) || 0; // Supabase DECIMAL comes as string
      totalAmount += amt;
      if (sale.sale_date === todayKey) todayTotal += amt;
      dailyMap[sale.sale_date] = (dailyMap[sale.sale_date] || 0) + amt;
      const mKey = toMonthKey(sale.sale_date);
      monthlyMap[mKey] = (monthlyMap[mKey] || 0) + amt;
      // 時間帯: sale_time の「時」をキーにする (例: '11')
      const hourStr = (sale.sale_time || '').split(':')[0];
      const hourNum = Number(hourStr);
      if (!Number.isNaN(hourNum)) {
        const key = String(hourNum);
        timeSlotMap[key] = (timeSlotMap[key] || 0) + amt;
      }
    });

    // 月次比率
    const now = new Date();
    const pad = (n: number) => `${n}`.padStart(2, '0');
    const currentMonthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const prevMonthKey = `${now.getFullYear()}-${pad(now.getMonth())}`;
    const lastYearMonthKey = `${now.getFullYear() - 1}-${pad(now.getMonth() + 1)}`;
    const currentMonthSales = monthlyMap[currentMonthKey] || 0;
    const prevMonthSales = monthlyMap[prevMonthKey] || 0;
    const lastYearMonthSales = monthlyMap[lastYearMonthKey] || 0;

    // 商品別集計
    const productMap: Record<number, { name: string; revenue: number; cost: number; quantity: number }> = {};

    (items || []).forEach((row: SaleItemRow) => {
      const revenue = Number(row.unit_price) * Number(row.quantity);
      const productInfo = Array.isArray(row.product) ? row.product[0] : row.product;
      const costUnit = Number(productInfo?.cost_price) || 0;
      const cost = costUnit * Number(row.quantity);
      const key = row.product_id;
      if (!productMap[key]) {
        productMap[key] = {
          name: productInfo?.name || `ID:${key}`,
          revenue: 0,
          cost: 0,
          quantity: 0,
        };
      }
      productMap[key].revenue += revenue;
      productMap[key].cost += cost;
      productMap[key].quantity += row.quantity;
    });

    const productRanking = Object.entries(productMap)
      .map(([id, val]) => ({
        productId: Number(id),
        name: val.name,
        revenue: val.revenue,
        cost: val.cost,
        profit: val.revenue - val.cost,
        profitRate: val.revenue ? ((val.revenue - val.cost) / val.revenue) * 100 : 0,
        quantity: val.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const totalCost = productRanking.reduce((sum, p) => sum + p.cost, 0);
    const costRate = totalAmount ? (totalCost / totalAmount) * 100 : 0;

    // 客数はスキーマに存在しないため null を返し、フロント側で注意書きを表示
    return NextResponse.json({
      totalAmount,
      todayTotal,
      dailySales: Object.entries(dailyMap).map(([date, total]) => ({ date, total })),
      monthlySales: Object.entries(monthlyMap).map(([month, total]) => ({ month, total })),
      timeSlots: timeSlotMap,
      productRanking,
      currentMonthSales,
      prevMonthSales,
      lastYearMonthSales,
      costRate,
      customerCount: null,
      averageSpend: null,
    });
  } catch (error) {
    console.error('売上分析エラー:', error);
    return NextResponse.json({ error: '売上の取得に失敗しました' }, { status: 500 });
  }
}
