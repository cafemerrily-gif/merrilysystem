'use client';

import { useEffect, useMemo, useState } from 'react';
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
  customerCount: number | null;
  averageSpend: number | null;
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

const buildSmoothPath = (points: [number, number][]) => {
  if (points.length < 2) return '';
  const d: string[] = [];
  d.push(`M ${points[0][0]} ${points[0][1]}`);
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    d.push(`Q ${cx} ${y0}, ${x1} ${y1}`);
  }
  return d.join(' ');
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
  const path = buildSmoothPath(points);

  const formatLabel = (raw: string) => {
    if (!raw) return '';
    return raw.length >= 10 ? raw.slice(5) : raw; // 日次はMM-DD、月次はYYYY-MM
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

  useEffect(() => {
    let timer: NodeJS.Timer | null = null;

    const load = async () => {
      try {
        const res = await fetch('/api/analytics/sales');
        const data = await res.json();
        if (!data.error) setSummary(data);
      } catch (error) {
        console.error('売上サマリー取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
    timer = setInterval(load, 30000); // 定期リフレッシュでグラフを自動反映
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const timeSlotTotal = useMemo(() => {
    if (!summary?.timeSlots) return 0;
    return Object.values(summary.timeSlots).reduce((a, b) => a + b, 0);
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
              <p className="text-sm text-muted-foreground">売上・時間帯別やランキングを確認</p>
            </div>
          </div>
          <Link
            href="/accounting/sales"
            className="px-4 py-3 bg-card border border-border hover:border-accent rounded-xl transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>売上を入力</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-muted-foreground mb-2">今日の売上</p>
              <div className="text-3xl font-bold text-foreground">\{summary.todayTotal.toLocaleString()}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-muted-foreground mb-2">今月の売上</p>
              <div className="text-3xl font-bold text-foreground">\{summary.currentMonthSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">前月比 {formatRatio(summary.currentMonthSales, summary.prevMonthSales)}</p>
              <p className="text-xs text-muted-foreground">前年同月比 {formatRatio(summary.currentMonthSales, summary.lastYearMonthSales)}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-muted-foreground mb-2">累計売上</p>
              <div className="text-3xl font-bold text-foreground">\{summary.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">原価率（試算） {summary.costRate.toFixed(1)}%</p>
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
              <h2 className="text-xl font-semibold">月次推移（カーブ表示）</h2>
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
            {!summary?.timeSlots ? (
              <p className="text-muted-foreground">データなし</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(summary.timeSlots).map(([slot, amount]) => {
                  const ratio = timeSlotTotal ? (amount / timeSlotTotal) * 100 : 0;
                  return (
                    <div key={slot} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{timeSlotLabels[slot] || slot}</span>
                        <span className="text-muted-foreground">\{amount.toLocaleString()} ({ratio.toFixed(1)}%)</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">メニュー別売上ランキング</h2>
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
                      <div className="text-sm font-bold">\{p.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">粗利 \{p.profit.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-3">
            <h2 className="text-xl font-semibold">客数と客単価</h2>
            {summary?.customerCount == null ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/40 rounded-xl text-sm text-yellow-900 dark:text-yellow-200">
                客数データがスキーマに無いため計算できません。<br />
                対応するには: sales テーブルに guest_count を追加し、入力フォームに項目を足してください。
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground">客数</p>
                  <p className="text-2xl font-bold">{summary.customerCount}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground">客単価</p>
                  <p className="text-2xl font-bold">
                    {summary.averageSpend !== null ? `\\${summary.averageSpend.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </div>
            )}
            <div className="bg-muted/40 rounded-xl p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">原価率（試算）</p>
              <p className="text-2xl font-bold">{summary?.costRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                原価率が高止まりしていないかを確認してください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
