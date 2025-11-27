'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useUiTheme } from '@/hooks/useUiTheme';

type HistoryItem = { ts: string; endpoint: string; method: string; status: number | null; ms: number | null };
type GuideCheck = { label: string; detail: string };

const presetEndpoints = [
  { label: 'Health', url: '/api/health', method: 'GET' },
  { label: 'Logs', url: '/api/logs', method: 'GET' },
  { label: 'Notifications', url: '/api/notifications', method: 'GET' },
  { label: 'Sales Summary', url: '/api/analytics/sales', method: 'GET' },
];

export default function DebugDashboard() {
  useUiTheme();

  const guideChecks: GuideCheck[] = [
    {
      label: '環境変数を確認',
      detail: 'NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SUPABASE_SERVICE_ROLE_KEY を Vercel と Cloudflare の両方で登録してあるか確認してください。',
    },
    {
      label: 'API の応答をチェック',
      detail: '/api/health や /api/analytics/sales が 200 を返すと正常。失敗するなら Supabase 接続情報や RLS を確認します。',
    },
    {
      label: 'uiSettings の整合性',
      detail: '/api/pr/website で uiSettings.sections に Light / Dark 両方があるかを確認。欠けていれば defaultModeSections を再投入してください。',
    },
    {
      label: 'ビルドログを記録',
      detail: 'npm run build でエラーが出たら、この画面のログ欄にコピーして担当者と共有すると早く直せます。',
    },
  ];

  const [endpoint, setEndpoint] = useState('/api/health');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('Content-Type: application/json');
  const [payload, setPayload] = useState('{\n  "ping": true\n}');
  const [responseLog, setResponseLog] = useState('ここにレスポンスを表示します');
  const [guideLog, setGuideLog] = useState('チェックを順番に実行しながら状況を記録してください。');
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

  const runGuideCheck = async () => {
    setGuideLog('uiSettings を確認中...');
    try {
      const res = await fetch('/api/pr/website', { cache: 'no-store' });
      if (!res.ok) throw new Error(`API エラー ${res.status}`);
      const data = await res.json();
      if (!data?.uiSettings) {
        setGuideLog('uiSettings が返っていません。Supabase 側の保存データを確認してください。');
        return;
      }
      const sections = data.uiSettings.sections;
      const presets = data.uiSettings.presets;
      if (!sections?.light || !sections?.dark) {
        setGuideLog('sections.light / sections.dark が欠けています。デフォルト構造を再投入してください。');
        return;
      }
      setGuideLog(`sections は OK（light:${Boolean(sections.light)}, dark:${Boolean(sections.dark)}）、presets:${Array.isArray(presets) ? 'あり' : 'なし'}。`);
    } catch (err: any) {
      setGuideLog(`チェック失敗: ${err?.message || err}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">デバッグダッシュボード</h1>
            <p className="text-sm text-muted-foreground">
              文系でも扱えるチェックリストと API テストを同時に並べたガイド付きです。
            </p>
          </div>
          <Link href="/" className="px-3 py-2 rounded-lg border border-border bg-card hover:border-accent text-sm">
            ホームへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <Link href="/dashboard/debug" className="p-4 rounded-2xl border border-border bg-card hover:border-accent hover:shadow transition">
            <h2 className="text-lg font-semibold">API テスト</h2>
            <p className="text-sm text-muted-foreground">Health / Logs / Notifications などを順番に確認できます。</p>
          </Link>
          <Link href="/" className="p-4 rounded-2xl border border-border bg-card hover:border-accent hover:shadow transition">
            <h2 className="text-lg font-semibold">トップへ戻る</h2>
            <p className="text-sm text-muted-foreground">アプリのホーム画面に移動します。</p>
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
                この API をテスト
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">簡単 API テスト</h2>
              <span className="text-xs text-muted-foreground">URL を入力して実行</span>
            </div>
            <label className="text-sm text-muted-foreground space-y-1 block">
              対象 URL
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
                  GET=取得 / POST=登録 / PUT=更新 / DELETE=削除
                </p>
              </label>
              {method !== 'GET' && (
                <label className="text-sm text-muted-foreground space-y-1 block flex-1">
                  送信 JSON
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
              追加ヘッダー
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground pt-1">
                例: Authorization: Bearer xxxxx / X-API-Key: your-key
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

          <div className="border border-border rounded-xl p-4 bg-gradient-to-br from-card/80 to-background space-y-3 shadow-sm">
            <h2 className="text-lg font-semibold">文系でもわかるデバッグガイド</h2>
            <div className="space-y-2 text-sm text-foreground">
              {guideChecks.map((step) => (
                <div key={step.label} className="rounded-lg border border-border bg-muted/30 p-2">
                  <p className="font-semibold">{step.label}</p>
                  <p className="text-muted-foreground text-xs">{step.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-xs font-mono text-muted-foreground">最新チェック: {guideLog}</p>
            <button
              onClick={runGuideCheck}
              className="w-full rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm text-primary hover:bg-primary/20"
            >
              uiSettings を再確認
            </button>
          </div>
        </div>

        <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">履歴（最新20件）</h2>
            <span className="text-xs text-muted-foreground">テストの足跡として残します</span>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">まだ履歴はありません</p>
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
                    <tr key={`${h.ts}-${idx}`} className="border-t border-border">
                      <td className="px-2 py-1 whitespace-nowrap">{h.ts}</td>
                      <td className="px-2 py-1 break-all">{h.endpoint}</td>
                      <td className="px-2 py-1">{h.method}</td>
                      <td className="px-2 py-1">{h.status ?? '-'}</td>
                      <td className="px-2 py-1">{h.ms ?? '-'}</td>
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
