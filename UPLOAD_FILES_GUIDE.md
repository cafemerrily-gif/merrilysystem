# 📤 GitHubアップロード対象ファイル完全ガイド

## 🎯 結論（先に答え）

### ✅ アップロードするもの
```
student-cafe-app/
├── src/                    ← ✅ アップロード
├── public/                 ← ✅ アップロード（あれば）
├── package.json            ← ✅ アップロード
├── package-lock.json       ← ✅ アップロード
├── tsconfig.json           ← ✅ アップロード
├── next.config.mjs         ← ✅ アップロード
├── tailwind.config.ts      ← ✅ アップロード
├── postcss.config.mjs      ← ✅ アップロード
├── .env.example            ← ✅ アップロード
├── .gitignore              ← ✅ アップロード
├── README.md               ← ✅ アップロード
├── SETUP_GUIDE.md          ← ✅ アップロード
├── GITHUB_GUIDE.md         ← ✅ アップロード
├── GITHUB_COMMANDS.md      ← ✅ アップロード
└── supabase-schema.sql     ← ✅ アップロード
```

### ❌ アップロードしないもの（自動的に除外される）
```
student-cafe-app/
├── node_modules/           ← ❌ アップロードしない
├── .next/                  ← ❌ アップロードしない
├── .env.local              ← ❌ アップロードしない（重要！）
├── .env                    ← ❌ アップロードしない
├── .DS_Store               ← ❌ アップロードしない
└── *.log                   ← ❌ アップロードしない
```

---

## 📋 詳細説明

### ✅ アップロードすべきファイル

#### 1. **ソースコードディレクトリ**
```
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── admin/
│   │   └── menu/
│   │       └── page.tsx
│   ├── accounting/
│   │   └── sales/
│   │       └── page.tsx
│   └── api/
│       ├── categories/
│       ├── products/
│       └── sales/
└── lib/
    └── supabase.ts
```
**理由:** プロジェクトの本体。これがないと動かない。

---

#### 2. **設定ファイル**

**package.json**
```json
{
  "name": "student-cafe-app",
  "dependencies": {
    "next": "14.2.18",
    "@supabase/supabase-js": "^2.45.4"
  }
}
```
**理由:** 必要なパッケージを定義。他の人が `npm install` で同じ環境を再現できる。

**package-lock.json**
```
パッケージのバージョンを固定
```
**理由:** 全員が同じバージョンのパッケージを使えるようにする。

**tsconfig.json**
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```
**理由:** TypeScriptの設定。

**next.config.mjs**
```javascript
const nextConfig = {
  reactStrictMode: true
};
```
**理由:** Next.jsの設定。

**tailwind.config.ts**
```typescript
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"]
};
```
**理由:** Tailwind CSSの設定。

**postcss.config.mjs**
```javascript
export default {
  plugins: {
    tailwindcss: {}
  }
};
```
**理由:** CSSの処理設定。

---

#### 3. **環境変数のテンプレート**

**.env.example**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
**理由:** 
- ✅ 他の人がどんな環境変数が必要かわかる
- ✅ 値は入っていないのでセキュリティ的に安全
- ❌ `.env.local` は絶対にアップロードしない

---

#### 4. **.gitignore**
```
node_modules/
.next/
.env.local
.env
```
**理由:** GitHubにアップロードしないファイルを指定。

---

#### 5. **ドキュメント**
```
README.md              ← プロジェクトの説明
SETUP_GUIDE.md         ← セットアップ手順
GITHUB_GUIDE.md        ← GitHub連携手順
GITHUB_COMMANDS.md     ← Gitコマンド集
supabase-schema.sql    ← データベース構築SQL
```
**理由:** プロジェクトの使い方を説明。

---

### ❌ アップロードしてはいけないファイル

#### 1. **node_modules/**
```
node_modules/
├── next/
├── react/
├── @supabase/
└── ... (数千個のファイル)
```

**理由:**
- 📦 サイズが巨大（数百MB〜数GB）
- 🔄 `npm install` で再生成できる
- ⚡ GitHubが重くなる

**確認方法:**
```bash
# サイズを確認（Windows）
dir /s node_modules

# サイズを確認（Mac/Linux）
du -sh node_modules
```
**結果:** 数百MB以上

---

#### 2. **.next/**
```
.next/
├── cache/
├── server/
└── static/
```

**理由:**
- 🏗️ ビルド時に自動生成される
- 💾 不要なファイルが多い
- 🔄 `npm run build` で再生成できる

---

#### 3. **.env.local** 🔴 超重要
```bash
# ❌ これは絶対にアップロードしない！
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**理由:**
- 🔒 データベースの認証情報が含まれる
- 🚨 公開すると誰でもデータベースにアクセスできる
- 💰 悪用されると課金される可能性
- 🔐 セキュリティの大原則違反

**もしアップロードしてしまったら:**
1. Supabaseでパスワードをリセット
2. GitHubのリポジトリからファイルを削除
3. Gitの履歴からも完全に削除（専門的な操作が必要）

---

#### 4. **その他の除外ファイル**

**.DS_Store** (Macのみ)
```
Macのフォルダ設定ファイル
```
**理由:** Windowsユーザーに不要

**\*.log**
```
npm-debug.log
error.log
```
**理由:** 開発時のログファイル

---

## 🔍 .gitignore の役割

`.gitignore` ファイルに書かれたファイルは**自動的に除外**されます。

### .gitignore の内容
```
# 依存関係
/node_modules
/.pnp
.pnp.js

# Next.jsのビルドファイル
/.next/
/out/

# 環境変数（秘密情報）
.env*.local
.env

# その他
.DS_Store
*.log
```

### 確認方法
```bash
# どのファイルがGitで管理されているか確認
git status
```

**表示例:**
```
On branch main
Untracked files:
  src/
  package.json
  README.md

# node_modules/ は表示されない（除外されている）
```

---

## ✅ アップロード前のチェックリスト

### 1. 必須ファイルがあるか確認
```bash
ls -la
```

**確認項目:**
- [ ] `src/` ディレクトリがある
- [ ] `package.json` がある
- [ ] `.gitignore` がある
- [ ] `.env.example` がある
- [ ] `README.md` がある

---

### 2. 環境変数ファイルを確認

**✅ あるべきもの:**
```
.env.example     ← テンプレート（値は空）
```

**❌ アップロードしてはいけないもの:**
```
.env.local       ← 実際の認証情報（秘密）
.env             ← 実際の認証情報（秘密）
```

**確認コマンド（Windows）:**
```bash
dir /a .env*
```

**確認コマンド（Mac/Linux）:**
```bash
ls -la .env*
```

**結果:**
```
.env.example     ← ✅ OK
.env.local       ← これは .gitignore で除外される
```

---

### 3. node_modules が除外されているか確認

```bash
git status
```

**✅ 正常な場合:**
```
Untracked files:
  src/
  package.json
  README.md
  
# node_modules/ は表示されない
```

**❌ 異常な場合:**
```
Untracked files:
  node_modules/     ← これが表示されたら問題！
```

**解決方法:**
1. `.gitignore` ファイルに `node_modules/` が書かれているか確認
2. なければ追加する

---

## 🎯 実際のアップロード手順

### ステップ 1: 状態確認
```bash
cd student-cafe-app
git status
```

### ステップ 2: アップロード対象を追加
```bash
git add .
```

**この時点で追加されるファイル:**
- ✅ src/
- ✅ package.json
- ✅ README.md
- ✅ .env.example
- ❌ node_modules/ (自動除外)
- ❌ .env.local (自動除外)

### ステップ 3: 追加されたファイルを確認
```bash
git status
```

**表示例:**
```
Changes to be committed:
  new file:   package.json
  new file:   src/app/page.tsx
  new file:   README.md
  
# node_modules/ や .env.local は表示されない
```

### ステップ 4: コミット
```bash
git commit -m "初回コミット"
```

### ステップ 5: プッシュ
```bash
git push -u origin main
```

---

## 🔍 GitHubでの確認方法

### アップロード後、GitHubで確認

1. GitHubのリポジトリページを開く
2. ファイル一覧を確認

**✅ 表示されるべきもの:**
```
student-cafe-app/
├── src/
├── package.json
├── README.md
├── .gitignore
└── .env.example
```

**❌ 表示されてはいけないもの:**
```
node_modules/     ← これがあったら削除！
.env.local        ← これがあったら即削除！
.next/            ← これがあったら削除
```

---

## 🚨 緊急対応: .env.local をアップロードしてしまった場合

### ステップ 1: すぐにファイルを削除
```bash
git rm --cached .env.local
git commit -m "Remove sensitive file"
git push
```

### ステップ 2: Supabaseの認証情報をリセット

1. Supabaseダッシュボードを開く
2. Settings → API
3. 「Reset database password」をクリック
4. 新しいService Role Keyを取得
5. ローカルの `.env.local` を更新

### ステップ 3: GitHubリポジトリをPrivateに変更

1. GitHub → Settings → General
2. Danger Zone → Change repository visibility
3. 「Make private」を選択

---

## 📊 ファイルサイズの目安

### 正常なアップロードサイズ
```
全体: 約 100KB〜500KB

内訳:
- src/          約 50KB〜200KB
- package.json  約 1KB
- README.md     約 5KB
- 設定ファイル   約 10KB
```

### 異常なアップロードサイズ
```
全体: 100MB以上

原因:
- node_modules/ が含まれている (数百MB)
- .next/ が含まれている (数十MB)
```

---

## ✅ 最終チェックリスト

アップロード前に必ず確認:

### ファイルの確認
- [ ] `src/` ディレクトリがある
- [ ] `package.json` がある
- [ ] `.gitignore` がある
- [ ] `.env.example` がある（値は空）
- [ ] `README.md` がある

### 除外の確認
- [ ] `node_modules/` が除外されている
- [ ] `.env.local` が除外されている
- [ ] `.next/` が除外されている

### セキュリティの確認
- [ ] `.env.local` に秘密情報が入っている
- [ ] `.env.local` が `.gitignore` に書かれている
- [ ] GitHubにアップロードされていない

### Git の確認
```bash
# これを実行して確認
git status
```
- [ ] node_modules が表示されない
- [ ] .env.local が表示されない

---

## 🎓 まとめ

### アップロードの鉄則

1. **ソースコードはアップロード** ✅
   - src/
   - 設定ファイル
   - ドキュメント

2. **生成ファイルはアップロードしない** ❌
   - node_modules/
   - .next/
   - ビルドファイル

3. **秘密情報は絶対にアップロードしない** 🔒
   - .env.local
   - データベースパスワード
   - APIキー

4. **.gitignore を信頼する** 🛡️
   - 自動的に除外してくれる
   - 編集する必要はほぼない

---

## 🆘 困ったときは

### 「node_modules がアップロードされてしまった」
```bash
# .gitignore を確認
cat .gitignore

# node_modules を削除
git rm -r --cached node_modules
git commit -m "Remove node_modules"
git push
```

### 「.env.local がアップロードされてしまった」
```bash
# 即座に削除
git rm --cached .env.local
git commit -m "Remove sensitive file"
git push

# そしてSupabaseの認証情報をリセット！
```

### 「何をアップロードしたか確認したい」
```bash
# 最後のコミット内容を確認
git show --name-only
```

---

**結論: `git add .` を実行すれば、.gitignore が自動的に不要なファイルを除外してくれます！**

安心してアップロードしてください！ 🚀
