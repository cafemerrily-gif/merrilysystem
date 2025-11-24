'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LogoutButton() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'SIGNED_OUT', session: null }),
      });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-card border border-border hover:bg-secondary text-foreground rounded-lg transition-all duration-200 flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      ログアウト
    </button>
  );
}
