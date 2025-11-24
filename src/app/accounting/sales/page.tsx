'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Summary = {
  totalAmount: number;
  todayTotal: number;
};

export default function SalesInputPage() {
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [saleTime, setSaleTime] = useState(() => new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [totalAmount, setTotalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (!data.error) {
        setSummary({
          totalAmount: data.totalAmount || 0,
          todayTotal: data.todayTotal || 0,
        });
      }
    } catch (error) {
      console.error('売上取得エラー:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalAmount) {
      alert('売上金額を入力してください');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleDate,
          saleTime,
          staffId: 1,
          totalAmount: Number(totalAmount),
          paymentMethod,
        }),
      });

      if (res.ok) {
        alert('売上を登録しました');
        setTotalAmount('');
        fetchSummary();
      } else {
        const error = await res.json();
        alert(error.error || '登録に失敗しました');
      }
    } catch (error) {
      console.error('売上登録エラー:', error);
      alert('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <span className="text-2xl" aria-hidden>
                ✍️
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">売上入力（手動）</h1>
              <p className="text-sm text-muted-foreground">POS連携なしで1件ずつ記録します</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/accounting"
              className="px-4 py-3 bg-card border border-border hover:border-accent rounded-xl transition-all duration-200 text-sm font-semibold"
            >
              ダッシュボードへ
            </Link>
            <Link
              href="/"
              className="px-4 py-3 bg-card border border-border hover:border-accent rounded-xl transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ホームへ
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-muted-foreground mb-2">本日の売上</p>
              <div className="text-3xl font-bold text-foreground">¥{summary.todayTotal.toLocaleString()}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-muted-foreground mb-2">累計売上</p>
              <div className="text-3xl font-bold text-foreground">¥{summary.totalAmount.toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">売上を入力</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">日付</label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">時間</label>
                <input
                  type="time"
                  value={saleTime}
                  onChange={(e) => setSaleTime(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  金額(円) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="例: 12000"
                  min={0}
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">支払い方法</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                >
                  <option value="cash">現金</option>
                  <option value="card">クレジット/デビット</option>
                  <option value="qr">QR/電子マネー</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold py-4 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60"
            >
              {loading ? '登録中...' : '売上を登録'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
