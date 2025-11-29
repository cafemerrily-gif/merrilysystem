import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: 売上分析データ取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  try {
    // 1. 日別売上推移（折れ線グラフ用）
    if (type === 'daily_trend') {
      let query = supabaseAdmin
        .from('daily_sales_summary')
        .select('sale_date, total_sales, gross_profit, transaction_count, item_count')
        .order('sale_date', { ascending: true });

      if (startDate) query = query.gte('sale_date', startDate);
      if (endDate) query = query.lte('sale_date', endDate);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({
        type: 'daily_trend',
        title: '日別売上推移',
        data: data || []
      });
    }

    // 2. 月別売上比較（棒グラフ用）
    if (type === 'monthly_comparison') {
      const { data, error } = await supabaseAdmin.rpc('get_monthly_sales', {
        target_year: year ? Number(year) : new Date().getFullYear()
      });

      // RPCがない場合は集計で代替
      if (error) {
        const { data: dailyData } = await supabaseAdmin
          .from('daily_sales_summary')
          .select('sale_date, total_sales, gross_profit');

        const monthlyMap = new Map();
        dailyData?.forEach((d: any) => {
          const date = new Date(d.sale_date);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const existing = monthlyMap.get(key) || { total_sales: 0, gross_profit: 0 };
          monthlyMap.set(key, {
            total_sales: existing.total_sales + Number(d.total_sales),
            gross_profit: existing.gross_profit + Number(d.gross_profit)
          });
        });

        const monthlyData = Array.from(monthlyMap.entries()).map(([month, values]) => ({
          month,
          ...values
        })).sort((a, b) => a.month.localeCompare(b.month));

        return NextResponse.json({
          type: 'monthly_comparison',
          title: '月別売上比較',
          data: monthlyData
        });
      }

      return NextResponse.json({
        type: 'monthly_comparison',
        title: '月別売上比較',
        data: data || []
      });
    }

    // 3. 商品別売上ランキング（円グラフ/棒グラフ用）
    if (type === 'product_ranking') {
      let query = supabaseAdmin
        .from('product_sales_summary')
        .select(`
          product_id,
          products(name),
          quantity_sold,
          total_sales
        `);

      if (startDate) query = query.gte('sale_date', startDate);
      if (endDate) query = query.lte('sale_date', endDate);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // 商品別に集計
      const productMap = new Map();
      data?.forEach((d: any) => {
        const productId = d.product_id;
        const existing = productMap.get(productId) || {
          product_id: productId,
          product_name: d.products?.name || '不明',
          quantity_sold: 0,
          total_sales: 0
        };
        productMap.set(productId, {
          ...existing,
          quantity_sold: existing.quantity_sold + Number(d.quantity_sold),
          total_sales: existing.total_sales + Number(d.total_sales)
        });
      });

      const ranking = Array.from(productMap.values())
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 10);

      return NextResponse.json({
        type: 'product_ranking',
        title: '商品別売上ランキング（TOP10）',
        data: ranking
      });
    }

    // 4. カテゴリ別売上構成（円グラフ用）
    if (type === 'category_breakdown') {
      let query = supabaseAdmin
        .from('product_sales_summary')
        .select(`
          product_id,
          products(category_id, categories(name)),
          total_sales
        `);

      if (startDate) query = query.gte('sale_date', startDate);
      if (endDate) query = query.lte('sale_date', endDate);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // カテゴリ別に集計
      const categoryMap = new Map();
      data?.forEach((d: any) => {
        const categoryName = d.products?.categories?.name || '未分類';
        const existing = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, existing + Number(d.total_sales));
      });

      const breakdown = Array.from(categoryMap.entries())
        .map(([category, total_sales]) => ({ category, total_sales }))
        .sort((a, b) => b.total_sales - a.total_sales);

      return NextResponse.json({
        type: 'category_breakdown',
        title: 'カテゴリ別売上構成',
        data: breakdown
      });
    }

    // 5. 時間帯別売上（棒グラフ用）
    if (type === 'hourly_sales') {
      let query = supabaseAdmin
        .from('hourly_sales_summary')
        .select('hour, total_sales, transaction_count');

      if (startDate) query = query.gte('sale_date', startDate);
      if (endDate) query = query.lte('sale_date', endDate);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // 時間帯別に集計
      const hourlyMap = new Map();
      for (let h = 0; h < 24; h++) {
        hourlyMap.set(h, { hour: h, total_sales: 0, transaction_count: 0 });
      }

      data?.forEach((d: any) => {
        const existing = hourlyMap.get(d.hour);
        if (existing) {
          hourlyMap.set(d.hour, {
            hour: d.hour,
            total_sales: existing.total_sales + Number(d.total_sales),
            transaction_count: existing.transaction_count + Number(d.transaction_count)
          });
        }
      });

      return NextResponse.json({
        type: 'hourly_sales',
        title: '時間帯別売上',
        data: Array.from(hourlyMap.values())
      });
    }

    // 6. 曜日別売上（棒グラフ用）
    if (type === 'weekday_sales') {
      let query = supabaseAdmin
        .from('daily_sales_summary')
        .select('sale_date, total_sales, transaction_count');

      if (startDate) query = query.gte('sale_date', startDate);
      if (endDate) query = query.lte('sale_date', endDate);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const weekdayMap = new Map();
      weekdays.forEach((day, i) => {
        weekdayMap.set(i, { weekday: day, total_sales: 0, count: 0 });
      });

      data?.forEach((d: any) => {
        const dayOfWeek = new Date(d.sale_date).getDay();
        const existing = weekdayMap.get(dayOfWeek);
        if (existing) {
          weekdayMap.set(dayOfWeek, {
            weekday: existing.weekday,
            total_sales: existing.total_sales + Number(d.total_sales),
            count: existing.count + 1
          });
        }
      });

      const weekdayData = Array.from(weekdayMap.values()).map(d => ({
        weekday: d.weekday,
        total_sales: d.total_sales,
        average_sales: d.count > 0 ? Math.round(d.total_sales / d.count) : 0
      }));

      return NextResponse.json({
        type: 'weekday_sales',
        title: '曜日別売上',
        data: weekdayData
      });
    }

    // 7. 売上目標達成率
    if (type === 'target_achievement') {
      const targetYear = year ? Number(year) : new Date().getFullYear();

      const { data: targets } = await supabaseAdmin
        .from('sales_targets')
        .select('*')
        .eq('year', targetYear);

      const { data: dailyData } = await supabaseAdmin
        .from('daily_sales_summary')
        .select('sale_date, total_sales');

      // 月別実績を集計
      const monthlyActual = new Map();
      dailyData?.forEach((d: any) => {
        const date = new Date(d.sale_date);
        if (date.getFullYear() === targetYear) {
          const month = date.getMonth() + 1;
          const existing = monthlyActual.get(month) || 0;
          monthlyActual.set(month, existing + Number(d.total_sales));
        }
      });

      const achievement = [];
      for (let m = 1; m <= 12; m++) {
        const target = targets?.find((t: any) => t.month === m);
        const actual = monthlyActual.get(m) || 0;
        const targetAmount = target?.target_amount || 0;
        const rate = targetAmount > 0 ? Math.round((actual / targetAmount) * 100) : 0;

        achievement.push({
          month: m,
          target_amount: targetAmount,
          actual_amount: actual,
          achievement_rate: rate
        });
      }

      return NextResponse.json({
        type: 'target_achievement',
        title: '売上目標達成率',
        year: targetYear,
        data: achievement
      });
    }

    return NextResponse.json({ error: 'typeパラメータを指定してください' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: '分析データの取得に失敗しました' }, { status: 500 });
  }
}
