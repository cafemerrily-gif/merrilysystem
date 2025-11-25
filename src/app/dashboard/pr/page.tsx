'use client';

import Link from 'next/link';

export default function PrDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-2xl w-full p-8 bg-card border border-border rounded-2xl shadow-lg space-y-6 text-center">
        <h1 className="text-3xl font-bold">広報部ダッシュボード</h1>
        <p className="text-muted-foreground">
          公式ホームページやSNSキャンペーンの編集スペースです。下のボタンからホームページ編集やブログ編集へ進めます。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/pr/website"
            className="inline-flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-xl border border-border hover:opacity-90"
          >
            ホームページを編集
          </Link>
          <Link
            href="/dashboard/pr/blogs"
            className="inline-flex items-center justify-center px-4 py-3 bg-card text-foreground rounded-xl border border-border hover:border-accent"
          >
            ブログを編集
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-3 bg-card text-foreground rounded-xl border border-border hover:border-accent"
          >
            ホームへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
