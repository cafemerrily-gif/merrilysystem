'use client';

import Link from 'next/link';

export default function StaffMenu() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">店舗スタッフメニュー</h1>
        <p className="text-sm text-muted-foreground">勤怠記録やスタッフ向け機能への入口です。</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/staff"
          className="rounded-xl border border-border bg-card hover:bg-muted transition p-4 shadow-sm"
        >
          <p className="text-sm text-muted-foreground mb-1">勤怠記録</p>
          <h2 className="text-lg font-semibold">出勤・退勤を記録</h2>
        </Link>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-muted-foreground">
          <p className="text-sm mb-1">追加予定</p>
          <p className="text-base">シフト管理</p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-muted-foreground">
          <p className="text-sm mb-1">追加予定</p>
          <p className="text-base">連絡掲示板</p>
        </div>
      </div>
    </div>
  );
}
