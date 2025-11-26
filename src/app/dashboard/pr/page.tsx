'use client';

import Link from 'next/link';
import { useUiTheme } from '@/hooks/useUiTheme';

export default function PrDashboard() {
  useUiTheme();
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-4xl w-full p-8 bg-card border border-border rounded-2xl shadow-lg space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-2xl font-bold">広報部ダッシュボード</h1>
            <p className="text-muted-foreground mt-1">公式サイト・ブログ・UI編集のメニュー一覧です。</p>
          </div>
          <Link href="/" className="inline-flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-xl">
            ホームへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/pr/website"
            className="group p-6 rounded-2xl border border-border bg-background hover:border-accent hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl">🌐</div>
              <div>
                <p className="text-sm text-muted-foreground">広報部 / 公式サイト</p>
                <h2 className="text-xl font-semibold">ホームページ編集</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              トップページの文言・色・アイコンを編集して公開用ページを整えます。
            </p>
          </Link>

          <Link
            href="/dashboard/pr/blogs"
            className="group p-6 rounded-2xl border border-border bg-background hover:border-accent hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl">📰</div>
              <div>
                <p className="text-sm text-muted-foreground">広報部 / コンテンツ</p>
                <h2 className="text-xl font-semibold">ブログ編集</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              新規ブログの作成・複数画像のアップロード・公開管理を行います。
            </p>
          </Link>

          <Link
            href="/dashboard/pr/ui"
            className="group p-6 rounded-2xl border border-border bg-background hover:border-accent hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl">🎨</div>
              <div>
                <p className="text-sm text-muted-foreground">広報部 / UI</p>
                <h2 className="text-xl font-semibold">UI編集</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              ログイン画面・トップページの配色やアイコンをモード別に設定します。
            </p>
          </Link>

          <div className="p-6 rounded-2xl border border-dashed border-border bg-muted/30">
            <p className="text-sm text-muted-foreground mb-2">今後追加するメニュー</p>
            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
              <li>SNSキャンペーン管理</li>
              <li>広告バナー管理</li>
              <li>配布物・デザイン管理</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
