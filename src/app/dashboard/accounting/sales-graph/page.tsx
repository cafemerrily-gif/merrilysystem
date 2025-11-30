'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

type HourlySales = {
  hour: number;
  sales: number;
  count: number;
};

type DailySales = {
  date: string;
  total_sales: number;
  total_cost: number;
  item_count: number;
  gross_profit: number;
};

type ProductSales = {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  total_sales: number;
};

type WeeklySales = {
  week: string;
  total_sales: number;
  item_count: number;
};

type MonthlySales = {
  month: string;
  total_sales: number;
  gross_profit: number;
};

export default function SalesGraphPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // 表示モード
  const [viewMode, setViewMode] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'product' | 'comparison'>('daily');
  
  // グラフタイプ
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  
  // 日付範囲
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  // 特定日（時間帯別用）
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // データ
  const [hourlySales, setHourlySales] = useState<HourlySales[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [weeklySales, setWeeklySales] = useState<WeeklySales[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [productSales, setProductSales] = useState<ProductSales[]>([]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const cardBg = isDark ? '#121212' : '#fafafa';
  const inputBg = isDark ? '#1a1a1a' : '#ffffff';
  const accentColor = '#22c55e';
  const secondaryColor = '#3b82f6';
  const warningColor = '#f59e0b';

  // 営業時間 11:00-16:00
  const businessHours = [11, 12, 13, 14, 15, 16];

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (viewMode === 'hourly') {
        fetchHourlySales();
      } else if (viewMode === 'daily') {
        fetchDailySales();
      } else if (viewMode === 'weekly') {
        fetchWeeklySales();
      } else if (viewMode === 'monthly') {
        fetchMonthlySales();
      } else if (viewMode === 'product') {
        fetchProductSales();
      }
    }
  }, [mounted, loading, viewMode, selectedDate, startDate, endDate]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(false);
  };

  // 時間帯別売上を取得（ダミーデータ）
  const fetchHourlySales = async () => {
    const dummyData: HourlySales[] = businessHours.map(hour => ({
      hour,
      sales: Math.floor(Math.random() * 15000) + 5000,
      count: Math.floor(Math.random() * 30) + 10
    }));
    setHourlySales(dummyData);
  };

  // 日別売上を取得
  const fetchDailySales = async () => {
    try {
      const res = await fetch(`/api/sales?action=daily_summary&start_date=${startDate}&end_date=${endDate}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setDailySales(data.map((d: any) => ({
          date: d.sale_date,
          total_sales: d.total_sales || 0,
          total_cost: d.total_cost || 0,
          item_count: d.item_count || 0,
          gross_profit: d.gross_profit || 0
        })).sort((a, b) => a.date.localeCompare(b.date)));
      }
    } catch (err) {
      console.error('日別売上取得エラー:', err);
      // ダミーデータ
      const days = getDaysBetween(new Date(startDate), new Date(endDate));
      const dummyData = days.map(date => ({
        date: date.toISOString().split('T')[0],
        total_sales: Math.floor(Math.random() * 30000) + 10000,
        total_cost: Math.floor(Math.random() * 15000) + 5000,
        item_count: Math.floor(Math.random() * 50) + 20,
        gross_profit: Math.floor(Math.random() * 15000) + 5000
      }));
      setDailySales(dummyData);
    }
  };

  // 週別売上を取得（ダミーデータ）
  const fetchWeeklySales = async () => {
    const weeks = getWeeksBetween(new Date(startDate), new Date(endDate));
    const dummyData: WeeklySales[] = weeks.map((week, index) => ({
      week: `第${index + 1}週`,
      total_sales: Math.floor(Math.random() * 100000) + 50000,
      item_count: Math.floor(Math.random() * 200) + 100
    }));
    setWeeklySales(dummyData);
  };

  // 月別売上を取得（ダミーデータ）
  const fetchMonthlySales = async () => {
    const months = getMonthsBetween(new Date(startDate), new Date(endDate));
    const dummyData: MonthlySales[] = months.map(month => ({
      month: `${month}月`,
      total_sales: Math.floor(Math.random() * 400000) + 200000,
      gross_profit: Math.floor(Math.random() * 200000) + 100000
    }));
    setMonthlySales(dummyData);
  };

  // 商品別売上を取得
  const fetchProductSales = async () => {
    try {
      const res = await fetch(`/api/sales?action=product_sales&start_date=${startDate}&end_date=${endDate}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const productMap = new Map<number, ProductSales>();
        data.forEach((d: any) => {
          const productId = d.product_id;
          const productName = d.products?.name || `商品${productId}`;
          
          if (productMap.has(productId)) {
            const existing = productMap.get(productId)!;
            existing.quantity_sold += d.quantity_sold || 0;
            existing.total_sales += d.total_sales || 0;
          } else {
            productMap.set(productId, {
              product_id: productId,
              product_name: productName,
              quantity_sold: d.quantity_sold || 0,
              total_sales: d.total_sales || 0
            });
          }
        });
        
        setProductSales(Array.from(productMap.values()).sort((a, b) => b.total_sales - a.total_sales));
      }
    } catch (err) {
      console.error('商品別売上取得エラー:', err);
      // ダミーデータ
      const products = ['コーヒー', '紅茶', 'ケーキ', 'サンドイッチ', 'クッキー', 'マフィン', 'スムージー', 'ジュース'];
      const dummyData: ProductSales[] = products.map((name, index) => ({
        product_id: index + 1,
        product_name: name,
        quantity_sold: Math.floor(Math.random() * 100) + 20,
        total_sales: Math.floor(Math.random() * 50000) + 10000
      })).sort((a, b) => b.total_sales - a.total_sales);
      setProductSales(dummyData);
    }
  };

  // ヘルパー関数
  const getDaysBetween = (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const getWeeksBetween = (start: Date, end: Date) => {
    const weeks: { start: string; end: string }[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        start: weekStart.toISOString().split('T')[0],
        end: (weekEnd > end ? end : weekEnd).toISOString().split('T')[0]
      });
      
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  };

  const getMonthsBetween = (start: Date, end: Date): number[] => {
    const months: number[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      months.push(current.getMonth() + 1);
      current.setMonth(current.getMonth() + 1);
    }
    return [...new Set(months)];
  };

  // グラフの最大値を計算
  const hourlyMax = useMemo(() => Math.max(...hourlySales.map(h => h.sales), 1), [hourlySales]);
  const dailyMax = useMemo(() => Math.max(...dailySales.map(d => d.total_sales), 1), [dailySales]);
  const weeklyMax = useMemo(() => Math.max(...weeklySales.map(w => w.total_sales), 1), [weeklySales]);
  const monthlyMax = useMemo(() => Math.max(...monthlySales.map(m => m.total_sales), 1), [monthlySales]);
  const productMax = useMemo(() => Math.max(...productSales.map(p => p.total_sales), 1), [productSales]);

  // 合計計算
  const getTotal = () => {
    switch (viewMode) {
      case 'hourly': return hourlySales.reduce((sum, h) => sum + h.sales, 0);
      case 'daily': return dailySales.reduce((sum, d) => sum + d.total_sales, 0);
      case 'weekly': return weeklySales.reduce((sum, w) => sum + w.total_sales, 0);
      case 'monthly': return monthlySales.reduce((sum, m) => sum + m.total_sales, 0);
      case 'product': return productSales.reduce((sum, p) => sum + p.total_sales, 0);
      default: return 0;
    }
  };

  // CSVエクスポート
  const exportToCSV = () => {
    let csvContent = '';
    let fileName = '';

    switch (viewMode) {
      case 'hourly':
        csvContent = '時間帯,売上,件数\n' + hourlySales.map(h => `${h.hour}:00,${h.sales},${h.count}`).join('\n');
        fileName = `時間帯別売上_${selectedDate}.csv`;
        break;
      case 'daily':
        csvContent = '日付,売上,原価,販売個数,粗利\n' + dailySales.map(d => 
          `${d.date},${d.total_sales},${d.total_cost},${d.item_count},${d.gross_profit}`
        ).join('\n');
        fileName = `日別売上_${startDate}_${endDate}.csv`;
        break;
      case 'weekly':
        csvContent = '週,売上,販売個数\n' + weeklySales.map(w => `${w.week},${w.total_sales},${w.item_count}`).join('\n');
        fileName = `週別売上_${startDate}_${endDate}.csv`;
        break;
      case 'monthly':
        csvContent = '月,売上,粗利\n' + monthlySales.map(m => `${m.month},${m.total_sales},${m.gross_profit}`).join('\n');
        fileName = `月別売上_${startDate}_${endDate}.csv`;
        break;
      case 'product':
        csvContent = '商品名,販売個数,売上\n' + productSales.map(p => 
          `${p.product_name},${p.quantity_sold},${p.total_sales}`
        ).join('\n');
        fileName = `商品別売上_${startDate}_${endDate}.csv`;
        break;
    }

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 棒グラフコンポーネント
  const BarChart = ({ value, max, color, height = 'h-32' }: { value: number; max: number; color: string; height?: string }) => {
    const percentage = (value / max) * 100;
    return (
      <div className={`${height} flex items-end`}>
        <div
          className="w-full rounded-t-lg transition-all duration-500"
          style={{ 
            height: `${percentage}%`,
            backgroundColor: color,
            minHeight: '4px'
          }}
        />
      </div>
    );
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: textColor }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/dashboard/accounting/menu" className="p-2 -ml-2 rounded-lg hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold">売上グラフ</h1>
          </div>
          <button
            onClick={exportToCSV}
            className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold"
            style={{ backgroundColor: accentColor, color: '#ffffff' }}
          >
            CSV
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 表示モード切替 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'hourly', label: '時間', icon: '🕐' },
            { id: 'daily', label: '日別', icon: '📅' },
            { id: 'weekly', label: '週別', icon: '📊' },
            { id: 'monthly', label: '月別', icon: '📈' },
            { id: 'product', label: '商品', icon: '🏆' },
            { id: 'comparison', label: '比較', icon: '⚖️' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as typeof viewMode)}
              className="px-3 sm:px-4 py-2 rounded-xl border whitespace-nowrap transition-all text-sm"
              style={{
                backgroundColor: viewMode === mode.id ? accentColor : cardBg,
                borderColor: viewMode === mode.id ? accentColor : borderColor,
                color: viewMode === mode.id ? '#ffffff' : textColor
              }}
            >
              <span className="hidden sm:inline">{mode.icon} </span>{mode.label}
            </button>
          ))}
        </div>

        {/* グラフタイプ切替 */}
        {viewMode !== 'comparison' && viewMode !== 'product' && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setChartType('bar')}
              className="flex-1 sm:flex-none sm:px-6 py-2 rounded-xl border transition-all text-sm"
              style={{
                backgroundColor: chartType === 'bar' ? secondaryColor : cardBg,
                borderColor: chartType === 'bar' ? secondaryColor : borderColor,
                color: chartType === 'bar' ? '#ffffff' : textColor
              }}
            >
              📊 棒グラフ
            </button>
            <button
              onClick={() => setChartType('line')}
              className="flex-1 sm:flex-none sm:px-6 py-2 rounded-xl border transition-all text-sm"
              style={{
                backgroundColor: chartType === 'line' ? secondaryColor : cardBg,
                borderColor: chartType === 'line' ? secondaryColor : borderColor,
                color: chartType === 'line' ? '#ffffff' : textColor
              }}
            >
              📈 折れ線
            </button>
          </div>
        )}

        {/* 日付選択 - スマホ対応 */}
        <div className="mb-6 p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
          {viewMode === 'hourly' ? (
            <div>
              <label className="block text-xs sm:text-sm mb-2" style={{ color: mutedColor }}>日付選択</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base"
                style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
              />
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm mb-2" style={{ color: mutedColor }}>開始日</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base"
                  style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm mb-2" style={{ color: mutedColor }}>終了日</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base"
                  style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 合計表示 */}
        <div className="mb-6 p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base" style={{ color: mutedColor }}>
              {viewMode === 'hourly' ? '日計売上' : '期間合計売上'}
            </span>
            <span className="text-xl sm:text-2xl font-bold" style={{ color: accentColor }}>
              ¥{getTotal().toLocaleString()}
            </span>
          </div>
        </div>

        {/* グラフ表示 */}
        {viewMode === 'hourly' && chartType === 'bar' && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-semibold mb-4">時間帯別売上（{selectedDate}）</h2>
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {hourlySales.map((item) => (
                <div key={item.hour} className="flex flex-col items-center">
                  <BarChart value={item.sales} max={hourlyMax} color={accentColor} height="h-32 sm:h-40" />
                  <div className="mt-2 text-center">
                    <div className="text-xs sm:text-sm font-medium">{item.hour}時</div>
                    <div className="text-xs mt-1" style={{ color: mutedColor }}>¥{(item.sales / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
              <div className="text-xs sm:text-sm" style={{ color: mutedColor }}>営業時間: 11:00 〜 16:00</div>
            </div>
          </div>
        )}

        {viewMode === 'hourly' && chartType === 'line' && (
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold mb-4">時間帯別売上（{selectedDate}）</h2>
            <p className="text-xs sm:text-sm mb-4" style={{ color: mutedColor }}>営業時間: 11:00 〜 16:00</p>
            {hourlySales.map((item) => (
              <div key={item.hour} className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base font-medium">{item.hour}:00 〜 {item.hour + 1}:00</span>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-semibold">¥{item.sales.toLocaleString()}</span>
                    <span className="text-xs sm:text-sm ml-2" style={{ color: mutedColor }}>({item.count}件)</span>
                  </div>
                </div>
                <div className="h-4 sm:h-6 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#333' : '#e5e7eb' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.sales / hourlyMax) * 100}%`, backgroundColor: accentColor }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'daily' && chartType === 'bar' && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-semibold mb-4">日別売上推移</h2>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-2 sm:gap-3 min-w-max">
                {dailySales.map((item) => (
                  <div key={item.date} className="flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
                    <BarChart value={item.total_sales} max={dailyMax} color={secondaryColor} height="h-32 sm:h-40" />
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium">{item.date.split('-')[2]}日</div>
                      <div className="text-xs mt-1" style={{ color: mutedColor }}>¥{(item.total_sales / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'daily' && chartType === 'line' && (
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold mb-4">日別売上推移</h2>
            {dailySales.map((item) => (
              <div key={item.date} className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm sm:text-base font-medium">{item.date}</span>
                    <span className="text-xs sm:text-sm ml-2" style={{ color: mutedColor }}>({item.item_count}個)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-semibold">¥{item.total_sales.toLocaleString()}</span>
                    <span className="text-xs sm:text-sm ml-2" style={{ color: accentColor }}>
                      利益 ¥{item.gross_profit.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="h-4 sm:h-6 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#333' : '#e5e7eb' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.total_sales / dailyMax) * 100}%`, backgroundColor: secondaryColor }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'weekly' && chartType === 'bar' && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-semibold mb-4">週別売上推移</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
              {weeklySales.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <BarChart value={item.total_sales} max={weeklyMax} color={warningColor} height="h-32 sm:h-40" />
                  <div className="mt-2 text-center">
                    <div className="text-xs sm:text-sm font-medium">{item.week}</div>
                    <div className="text-xs mt-1" style={{ color: mutedColor }}>¥{(item.total_sales / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'weekly' && chartType === 'line' && (
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold mb-4">週別売上推移</h2>
            {weeklySales.map((item, index) => (
              <div key={index} className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm sm:text-base font-medium">{item.week}</span>
                    <span className="text-xs sm:text-sm ml-2" style={{ color: mutedColor }}>({item.item_count}個)</span>
                  </div>
                  <span className="text-sm sm:text-base font-semibold">¥{item.total_sales.toLocaleString()}</span>
                </div>
                <div className="h-4 sm:h-6 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#333' : '#e5e7eb' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.total_sales / weeklyMax) * 100}%`, backgroundColor: warningColor }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'monthly' && chartType === 'bar' && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-semibold mb-4">月別売上推移</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {monthlySales.map((item) => (
                <div key={item.month} className="flex flex-col items-center">
                  <BarChart value={item.total_sales} max={monthlyMax} color="#8b5cf6" height="h-32 sm:h-40" />
                  <div className="mt-2 text-center">
                    <div className="text-xs sm:text-sm font-medium">{item.month}</div>
                    <div className="text-xs mt-1" style={{ color: mutedColor }}>¥{(item.total_sales / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'monthly' && chartType === 'line' && (
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold mb-4">月別売上推移</h2>
            {monthlySales.map((item) => (
              <div key={item.month} className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base font-medium text-lg">{item.month}</span>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-semibold">¥{item.total_sales.toLocaleString()}</span>
                    <span className="text-xs sm:text-sm ml-2" style={{ color: accentColor }}>
                      利益 ¥{item.gross_profit.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="h-6 sm:h-8 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#333' : '#e5e7eb' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.total_sales / monthlyMax) * 100}%`, backgroundColor: '#8b5cf6' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'product' && (
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold mb-4">商品別売上ランキング</h2>
            {productSales.map((item, index) => (
              <div key={item.product_id} className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold"
                      style={{
                        backgroundColor: index < 3 ? accentColor : borderColor,
                        color: index < 3 ? '#ffffff' : textColor
                      }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-sm sm:text-base font-medium">{item.product_name}</span>
                      <span className="text-xs sm:text-sm ml-2" style={{ color: mutedColor }}>({item.quantity_sold}個)</span>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-semibold">¥{item.total_sales.toLocaleString()}</span>
                </div>
                <div className="h-3 sm:h-4 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#333' : '#e5e7eb' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.total_sales / productMax) * 100}%`, backgroundColor: index < 3 ? accentColor : secondaryColor }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'comparison' && (
          <div className="space-y-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">期間比較</h2>
            
            {/* 売上 vs 利益 */}
            <div className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
              <h3 className="text-sm sm:text-base font-semibold mb-4">売上 vs 粗利</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2 text-sm sm:text-base">
                    <span style={{ color: mutedColor }}>売上</span>
                    <span className="font-semibold">¥{dailySales.reduce((s, d) => s + d.total_sales, 0).toLocaleString()}</span>
                  </div>
                  <div className="h-5 sm:h-6 rounded-full" style={{ backgroundColor: secondaryColor }} />
                </div>
                <div>
                  <div className="flex justify-between mb-2 text-sm sm:text-base">
                    <span style={{ color: mutedColor }}>粗利</span>
                    <span className="font-semibold">¥{dailySales.reduce((s, d) => s + d.gross_profit, 0).toLocaleString()}</span>
                  </div>
                  <div className="h-5 sm:h-6 rounded-full" style={{ backgroundColor: accentColor }} />
                </div>
              </div>
            </div>

            {/* トップ3商品 */}
            <div className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
              <h3 className="text-sm sm:text-base font-semibold mb-4">🏆 売上トップ3</h3>
              <div className="space-y-2">
                {productSales.slice(0, 3).map((item, index) => (
                  <div key={item.product_id} className="flex items-center justify-between text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl">{['🥇', '🥈', '🥉'][index]}</span>
                      <span className="font-medium">{item.product_name}</span>
                    </div>
                    <span style={{ color: mutedColor }}>¥{item.total_sales.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 下部ナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 border-t z-40" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-5 h-16">
            <Link href="/dashboard/accounting/menu" className="flex flex-col items-center justify-center gap-1">
              <svg className="w-6 h-6" fill={textColor} stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold" style={{ color: textColor }}>会計部</span>
            </Link>
            <Link href="/dashboard/dev/menu" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>開発部</span>
            </Link>
            <Link href="/dashboard/pr/menu" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>広報部</span>
            </Link>
            <Link href="/dashboard/staff" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>スタッフ</span>
            </Link>
            <Link href="/account" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>設定</span>
            </Link>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
