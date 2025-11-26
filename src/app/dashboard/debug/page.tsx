'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUiTheme } from '@/hooks/useUiTheme';

export default function DebugDashboard() {
  useUiTheme();

  const [endpoint, setEndpoint] = useState('/api/health');
  const [method, setMethod] = useState('GET');
  const [payload, setPayload] = useState('{\n  "ping": true\n}');
  const [responseLog, setResponseLog] = useState('ここにレスポンスを表示します');
  const [running, setRunning] = useState(false);

  const checks = [
    { label: 'Next.js', desc: '画面が返っているか', url: '/api/health' },
    { label: 'Supabase', desc: 'DBにつながるか', url: '/api/logs' },
    { label: '通知API', desc: '通知が届くか', url: '/api/notifications' },
    { label: '売上サマリー', desc: '集計APIが返るか', url: '/api/analytics/sales' },
  ];

  const runRequest = async () => {
    setRunning(true);
    setResponseLog('送信中...');
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'GET' ? undefined : payload,
      });
      const text = await res.text();
      setResponseLog(`Status: ${res.status}\n\n${text}`);
    } catch (e: any) {
      setResponseLog(`エラー: ${e?.message || e}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">デバッグダッシュボード</h1>
            <p className="text-sm text-muted-foreground">
              「今、動いているか」を文系でも確認できる簡易ツールです。まずは左上のステータスを確認し、異常があればAPIテストで調べます。
            </p>
          </div>
          <Link href="/" className="px-3 py-2 rounded-lg border border-border bg-card hover:border-accent text-sm">
            ホームへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {checks.map((c) => (
            <div key={c.label} className="border border-border rounded-xl p-4 bg-card shadow-sm space-y-2">
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
              <p className="text-[11px] text-muted-foreground break-all">{c.url}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">かんたんAPIテスト</h2>
              <span className="text-xs text-muted-foreground">コピーして送信するだけ</span>
            </div>
            <label className="text-sm text-muted-foreground space-y-1 block">
              送り先URL
              <input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <div className="flex gap-2 items-start">
              <label className="text-sm text-muted-foreground space-y-1 block">
                メソッド
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </label>
              {method !== 'GET' && (
                <label className="text-sm text-muted-foreground space-y-1 block flex-1">
                  送りたい内容（JSON）
                  <textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              )}
            </div>
            <button
              onClick={runRequest}
              disabled={running}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {running ? '送信中...' : 'テスト実行'}
            </button>
            <div className="bg-muted/40 border border-border rounded-lg p-3 text-sm whitespace-pre-wrap min-h-[120px]">
              {responseLog}
            </div>
          </div>

          <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-sm">
            <h2 className="text-lg font-semibold">使い方ガイド（文系向け）</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
              <li>上のステータスを見て、気になる項目のURLをコピー</li>
              <li>左の「かんたんAPIテスト」に貼り付けて送信</li>
              <li>ステータスと本文を確認し、異常があれば担当に共有</li>
            </ol>
            <p className="text-xs text-muted-foreground">
              GETで確認できない場合は、POSTに切り替えて簡単なJSON（例: {"{\"ping\":true}"}）を送信してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
