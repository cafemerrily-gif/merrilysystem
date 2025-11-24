# 🚀 GitHubへのアップロードとURL取得ガイド

このガイドでは、プロジェクトをGitHubにアップロードして、URLを取得する方法を説明します。

## 📋 目次

1. [GitHubアカウントの作成](#1-githubアカウントの作成)
2. [Gitのインストール](#2-gitのインストール)
3. [GitHubリポジトリの作成](#3-githubリポジトリの作成)
4. [プロジェクトをGitHubにアップロード](#4-プロジェクトをgithubにアップロード)
5. [GitHubのURLを取得](#5-githubのurlを取得)
6. [Vercelでデプロイ（本番公開）](#6-vercelでデプロイ本番公開)

---

## 1. GitHubアカウントの作成

### ステップ 1-1: GitHubにアクセス

1. ブラウザで [https://github.com](https://github.com) を開く
2. 右上の「**Sign up**」をクリック

### ステップ 1-2: アカウント情報を入力

1. **Email address**: メールアドレスを入力
2. **Password**: パスワードを設定（最低8文字）
3. **Username**: ユーザー名を決める（英数字とハイフン）
   - 例: `student-cafe-2024`
4. **Email preferences**: メール受信の設定（不要なら "n"）
5. 「**Continue**」をクリック

### ステップ 1-3: 認証とアカウント確認

1. パズル認証を完了
2. 「**Create account**」をクリック
3. メールに届いた確認コードを入力
4. アンケート画面は「Skip」でOK
5. プラン選択画面で「**Free**」を選択

---

## 2. Gitのインストール

### ステップ 2-1: Gitがインストール済みか確認

**Windowsの場合:**
```bash
git --version
```

**Macの場合:**
```bash
git --version
```

**結果:**
- バージョン番号が表示される → ✅ インストール済み（ステップ3へ）
- エラーが表示される → インストールが必要

### ステップ 2-2: Gitのインストール（必要な場合）

**Windowsの場合:**
1. [https://git-scm.com/download/win](https://git-scm.com/download/win) にアクセス
2. 「64-bit Git for Windows Setup」をダウンロード
3. ダウンロードしたファイルを実行
4. すべてデフォルト設定のまま「Next」で進める
5. インストール完了後、コマンドプロンプトを**再起動**

**Macの場合:**
1. ターミナルで以下を実行:
```bash
xcode-select --install
```
2. インストール画面が表示されたら「Install」をクリック
3. 完了まで待つ（5〜10分）

### ステップ 2-3: Gitの初期設定

コマンドプロンプト/ターミナルで以下を実行:

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

## 3. GitHubリポジトリの作成

### ステップ 3-1: 新規リポジトリを作成

1. [https://github.com](https://github.com) にログイン
2. 右上の「**+**」アイコンをクリック
3. 「**New repository**」を選択

### ステップ 3-2: リポジトリ情報を入力

以下の情報を入力します:

- **Repository name（リポジトリ名）**: `student-cafe-app`
  - 英数字、ハイフン、アンダースコアのみ使用可能
  
- **Description（説明）**: `学生経営カフェ管理システム`（任意）

- **Public / Private**: 
  - ✅ **Private（推奨）**: 自分だけがアクセス可能
  - Public: 誰でも見られる

- **Initialize this repository with:**
  - ❌ すべてチェックを**外す**（重要！）

### ステップ 3-3: リポジトリを作成

「**Create repository**」ボタンをクリック

---

## 4. プロジェクトをGitHubにアップロード

### ステップ 4-1: プロジェクトフォルダに移動

コマンドプロンプト/ターミナルを開いて、プロジェクトフォルダに移動:

**Windowsの場合:**
```bash
cd C:\Users\あなたの名前\Desktop\student-cafe-app
```

**Macの場合:**
```bash
cd ~/Desktop/student-cafe-app
```

### ステップ 4-2: Gitリポジトリを初期化

```bash
git init
```

**表示されるメッセージ:**
```
Initialized empty Git repository in ...
```

### ステップ 4-3: .gitignoreの確認

プロジェクトフォルダに `.gitignore` ファイルがあることを確認。
これにより、不要なファイル（node_modules等）がアップロードされません。

### ステップ 4-4: ファイルをステージング

```bash
git add .
```

**説明:** `.` はすべてのファイルを追加する意味

### ステップ 4-5: コミット（変更を記録）

```bash
git commit -m "初回コミット: プロジェクト作成"
```

**表示される例:**
```
[master (root-commit) abc1234] 初回コミット: プロジェクト作成
 XX files changed, XXX insertions(+)
```

### ステップ 4-6: GitHubと接続

GitHubの画面に表示されているコマンドをコピーして実行します。

**まず、リモートリポジトリを追加:**
```bash
git remote add origin https://github.com/あなたのユーザー名/student-cafe-app.git
```

**例:**
```bash
git remote add origin https://github.com/student-cafe-2024/student-cafe-app.git
```

### ステップ 4-7: ブランチ名を変更（必要な場合）

```bash
git branch -M main
```

### ステップ 4-8: GitHubにプッシュ（アップロード）

```bash
git push -u origin main
```

**初回のみ、GitHubへのログインが求められます:**

**Windowsの場合:**
- ブラウザが開いて認証画面が表示される
- 「Authorize Git Credential Manager」をクリック

**Macの場合:**
- ユーザー名とパスワード（またはPersonal Access Token）を入力

**アップロード完了の確認:**
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
...
To https://github.com/あなたのユーザー名/student-cafe-app.git
 * [new branch]      main -> main
```

---

## 5. GitHubのURLを取得

### ステップ 5-1: リポジトリページを開く

1. ブラウザで [https://github.com](https://github.com) を開く
2. 自分のプロフィールアイコンをクリック
3. 「**Your repositories**」を選択
4. `student-cafe-app` をクリック

### ステップ 5-2: リポジトリURLをコピー

**方法1: ブラウザのアドレスバーからコピー**
- URLは以下の形式: 
  ```
  https://github.com/あなたのユーザー名/student-cafe-app
  ```

**方法2: 緑色の「Code」ボタンから**
1. 「**Code**」ボタン（緑色）をクリック
2. 「HTTPS」タブを選択
3. URLをコピー

**取得できるURL:**
```
https://github.com/student-cafe-2024/student-cafe-app
```

このURLを共有すれば、他の人もプロジェクトを見られます（Publicの場合）。

---

## 6. Vercelでデプロイ（本番公開）

GitHubにアップロードしたら、Vercelで**本番環境**として公開できます。

### ステップ 6-1: Vercelアカウント作成

1. [https://vercel.com](https://vercel.com) にアクセス
2. 「**Sign Up**」をクリック
3. 「**Continue with GitHub**」を選択
4. GitHubで認証を許可

### ステップ 6-2: プロジェクトをインポート

1. Vercelダッシュボードで「**Add New...**」→「**Project**」をクリック
2. 「**Import Git Repository**」から `student-cafe-app` を選択
3. 「**Import**」をクリック

### ステップ 6-3: 環境変数を設定

**重要:** Supabaseの認証情報を設定します。

1. 「**Environment Variables**」セクションを展開
2. 以下の3つを追加:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseのProject URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseのanon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseのservice_role key |

**追加方法:**
1. 「Name」欄にキー名を入力
2. 「Value」欄に値を入力（`.env.local` からコピー）
3. 「**Add**」をクリック
4. 3つすべて追加する

### ステップ 6-4: デプロイ

1. 「**Deploy**」ボタンをクリック
2. デプロイ完了を待つ（2〜3分）
3. 「**Congratulations!**」画面が表示されたらOK

### ステップ 6-5: 本番URLを取得

デプロイ完了後、以下のようなURLが発行されます:

```
https://student-cafe-app-xxxxxxx.vercel.app
```

このURLにアクセスすれば、**インターネット上でアプリが使えます**！

---

## 7. コードを更新する方法

プロジェクトを修正した後、GitHubとVercelに反映させる手順:

### ステップ 7-1: 変更をコミット

```bash
git add .
git commit -m "機能追加: ○○を実装"
git push
```

### ステップ 7-2: 自動デプロイ

Vercelは**自動的に**変更を検知して再デプロイします。
GitHubにpushするだけで、本番環境も更新されます！

---

## 8. URLの種類まとめ

プロジェクトには3種類のURLがあります:

### 1. ローカル開発環境
```
http://localhost:3000
```
- 自分のパソコンでのみアクセス可能
- `npm run dev` で起動

### 2. GitHubリポジトリURL
```
https://github.com/あなたのユーザー名/student-cafe-app
```
- コードを見るためのURL
- 他の人と共有してコードレビューできる

### 3. 本番環境URL（Vercel）
```
https://student-cafe-app-xxxxxxx.vercel.app
```
- 実際にアプリが動作するURL
- インターネット上で誰でもアクセス可能
- スマホからもアクセス可能

---

## 9. トラブルシューティング

### 問題1: `git push` でエラー

**エラーメッセージ:**
```
Permission denied (publickey)
```

**解決策:**
1. GitHubで Personal Access Token を作成
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. 「Generate new token (classic)」をクリック
4. 「repo」にチェック
5. トークンをコピー
6. パスワードの代わりにトークンを使用

---

### 問題2: Vercelデプロイエラー

**原因:** 環境変数が設定されていない

**解決策:**
1. Vercel → プロジェクト → Settings → Environment Variables
2. 3つの環境変数が正しく設定されているか確認
3. Deployments → 最新のデプロイ → Redeploy

---

### 問題3: 本番環境でデータが保存されない

**原因:** Supabaseの環境変数が間違っている

**解決策:**
1. Supabaseダッシュボードで認証情報を再確認
2. Vercelの環境変数を修正
3. 再デプロイ

---

## 10. よくある質問

### Q1: Privateリポジトリでも他の人と共有できる？

**A:** できます。以下の手順で共同編集者を追加:
1. GitHubリポジトリページ → Settings
2. Collaborators → Add people
3. 相手のGitHubユーザー名を入力

### Q2: GitHubのURLを変更したい

**A:** リポジトリ設定で変更可能:
1. Settings → Repository name
2. 新しい名前を入力
3. Rename

### Q3: Vercelの無料プランの制限は？

**A:**
- 月間100GBの帯域幅
- 無制限のデプロイ
- 個人プロジェクトなら十分

### Q4: 独自ドメインを使いたい

**A:** Vercelで設定可能（有料プランまたは外部ドメイン）:
1. ドメイン取得（お名前.com等）
2. Vercel → Project → Settings → Domains
3. ドメインを追加

---

## 🎉 完了！

これで以下が達成できました:

- ✅ GitHubにコードをアップロード
- ✅ GitHubのURLを取得
- ✅ Vercelで本番環境を公開（オプション）
- ✅ 自動デプロイの設定

**次のステップ:**
- [ ] チームメンバーをGitHubに招待
- [ ] 本番URLをカフェメンバーに共有
- [ ] 定期的にコードをバックアップ（git push）
- [ ] 機能追加とデプロイのサイクルを回す

お疲れ様でした！🚀✨
