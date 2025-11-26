'use client';

import Link from 'next/link';
import { useUiTheme } from '@/hooks/useUiTheme';

export default function AccountingMenu() {
  useUiTheme();
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">会計部メニュー</h1>
          <p className="text-sm text-muted-foreground">売上ダッシュボードや会計ページへの入り口です。</p>
        </div>
        <Link href="/" className="text-sm px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition">
          ホームへ戻る
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/accounting" className="rounded-xl border border-border bg-card hover:bg-muted transition p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">売上ダッシュボード</p>
          <h2 className="text-lg font-semibold">売上・詳細分析を見る</h2>
        </Link>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-muted-foreground">
          <p className="text-sm mb-1">追加予定</p>
          <p className="text-base">レポート出力</p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-muted-foreground">
          <p className="text-sm mb-1">追加予定</p>
          <p className="text-base">コスト管理</p>
        </div>
      </div>
    </div>
  );
}
