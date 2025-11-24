# 🚀 GitHub アップロード - クイックコマンド集

このファイルは、GitHubにアップロードするためのコマンドをまとめた簡易版です。
詳しい説明は `GITHUB_GUIDE.md` を参照してください。

---

## 📌 前提条件

- ✅ GitHubアカウントを作成済み
- ✅ Gitをインストール済み
- ✅ GitHubでリポジトリを作成済み

---

## 🎯 基本的な流れ

```
1. Gitの初期設定
2. GitHubリポジトリ作成
3. ローカルリポジトリ初期化
4. ファイルをコミット
5. GitHubにプッシュ
```

---

## 💻 実行コマンド

### 1. Gitの初期設定（最初の1回のみ）

```bash
git config --global user.name "あなたの名前"
git config --global user.email "あなたのメールアドレス"
```

**例:**
```bash
git config --global user.name "Taro Yamada"
git config --global user.email "taro@example.com"
```

---

### 2. プロジェクトフォルダに移動

**Windows:**
```bash
cd C:\Users\あなたの名前\Desktop\student-cafe-app
```

**Mac/Linux:**
```bash
cd ~/Desktop/student-cafe-app
```

---

### 3. Gitリポジトリを初期化

```bash
git init
```

---

### 4. すべてのファイルを追加

```bash
git add .
```

---

### 5. コミット（変更を記録）

```bash
git commit -m "初回コミット"
```

---

### 6. GitHubリポジトリと接続

```bash
git remote add origin https://github.com/あなたのユーザー名/student-cafe-app.git
```

**⚠️ 注意:** 
- `あなたのユーザー名` を実際のGitHubユーザー名に置き換える
- リポジトリ名も必要に応じて変更

**例:**
```bash
git remote add origin https://github.com/student-cafe-2024/student-cafe-app.git
```

---

### 7. ブランチ名をmainに変更

```bash
git branch -M main
```

---

### 8. GitHubにアップロード

```bash
git push -u origin main
```

**初回のみ:** GitHubへのログインが求められます。

---

## 🔄 コードを更新した後のコマンド

プロジェクトを修正した後、再度GitHubにアップロードする手順:

### 1. 変更をステージング

```bash
git add .
```

### 2. コミット

```bash
git commit -m "変更内容の説明"
```

**例:**
```bash
git commit -m "売上分析機能を追加"
git commit -m "バグ修正: カテゴリ削除時のエラー"
git commit -m "UIの改善"
```

### 3. プッシュ

```bash
git push
```

---

## 📋 よく使うコマンド一覧

### 現在の状態を確認

```bash
git status
```

**表示される内容:**
- 変更されたファイル（赤色）
- ステージングされたファイル（緑色）
- コミットされていない変更

---

### 変更履歴を確認

```bash
git log
```

または、見やすい形式で:
```bash
git log --oneline
```

**終了方法:** `q` キーを押す

---

### リモートリポジトリを確認

```bash
git remote -v
```

**表示される例:**
```
origin  https://github.com/あなたのユーザー名/student-cafe-app.git (fetch)
origin  https://github.com/あなたのユーザー名/student-cafe-app.git (push)
```

---

### 最新の状態をダウンロード

```bash
git pull
```

**使用場面:**
- 他の人が変更した内容を取得
- 別のパソコンで作業する前

---

## 🔧 トラブル時のコマンド

### コミットを取り消したい（直前のコミットのみ）

```bash
git reset --soft HEAD~1
```

**効果:** 
- コミットが取り消される
- ファイルの変更は残る

---

### すべての変更を破棄して元に戻す

```bash
git reset --hard HEAD
```

**⚠️ 警告:** 
- すべての変更が消えます
- 実行前に必ず確認

---

### 特定のファイルの変更を破棄

```bash
git checkout -- ファイル名
```

**例:**
```bash
git checkout -- src/app/page.tsx
```

---

## 📊 GitHubでの作業フロー

### 毎日の作業フロー

```bash
# 1. 作業開始前に最新状態を取得
git pull

# 2. コードを編集

# 3. 変更をコミット
git add .
git commit -m "今日の作業内容"

# 4. GitHubにアップロード
git push
```

---

### 週次バックアップ

```bash
# すべての変更をまとめてアップロード
git add .
git commit -m "週次バックアップ: 2025年1月第1週"
git push
```

---

## 🌐 GitHub URL一覧

### リポジトリURL

```
https://github.com/あなたのユーザー名/student-cafe-app
```

**用途:**
- コードを見る
- 他の人と共有
- Issueを作成

---

### Cloneする場合のURL

```
https://github.com/あなたのユーザー名/student-cafe-app.git
```

**使用場面:**
- 別のパソコンでプロジェクトを取得
- チームメンバーがコードをダウンロード

**コマンド:**
```bash
git clone https://github.com/あなたのユーザー名/student-cafe-app.git
```

---

## ⚡ Vercel デプロイコマンド（オプション）

Vercel CLIを使う場合:

### インストール

```bash
npm install -g vercel
```

### ログイン

```bash
vercel login
```

### デプロイ

```bash
vercel
```

**または:**

```bash
vercel --prod
```

---

## 🎓 Git 用語集

| 用語 | 意味 |
|------|------|
| **Repository（リポジトリ）** | プロジェクトの保管場所 |
| **Commit（コミット）** | 変更を記録すること |
| **Push（プッシュ）** | ローカルからGitHubにアップロード |
| **Pull（プル）** | GitHubから最新版をダウンロード |
| **Branch（ブランチ）** | 作業を分岐させる機能 |
| **Clone（クローン）** | リポジトリをコピーすること |
| **Origin（オリジン）** | リモートリポジトリの名前 |
| **Main / Master** | メインのブランチ名 |

---

## 📝 コミットメッセージのベストプラクティス

### 良い例

```bash
git commit -m "メニュー管理画面に検索機能を追加"
git commit -m "バグ修正: 売上入力時の合計金額計算エラー"
git commit -m "UI改善: ボタンのデザインを統一"
git commit -m "パフォーマンス改善: 商品一覧の読み込み速度向上"
```

### 悪い例

```bash
git commit -m "更新"
git commit -m "修正"
git commit -m "aaa"
git commit -m "test"
```

---

## 🔒 .gitignoreの確認

以下のファイル/フォルダはGitHubにアップロードされません:

```
node_modules/      # パッケージ
.next/             # ビルドファイル
.env.local         # 環境変数（秘密情報）
.DS_Store          # Macのシステムファイル
*.log              # ログファイル
```

**確認方法:**
プロジェクトフォルダの `.gitignore` ファイルを開く

---

## 🎉 チェックリスト

初回セットアップ時:
- [ ] GitHubアカウント作成
- [ ] Gitインストール
- [ ] Git初期設定（user.name, user.email）
- [ ] GitHubでリポジトリ作成
- [ ] `git init` 実行
- [ ] `git remote add origin` 実行
- [ ] `git push` 実行
- [ ] GitHubでコードが表示されることを確認

日常の更新時:
- [ ] `git add .`
- [ ] `git commit -m "メッセージ"`
- [ ] `git push`

---

## 💡 ヒント

1. **こまめにコミット**: 1つの機能を完成させたらコミット
2. **わかりやすいメッセージ**: 何を変更したか明確に書く
3. **毎日プッシュ**: バックアップの意味でも毎日GitHubにアップロード
4. **定期的にpull**: チーム作業の場合は作業前に必ずpull

---

**詳しい説明は `GITHUB_GUIDE.md` を参照してください。**
