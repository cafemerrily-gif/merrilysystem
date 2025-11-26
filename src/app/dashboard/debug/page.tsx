'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useUiTheme } from '@/hooks/useUiTheme';

type HistoryItem = { ts: string; endpoint: string; method: string; status: number | null; ms: number | null };

const presetEndpoints = [
  { label: 'Health', url: '/api/health', method: 'GET' },
  { label: 'Logs', url: '/api/logs', method: 'GET' },
  { label: 'Notifications', url: '/api/notifications', method: 'GET' },
  { label: 'Sales Summary', url: '/api/analytics/sales', method: 'GET' },
];

export default function DebugDashboard() {
  useUiTheme();

  const [endpoint, setEndpoint] = useState('/api/health');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('Content-Type: application/json');
  const [payload, setPayload] = useState('{\n  "ping": true\n}');
  const [responseLog, setResponseLog] = useState('ここにレスポンスを表示します');
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const parsedHeaders = useMemo(() => {
    const result: Record<string, string> = {};
    headers
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const idx = line.indexOf(':');
        if (idx > 0) {
          const k = line.slice(0, idx).trim();
          const v = line.slice(idx + 1).trim();
          if (k) result[k] = v;
        }
      });
    return result;
  }, [headers]);

  const runRequest = async () => {
    setRunning(true);
    setResponseLog('送信中...');
    const started = performance.now();
    try {
      const res = await fetch(endpoint, {
        method,
        headers: parsedHeaders,
        body: method === 'GET' ? undefined : payload,
      });
      const elapsed = performance.now() - started;
      const text = await res.text();
      setResponseLog(`Status: ${res.status} (${elapsed.toFixed(0)} ms)\n\n${text}`);
      setHistory((prev) => [
        { ts: new Date().toLocaleString(), endpoint, method, status: res.status, ms: Math.round(elapsed) },
        ...prev.slice(0, 19),
      ]);
    } catch (e: any) {
      const elapsed = performance.now() - started;
      setResponseLog(`エラー (${elapsed.toFixed(0)} ms): ${e?.message || e}`);
      setHistory((prev) => [
        { ts: new Date().toLocaleString(), endpoint, method, status: null, ms: Math.round(elapsed) },
        ...prev.slice(0, 19),
      ]);
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
              文系の方でも「今、動いているか」を確認できるツールです。1) ステータス確認 → 2) 気になるAPIをテスト →
              3) ガイドを見る、の順で使ってください。
            </p>
          </div>
          <Link href="/" className="px-3 py-2 rounded-lg border border-border bg-card hover:border-accent text-sm">
            ホームへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {presetEndpoints.map((c) => (
            <div key={c.label} className="border border-border rounded-xl p-4 bg-card shadow-sm space-y-2">
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="text-xs text-muted-foreground break-all">{c.url}</p>
              <button
                className="text-xs px-3 py-1 rounded-lg border border-border hover:border-accent"
                onClick={() => {
                  setEndpoint(c.url);
                  setMethod(c.method);
                }}
              >
                このAPIをテスト
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">かんたんAPIテスト</h2>
              <span className="text-xs text-muted-foreground">URLを入れて送信するだけ</span>
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
                <p className="text-xs text-muted-foreground pt-1">
                  GET=取得のみ / POST=新規・検索 / PUT=更新 / DELETE=削除 を目安に選びます。
                </p>
              </label>
              {method !== 'GET' && (
                <label className="text-sm text-muted-foreground space-y-1 block flex-1">
                  送りたい内容（JSON）
                  <textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                  />
                </label>
              )}
            </div>
            <label className="text-sm text-muted-foreground space-y-1 block">
              追加ヘッダー（1行に1つ, 例: Authorization: Bearer xxx）
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground pt-1">
                例: Authorization: Bearer xxxxx, X-API-Key: your-key, Prefer: return=representation
              </p>
            </label>
            <button
              onClick={runRequest}
              disabled={running}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {running ? '送信中...' : 'テスト実行'}
            </button>
            <div className="bg-muted/40 border border-border rounded-lg p-3 text-sm whitespace-pre-wrap min-h-[140px] font-mono">
              {responseLog}
            </div>
          </div>

          <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-sm">
            <h2 className="text-lg font-semibold">使い方ガイド（文系向け）</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
              <li>上の「主要API」をクリックしてURLをセットする</li>
              <li>「テスト実行」を押す（必要ならボディやヘッダーを入力）</li>
              <li>レスポンスのステータスと本文を見て、異常なら担当へ共有</li>
            </ol>
            <p className="text-xs text-muted-foreground">
              500: サーバーの中でエラー。429: リクエスト多すぎ。401/403: 認証が通っていない。404: URL が違うか機能がない。
            </p>
            <div className="bg-muted/30 border border-border rounded-lg p-3 text-xs space-y-1">
              <p className="font-semibold">よくある確認</p>
              <p>・/api/health が 200 なら Next.js は動いています。</p>
              <p>・/api/analytics/sales が 200 なら売上集計APIは生きています。</p>
              <p>・/api/logs や /api/notifications が落ちる場合は Supabase 側を確認。</p>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">履歴（最新20件）</h2>
            <span className="text-xs text-muted-foreground">デバッグの足跡として残ります</span>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">まだ履歴はありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="px-2 py-1">時刻</th>
                    <th className="px-2 py-1">URL</th>
                    <th className="px-2 py-1">Method</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">ms</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="px-2 py-1">{h.ts}</td>
                      <td className="px-2 py-1 break-all">{h.endpoint}</td>
                      <td className="px-2 py-1">{h.method}</td>
                      <td className="px-2 py-1">{h.status ?? '—'}</td>
                      <td className="px-2 py-1">{h.ms ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
