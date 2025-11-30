'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

interface AttendanceRecord {
  id: string;
  clock_in: string;
  clock_out: string | null;
  work_hours: number | null;
  notes: string | null;
  staff_name: string;
}

interface StaffInfo {
  display_name: string;
  department: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
    
    await fetchStaffInfo(user.id);
    await fetchCurrentAttendance(user.id);
    await fetchAttendanceHistory(user.id);
    setLoading(false);
  };

  const fetchStaffInfo = async (userId: string) => {
    const { data, error } = await supabase
      .from('staff_info')
      .select('display_name, department')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('スタッフ情報の取得エラー:', error);
      return;
    }

    setStaffInfo(data);
  };

  const fetchCurrentAttendance = async (userId: string) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .is('clock_out', null)
      .order('clock_in', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('現在の勤怠情報取得エラー:', error);
      return;
    }

    setCurrentAttendance(data);
  };

  const fetchAttendanceHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .not('clock_out', 'is', null)
      .order('clock_in', { ascending: false })
      .limit(30);

    if (error) {
      console.error('勤怠履歴取得エラー:', error);
      return;
    }

    setAttendanceHistory(data || []);
  };

  const handleClockIn = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ユーザー情報が取得できませんでした');
      setActionLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: user.id,
        staff_name: staffInfo?.display_name || user.email?.split('@')[0] || 'Unknown',
        clock_in: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('出勤記録エラー:', error);
      alert('出勤記録に失敗しました');
    } else {
      setCurrentAttendance(data);
      alert('出勤しました');
    }

    setActionLoading(false);
  };

  const handleClockOut = async () => {
    if (actionLoading || !currentAttendance) return;
    setActionLoading(true);

    const clockOutTime = new Date();
    const clockInTime = new Date(currentAttendance.clock_in);
    const workHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    const { error } = await supabase
      .from('attendance')
      .update({
        clock_out: clockOutTime.toISOString(),
        work_hours: Math.round(workHours * 100) / 100,
      })
      .eq('id', currentAttendance.id);

    if (error) {
      console.error('退勤記録エラー:', error);
      alert('退勤記録に失敗しました');
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchCurrentAttendance(user.id);
        await fetchAttendanceHistory(user.id);
      }
      alert(`退勤しました（勤務時間: ${workHours.toFixed(2)}時間）`);
    }

    setActionLoading(false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
              <h1 className="text-lg font-semibold">勤怠管理</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* スタッフ情報 */}
        {staffInfo && (
          <div className="p-4 border rounded-2xl" style={{ borderColor, backgroundColor: cardBgColor }}>
            <h2 className="text-sm font-semibold mb-2" style={{ color: mutedColor }}>スタッフ情報</h2>
            <p className="text-lg font-semibold">{staffInfo.display_name}</p>
            <p className="text-sm mt-1" style={{ color: mutedColor }}>
              所属: {staffInfo.department === 'accounting' ? '会計部' : 
                     staffInfo.department === 'dev' ? '開発部' : 
                     staffInfo.department === 'engineer' ? 'エンジニア部' :
                     staffInfo.department === 'pr' ? '広報部' : 'スタッフ'}
            </p>
          </div>
        )}

        {/* 出勤・退勤ボタン */}
        <div className="p-6 border rounded-2xl" style={{ borderColor, backgroundColor: cardBgColor }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: mutedColor }}>勤怠操作</h2>
          
          {currentAttendance ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-xl" style={{ borderColor, backgroundColor: bgColor }}>
                <p className="text-sm mb-1" style={{ color: mutedColor }}>出勤時刻</p>
                <p className="text-lg font-semibold">{formatDateTime(currentAttendance.clock_in)}</p>
              </div>
              <button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="w-full py-4 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#ef4444' }}
              >
                {actionLoading ? '処理中...' : '退勤する'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={actionLoading}
              className="w-full py-4 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#10b981' }}
            >
              {actionLoading ? '処理中...' : '出勤する'}
            </button>
          )}
        </div>

        {/* 勤怠履歴 */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-2">勤怠履歴</h2>
          {attendanceHistory.length === 0 ? (
            <div className="p-8 text-center border rounded-2xl" style={{ borderColor }}>
              <p style={{ color: mutedColor }}>まだ勤怠記録がありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attendanceHistory.map((record) => (
                <div
                  key={record.id}
                  className="p-4 border rounded-xl"
                  style={{ borderColor, backgroundColor: cardBgColor }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{formatDate(record.clock_in)}</p>
                    {record.work_hours && (
                      <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: isDark ? '#065f46' : '#d1fae5', color: isDark ? '#34d399' : '#059669' }}>
                        {record.work_hours.toFixed(2)}時間
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p style={{ color: mutedColor }}>出勤</p>
                      <p className="font-medium">{formatTime(record.clock_in)}</p>
                    </div>
                    {record.clock_out && (
                      <div>
                        <p style={{ color: mutedColor }}>退勤</p>
                        <p className="font-medium">{formatTime(record.clock_out)}</p>
                      </div>
                    )}
                  </div>
                  {record.notes && (
                    <p className="text-sm mt-2" style={{ color: mutedColor }}>{record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
