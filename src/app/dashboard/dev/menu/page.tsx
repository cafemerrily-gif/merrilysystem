'use client';

import Link from 'next/link';

export default function DevMenu() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">開発部メニュー</h1>
        <p className="text-sm text-muted-foreground">メニュー管理など開発部向けの入口です。</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/dev" className="rounded-xl border border-border bg-card hover:bg-muted transition p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">メニュー管理</p>
          <h2 className="text-lg font-semibold">カテゴリ・フォルダ・商品を管理</h2>
        </Link>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-muted-foreground">
          <p className="text-sm mb-1">追加予定</p>
          <p className="text-base">開発タスク</p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-muted-foreground">
          <p className="text-sm mb-1">追加予定</p>
          <p className="text-base">リリースノート</p>
        </div>
      </div>
    </div>
  );
}
