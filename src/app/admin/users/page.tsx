'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type UserRecord = {
  id: string;
  email: string | null;
  full_name: string;
  departments: string[];
  is_admin: boolean;
};

const deptOptions = ['会計部', '開発部', '広報部', 'マネジメント部', '職員', 'エンジニアチーム', '店舗スタッフ'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.error) setError(data.error);
      else setUsers(data);
    } catch (e: any) {
      setError(e?.message || '取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleDept = (userId: string, dept: string, checked: boolean) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, departments: checked ? [...u.departments, dept] : u.departments.filter((d) => d !== dept) }
          : u
      )
    );
  };

  const updateUser = async (user: UserRecord) => {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          full_name: user.full_name,
          departments: user.departments,
          is_admin: user.is_admin,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setInfo('保存しました');
        setUsers((prev) => prev.map((u) => (u.id === user.id ? data : u)));
      }
    } catch (e: any) {
      setError(e?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">メンバー管理</h1>
            <p className="text-sm text-muted-foreground">管理者のみ編集可能です</p>
          </div>
          <Link href="/" className="px-4 py-2 rounded-xl border border-border bg-card hover:border-accent text-sm">
            ホームへ戻る
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-4">
        {loading ? (
          <p className="text-muted-foreground">読み込み中...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u.id} className="border border-border rounded-2xl bg-card p-4 shadow-lg space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">ID: {u.id}</p>
                    <p className="font-semibold">{u.email || '(メール未設定)'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={u.is_admin}
                        onChange={(e) => setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_admin: e.target.checked } : x)))}
                      />
                      <span>管理者</span>
                    </label>
                    <button
                      onClick={() => updateUser(u)}
                      disabled={saving}
                      className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-60"
                    >
                      保存
                    </button>
                  </div>
                </div>

                <label className="text-sm text-muted-foreground flex flex-col gap-2">
                  氏名
                  <input
                    value={u.full_name}
                    onChange={(e) => setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, full_name: e.target.value } : x)))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </label>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">部署タグ（複数選択可）</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {deptOptions.map((dept) => {
                      const checked = u.departments.includes(dept);
                      return (
                        <label key={dept} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleDept(u.id, dept, e.target.checked)}
                          />
                          <span>{dept}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {info && <p className="text-green-600 text-sm">{info}</p>}
      </div>
    </div>
  );
}
