# 🚀 MERRILY Cafe Management System - クイックスタート

## ⚡ 5分で起動

### 1. プロジェクトをダウンロード
```bash
# ZIPファイルを展開
# student-cafe-app フォルダに移動
cd student-cafe-app
```

### 2. パッケージをインストール
```bash
npm install
```

### 3. 環境変数を設定

`.env.example` を `.env.local` にコピー:

**Windowsの場合:**
```bash
copy .env.example .env.local
```

**Mac/Linuxの場合:**
```bash
cp .env.example .env.local
```

**⚠️ 重要:** `.env.example` にはすでに新しいプロジェクトの認証情報が設定されています！

### 4. Supabaseでデータベースを作成

1. [Supabaseダッシュボード](https://supabase.com/dashboard) を開く
2. プロジェクト「**ipseojnbbcszjmffjrkn**」を選択
3. 左メニューの「**SQL Editor**」をクリック
4. 「**+ New query**」をクリック
5. `supabase-schema.sql` の内容をコピー＆ペースト
6. 「**Run**」をクリック

### 5. テストユーザーを作成

1. Supabaseダッシュボード → **Authentication** → **Users**
2. 「**Add user**」→「**Create new user**」
3. 以下を入力:
   - Email: `test@example.com`
   - Password: `password123`
   - ✅ **Auto Confirm User** にチェック
4. 「**Create user**」

### 6. アプリを起動
```bash
npm run dev
```

### 7. ブラウザでアクセス
```
http://localhost:3000
```

### 8. ログイン
- メール: `test@example.com`
- パスワード: `password123`

---

## ✅ これで完了！

MERRILYカフェ管理システムが使えます！

---

## 📚 詳しいガイド

- **SETUP_GUIDE.md** - 詳細なセットアップ手順
- **LOGIN_SETUP_GUIDE.md** - ログインシステムの説明
- **GITHUB_GUIDE.md** - GitHubへのアップロード方法
- **VERCEL_DEPLOY_GUIDE.md** - 本番環境へのデプロイ方法

---

## 🔑 プロジェクト情報

### Supabase Project
- **URL**: `https://ipseojnbbcszjmffjrkn.supabase.co`
- **Project ID**: `ipseojnbbcszjmffjrkn`

### デフォルトユーザー
- **Email**: `test@example.com`
- **Password**: `password123`

---

## 🆘 トラブルシューティング

### エラー: 「カテゴリの取得に失敗しました」

**原因:** データベースが作成されていない

**解決策:**
1. Supabase SQL Editorを開く
2. `supabase-schema.sql` を実行
3. テーブルが作成されたか確認（Table Editor）

---

### エラー: 「ログインできない」

**原因:** ユーザーが作成されていない

**解決策:**
1. Supabase → Authentication → Users
2. テストユーザーを作成（上記手順5参照）

---

### エラー: 「Module not found」

**原因:** パッケージが不足

**解決策:**
```bash
npm install
npm run dev
```

---

## 📱 機能一覧

- ✅ ログイン/ログアウト
- ✅ メニュー管理（カテゴリ・商品）
- ✅ 売上入力（POSレジ風）
- ✅ ライト/ダークモード切り替え
- ✅ レスポンシブデザイン

---

**お疲れ様でした！MERRILYで素敵なカフェ運営を！** ☕✨
