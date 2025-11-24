'use client';

import Link from 'next/link';

export default function PrDashboardPlaceholder() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-xl w-full p-8 bg-card border border-border rounded-2xl shadow-lg text-center space-y-4">
        <h1 className="text-2xl font-bold">広報部ダッシュボード</h1>
        <p className="text-muted-foreground">
          ここに広報施策の効果測定やSNS指標のダッシュボードを配置予定です。
        </p>
        <Link href="/" className="inline-flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-xl">
          ホームへ戻る
        </Link>
      </div>
    </div>
  );
}
