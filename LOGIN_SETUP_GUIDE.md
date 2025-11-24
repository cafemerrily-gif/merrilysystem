# 🔐 ログインシステムセットアップガイド

## 概要

Supabase Authを使用したログインシステムを実装しました。

---

## 🎯 実装した機能

### 1. **ログインページ** (`/login`)
- メールアドレス＋パスワードでログイン
- エラーメッセージ表示
- ローディング状態の表示
- MERRILYブランディング対応

### 2. **認証ミドルウェア**
- 未ログイン状態では自動的にログインページにリダイレクト
- ログイン済みの場合、ログインページにアクセスするとホームにリダイレクト

### 3. **ログアウト機能**
- ホーム画面左上にログアウトボタンを配置
- ワンクリックでログアウト可能

---

## 📋 Supabaseでの設定手順

### ステップ 1: Supabase Authを有効化

1. [Supabaseダッシュボード](https://supabase.com/dashboard)を開く
2. プロジェクトを選択
3. 左メニューの「**Authentication**」をクリック

### ステップ 2: テストユーザーを作成

1. 「**Users**」タブを開く
2. 「**Add user**」→「**Create new user**」をクリック
3. 以下の情報を入力:
   - **Email**: `test@example.com`（任意のメールアドレス）
   - **Password**: `password123`（任意のパスワード、最低6文字）
   - **Auto Confirm User**: ✅ チェックを入れる（メール確認をスキップ）
4. 「**Create user**」をクリック

### ステップ 3: メール確認をオフにする（開発用）

1. 「**Settings**」タブを開く
2. 「**Email Auth**」セクションを探す
3. 「**Enable email confirmations**」を **オフ** にする
   - これにより、ユーザー登録時にメール確認が不要になります

---

## 🚀 使い方

### ログイン

1. アプリにアクセス: `http://localhost:3000` または本番URL
2. 自動的にログインページにリダイレクトされます
3. 以下の情報でログイン:
   - **メールアドレス**: `test@example.com`
   - **パスワード**: `password123`
4. 「ログイン」ボタンをクリック
5. ログイン成功でホーム画面に移動

### ログアウト

1. ホーム画面左上の「ログアウト」ボタンをクリック
2. 自動的にログインページに戻ります

---

## 📁 追加されたファイル

### 1. **src/app/login/page.tsx**
ログインページのUI

### 2. **src/middleware.ts**
認証チェックのミドルウェア
- 未認証ユーザーを`/login`にリダイレクト
- ログイン済みユーザーを`/`にリダイレクト

### 3. **src/components/LogoutButton.tsx**
ログアウトボタンコンポーネント

### 4. **package.json**
`@supabase/auth-helpers-nextjs` を追加

---

## 🔧 パッケージのインストール

新しいパッケージを追加したので、再インストールが必要です:

```bash
cd student-cafe-app
npm install
```

---

## ⚙️ 環境変数

既存の環境変数で動作します。追加の設定は不要です:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🎨 ダークモード対応

ログインページもダークモード対応しています:
- ライトモード: 白背景 + 緑ボタン
- ダークモード: 暗い背景 + 白ボタン

---

## 🛡️ セキュリティ機能

### 実装済み
- ✅ Supabase Authによる認証
- ✅ セッション管理
- ✅ ミドルウェアによるルート保護
- ✅ 自動リダイレクト

### 今後追加可能
- パスワードリセット機能
- ユーザー登録機能
- ソーシャルログイン（Google、GitHub等）
- 二要素認証（2FA）

---

## 📝 ユーザー追加方法

### Supabaseダッシュボードで追加

1. Authentication → Users → Add user
2. メールアドレスとパスワードを入力
3. 「Auto Confirm User」にチェック
4. Create user

### SQLで追加（上級者向け）

```sql
-- Supabase SQL Editorで実行
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'newuser@example.com',
  crypt('newpassword123', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

---

## 🆘 トラブルシューティング

### 問題1: ログインできない

**原因:** ユーザーが作成されていない

**解決策:**
1. Supabase → Authentication → Users を確認
2. テストユーザーが存在するか確認
3. ない場合は「Add user」で作成

---

### 問題2: ログイン後もログインページに戻される

**原因:** ミドルウェアのエラー

**解決策:**
1. `npm install` を再実行
2. 開発サーバーを再起動
3. ブラウザのキャッシュをクリア

---

### 問題3: 「Invalid login credentials」エラー

**原因:** メールアドレスまたはパスワードが間違っている

**解決策:**
1. Supabaseダッシュボードでユーザー情報を確認
2. 正しいメールアドレスとパスワードを入力

---

### 問題4: ミドルウェアでエラーが出る

**原因:** パッケージが不足している

**解決策:**
```bash
npm install @supabase/auth-helpers-nextjs
npm run dev
```

---

## 🔐 本番環境での注意点

### 1. メール確認を有効にする

開発環境では無効にしていますが、本番環境では有効にすることを推奨:
- Supabase → Authentication → Settings
- 「Enable email confirmations」を **オン** にする

### 2. パスワードポリシー

Supabaseのデフォルト:
- 最低6文字
- 強力なパスワードを推奨

### 3. レート制限

Supabaseが自動的にレート制限を適用:
- 同一IPからの過度なログイン試行を防止

---

## 📚 次のステップ

### 実装可能な機能

1. **ユーザー登録ページ** (`/signup`)
   - 新規ユーザーが自分でアカウント作成

2. **パスワードリセット**
   - メールでパスワードリセットリンクを送信

3. **プロフィール編集**
   - ユーザー情報の編集機能

4. **権限管理**
   - 開発部、会計部など役割ベースのアクセス制御

5. **ログイン履歴**
   - ユーザーのログイン履歴を記録

---

## ✅ 完了チェックリスト

- [ ] Supabase Authを有効化
- [ ] テストユーザーを作成
- [ ] `npm install` を実行
- [ ] ログインページにアクセス
- [ ] テストユーザーでログイン成功
- [ ] ホーム画面が表示される
- [ ] ログアウトボタンが機能する

---

**これでログインシステムが使えます！** 🎉

セキュアな認証で、MERRILYカフェ管理システムを守りましょう！
