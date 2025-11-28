// src/app/api/upload/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('🔵 [Upload API] リクエスト受信');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // 認証チェック
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('🔴 [Upload API] 認証エラー: セッションなし');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('🟢 [Upload API] 認証OK:', session.user.email);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('🔴 [Upload API] ファイルなし');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log('📄 [Upload API] ファイル情報:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    
    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      console.log('🔴 [Upload API] ファイルサイズ超過:', file.size);
      return NextResponse.json({ error: 'File size exceeds 5MB' }, { status: 400 });
    }
    
    // ファイルタイプチェック
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('🔴 [Upload API] 無効なファイルタイプ:', file.type);
      return NextResponse.json({ error: 'Invalid file type. Only PNG, JPEG, and WebP are allowed' }, { status: 400 });
    }
    
    // ファイル名を生成（タイムスタンプ + オリジナル名）
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${originalName}`;
    
    console.log('📝 [Upload API] 生成されたファイル名:', fileName);
    
    // ArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('📤 [Upload API] Supabase Storageにアップロード中...');
    
    // Supabase Storageにアップロード（blog-imagesバケット）
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });
    
    if (error) {
      console.error('🔴 [Upload API] Supabaseアップロードエラー:', error);
      return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
    }
    
    console.log('🟢 [Upload API] アップロード成功:', data);
    
    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);
    
    console.log('🔗 [Upload API] 公開URL:', publicUrl);
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    });
  } catch (error: any) {
    console.error('🔴 [Upload API] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
