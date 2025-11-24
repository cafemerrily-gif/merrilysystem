# 🔧 ログインエラー修正ガイド

## 🚨 発生しているエラー

```
Failed to load resource: the server responded with a status of 400 ()
GoTrueClient: Multiple instances detected
```

---

## ✅ 解決手順

### ステップ 1: Supabaseクライアントを修正 ✅完了

Supabaseクライアントをシングルトンパターンに変更し、複数インスタンスの問題を解決しました。

---

### ステップ 2: Supabase Email Authを設定

#### 2-1: Supabaseダッシュボードを開く

1. [https://supabase.com/dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクト「**ipseojnbbcszjmffjrkn**」を選択

#### 2-2: Email Auth設定を確認

1. 左メニューの「**Authentication**」をクリック
2. 上部の「**Providers**」タブをクリック
3. 「**Email**」を探す

#### 2-3: Email Providerを有効化

「Email」の設定:
- **Enable Email provider**: ✅ **ON** にする
- **Confirm email**: ✅ **OFF** にする（開発環境用）
- **Secure email change**: ✅ **OFF** にする（開発環境用）

「**Save**」をクリック

---

### ステップ 3: Site URLを設定

#### 3-1: URL Configuration

1. Authentication → **Settings** → **URL Configuration**
2. 以下を設定:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/**
http://localhost:3000/auth/callback
```

「**Save**」をクリック

---

### ステップ 4: テストユーザーを再作成

#### 4-1: 既存ユーザーの確認

1. Authentication → **Users**
2. `test@example.com` が存在するか確認

#### 4-2: ユーザーがいない場合は作成

1. 「**Add user**」→「**Create new user**」
2. 以下を入力:
   - **Email**: `test@example.com`
   - **Password**: `password123`
   - ✅ **Auto Confirm User** にチェック
3. 「**Create user**」

---

### ステップ 5: ローカル環境を再起動

#### 5-1: 開発サーバーを停止

ターミナルで `Ctrl + C` を押す

#### 5-2: ブラウザのキャッシュをクリア

**Chrome/Edge:**
1. `F12` でDevToolsを開く
2. 「Application」タブ
3. 左側の「Local Storage」→ `http://localhost:3000` を右クリック
4. 「Clear」

または:
1. 設定 → プライバシーとセキュリティ
2. 閲覧履歴データの削除
3. 「キャッシュされた画像とファイル」をチェック
4. 削除

#### 5-3: 開発サーバーを再起動

```bash
npm run dev
```

---

### ステップ 6: ログインを再試行

1. `http://localhost:3000` にアクセス
2. ログインページが表示される
3. 以下でログイン:
   - Email: `test@example.com`
   - Password: `password123`
4. 「ログイン」ボタンをクリック

---

## 🔍 追加のトラブルシューティング

### エラー: 「Invalid login credentials」

**原因:** パスワードが間違っている、またはユーザーが存在しない

**解決策:**
1. Supabase → Authentication → Users でユーザーを確認
2. ユーザーがいない場合は再作成
3. パスワードをリセット:
   - ユーザーの「...」→「Reset Password」
   - 新しいパスワードを設定

---

### エラー: 「Email not confirmed」

**原因:** メール確認が有効になっている

**解決策:**
1. Authentication → Providers → Email
2. 「**Confirm email**」を **OFF** にする
3. ユーザーを削除して再作成（Auto Confirm User にチェック）

---

### エラー: 「Rate limit exceeded」

**原因:** ログイン試行が多すぎる

**解決策:**
1. 5分待つ
2. Supabase → Project Settings → API
3. 「Rate Limiting」を確認

---

## 📋 完全なチェックリスト

### Supabase設定
- [ ] Authentication → Providers → Email が **ON**
- [ ] Confirm email が **OFF**
- [ ] Site URL が `http://localhost:3000`
- [ ] Redirect URLs が設定されている
- [ ] テストユーザーが存在する（Auto Confirm済み）

### ローカル環境
- [ ] `.env.local` が存在する
- [ ] 環境変数が正しい
- [ ] `npm install` を実行済み
- [ ] ブラウザのキャッシュをクリア
- [ ] 開発サーバーを再起動

### ログイン
- [ ] ログインページが表示される
- [ ] メールアドレスとパスワードを入力
- [ ] エラーが表示されない
- [ ] ホーム画面にリダイレクトされる

---

## 🆘 それでも解決しない場合

### デバッグ情報の確認

#### ブラウザのコンソールを開く

`F12` → Console タブ

**確認すべき情報:**
1. エラーメッセージの詳細
2. ネットワークタブで失敗しているリクエスト
3. Application タブで localStorage の内容

#### Supabase Logsを確認

1. Supabase → Project Settings → **Logs**
2. Authentication logs を確認
3. エラーメッセージを探す

---

### よくあるエラーメッセージ

#### 「Invalid Refresh Token」
- ブラウザのlocalStorageをクリア
- 再ログイン

#### 「User not found」
- Supabaseでユーザーを再作成

#### 「Email rate limit exceeded」
- 5-10分待つ

---

## ✅ 修正完了後の確認

### 正常な動作
1. ✅ ログインページが表示される
2. ✅ メールとパスワードを入力できる
3. ✅ ログインボタンをクリックできる
4. ✅ エラーが表示されない
5. ✅ ホーム画面にリダイレクトされる
6. ✅ ログアウトボタンが表示される
7. ✅ ログアウトが機能する

---

**これで解決するはずです！** 🎉

問題が続く場合は、上記のチェックリストを最初から確認してください。
