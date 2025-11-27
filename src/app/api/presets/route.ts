// src/app/api/presets/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: プリセット一覧取得
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from('ui_presets')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching presets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: プリセット作成
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 認証チェック
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, sections } = body;
    
    if (!name || !sections) {
      return NextResponse.json({ error: 'Name and sections are required' }, { status: 400 });
    }
    
    // 最大のdisplay_orderを取得
    const { data: maxOrder } = await supabase
      .from('ui_presets')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();
    
    const nextOrder = (maxOrder?.display_order || 0) + 1;
    
    const { data, error } = await supabase
      .from('ui_presets')
      .insert({
        name,
        sections,
        is_default: false,
        display_order: nextOrder,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating preset:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: プリセット更新
export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 認証チェック
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, name, sections } = body;
    
    if (!id || !name || !sections) {
      return NextResponse.json({ error: 'ID, name and sections are required' }, { status: 400 });
    }
    
    // デフォルトプリセットは更新不可
    const { data: preset } = await supabase
      .from('ui_presets')
      .select('is_default')
      .eq('id', id)
      .single();
    
    if (preset?.is_default) {
      return NextResponse.json({ error: 'Cannot update default preset' }, { status: 403 });
    }
    
    const { data, error } = await supabase
      .from('ui_presets')
      .update({ name, sections })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating preset:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: プリセット削除
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 認証チェック
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    // デフォルトプリセットは削除不可
    const { data: preset } = await supabase
      .from('ui_presets')
      .select('is_default')
      .eq('id', id)
      .single();
    
    if (preset?.is_default) {
      return NextResponse.json({ error: 'Cannot delete default preset' }, { status: 403 });
    }
    
    const { error } = await supabase
      .from('ui_presets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting preset:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
