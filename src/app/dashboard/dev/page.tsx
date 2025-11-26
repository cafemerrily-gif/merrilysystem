'use client';

import Link from 'next/link';
import { useUiTheme } from '@/hooks/useUiTheme';

export default function DevDashboard() {
  useUiTheme();
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-4xl w-full p-8 bg-card border border-border rounded-2xl shadow-lg space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-2xl font-bold">開発部ダッシュボード</h1>
            <p className="text-muted-foreground mt-1">メニュー開発・商品運用の入り口一覧です。</p>
          </div>
          <Link href="/" className="inline-flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-xl">
            ホームへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/menu"
            className="group p-6 rounded-2xl border border-border bg-background hover:border-accent hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl">🍽</div>
              <div>
                <p className="text-sm text-muted-foreground">開発部 / 商品運用</p>
                <h2 className="text-xl font-semibold">メニュー管理</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              カテゴリー・商品を追加/編集/削除。価格やコストのメンテナンスを行います。
            </p>
          </Link>

          <div className="p-6 rounded-2xl border border-dashed border-border bg-muted/30">
            <p className="text-sm text-muted-foreground mb-2">今後追加するメニュー</p>
            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
              <li>新商品企画ワークスペース</li>
              <li>在庫・原価シミュレーション</li>
              <li>テスト販売の記録</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
