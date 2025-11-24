import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/collections
 * コレクション（商品フォルダ）一覧を取得
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('product_collections')
      .select('id,name,description,start_date,end_date,created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('コレクション取得エラー:', error);
      return NextResponse.json({ error: 'コレクションの取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ collections: data || [] });
  } catch (error) {
    console.error('コレクション取得エラー:', error);
    return NextResponse.json({ error: 'コレクションの取得に失敗しました' }, { status: 500 });
  }
}

/**
 * POST /api/collections
 * コレクション（商品フォルダ）を作成
 * 必要に応じて product_collections に start_date, end_date カラムがあることが前提
 */
export async function POST(request: NextRequest) {
  try {
    const { name, description, startDate, endDate } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: '名前は必須です' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('product_collections')
      .insert({
        name,
        description: description || '',
        start_date: startDate || null,
        end_date: endDate || null,
      })
      .select('id,name,start_date,end_date')
      .single();

    if (error) {
      console.error('コレクション作成エラー:', error);
      return NextResponse.json({ error: 'コレクションの作成に失敗しました（start_date/end_date カラムがDBに必要です）' }, { status: 500 });
    }

    return NextResponse.json({ collection: data }, { status: 201 });
  } catch (error) {
    console.error('コレクション作成エラー:', error);
    return NextResponse.json({ error: 'コレクションの作成に失敗しました' }, { status: 500 });
  }
}
