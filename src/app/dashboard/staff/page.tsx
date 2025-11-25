'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Attendance = {
  id: number;
  staff_name: string;
  work_date: string;
  clock_in: string;
  clock_out?: string | null;
  note?: string | null;
};

export default function StaffDashboard() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    staff_name: '',
    work_date: '',
    clock_in: '',
    clock_out: '',
    note: '',
  });

  const totalHours = useMemo(() => {
    // 簡易集計（clock_out があるものだけ時間差を算出）
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

  const load = async () => {
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      if (!data.error) setRecords(data);
    } catch (error) {
      console.error('勤怠データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setForm({ staff_name: '', work_date: '', clock_in: '', clock_out: '', note: '' });
        load();
      }
    } catch (error) {
      console.error('勤怠登録エラー:', error);
      alert('登録に失敗しました');
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <span className="text-2xl" aria-hidden>
                🧑‍🍳
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">店舗スタッフ</h1>
              <p className="text-sm text-muted-foreground">勤怠管理システム</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">勤怠を登録</h2>
              <button
                onClick={load}
                className="text-sm px-3 py-2 rounded-lg border border-border hover:border-accent"
              >
                最新に更新
              </button>
            </div>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
              <label className="text-sm text-muted-foreground flex flex-col gap-2">
                スタッフ名
                <input
                  required
                  value={form.staff_name}
                  onChange={(e) => setForm((f) => ({ ...f, staff_name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2"
                  placeholder="山田 太郎"
                />
              </label>
              <label className="text-sm text-muted-foreground flex flex-col gap-2">
                日付
                <input
                  required
                  type="date"
                  value={form.work_date}
                  onChange={(e) => setForm((f) => ({ ...f, work_date: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2"
                />
              </label>
              <label className="text-sm text-muted-foreground flex flex-col gap-2">
                出勤
                <input
                  required
                  type="time"
                  value={form.clock_in}
                  onChange={(e) => setForm((f) => ({ ...f, clock_in: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2"
                />
              </label>
              <label className="text-sm text-muted-foreground flex flex-col gap-2">
                退勤（任意）
                <input
                  type="time"
                  value={form.clock_out}
                  onChange={(e) => setForm((f) => ({ ...f, clock_out: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2"
                />
              </label>
              <label className="text-sm text-muted-foreground flex flex-col gap-2 md:col-span-2">
                メモ（任意）
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2"
                  rows={2}
                  placeholder="引き継ぎ事項など"
                />
              </label>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-auto px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? '登録中…' : '勤怠を登録'}
                </button>
              </div>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              ※ 勤怠データを保存するには Supabase に attendance テーブル（id, staff_name, work_date, clock_in, clock_out, note）を作成してください。
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-3">
            <h3 className="text-lg font-semibold">サマリー</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-muted-foreground">登録件数</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-muted-foreground">合計時間（概算）</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              時間計算は出勤・退勤の差分を合計した簡易値です。正確な集計が必要な場合は将来的に給与システムと連携してください。
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">勤怠履歴</h2>
            <button
              onClick={load}
              className="text-sm px-3 py-2 rounded-lg border border-border hover:border-accent"
            >
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
                    <th className="py-2 pr-3">メモ</th>
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
