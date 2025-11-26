'use client';

import Link from 'next/link';

export default function StaffMenu() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">店舗スタッフメニュー</h1>
          <p className="text-sm text-muted-foreground">勤怠記録やスタッフ向け機能への入口です。</p>
        </div>
        <Link href="/" className="text-sm px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition">
          ホームへ戻る
        </Link>
      </div>
      <div className="rounded-xl border border-border bg-card/50 p-6 text-center text-muted-foreground">
        現在準備中です。必要な機能が決まり次第ここにメニューを配置します。
      </div>
    </div>
  );
}
