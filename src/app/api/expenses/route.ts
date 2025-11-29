import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Excelエクスポート用データ取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exportType = searchParams.get('type');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  try {
    // 日別売上データエクスポート
    if (exportType === 'daily_sales') {
      let query = supabaseAdmin
        .from('daily_sales_summary')
        .select('*')
        .order('sale_date', { ascending: true });

      if (startDate) query = query.gte('sale_date', startDate);
      if (endDate) query = query.lte('sale_date', endDate);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({
        filename: `daily_sales_${startDate || 'all'}_${endDate || 'all'}.xlsx`,
        headers: ['日付', '売上合計', '原価合計', '粗利益', '粗利率(%)', '販売数'],
        data: (data || []).map((d: any) => [
          d.sale_date,
          d.total_sales,
          d.total_cost,
          d.gross_profit,
          d.gross_margin,
          d.item_count
        ])
      });
    }

    // 商品別売上データエクスポート
    if (exportType === 'product_sales') {
      let query = supabaseAdmin
        .from('product_sales_summary')
        .select(`
          sale_date,
          quantity_sold,
          total_sales,
          total_cost,
          products(name)
        `)
        .order('sale_date', { ascending: true });

      if (startDate) query = query.gte('sale_date', startDate);
      if (endDate) query = query.lte('sale_date', endDate);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({
        filename: `product_sales_${startDate || 'all'}_${endDate || 'all'}.xlsx`,
        headers: ['日付', '商品名', '販売数', '売上', '原価'],
        data: (data || []).map((d: any) => [
          d.sale_date,
          d.products?.name || '不明',
          d.quantity_sold,
          d.total_sales,
          d.total_cost
        ])
      });
    }

    // 経費データエクスポート
    if (exportType === 'expenses') {
      let query = supabaseAdmin
        .from('expenses')
        .select(`
          expense_date,
          amount,
          description,
          vendor_name,
          payment_method,
          status,
          expense_categories(name)
        `)
        .is('deleted_at', null)
        .order('expense_date', { ascending: true });

      if (startDate) query = query.gte('expense_date', startDate);
      if (endDate) query = query.lte('expense_date', endDate);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({
        filename: `expenses_${startDate || 'all'}_${endDate || 'all'}.xlsx`,
        headers: ['日付', 'カテゴリ', '金額', '説明', '支払先', '支払方法', 'ステータス'],
        data: (data || []).map((d: any) => [
          d.expense_date,
          d.expense_categories?.name || '未分類',
          d.amount,
          d.description || '',
          d.vendor_name || '',
          d.payment_method,
          d.status
        ])
      });
    }

    // 予算vs実績エクスポート
    if (exportType === 'budget_vs_actual') {
      const targetYear = year ? Number(year) : new Date().getFullYear();

      const { data: budgets } = await supabaseAdmin
        .from('budgets')
        .select('*')
        .eq('year', targetYear)
        .order('month')
        .order('category');

      return NextResponse.json({
        filename: `budget_vs_actual_${targetYear}.xlsx`,
        headers: ['年', '月', 'カテゴリ', '予算', '実績', '差異'],
        data: (budgets || []).map((b: any) => [
          b.year,
          b.month,
          b.category,
          b.planned_amount,
          b.actual_amount,
          b.actual_amount - b.planned_amount
        ])
      });
    }

    // 月次レポートエクスポート
    if (exportType === 'monthly_report') {
      const targetYear = year ? Number(year) : new Date().getFullYear();
      const targetMonth = month ? Number(month) : new Date().getMonth() + 1;

      const monthStart = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
      const nextMonth = targetMonth === 12 ? 1 : targetMonth + 1;
      const nextYear = targetMonth === 12 ? targetYear + 1 : targetYear;
      const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

      // 売上データ
      const { data: salesData } = await supabaseAdmin
        .from('daily_sales_summary')
        .select('*')
        .gte('sale_date', monthStart)
        .lt('sale_date', monthEnd);

      // 経費データ
      const { data: expenseData } = await supabaseAdmin
        .from('expenses')
        .select('amount')
        .is('deleted_at', null)
        .gte('expense_date', monthStart)
        .lt('expense_date', monthEnd);

      // 売上目標
      const { data: targetData } = await supabaseAdmin
        .from('sales_targets')
        .select('target_amount')
        .eq('year', targetYear)
        .eq('month', targetMonth)
        .single();

      const totalSales = salesData?.reduce((sum, d: any) => sum + Number(d.total_sales), 0) || 0;
      const totalCost = salesData?.reduce((sum, d: any) => sum + Number(d.total_cost), 0) || 0;
      const totalExpenses = expenseData?.reduce((sum, d: any) => sum + Number(d.amount), 0) || 0;
      const grossProfit = totalSales - totalCost;
      const netProfit = grossProfit - totalExpenses;
      const targetAmount = targetData?.target_amount || 0;

      return NextResponse.json({
        filename: `monthly_report_${targetYear}_${String(targetMonth).padStart(2, '0')}.xlsx`,
        headers: ['項目', '金額'],
        data: [
          ['売上高', totalSales],
          ['原価', totalCost],
          ['粗利益', grossProfit],
          ['粗利率(%)', totalSales > 0 ? Math.round((grossProfit / totalSales) * 100 * 100) / 100 : 0],
          ['経費合計', totalExpenses],
          ['営業利益', netProfit],
          ['売上目標', targetAmount],
          ['達成率(%)', targetAmount > 0 ? Math.round((totalSales / targetAmount) * 100 * 100) / 100 : 0]
        ]
      });
    }

    return NextResponse.json({ error: 'typeパラメータを指定してください' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'エクスポートデータの取得に失敗しました' }, { status: 500 });
  }
}
