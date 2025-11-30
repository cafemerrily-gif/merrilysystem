'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from '@/components/ThemeProvider';

interface AttendanceRecord {
  id: string;
  user_id: string;
  staff_name: string;
  clock_in: string;
  clock_out: string | null;
  work_hours: number | null;
  notes: string | null;
  created_at: string;
}

interface StaffMember {
  user_id: string;
  display_name: string;
}

export default function AdminAttendancePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [selectedStaff, startDate, endDate, allAttendance]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: staffInfo } = await supabase
      .from('staff_info')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();
    
    if (!staffInfo?.is_admin) {
      router.push('/attendance');
      return;
    }

    setIsAdmin(true);
    await fetchStaffList();
    await fetchAllAttendance();
    setLoading(false);
  };

  const fetchStaffList = async () => {
    const { data, error } = await supabase
      .from('staff_info')
      .select('user_id, display_name')
      .order('display_name');

    if (error) {
      console.error('スタッフ一覧取得エラー:', error);
      return;
    }

    setStaffList(data || []);
  };

  const fetchAllAttendance = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('clock_in', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('勤怠データ取得エラー:', error);
      return;
    }

    setAllAttendance(data || []);
  };

  const filterAttendance = () => {
    let filtered = [...allAttendance];

    if (selectedStaff !== 'all') {
      filtered = filtered.filter(a => a.user_id === selectedStaff);
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(a => new Date(a.clock_in) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => new Date(a.clock_in) <= end);
    }

    setFilteredAttendance(filtered);
  };

  const exportToCSV = () => {
    // CSVヘッダー
    const headers = ['スタッフ名', '出勤日時', '退勤日時', '労働時間', '備考'];
    
    // CSVデータ
    const csvData = filteredAttendance.map(record => [
      record.staff_name,
      formatDateTime(record.clock_in),
      record.clock_out ? formatDateTime(record.clock_out) : '勤務中',
      record.work_hours ? `${record.work_hours.toFixed(2)}時間` : '-',
      record.notes || '',
    ]);

    // CSV文字列を作成
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // BOM付きでダウンロード（Excelで文字化けしないように）
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = `勤怠データ_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // TSV形式（タブ区切り）でエクスポート - Excelで開きやすい
    const headers = ['スタッフ名', '出勤日時', '退勤日時', '労働時間', '備考'];
    
    const tsvData = filteredAttendance.map(record => [
      record.staff_name,
      formatDateTime(record.clock_in),
      record.clock_out ? formatDateTime(record.clock_out) : '勤務中',
      record.work_hours ? `${record.work_hours.toFixed(2)}時間` : '-',
      record.notes || '',
    ]);

    // TSV文字列を作成（タブ区切り）
    const tsvContent = [
      headers.join('\t'),
      ...tsvData.map(row => row.join('\t'))
    ].join('\n');

    // BOM付きでダウンロード
    const bom = '\uFEFF';
    const blob = new Blob([bom + tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = `勤怠データ_${new Date().toISOString().split('T')[0]}.xls`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const getTotalHours = () => {
    return filteredAttendance
      .filter(a => a.work_hours)
      .reduce((sum, a) => sum + (a.work_hours || 0), 0)
      .toFixed(2);
  };

  const getWorkDays = () => {
    return filteredAttendance.filter(a => a.clock_out).length;
  };

  const handleDeleteAttendance = async (attendanceId: string, staffName: string) => {
    if (deleteLoading) return;
    
    if (!confirm(`${staffName}の勤怠記録を削除しますか？\nこの操作は取り消せません。`)) {
      return;
    }

    setDeleteLoading(true);

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', attendanceId);

    if (error) {
      console.error('勤怠削除エラー:', error);
      alert('勤怠記録の削除に失敗しました');
    } else {
      alert('勤怠記録を削除しました');
      await fetchAllAttendance();
    }

    setDeleteLoading(false);
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <p style={{ color: mutedColor }}>管理者権限が必要です</p>
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
              <h1 className="text-lg font-semibold">勤怠管理（管理者）</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* フィルターとエクスポート */}
        <div className="p-4 border rounded-2xl space-y-4" style={{ borderColor, backgroundColor: cardBgColor }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold">フィルター</h2>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-2"
                style={{ backgroundColor: '#10b981' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                CSV
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-2"
                style={{ backgroundColor: '#3b82f6' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: mutedColor }}>スタッフ</label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor, backgroundColor: bgColor, color: textColor }}
              >
                <option value="all">全員</option>
                {staffList.map(staff => (
                  <option key={staff.user_id} value={staff.user_id}>
                    {staff.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: mutedColor }}>開始日</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor, backgroundColor: bgColor, color: textColor }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: mutedColor }}>終了日</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor, backgroundColor: bgColor, color: textColor }}
              />
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-xl" style={{ borderColor, backgroundColor: cardBgColor }}>
            <p className="text-sm mb-1" style={{ color: mutedColor }}>総レコード数</p>
            <p className="text-2xl font-bold">{filteredAttendance.length}件</p>
          </div>
          <div className="p-4 border rounded-xl" style={{ borderColor, backgroundColor: cardBgColor }}>
            <p className="text-sm mb-1" style={{ color: mutedColor }}>完了勤務日数</p>
            <p className="text-2xl font-bold">{getWorkDays()}日</p>
          </div>
          <div className="p-4 border rounded-xl" style={{ borderColor, backgroundColor: cardBgColor }}>
            <p className="text-sm mb-1" style={{ color: mutedColor }}>総労働時間</p>
            <p className="text-2xl font-bold">{getTotalHours()}時間</p>
          </div>
        </div>

        {/* 勤怠一覧 */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-2">勤怠記録一覧</h2>
          {filteredAttendance.length === 0 ? (
            <div className="p-8 text-center border rounded-2xl" style={{ borderColor }}>
              <p style={{ color: mutedColor }}>該当する勤怠記録がありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAttendance.map((record) => (
                <div
                  key={record.id}
                  className="p-4 border rounded-xl"
                  style={{ borderColor, backgroundColor: cardBgColor }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{record.staff_name}</p>
                      <p className="text-sm" style={{ color: mutedColor }}>{formatDate(record.clock_in)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.work_hours && (
                        <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: isDark ? '#065f46' : '#d1fae5', color: isDark ? '#34d399' : '#059669' }}>
                          {record.work_hours.toFixed(2)}時間
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteAttendance(record.id, record.staff_name)}
                        disabled={deleteLoading}
                        className="p-2 rounded-lg border transition-opacity hover:opacity-70 disabled:opacity-50"
                        style={{ borderColor, color: '#ef4444' }}
                        title="削除"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p style={{ color: mutedColor }}>出勤</p>
                      <p className="font-medium">{formatTime(record.clock_in)}</p>
                    </div>
                    <div>
                      <p style={{ color: mutedColor }}>退勤</p>
                      <p className="font-medium">
                        {record.clock_out ? formatTime(record.clock_out) : (
                          <span style={{ color: '#3b82f6' }}>勤務中</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {record.notes && (
                    <p className="text-sm mt-2 pt-2 border-t" style={{ color: mutedColor, borderColor }}>
                      備考: {record.notes}
                    </p>
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
