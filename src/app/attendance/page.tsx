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
  department: string[];
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

  const getDepartmentName = (dept: string) => {
    const deptMap: { [key: string]: string } = {
      accounting: '会計部',
      dev: '開発部',
      engineer: 'エンジニア部',
      pr: '広報部',
      management: 'マネジメント部',
      employee: '職員',
      staff: 'スタッフ',
    };
    return deptMap[dept] || dept;
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
              所属: {Array.isArray(staffInfo.department) 
                ? staffInfo.department.map(d => getDepartmentName(d)).join('、')
                : getDepartmentName(staffInfo.department)}
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
      <nav className="fixed bottom-0 left-0 right-0 border-t z-40" style={{ backgroundColor: bgColor, borderColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 h-16">
            <Link href="/dashboard/accounting" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>会計部</span>
            </Link>
            <Link href="/dashboard/dev/menu" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>開発部</span>
            </Link>
            <Link href="/dashboard/pr/menu" className="flex flex-col items-center justify-center gap-1">
              <svg className="w-6 h-6" fill={textColor} stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
              <span className="text-xs font-semibold" style={{ color: textColor }}>広報部</span>
            </Link>
            <Link href="/dashboard/staff" className="flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="text-xs" style={{ color: textColor }}>スタッフ</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
