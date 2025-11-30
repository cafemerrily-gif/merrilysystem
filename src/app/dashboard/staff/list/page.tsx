'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

interface StaffMember {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  department: string;
  hourly_rate: number;
  is_active: boolean;
  created_at: string;
}

interface Profile {
  role: string;
}

export default function StaffListPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    department: 'staff',
    hourly_rate: 1000,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // ユーザーの権限をチェック
    // profilesテーブルがある場合
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // profilesテーブルがない場合はstaff_infoのis_adminを使用
    if (!profile) {
      const { data: staffInfo } = await supabase
        .from('staff_info')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();
      
      setIsAdmin(staffInfo?.is_admin || false);
    } else {
      const adminRole = profile?.role === 'admin' || profile?.role === 'manager';
      setIsAdmin(adminRole);
    }

    await fetchStaffList();
    setLoading(false);
  };

  const fetchStaffList = async () => {
    const { data, error } = await supabase
      .from('staff_info')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('スタッフ一覧取得エラー:', error);
      return;
    }

    setStaffList(data || []);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading || !isAdmin) return;
    setFormLoading(true);

    // まず、ユーザーを検索（メールアドレスで）
    const { data: existingUser } = await supabase
      .from('staff_info')
      .select('email')
      .eq('email', formData.email)
      .single();

    if (existingUser) {
      alert('このメールアドレスは既に登録されています');
      setFormLoading(false);
      return;
    }

    // auth.usersテーブルからユーザーIDを取得する必要がありますが、
    // クライアント側からは直接アクセスできないため、
    // ここでは仮のユーザーIDとして新規UUIDを生成します
    // 実際の運用では、サーバーサイドAPIを経由するか、
    // ユーザーが事前にサインアップ済みである必要があります

    const { data, error } = await supabase
      .from('staff_info')
      .insert({
        user_id: crypto.randomUUID(), // 本来はauth.usersのIDを使用
        display_name: formData.display_name,
        email: formData.email,
        department: formData.department,
        hourly_rate: formData.hourly_rate,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('スタッフ追加エラー:', error);
      alert('スタッフの追加に失敗しました');
    } else {
      alert('スタッフを追加しました');
      setShowAddModal(false);
      setFormData({
        display_name: '',
        email: '',
        department: 'staff',
        hourly_rate: 1000,
      });
      await fetchStaffList();
    }

    setFormLoading(false);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading || !isAdmin || !editingStaff) return;
    setFormLoading(true);

    const { error } = await supabase
      .from('staff_info')
      .update({
        display_name: formData.display_name,
        department: formData.department,
        hourly_rate: formData.hourly_rate,
      })
      .eq('id', editingStaff.id);

    if (error) {
      console.error('スタッフ更新エラー:', error);
      alert('スタッフ情報の更新に失敗しました');
    } else {
      alert('スタッフ情報を更新しました');
      setEditingStaff(null);
      setFormData({
        display_name: '',
        email: '',
        department: 'staff',
        hourly_rate: 1000,
      });
      await fetchStaffList();
    }

    setFormLoading(false);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!isAdmin) return;
    
    if (!confirm('本当にこのスタッフを削除しますか?')) return;

    const { error } = await supabase
      .from('staff_info')
      .delete()
      .eq('id', staffId);

    if (error) {
      console.error('スタッフ削除エラー:', error);
      alert('スタッフの削除に失敗しました');
    } else {
      alert('スタッフを削除しました');
      await fetchStaffList();
    }
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      display_name: staff.display_name,
      email: staff.email,
      department: staff.department,
      hourly_rate: staff.hourly_rate,
    });
  };

  const getDepartmentName = (dept: string) => {
    switch (dept) {
      case 'accounting': return '会計部';
      case 'dev': return '開発部';
      case 'engineer': return 'エンジニア部';
      case 'pr': return '広報部';
      default: return 'スタッフ';
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#262626' : '#dbdbdb';
  const mutedColor = isDark ? '#a8a8a8' : '#737373';
  const cardBgColor = isDark ? '#0a0a0a' : '#fafafa';

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <p style={{ color: mutedColor }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: bgColor, color: textColor }}>
      <header className="fixed top-0 left-0 right-0 z-40 border-b" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/staff" className="p-2">
                <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg font-semibold">スタッフ一覧</h1>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-lg font-semibold text-white"
                style={{ backgroundColor: '#3b82f6' }}
              >
                追加
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 max-w-4xl mx-auto px-4 py-6 space-y-4">
        {staffList.length === 0 ? (
          <div className="p-8 text-center border rounded-2xl" style={{ borderColor }}>
            <p style={{ color: mutedColor }}>スタッフが登録されていません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {staffList.map((staff) => (
              <div
                key={staff.id}
                className="p-4 border rounded-xl"
                style={{ borderColor, backgroundColor: cardBgColor }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{staff.display_name}</h3>
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: staff.department === 'accounting' ? (isDark ? '#1e3a8a' : '#dbeafe') :
                                         staff.department === 'dev' ? (isDark ? '#065f46' : '#d1fae5') :
                                         staff.department === 'engineer' ? (isDark ? '#1e1b4b' : '#e0e7ff') :
                                         staff.department === 'pr' ? (isDark ? '#7c2d12' : '#fed7aa') :
                                         (isDark ? '#4c1d95' : '#e9d5ff'),
                          color: staff.department === 'accounting' ? (isDark ? '#93c5fd' : '#1e40af') :
                                staff.department === 'dev' ? (isDark ? '#6ee7b7' : '#059669') :
                                staff.department === 'engineer' ? (isDark ? '#818cf8' : '#4338ca') :
                                staff.department === 'pr' ? (isDark ? '#fdba74' : '#c2410c') :
                                (isDark ? '#c4b5fd' : '#6b21a8')
                        }}
                      >
                        {getDepartmentName(staff.department)}
                      </span>
                      {!staff.is_active && (
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: isDark ? '#7f1d1d' : '#fee2e2', color: isDark ? '#fca5a5' : '#991b1b' }}
                        >
                          非アクティブ
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p style={{ color: mutedColor }}>メール: {staff.email}</p>
                      <p style={{ color: mutedColor }}>時給: ¥{staff.hourly_rate.toLocaleString()}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-2 rounded-lg border transition-opacity hover:opacity-70"
                        style={{ borderColor }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="p-2 rounded-lg border transition-opacity hover:opacity-70"
                        style={{ borderColor, color: '#ef4444' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* スタッフ追加モーダル */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md p-6 rounded-2xl" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
            <h2 className="text-xl font-bold mb-4">スタッフを追加</h2>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: mutedColor }}>名前</label>
                <input
                  type="text"
                  required
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor, backgroundColor: cardBgColor, color: textColor }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: mutedColor }}>メールアドレス</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor, backgroundColor: cardBgColor, color: textColor }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: mutedColor }}>所属部署</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor, backgroundColor: cardBgColor, color: textColor }}
                >
                  <option value="staff">スタッフ</option>
                  <option value="accounting">会計部</option>
                  <option value="dev">開発部</option>
                  <option value="engineer">エンジニア部</option>
                  <option value="pr">広報部</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: mutedColor }}>時給（円）</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="10"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor, backgroundColor: cardBgColor, color: textColor }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ display_name: '', email: '', department: 'staff', hourly_rate: 1000 });
                  }}
                  className="flex-1 py-2 rounded-lg border"
                  style={{ borderColor }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  {formLoading ? '追加中...' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* スタッフ編集モーダル */}
      {editingStaff && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md p-6 rounded-2xl" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
            <h2 className="text-xl font-bold mb-4">スタッフ情報を編集</h2>
            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: mutedColor }}>名前</label>
                <input
                  type="text"
                  required
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor, backgroundColor: cardBgColor, color: textColor }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: mutedColor }}>メールアドレス</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-2 rounded-lg border opacity-50"
                  style={{ borderColor, backgroundColor: cardBgColor, color: textColor }}
                />
                <p className="text-xs mt-1" style={{ color: mutedColor }}>※メールアドレスは変更できません</p>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: mutedColor }}>所属部署</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor, backgroundColor: cardBgColor, color: textColor }}
                >
                  <option value="staff">スタッフ</option>
                  <option value="accounting">会計部</option>
                  <option value="dev">開発部</option>
                  <option value="engineer">エンジニア部</option>
                  <option value="pr">広報部</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: mutedColor }}>時給（円）</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="10"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor, backgroundColor: cardBgColor, color: textColor }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStaff(null);
                    setFormData({ display_name: '', email: '', department: 'staff', hourly_rate: 1000 });
                  }}
                  className="flex-1 py-2 rounded-lg border"
                  style={{ borderColor }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  {formLoading ? '更新中...' : '更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
