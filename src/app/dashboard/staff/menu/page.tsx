'use client';

import Link from 'next/link';
import { useUiTheme } from '@/hooks/useUiTheme';

export default function StaffMenu() {
  useUiTheme();
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">店舗スタッフメニュー</h1>
          <p className="text-sm text-muted-foreground">勤怠やシフトをスタッフ自身で記録・確認できます。</p>
        </div>
        <Link href="/" className="text-sm px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition">
          ホームへ戻る
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/staff" className="rounded-xl border border-border bg-card hover:bg-muted transition p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">勤怠管理</p>
          <h2 className="text-lg font-semibold">出勤・退勤を記録</h2>
        </Link>
        <div className="rounded-xl border border-border bg-card/50 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">シフト管理</p>
          <h2 className="text-lg font-semibold text-foreground">（準備中）</h2>
          <p className="text-sm text-muted-foreground mt-2">シフト登録・確認機能をここに追加予定です。</p>
        </div>
      </div>
    </div>
  );
}
