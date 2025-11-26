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

const timeSlotLabels: Record<string, string> = {
  morning: 'モーニング',
  lunch: 'ランチ',
  afternoon: '午後',
  evening: '夜',
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

function SmoothLineChart({ data, height = 180 }: { data: Daily[]; height?: number }) {
  if (!data.length) return <p className="text-sm text-muted-foreground">データなし</p>;
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
    return raw.length >= 10 ? raw.slice(5) : raw; // 日次:MM-DD / 月次:YYYY-MM
  };

  return (
    <svg viewBox={`0 0 ${width} ${height + labelArea}`} className="w-full h-52">
      <path
        d={path}
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="hsl(var(--primary))" />
          <text
            x={x}
            y={height + 18}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {formatLabel(data[i]?.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function AccountingDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isInitial = false) => {
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await fetch('/api/analytics/sales');
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
    if (!summary?.timeSlots) return [];
    return Object.entries(summary.timeSlots);
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-4"></div>
          <div className="text-xl text-muted-foreground">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <span className="text-2xl" aria-hidden>
                📊
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">会計部</h1>
              <p className="text-sm text-muted-foreground">売上・時間帯別・ランキングを確認</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(false)}
              disabled={refreshing}
              className="px-4 py-3 bg-card border border-border hover:border-accent rounded-xl transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60"
            >
              {refreshing ? 'リロード中…' : '最新データを再読込'}
            </button>
            <Link
              href="/accounting/sales"
              className="px-4 py-3 bg-card border border-border hover:border-accent rounded-xl transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <span>売上を入力</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-muted-foreground mb-2">今日の売上</p>
              <div className="text-3xl font-bold text-foreground">¥{summary.todayTotal.toLocaleString()}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-muted-foreground mb-2">今月の売上</p>
              <div className="text-3xl font-bold text-foreground">¥{summary.currentMonthSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">前月比 {formatRatio(summary.currentMonthSales, summary.prevMonthSales)}</p>
              <p className="text-xs text-muted-foreground">前年同月比 {formatRatio(summary.currentMonthSales, summary.lastYearMonthSales)}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-muted-foreground mb-2">累計売上</p>
              <div className="text-3xl font-bold text-foreground">¥{summary.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">原価率試算：{summary.costRate.toFixed(1)}%</p>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">日次推移</h2>
            <span className="text-sm text-muted-foreground">直近データ</span>
          </div>
          <SmoothLineChart data={summary?.dailySales?.slice(-30) || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">月次推移</h2>
              <span className="text-sm text-muted-foreground">直近6か月</span>
            </div>
            {!summary?.monthlySales?.length ? (
              <p className="text-muted-foreground">データなし</p>
            ) : (
              <SmoothLineChart
                data={summary.monthlySales
                  .sort((a, b) => (a.month > b.month ? 1 : -1))
                  .slice(-6)
                  .map((m) => ({ date: m.month, total: m.total }))}
                height={200}
              />
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">時間帯別売上</h2>
              <span className="text-sm text-muted-foreground">比率</span>
            </div>
            {!timeSlotEntries.length ? (
              <p className="text-muted-foreground">データなし</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timeSlotEntries.map(([slot, amount]) => {
                    const ratio = maxTimeSlot ? (amount / maxTimeSlot) * 100 : 0;
                    return (
                      <div key={slot} className="bg-muted/40 rounded-xl p-3 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">{timeSlotLabels[slot] || slot}</p>
                        <div className="h-24 flex items-end">
                          <div
                            className="w-full bg-gradient-to-t from-primary to-accent rounded-t-md"
                            style={{ height: `${Math.min(100, ratio)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          ¥{Math.round(amount).toLocaleString()} / {ratio.toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  棒の高さは時間帯別の最大値を100%として比較しています（合計 {timeSlotTotal ? `¥${timeSlotTotal.toLocaleString()}` : '0'}）。
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-semibold">詳細分析</h2>

            <div>
              <p className="text-sm text-muted-foreground mb-2">日次移動平均（7日）</p>
              {summary?.dailySales?.length ? (
                <SmoothLineChart
                  data={summary.dailySales.slice(-30).map((d, idx, arr) => {
                    const start = Math.max(0, idx - 6);
                    const slice = arr.slice(start, idx + 1);
                    const avg = slice.reduce((s, v) => s + v.total, 0) / slice.length;
                    return { date: d.date, total: Math.round(avg) };
                  })}
                  height={180}
                />
              ) : (
                <p className="text-sm text-muted-foreground">データなし</p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">売上トップ日（直近30日）</p>
              {topDays.length ? (
                <div className="space-y-2">
                  {topDays.map((d, i) => (
                    <div key={d.date} className="flex items-center justify-between bg-muted/30 border border-border rounded-lg p-3">
                      <span className="text-sm text-muted-foreground">#{i + 1} {d.date}</span>
                      <span className="text-sm font-semibold text-foreground">¥{d.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">データなし</p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">月次成長率</p>
              {summary?.monthlySales?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {summary.monthlySales
                    .sort((a, b) => (a.month > b.month ? 1 : -1))
                    .slice(-6)
                    .map((m, idx, arr) => {
                      const prev = idx > 0 ? arr[idx - 1].total : null;
                      const growth = prev ? ((m.total - prev) / prev) * 100 : null;
                      return (
                        <div key={m.month} className="bg-muted/40 rounded-xl p-3 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">{m.month}</p>
                          <p className="text-sm font-semibold">¥{m.total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {growth !== null ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%` : 'N/A'}
                          </p>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">データなし</p>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">メニュー別 売上ランキング</h2>
              <span className="text-sm text-muted-foreground">TOP 10</span>
            </div>
            {!summary?.productRanking?.length ? (
              <p className="text-muted-foreground">データなし</p>
            ) : (
              <div className="space-y-3">
                {summary.productRanking.map((p, idx) => (
                  <div
                    key={p.productId}
                    className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl p-3"
                  >
                    <span className="text-sm font-semibold w-6 text-right">{idx + 1}.</span>
                    <div className="flex-1">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        個数 {p.quantity} / 利益率 {p.profitRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">¥{p.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">粗利 ¥{p.profit.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
