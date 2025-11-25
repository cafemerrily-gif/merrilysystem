'use client';

import Link from 'next/link';

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DebugDashboard() {
  const [endpoint, setEndpoint] = useState('/api/health');
  const [method, setMethod] = useState('GET');
  const [payload, setPayload] = useState('{\n  "ping": true\n}');
  const [responseLog, setResponseLog] = useState('ここにレスポンスを表示します');
  const [running, setRunning] = useState(false);

  const fakeStatus = [
    { label: 'Next.js', value: 'OK', color: 'text-green-500' },
    { label: 'Supabase', value: 'OK', color: 'text-green-500' },
    { label: 'Auth Cookie', value: 'OK', color: 'text-green-500' },
    { label: 'Edge Cache', value: 'SKIP', color: 'text-yellow-500' },
  ];

  const fakeFlags = [
    { key: 'enableNewChart', label: '新チャート', on: true },
    { key: 'useMockApi', label: 'モックAPI', on: false },
    { key: 'showDevBanner', label: 'Devバナー', on: true },
  ];

  const runRequest = async () => {
    setRunning(true);
    setResponseLog('送信中...');
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'GET' ? payload : undefined,
      });
      const text = await res.text();
      setResponseLog(`Status: ${res.status}\n${text}`);
    } catch (e: any) {
      setResponseLog(`Error: ${e?.message || 'unknown error'}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <span className="text-2xl" aria-hidden>
                🧪
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">デバッグダッシュボード</h1>
              <p className="text-sm text-muted-foreground">エンジニアチーム向けの検証・確認用スペース</p>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-3 bg-card border border-border hover:border-accent rounded-xl transition-all duration-200 text-sm"
          >
            ホームへ戻る
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* ステータス */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold">ステータス</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {fakeStatus.map((s) => (
              <div key={s.label} className="border border-border rounded-xl p-4 bg-muted/40 flex flex-col gap-2">
                <p className="text-muted-foreground">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            実運用ではここにヘルスチェック結果や監視メトリクスを差し替えてください。
          </p>
        </div>

        {/* API テスター */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">API テスター</h2>
            <span className="text-xs text-muted-foreground">fetchで試せます</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[140px,1fr] gap-3">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex flex-col gap-1">
                メソッド
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </select>
              </label>
              <label className="text-sm text-muted-foreground flex flex-col gap-1">
                エンドポイント
                <input
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2"
                  placeholder="/api/health"
                />
              </label>
              <button
                onClick={runRequest}
                disabled={running}
                className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {running ? '実行中...' : '送信'}
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex flex-col gap-1">
                Payload (JSON)
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  className="w-full h-40 rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs"
                />
              </label>
              <label className="text-sm text-muted-foreground flex flex-col gap-1">
                レスポンス
                <textarea
                  value={responseLog}
                  readOnly
                  className="w-full h-32 rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Feature Flags / 設定 */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Feature Flags</h2>
            <span className="text-xs text-muted-foreground">ダミーの表示です</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {fakeFlags.map((flag) => (
              <div key={flag.key} className="border border-border rounded-xl p-4 bg-muted/40 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{flag.label}</p>
                  <p className="text-xs text-muted-foreground">{flag.key}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs ${
                    flag.on ? 'bg-green-500/20 text-green-700 dark:text-green-200' : 'bg-border text-muted-foreground'
                  }`}
                >
                  {flag.on ? 'ON' : 'OFF'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 環境メモ */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-3 text-sm">
          <h2 className="text-xl font-semibold">環境メモ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-border rounded-xl p-4 bg-muted/40 space-y-2">
              <h3 className="font-semibold">API/Supabase</h3>
              <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                <li>REST: /api/*</li>
                <li>Supabase: auth & DB (RLS)</li>
                <li>環境変数は .env.local で管理</li>
              </ul>
            </div>
            <div className="border border-border rounded-xl p-4 bg-muted/40 space-y-2">
              <h3 className="font-semibold">留意点</h3>
              <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                <li>本番前は Edge Runtime 依存に注意</li>
                <li>ログは将来統合予定（Sentry等）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
