'use client';

import Link from 'next/link';
import { useUiTheme } from '@/hooks/useUiTheme';

export default function PrMenu() {
  useUiTheme();
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">広報部メニュー</h1>
          <p className="text-sm text-muted-foreground">ホームページ編集・UI編集・ブログ編集への入口です。</p>
        </div>
        <Link href="/" className="text-sm px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition">
          ホームへ戻る
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/pr/website" className="rounded-xl border border-border bg-card hover:bg-muted transition p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">ホームページ編集</p>
          <h2 className="text-lg font-semibold">トップ・ヘッダー・内容編集</h2>
        </Link>
        <Link href="/dashboard/pr/ui" className="rounded-xl border border-border bg-card hover:bg-muted transition p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">UI編集</p>
          <h2 className="text-lg font-semibold">配色・アイコンの変更</h2>
        </Link>
        <Link href="/dashboard/pr/blogs" className="rounded-xl border border-border bg-card hover:bg-muted transition p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">ブログ編集</p>
          <h2 className="text-lg font-semibold">記事・画像の更新</h2>
        </Link>
      </div>
    </div>
  );
}
