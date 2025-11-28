'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Daily = { date: string; total: number };
type Monthly = { month: string; total: number };
type TimeSlots = Record<string, number>;
type Product = {
  productId: number;
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  profitRate: number;
  quantity: number;
};

type Summary = {
  totalAmount: number;
  todayTotal: number;
  dailySales: Daily[];
  monthlySales: Monthly[];
  timeSlots: TimeSlots;
  productRanking: Product[];
  currentMonthSales: number;
  prevMonthSales: number;
  lastYearMonthSales: number;
  costRate: number;
};

const formatRatio = (current: number, previous: number) => {
  if (!previous) return 'N/A';
  const diff = ((current - previous) / previous) * 100;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}%`;
};

const buildLinePath = (points: [number, number][]) => {
  if (points.length < 2) return '';
  const cmds = [`M ${points[0][0]} ${points[0][1]}`];
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    cmds.push(`L ${x} ${y}`);
  }
  return cmds.join(' ');
};

function SmoothLineChart({ data, height = 180, strokeColor = '#000000' }: { data: Daily[]; height?: number; strokeColor?: string }) {
  if (!data.length) return <p className="text-sm" style={{ color: '#737373' }}>データなし</p>;
  const width = 600;
  const labelArea = 30;
  const max = Math.max(...data.map((d) => d.total));
  const points = data.map((d, idx) => {
    const x = (idx / Math.max(1, data.length - 1)) * width;
    const y = max ? height - (d.total / max) * height : height;
    return [x, y] as [number, number];
  });
  const path = buildLinePath(points);

  const formatLabel = (raw: string) => {
    if (!raw) return '';
    return raw.length >= 10 ? raw.slice(5) : raw;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height + labelArea}`} className="w-full h-52">
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill={strokeColor} />
          <text x={x} y={height + 18} textAnchor="middle" className="text-[10px]" fill="#737373">
            {formatLabel(data[i]?.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function AccountingDashboard() {
  const [isDark, setIsDark] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const stored = window.localStorage.getItem('ui-is-dark');
    
    const currentIsDark = isMobile ? media.matches : (stored === 'true' ? true : stored === 'false' ? false : media.matches);
    setIsDark(currentIsDark);
    
    document.documentElement.classList.toggle('dark', currentIsDark);
    document.body.style.backgroundColor = currentIsDark ? '#000000' : '#ffffff';
    document.body.style.color = currentIsDark ? '#ffffff' : '#000000';
  }, []);

  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const cardBg = isDark ? '#000000' : '#ffffff';

  const load = useCallback(
    async (isInitial = false) => {
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await fetch('/api/analytics/sales', { cache: 'no-store' });
        const data = await res.json();
        if (!data.error) setSummary(data);
      } catch (error) {
        console.error('売上サマリー取得エラー:', error);
      } finally {
        if (isInitial) setLoading(false);
        else setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    load(true);
    timer = setInterval(() => load(false), 30000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [load]);

  const timeSlotEntries = useMemo(() => {
    const hours = [11, 12, 13, 14, 15, 16];
    if (!summary?.timeSlots) return hours.map((h) => [String(h), 0] as [string, number]);
    return hours.map((h) => [String(h), summary.timeSlots[String(h)] ?? 0] as [string, number]);
  }, [summary]);

  const timeSlotTotal = useMemo(() => {
    if (!timeSlotEntries.length) return 0;
    return timeSlotEntries.reduce((sum, [, v]) => sum + v, 0);
  }, [timeSlotEntries]);

  const maxTimeSlot = useMemo(() => {
    if (!timeSlotEntries.length) return 0;
    return Math.max(...timeSlotEntries.map(([, v]) => v));
  }, [timeSlotEntries]);

  const topDays = useMemo(() => {
    if (!summary?.dailySales?.length) return [];
    return [...summary.dailySales].sort((a, b) => b.total - a.total).slice(0, 5);
  }, [summary]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor, color: textColor }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mb-4" style={{ borderColor: borderColor, borderTopColor: 'transparent' }}></div>
          <div className="text-xl" style={{ color: mutedColor }}>読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="sticky top-0 z-10 border-b backdrop-blur" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cardBg, border: `2px solid ${borderColor}` }}>
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: textColor }}>会計部</h1>
              <p className="text-sm" style={{ color: mutedColor }}>売上・時間帯別・ランキングを確認</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(false)}
              disabled={refreshing}
              className="px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60"
              style={{ backgroundColor: cardBg, borderColor, color: textColor }}
            >
              {refreshing ? 'リロード中…' : '最新データを再読込'}
            </button>
            <Link
              href="/accounting/sales"
              className="px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 text-sm"
              style={{ backgroundColor: cardBg, borderColor, color: textColor }}
            >
              <span>売上を入力</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Link href="/dashboard/accounting" className="p-4 rounded-xl border transition" style={{ borderColor, backgroundColor: cardBg }}>
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>ダッシュボード</h2>
            <p className="text-sm" style={{ color: mutedColor }}>売上推移・時間帯・ランキングを閲覧</p>
          </Link>
          <Link href="/accounting/sales" className="p-4 rounded-xl border transition" style={{ borderColor, backgroundColor: cardBg }}>
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>売上入力</h2>
            <p className="text-sm" style={{ color: mutedColor }}>手動入力で金額と日時を登録</p>
          </Link>
          <Link href="/dashboard/accounting#ranking" className="p-4 rounded-xl border transition" style={{ borderColor, backgroundColor: cardBg }}>
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>ランキング</h2>
            <p className="text-sm" style={{ color: mutedColor }}>メニュー別売上トップを確認</p>
          </Link>
          <div className="p-4 rounded-xl border border-dashed" style={{ borderColor, opacity: 0.6 }}>
            <h2 className="text-lg font-semibold" style={{ color: mutedColor }}>今後追加するメニュー</h2>
            <p className="text-sm" style={{ color: mutedColor }}>分析系の追加メニューをここに並べます。</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border p-5" style={{ backgroundColor: cardBg, borderColor }}>
              <p className="text-sm mb-2" style={{ color: mutedColor }}>今日の売上</p>
              <div className="text-3xl font-bold" style={{ color: textColor }}>¥{summary.todayTotal.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl border p-5" style={{ backgroundColor: cardBg, borderColor }}>
              <p className="text-sm mb-2" style={{ color: mutedColor }}>今月の売上</p>
              <div className="text-3xl font-bold" style={{ color: textColor }}>¥{summary.currentMonthSales.toLocaleString()}</div>
              <p className="text-xs mt-1" style={{ color: mutedColor }}>前月比 {formatRatio(summary.currentMonthSales, summary.prevMonthSales)}</p>
              <p className="text-xs" style={{ color: mutedColor }}>前年同月比 {formatRatio(summary.currentMonthSales, summary.lastYearMonthSales)}</p>
            </div>
            <div className="rounded-2xl border p-5" style={{ backgroundColor: cardBg, borderColor }}>
              <p className="text-sm mb-2" style={{ color: mutedColor }}>累計売上</p>
              <div className="text-3xl font-bold" style={{ color: textColor }}>¥{summary.totalAmount.toLocaleString()}</div>
              <p className="text-xs" style={{ color: mutedColor }}>原価率：{summary.costRate.toFixed(1)}%</p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: textColor }}>日次推移</h2>
            <span className="text-sm" style={{ color: mutedColor }}>直近データ</span>
          </div>
          <SmoothLineChart data={summary?.dailySales?.slice(-30) || []} strokeColor={textColor} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: textColor }}>月次推移</h2>
              <span className="text-sm" style={{ color: mutedColor }}>直近6か月</span>
            </div>
            {!summary?.monthlySales?.length ? (
              <p style={{ color: mutedColor }}>データなし</p>
            ) : (
              <SmoothLineChart
                data={summary.monthlySales
                  .sort((a, b) => (a.month > b.month ? 1 : -1))
                  .slice(-6)
                  .map((m) => ({ date: m.month, total: m.total }))}
                height={200}
                strokeColor={textColor}
              />
            )}
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: textColor }}>時間帯別売上</h2>
              <span className="text-sm" style={{ color: mutedColor }}>1時間刻み</span>
            </div>
            {!timeSlotEntries.length ? (
              <p style={{ color: mutedColor }}>データなし</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {timeSlotEntries.map(([slot, amount]) => {
                    const ratio = maxTimeSlot ? (amount / maxTimeSlot) * 100 : 0;
                    const hour = Number.isFinite(Number(slot)) ? `${String(parseInt(slot)).padStart(2, '0')}:00` : slot;
                    return (
                      <div key={slot} className="rounded-xl border p-3" style={{ backgroundColor: cardBg, borderColor }}>
                        <p className="text-xs mb-1" style={{ color: mutedColor }}>{hour}</p>
                        <div className="h-24 flex items-end">
                          <div className="w-full rounded-t-md" style={{ height: `${Math.min(100, ratio)}%`, backgroundColor: textColor }} />
                        </div>
                        <p className="text-xs mt-1" style={{ color: mutedColor }}>¥{Math.round(amount).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between mb-4" id="ranking">
            <h2 className="text-xl font-semibold" style={{ color: textColor }}>メニュー別 売上ランキング</h2>
            <span className="text-sm" style={{ color: mutedColor }}>TOP 10</span>
          </div>
          {!summary?.productRanking?.length ? (
            <p style={{ color: mutedColor }}>データなし</p>
          ) : (
            <div className="space-y-3">
              {summary.productRanking.map((p, idx) => (
                <div
                  key={p.productId}
                  className="flex items-center gap-3 rounded-xl border p-3"
                  style={{ backgroundColor: cardBg, borderColor }}
                >
                  <span className="text-sm font-semibold w-6 text-right" style={{ color: textColor }}>{idx + 1}.</span>
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: textColor }}>{p.name}</div>
                    <div className="text-xs" style={{ color: mutedColor }}>
                      個数 {p.quantity} / 利益率 {p.profitRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: textColor }}>¥{p.revenue.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: mutedColor }}>粗利 ¥{p.profit.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
