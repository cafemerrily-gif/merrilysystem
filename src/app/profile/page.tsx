'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const deptOptions = ['会計部', '開発部', '広報部', 'マネジメント部', '職員', 'エンジニアチーム', '店舗スタッフ'];

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [fullName, setFullName] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        const meta = data.user?.user_metadata || {};
        if (meta.full_name) setFullName(meta.full_name);
        if (Array.isArray(meta.departments)) setDepartments(meta.departments);
        if (meta.is_admin === true || meta.role === 'admin') setIsAdmin(true);
      } catch (e: any) {
        setError(e?.message || 'ユーザー情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const toggleDept = (dept: string, checked: boolean) => {
    setDepartments((prev) => {
      if (checked) return [...prev, dept];
      return prev.filter((d) => d !== dept);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('権限がありません（管理者のみ変更できます）');
      return;
    }
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          departments,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setInfo('更新しました。再ログインで反映される場合があります。');
      }
    } catch (e: any) {
      setError(e?.message || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-card border border-border rounded-2xl shadow-lg text-center space-y-4">
          <h1 className="text-xl font-bold">アクセス不可</h1>
          <p className="text-sm text-muted-foreground">このページは管理者のみが利用できます。権限付与はSupabaseダッシュボードで is_admin=true を設定してください。</p>
          <Link href="/" className="px-4 py-2 rounded-xl border border-border bg-card hover:border-accent text-sm">
            ホームへ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">プロフィール / タグ編集</h1>
            <p className="text-sm text-muted-foreground">氏名と部署タグを更新できます</p>
          </div>
          <Link href="/" className="px-4 py-2 rounded-xl border border-border bg-card hover:border-accent text-sm">
            ホームへ戻る
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <form className="space-y-6 bg-card border border-border rounded-2xl p-6 shadow-lg" onSubmit={handleSave}>
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            氏名
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
              placeholder="山田 太郎"
              required
            />
          </label>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">部署タグ（複数選択可）</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {deptOptions.map((dept) => {
                const checked = departments.includes(dept);
                return (
                  <label
                    key={dept}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleDept(dept, e.target.checked)}
                    />
                    <span>{dept}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {info && <p className="text-sm text-green-600">{info}</p>}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? '更新中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  );
}
