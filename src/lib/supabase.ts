import { createClient } from '@supabase/supabase-js';

// Supabase環境変数の検証
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません。.env.localを確認してください。');
}

/**
 * クライアントサイド用のSupabaseクライアント
 * シングルトンパターンで複数インスタンス生成を防止
 */
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'merrily-cafe-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
  }
  return supabaseInstance;
})();

/**
 * サーバーサイド用のSupabaseクライアント（管理者権限）
 * API Route Handlersなどのサーバーサイドコードで使用
 * Row Level Security (RLS) をバイパスできる
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * データベース型定義（主要なテーブル）
 */
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          display_order: number;
          is_seasonal: boolean;
          start_date: string | null;
          end_date: string | null;
          created_by: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: never;
          name: string;
          description?: string | null;
          display_order?: number;
          is_seasonal?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          created_by?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: never;
          name?: string;
          description?: string | null;
          display_order?: number;
          is_seasonal?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          created_by?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      products: {
        Row: {
          id: number;
          category_id: number;
          name: string;
          description: string | null;
          cost_price: number;
          selling_price: number;
          sku: string | null;
          is_available: boolean;
          image_url: string | null;
          created_by: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: never;
          category_id: number;
          name: string;
          description?: string | null;
          cost_price: number;
          selling_price: number;
          sku?: string | null;
          is_available?: boolean;
          image_url?: string | null;
          created_by?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: never;
          category_id?: number;
          name?: string;
          description?: string | null;
          cost_price?: number;
          selling_price?: number;
          sku?: string | null;
          is_available?: boolean;
          image_url?: string | null;
          created_by?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      sales: {
        Row: {
          id: number;
          sale_date: string;
          sale_time: string;
          time_slot: 'morning' | 'lunch' | 'afternoon' | 'evening';
          total_amount: number;
          payment_method: 'cash' | 'card' | 'qr' | 'other' | null;
          note: string | null;
          entered_by: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: never;
          sale_date: string;
          sale_time: string;
          time_slot: 'morning' | 'lunch' | 'afternoon' | 'evening';
          total_amount: number;
          payment_method?: 'cash' | 'card' | 'qr' | 'other' | null;
          note?: string | null;
          entered_by: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: never;
          sale_date?: string;
          sale_time?: string;
          time_slot?: 'morning' | 'lunch' | 'afternoon' | 'evening';
          total_amount?: number;
          payment_method?: 'cash' | 'card' | 'qr' | 'other' | null;
          note?: string | null;
          entered_by?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      sale_items: {
        Row: {
          id: number;
          sale_id: number;
          product_id: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: never;
          sale_id: number;
          product_id: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: never;
          sale_id?: number;
          product_id?: number;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
    };
  };
}
