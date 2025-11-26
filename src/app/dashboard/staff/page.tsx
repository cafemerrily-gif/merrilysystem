'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUiTheme } from '@/hooks/useUiTheme';

type Attendance = {
  id: number;
  staff_name: string;
  work_date: string;
  clock_in: string;
  clock_out?: string | null;
  note?: string | null;
};

export default function StaffDashboard() {
  useUiTheme();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserLabel, setCurrentUserLabel] = useState('ログインユーザー');
  const supabase = createClientComponentClient();

  const totalHours = useMemo(() => {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    let minutes = 0;
    records.forEach((r) => {
      if (r.clock_in && r.clock_out) {
        minutes += Math.max(0, toMinutes(r.clock_out) - toMinutes(r.clock_in));
      }
    });
    return minutes / 60;
  }, [records]);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      if (!data.error) setRecords(data);
    } catch (error) {
      console.error('勤怠データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const nowDateTime = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return { date, time: `${hh}:${mm}` };
  };

  const clockIn = async () => {
    if (submitting) return;
    setSubmitting(true);
    const { date, time } = nowDateTime();
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_name: currentUserLabel, work_date: date, clock_in: time }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        await load();
      }
    } catch (error) {
      console.error('出勤登録エラー:', error);
      alert('出勤の記録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const clockOut = async () => {
    if (submitting) return;
    setSubmitting(true);
    const { time } = nowDateTime();
    try {
      const res = await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_name: currentUserLabel, clock_out: time }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        await load();
      }
    } catch (error) {
      console.error('退勤登録エラー:', error);
      alert('退勤の記録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('この勤怠を削除しますか？')) return;
    try {
      const res = await fetch(`/api/attendance?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const meta = data.user?.user_metadata;
      if (meta?.full_name) setCurrentUserLabel(meta.full_name);
    })();
    load();
  }, [load, supabase]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const menuCards = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <Link href="/dashboard/staff" className="p-4 rounded-2xl border border-border bg-card hover:border-accent hover:shadow transition">
        <h2 className="text-lg font-semibold">勤怠ダッシュボード</h2>
        <p className="text-sm text-muted-foreground">出勤・退勤の記録と履歴を確認</p>
      </Link>
      <button
        onClick={clockIn}
        disabled={submitting}
        className="p-4 rounded-2xl border border-border bg-card hover:border-accent hover:shadow transition text-left"
      >
        <h2 className="text-lg font-semibold">{submitting ? '処理中...' : '出勤を記録'}</h2>
        <p className="text-sm text-muted-foreground">現在時刻で出勤を打刻</p>
      </button>
      <button
        onClick={clockOut}
        disabled={submitting}
        className="p-4 rounded-2xl border border-border bg-card hover:border-accent hover:shadow transition text-left"
      >
        <h2 className="text-lg font-semibold">{submitting ? '処理中...' : '退勤を記録'}</h2>
        <p className="text-sm text-muted-foreground">未退勤レコードに現在時刻で退勤を記録</p>
      </button>
      <div className="p-4 rounded-2xl border border-dashed border-border bg-muted/30">
        <h2 className="text-lg font-semibold">今後追加するメニュー</h2>
        <p className="text-sm text-muted-foreground">シフト管理や連絡事項などを予定しています。</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <span className="text-2xl" aria-hidden>
                🕒
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">店舗スタッフ</h1>
              <p className="text-sm text-muted-foreground">勤怠管理と履歴確認</p>
            </div>
          </div>
          <Link href="/" className="px-4 py-3 bg-card border border-border hover:border-accent rounded-xl transition-all duration-200 text-sm">
            ホームへ戻る
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{menuCards}</div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">勤怠を記録</h2>
                <p className="text-sm text-muted-foreground">ログイン中: {currentUserLabel}</p>
              </div>
              <button onClick={load} className="text-sm px-3 py-2 rounded-lg border border-border hover:border-accent">
                最新に更新
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                disabled={submitting}
                onClick={clockIn}
                className="w-full px-5 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? '処理中...' : '出勤を記録'}
              </button>
              <button
                disabled={submitting}
                onClick={clockOut}
                className="w-full px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? '処理中...' : '退勤を記録'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              出勤: 今日の日付と現在時刻で新規レコードを作成します。退勤: 直近の未退勤レコードに現在時刻で退勤を付与します。
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-3">
            <h3 className="text-lg font-semibold">サマリー</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-muted-foreground">記録件数</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-muted-foreground">推定勤務時間</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              勤務時間は出勤・退勤の差から算出しています。正確な管理が必要な場合は詳細を確認してください。
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">勤怠履歴</h2>
            <button onClick={load} className="text-sm px-3 py-2 rounded-lg border border-border hover:border-accent">
              再読み込み
            </button>
          </div>
          {loading ? (
            <p className="text-muted-foreground">読み込み中...</p>
          ) : !records.length ? (
            <p className="text-muted-foreground">まだ勤怠がありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-3">スタッフ</th>
                    <th className="py-2 pr-3">日付</th>
                    <th className="py-2 pr-3">出勤</th>
                    <th className="py-2 pr-3">退勤</th>
                    <th className="py-2 pr-3">備考</th>
                    <th className="py-2 pr-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((r) => (
                    <tr key={r.id} className="align-top">
                      <td className="py-2 pr-3">{r.staff_name}</td>
                      <td className="py-2 pr-3">{r.work_date}</td>
                      <td className="py-2 pr-3">{r.clock_in}</td>
                      <td className="py-2 pr-3">{r.clock_out || '-'}</td>
                      <td className="py-2 pr-3 max-w-[220px]">
                        <div className="line-clamp-2">{r.note || '-'}</div>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <button
                          onClick={() => remove(r.id)}
                          className="text-xs px-3 py-1 rounded-lg border border-border hover:border-accent"
                        >
                          削除
                        </button>
                      </td>
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
