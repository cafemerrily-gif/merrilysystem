# 🌐 本番環境デプロイ完全ガイド（Vercel）

## 🎯 目標

GitHubにアップロードしたプロジェクトを、**インターネット上で実際に動くアプリ**として公開します。

**完成イメージ:**
```
https://student-cafe-app.vercel.app
```
このようなURLで、誰でもアクセスできるアプリが完成します！

---

## 📋 前提条件

以下が完了していることを確認:
- ✅ GitHubアカウントがある
- ✅ プロジェクトがGitHubにアップロード済み
- ✅ Supabaseプロジェクトが作成済み
- ✅ `.env.local` に認証情報が設定済み（ローカルで動作確認済み）

---

## 🚀 Vercelデプロイ手順（30分で完了）

### ステップ 1: Vercelアカウント作成

#### 1-1: Vercelにアクセス

ブラウザで以下を開く:
```
https://vercel.com
```

#### 1-2: サインアップ

1. 右上の「**Sign Up**」をクリック

2. 「**Continue with GitHub**」を選択
   - GitHubアカウントで登録するのが最も簡単

3. GitHubのログイン画面が表示されたら:
   - GitHubのユーザー名/メールアドレスとパスワードを入力
   - 「**Sign in**」をクリック

4. Vercelの認証画面が表示される:
   - 「**Authorize Vercel**」をクリック
   - GitHubのパスワードを再入力（求められた場合）

#### 1-3: アカウント情報入力

1. 名前を入力（任意）
2. 「**Continue**」をクリック

#### 1-4: チーム設定（スキップ可能）

- 「**Skip**」または「**Continue**」でOK

**完了！** Vercelダッシュボードが表示されます。

---

### ステップ 2: GitHubリポジトリをインポート

#### 2-1: 新規プロジェクト作成

1. Vercelダッシュボードの右上
2. 「**Add New...**」をクリック
3. 「**Project**」を選択

#### 2-2: GitHubリポジトリを選択

**「Import Git Repository」画面:**

1. **自分のリポジトリが表示されている場合:**
   - `student-cafe-app` を探す
   - 「**Import**」ボタンをクリック

2. **リポジトリが表示されない場合:**
   - 「**Adjust GitHub App Permissions**」をクリック
   - GitHubの設定画面が開く
   - 「**All repositories**」または「**Only select repositories**」を選択
   - `student-cafe-app` にチェック
   - 「**Save**」をクリック
   - Vercelに戻る
   - ページをリロード
   - リポジトリが表示される

#### 2-3: プロジェクト名の確認

**「Configure Project」画面:**

- **Project Name**: `student-cafe-app`（自動入力される）
  - そのままでOK
  - 変更したい場合は任意の名前に変更可能

---

### ステップ 3: 環境変数の設定 🔴超重要

この手順が**最も重要**です！ここを間違えるとアプリが動きません。

#### 3-1: 環境変数セクションを開く

**「Configure Project」画面をスクロール:**

- 「**Environment Variables**」セクションを探す
- セクションが閉じている場合は展開する

#### 3-2: Supabase認証情報を取得

**別のタブでSupabaseを開く:**

1. [https://supabase.com/dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクトを選択
3. 左下の「⚙️ **Project Settings**」をクリック
4. 左メニューの「**API**」をクリック

**以下の3つをコピー（メモ帳に貼り付けておく）:**

1. **Project URL**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

2. **anon public key**
   - 「Project API keys」の「anon」「public」欄
   - 「👁️ Reveal」をクリックして表示
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（長い文字列）
   ```

3. **service_role key**
   - 「Project API keys」の「service_role」「secret」欄
   - 「👁️ Reveal」をクリックして表示
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（長い文字列）
   ```

#### 3-3: Vercelに環境変数を追加

**Vercelのタブに戻る:**

**1つ目の環境変数:**

1. **Name（キー名）**: `NEXT_PUBLIC_SUPABASE_URL`
2. **Value（値）**: 先ほどコピーした Project URL を貼り付け
3. **Environment**: すべてチェックされているか確認
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. 「**Add**」ボタンをクリック

**2つ目の環境変数:**

1. **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **Value**: anon public key を貼り付け
3. **Environment**: すべてチェック
4. 「**Add**」ボタンをクリック

**3つ目の環境変数:**

1. **Name**: `SUPABASE_SERVICE_ROLE_KEY`
2. **Value**: service_role key を貼り付け
3. **Environment**: すべてチェック
4. 「**Add**」ボタンをクリック

#### 3-4: 環境変数の確認

追加した環境変数が3つ表示されているか確認:

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
```

**🔴 重要な注意:**
- 値にスペースが入っていないか確認
- `"` や `'` で囲まない
- すべてコピペで正確に入力

---

### ステップ 4: デプロイ実行

#### 4-1: デプロイ開始

1. 画面を下にスクロール
2. 「**Deploy**」ボタンをクリック

**デプロイ開始！** 🚀

#### 4-2: デプロイ進行状況

**デプロイ画面が表示される:**

```
Building...
⚡ Deploying...
```

**進行状況:**
1. Building（ビルド中）: 30秒〜2分
2. Deploying（デプロイ中）: 10秒〜30秒

**ログが流れます:**
```
Installing dependencies...
Building application...
Uploading build...
Deploying to production...
```

⏰ **所要時間: 2〜3分**

---

### ステップ 5: デプロイ完了確認

#### 5-1: 成功画面

**デプロイ成功時:**

```
🎉 Congratulations!
```

画面中央に大きく表示されます。

**表示される情報:**
- プロジェクト画像（スクリーンショット）
- 本番URL
- 「**Continue to Dashboard**」ボタン

#### 5-2: 本番URLを確認

**URLの形式:**
```
https://student-cafe-app-xxxx.vercel.app
```

または

```
https://student-cafe-app.vercel.app
```

**このURLをコピーしておく！**

#### 5-3: アプリにアクセス

1. URLをクリック、または新しいタブで開く
2. アプリが表示される ✅

**確認項目:**
- ☕ 学生経営カフェ管理システム（タイトル）
- メニュー管理、売上入力のカード
- Powered by Supabase 🚀

---

### ステップ 6: 動作確認

#### 6-1: メニュー管理画面

1. 「**メニュー管理**」カードをクリック
2. カテゴリ一覧が表示されるか確認
   - ドリンク
   - フード
   - 季節限定
3. 商品一覧が表示されるか確認

**✅ 表示されればOK**

#### 6-2: データの追加テスト

**新規カテゴリ追加:**
1. 「新規カテゴリ追加」フォームに入力
   - カテゴリ名: `テスト`
   - 説明: `本番環境テスト`
2. 「カテゴリを追加」をクリック
3. 「カテゴリを追加しました」と表示される ✅
4. カテゴリ一覧に「テスト」が追加される ✅

#### 6-3: 売上入力画面

1. ホームに戻る
2. 「**売上入力**」カードをクリック
3. 商品一覧が表示される ✅
4. 適当な商品をクリックして追加
5. 「会計を登録」をクリック
6. 「会計を登録しました」と表示される ✅

---

## 🎉 デプロイ完了！

おめでとうございます！アプリがインターネット上に公開されました！

### 取得したURL

**本番環境URL:**
```
https://student-cafe-app-xxxx.vercel.app
```

**このURLでできること:**
- ✅ どこからでもアクセス可能
- ✅ スマートフォンからもアクセス可能
- ✅ チームメンバーに共有可能
- ✅ 実際の業務で使用可能

---

## 📱 スマホでアクセス

### スマホから確認する方法

1. スマホのブラウザ（Safari、Chrome）を開く
2. Vercelの本番URLを入力
3. アプリが表示される ✅

**または:**
- 自分宛にURLをメール送信
- スマホでメールを開いてURLをタップ

---

## 🔄 コードを更新した場合

### ローカルで修正 → GitHubにプッシュ → 自動デプロイ

#### ステップ1: ローカルで修正

```bash
# ファイルを編集
# 例: src/app/page.tsx を修正
```

#### ステップ2: GitHubにプッシュ

```bash
git add .
git commit -m "機能追加: ○○を実装"
git push
```

#### ステップ3: 自動デプロイ

**Vercelが自動的に:**
1. GitHubの変更を検知
2. 自動的にビルド開始
3. 本番環境に自動デプロイ

⏰ **所要時間: 2〜3分**

**確認方法:**
1. Vercelダッシュボードを開く
2. 「Deployments」タブを開く
3. 最新のデプロイが「Building...」→「Ready」になる
4. 本番URLにアクセスして確認

---

## 🌐 独自ドメインの設定（オプション）

### 独自ドメインを使いたい場合

**例:**
```
https://cafe.example.com
```

**必要なもの:**
- 独自ドメイン（お名前.com、ムームードメインなどで購入）

**設定手順:**

1. Vercelダッシュボード
2. プロジェクトを選択
3. 「**Settings**」タブ
4. 左メニューの「**Domains**」
5. 「**Add**」ボタンをクリック
6. ドメイン名を入力
7. DNSレコードを設定（指示に従う）

**詳細は公式ドキュメント:**
https://vercel.com/docs/concepts/projects/domains

---

## 🔧 Vercelダッシュボードの使い方

### プロジェクト画面

**「Overview」タブ:**
- 最新のデプロイ状況
- 本番URL
- Gitブランチ
- デプロイ履歴

**「Deployments」タブ:**
- すべてのデプロイ履歴
- 各デプロイの詳細ログ
- ロールバック機能

**「Settings」タブ:**
- 環境変数の管理
- ドメイン設定
- プロジェクト削除

---

## 🆘 トラブルシューティング

### 問題1: 「Application error」が表示される

**原因:** 環境変数が正しく設定されていない

**解決策:**

1. Vercelダッシュボード → プロジェクト選択
2. 「**Settings**」タブ → 「**Environment Variables**」
3. 3つの環境変数が正しいか確認:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 間違っている場合:
   - 「Edit」で修正
   - または「Delete」して再追加
5. 「**Deployments**」タブ → 最新デプロイの「...」→「**Redeploy**」

---

### 問題2: 「カテゴリの取得に失敗しました」

**原因:** Supabase認証情報が間違っている

**解決策:**

1. Supabaseダッシュボードを開く
2. Project Settings → API
3. 認証情報を再確認
4. Vercelの環境変数を修正
5. 再デプロイ

---

### 問題3: 「データが保存されない」

**原因:** Row Level Security（RLS）の設定

**解決策:**

1. Supabaseダッシュボード → SQL Editor
2. 以下のSQLを実行:

```sql
-- service_roleに全権限を付与
CREATE POLICY "Enable all for service role" ON categories 
  FOR ALL TO service_role USING (true);

CREATE POLICY "Enable all for service role" ON products 
  FOR ALL TO service_role USING (true);

CREATE POLICY "Enable all for service role" ON sales 
  FOR ALL TO service_role USING (true);

CREATE POLICY "Enable all for service role" ON sale_items 
  FOR ALL TO service_role USING (true);
```

3. Vercelで再デプロイ

---

### 問題4: デプロイは成功するが画面が真っ白

**原因:** ビルドエラー

**解決策:**

1. Vercelダッシュボード → Deployments
2. 最新デプロイをクリック
3. 「**Building**」セクションのログを確認
4. エラーメッセージを探す
5. エラーに応じて修正:
   - 構文エラー → コードを修正
   - 依存関係エラー → `package.json` を確認
6. GitHubにプッシュして再デプロイ

---

### 問題5: ビルドに失敗する

**エラー例:**
```
Build failed: Module not found
```

**原因:** パッケージのインストール失敗

**解決策:**

1. ローカルで確認:
```bash
npm install
npm run build
```

2. ローカルでビルドが成功する場合:
   - Vercelで「Redeploy」

3. ローカルでもエラーが出る場合:
   - エラーメッセージに従って修正
   - GitHubにプッシュ

---

## 📊 URLの種類まとめ

プロジェクトには複数のURLがあります:

### 1. **ローカル開発環境**
```
http://localhost:3000
```
- 自分のパソコンでのみアクセス可能
- `npm run dev` で起動

### 2. **GitHubリポジトリ**
```
https://github.com/あなたのユーザー名/student-cafe-app
```
- ソースコードを見るためのURL
- チームメンバーと共有

### 3. **Vercel本番環境** 🌟
```
https://student-cafe-app-xxxx.vercel.app
```
- 実際に動くアプリのURL
- インターネットからアクセス可能
- **このURLを使って業務を開始！**

---

## 🎓 よくある質問

### Q1: Vercelは無料で使える？

**A:** はい、無料プランがあります。

**無料プランの制限:**
- 月間100GBの帯域幅
- 無制限のデプロイ
- 個人・小規模プロジェクトなら十分

**有料プランが必要な場合:**
- 独自ドメインを複数使いたい
- チーム機能を使いたい
- 帯域幅が足りなくなった

---

### Q2: URLを変更できる？

**A:** はい、可能です。

**方法:**
1. Vercelダッシュボード
2. Settings → Domains
3. 新しいドメインを追加
4. 元のURLは残る（削除も可能）

---

### Q3: データはどこに保存される？

**A:** Supabaseのクラウドサーバーに保存されます。

- Vercelはアプリの実行環境のみ
- データベースはSupabase
- 両方とも異なるサービス

---

### Q4: 本番環境とローカル環境でデータは共有される？

**A:** はい、同じSupabaseプロジェクトを使っているため共有されます。

**注意:**
- 本番環境で追加したデータは、ローカルでも見える
- ローカルで削除したデータは、本番環境からも消える

**開発用と本番用を分けたい場合:**
- Supabaseで2つのプロジェクトを作成
- 開発用：ローカル環境で使用
- 本番用：Vercelで使用

---

### Q5: エラーログはどこで見る？

**A:** Vercelダッシュボード

1. Deployments タブ
2. 該当デプロイをクリック
3. ログが表示される

**リアルタイムログ:**
- Functions タブで確認可能

---

## ✅ デプロイ完了チェックリスト

すべてチェックできたら成功です:

### 基本設定
- [ ] Vercelアカウント作成完了
- [ ] GitHubとVercelを連携
- [ ] プロジェクトをインポート

### 環境変数
- [ ] `NEXT_PUBLIC_SUPABASE_URL` を設定
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
- [ ] `SUPABASE_SERVICE_ROLE_KEY` を設定
- [ ] すべての環境変数が正確

### デプロイ
- [ ] デプロイが成功（Congratulations画面）
- [ ] 本番URLにアクセスできる
- [ ] トップページが表示される

### 動作確認
- [ ] メニュー管理画面が開く
- [ ] カテゴリ一覧が表示される
- [ ] 新規カテゴリを追加できる
- [ ] 売上入力画面が開く
- [ ] 商品を選択できる
- [ ] 会計を登録できる

### 共有
- [ ] 本番URLをコピー
- [ ] スマホからアクセス確認
- [ ] チームメンバーに共有

---

## 🎉 次のステップ

デプロイが完了したら:

1. **本番URLをブックマーク**
   - 毎日使うので保存しておく

2. **チームメンバーに共有**
   - URLを共有
   - 使い方を説明

3. **実際の業務で使ってみる**
   - 実際のメニューを登録
   - 売上データを入力

4. **フィードバックを集める**
   - 使いにくい点を改善
   - 必要な機能を追加

5. **継続的な開発**
   - 機能追加
   - GitHubにプッシュ
   - 自動デプロイ

---

**おめでとうございます！🎉**

アプリがインターネット上で公開され、実際に使えるようになりました！

本番URL:
```
https://student-cafe-app-xxxx.vercel.app
```

このURLを使って、学生カフェの業務を開始してください！☕✨
