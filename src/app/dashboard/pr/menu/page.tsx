'use client';

import Link from 'next/link';

export default function PrMenu() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">広報部メニュー</h1>
        <p className="text-sm text-muted-foreground">ホームページ編集やブログ編集への入口です。</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/pr"
          className="rounded-xl border border-border bg-card hover:bg-muted transition p-4 shadow-sm"
        >
          <p className="text-sm text-muted-foreground mb-1">ホームページ編集</p>
          <h2 className="text-lg font-semibold">公式サイト・SNSキャンペーン</h2>
        </Link>
        <Link
          href="/dashboard/pr/blogs"
          className="rounded-xl border border-border bg-card hover:bg-muted transition p-4 shadow-sm"
        >
          <p className="text-sm text-muted-foreground mb-1">ブログ編集</p>
          <h2 className="text-lg font-semibold">記事・画像の更新</h2>
        </Link>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-muted-foreground">
          <p className="text-sm mb-1">追加予定</p>
          <p className="text-base">SNS連携</p>
        </div>
      </div>
    </div>
  );
}
