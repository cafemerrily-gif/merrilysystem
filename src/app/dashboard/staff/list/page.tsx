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
  department: string[];
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function MemberListPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [memberList, setMemberList] = useState<StaffMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    display_name: '',
    email: '',
    departments: [] as string[],
  });
  const [formLoading, setFormLoading] = useState(false);

  const departmentOptions = [
    { value: 'accounting', label: '会計部' },
    { value: 'dev', label: '開発部' },
    { value: 'engineer', label: 'エンジニア部' },
    { value: 'pr', label: '広報部' },
    { value: 'management', label: 'マネジメント部' },
    { value: 'employee', label: '職員' },
    { value: 'staff', label: 'スタッフ' },
  ];

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

    setCurrentUserId(user.id);

    const { data: staffInfo } = await supabase
      .from('staff_info')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();
    
    setIsAdmin(staffInfo?.is_admin || false);

    await fetchMemberList();
    setLoading(false);
  };

  const fetchMemberList = async () => {
    const { data, error } = await supabase
      .from('staff_info')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('メンバー一覧取得エラー:', error);
      return;
    }

    setMemberList(data || []);
  };

  const handleDepartmentToggle = (dept: string) => {
    setFormData(prev => {
      const departments = prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept];
      return { ...prev, departments };
    });
  };

  const handleToggleAdmin = async (memberId: string, currentIsAdmin: boolean, memberName: string, memberUserId: string) => {
    // 自分自身の管理者権限は削除できない
    if (memberUserId === currentUserId && currentIsAdmin) {
      alert('自分自身の管理者権限は削除できません');
      return;
    }

    const action = currentIsAdmin ? '削除' : '付与';
    if (!confirm(`${memberName}の管理者権限を${action}しますか？`)) {
      return;
    }

    const { error } = await supabase
      .from('staff_info')
      .update({ is_admin: !currentIsAdmin })
      .eq('id', memberId);

    if (error) {
      console.error('管理者権限更新エラー:', error);
      alert('管理者権限の更新に失敗しました');
    } else {
      alert(`管理者権限を${action}しました`);
      await fetchMemberList();
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading || !isAdmin) return;
    
    if (formData.departments.length === 0) {
      alert('少なくとも1つの部署を選択してください');
      return;
    }
    
    setFormLoading(true);

    const { data, error } = await supabase
      .from('staff_info')
      .insert({
        user_id: formData.user_id,
        display_name: formData.display_name,
        email: formData.email,
        department: formData.departments,
        is_active: true,
        is_admin: false,
      })
      .select()
      .single();

    if (error) {
      console.error('メンバー追加エラー:', error);
      alert('メンバーの追加に失敗しました');
    } else {
      alert('メンバーを追加しました');
      setShowAddModal(false);
      setFormData({
        user_id: '',
        display_name: '',
        email: '',
        departments: [],
      });
      await fetchMemberList();
    }

    setFormLoading(false);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading || !isAdmin || !editingMember) return;
    
    if (formData.departments.length === 0) {
      alert('少なくとも1つの部署を選択してください');
      return;
    }
    
    setFormLoading(true);

    const { error } = await supabase
      .from('staff_info')
      .update({
        display_name: formData.display_name,
        department: formData.departments,
      })
      .eq('id', editingMember.id);

    if (error) {
      console.error('メンバー更新エラー:', error);
      alert('メンバー情報の更新に失敗しました');
    } else {
      alert('メンバー情報を更新しました');
      setEditingMember(null);
      setFormData({
        user_id: '',
        display_name: '',
        email: '',
        departments: [],
      });
      await fetchMemberList();
    }

    setFormLoading(false);
  };

  const handleDeleteMember = async (memberId: string, memberUserId: string) => {
    if (!isAdmin) return;
    
    // 自分自身は削除できない
    if (memberUserId === currentUserId) {
      alert('自分自身を削除することはできません');
      return;
    }
    
    if (!confirm('本当にこのメンバーを削除しますか?')) return;

    const { error } = await supabase
      .from('staff_info')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('メンバー削除エラー:', error);
      alert('メンバーの削除に失敗しました');
    } else {
      alert('メンバーを削除しました');
      await fetchMemberList();
    }
  };

  const openEditModal = (member: StaffMember) => {
    setEditingMember(member);
    setFormData({
      user_id: member.user_id,
      display_name: member.display_name,
      email: member.email,
      departments: Array.isArray(member.department) ? member.department : [member.department],
    });
  };

  const getDepartmentName = (dept: string) => {
    const found = departmentOptions.find(d => d.value === dept);
    return found ? found.label : dept;
  };

  const getDepartmentColor = (dept: string, isDark: boolean) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      accounting: { bg: isDark ? '#1e3a8a' : '#dbeafe', text: isDark ? '#93c5fd' : '#1e40af' },
      dev: { bg: isDark ? '#065f46' : '#d1fae5', text: isDark ? '#6ee7b7' : '#059669' },
      engineer: { bg: isDark ? '#1e1b4b' : '#e0e7ff', text: isDark ? '#818cf8' : '#4338ca' },
      pr: { bg: isDark ? '#7c2d12' : '#fed7aa', text: isDark ? '#fdba74' : '#c2410c' },
      management: { bg: isDark ? '#831843' : '#fce7f3', text: isDark ? '#f9a8d4' : '#9f1239' },
      employee: { bg: isDark ? '#713f12' : '#fef3c7', text: isDark ? '#fde047' : '#a16207' },
      staff: { bg: isDark ? '#4c1d95' : '#e9d5ff', text: isDark ? '#c4b5fd' : '#6b21a8' },
    };
    return colors[dept] || colors.staff;
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
              <h1 className="text-lg font-semibold">メンバー一覧</h1>
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
        {memberList.length === 0 ? (
          <div className="p-8 text-center border rounded-2xl" style={{ borderColor }}>
            <p style={{ color: mutedColor }}>メンバーが登録されていません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {memberList.map((member) => {
              const departments = Array.isArray(member.department) ? member.department : [member.department];
              const isSelf = member.user_id === currentUserId;
              
              return (
                <div
                  key={member.id}
                  className="p-4 border rounded-xl"
                  style={{ borderColor, backgroundColor: cardBgColor }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{member.display_name}</h3>
                        {isSelf && (
                          <span 
                            className="text-xs px-2 py-1 rounded-full font-semibold"
                            style={{ backgroundColor: isDark ? '#1e3a8a' : '#dbeafe', color: isDark ? '#93c5fd' : '#1e40af' }}
                          >
                            あなた
                          </span>
                        )}
                        {departments.map((dept) => {
                          const color = getDepartmentColor(dept, isDark);
                          return (
                            <span
                              key={dept}
                              className="text-xs px-2 py-1 rounded-full"
                              style={{ backgroundColor: color.bg, color: color.text }}
                            >
                              {getDepartmentName(dept)}
                            </span>
                          );
                        })}
                        {!member.is_active && (
                          <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: isDark ? '#7f1d1d' : '#fee2e2', color: isDark ? '#fca5a5' : '#991b1b' }}
                          >
                            非アクティブ
                          </span>
                        )}
                        {member.is_admin && (
                          <span 
                            className="text-xs px-2 py-1 rounded-full font-semibold"
                            style={{ backgroundColor: isDark ? '#854d0e' : '#fef3c7', color: isDark ? '#fde047' : '#a16207' }}
                          >
                            👑 管理者
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p style={{ color: mutedColor }}>メール: {member.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 ml-4 flex-wrap">
                        <button
                          onClick={() => handleToggleAdmin(member.id, member.is_admin, member.display_name, member.user_id)}
                          className="p-2 rounded-lg border transition-opacity hover:opacity-70"
                          style={{ 
                            borderColor,
                            backgroundColor: member.is_admin ? (isDark ? '#854d0e' : '#fef3c7') : 'transparent',
                            color: member.is_admin ? (isDark ? '#fde047' : '#a16207') : textColor
                          }}
                          title={member.is_admin ? '管理者権限を削除' : '管理者権限を付与'}
                        >
                          <svg className="w-5 h-5" fill={member.is_admin ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-2 rounded-lg border transition-opacity hover:opacity-70"
                          style={{ borderColor }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id, member.user_id)}
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
              );
            })}
          </div>
        )}
      </main>

      {/* メンバー追加モーダル */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md p-6 rounded-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">メンバーを追加</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: mutedColor }}>ユーザーID（UUID）</label>
                <input
                  type="text"
                  required
                  placeholder="auth.usersのユーザーID"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor, backgroundColor: cardBgColor, color: textColor }}
                />
                <p className="text-xs mt-1" style={{ color: mutedColor }}>
                  ※ AuthenticationのUsersから取得してください
                </p>
              </div>
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
                <label className="block text-sm mb-2" style={{ color: mutedColor }}>所属部署（複数選択可）</label>
                <div className="space-y-2">
                  {departmentOptions.map((dept) => (
                    <label
                      key={dept.value}
                      className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-opacity-50"
                      style={{ borderColor, backgroundColor: formData.departments.includes(dept.value) ? `${borderColor}40` : 'transparent' }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.departments.includes(dept.value)}
                        onChange={() => handleDepartmentToggle(dept.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{dept.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ user_id: '', display_name: '', email: '', departments: [] });
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

      {/* メンバー編集モーダル */}
      {editingMember && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setEditingMember(null)}>
          <div className="w-full max-w-md p-6 rounded-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">メンバー情報を編集</h2>
            <form onSubmit={handleUpdateMember} className="space-y-4">
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
                <label className="block text-sm mb-2" style={{ color: mutedColor }}>所属部署（複数選択可）</label>
                <div className="space-y-2">
                  {departmentOptions.map((dept) => (
                    <label
                      key={dept.value}
                      className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-opacity-50"
                      style={{ borderColor, backgroundColor: formData.departments.includes(dept.value) ? `${borderColor}40` : 'transparent' }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.departments.includes(dept.value)}
                        onChange={() => handleDepartmentToggle(dept.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{dept.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(null);
                    setFormData({ user_id: '', display_name: '', email: '', departments: [] });
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
