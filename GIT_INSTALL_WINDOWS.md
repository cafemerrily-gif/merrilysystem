# 🔧 Windows用 Git インストール完全ガイド

## 🎯 エラーの原因

```
'git' は、内部コマンドまたは外部コマンド、
操作可能なプログラムまたはバッチ ファイルとして認識されていません。
```

このエラーは **Gitがインストールされていない** ことを意味します。

---

## 📥 Git for Windows のインストール手順

### ステップ 1: Git for Windows をダウンロード

1. ブラウザで以下のURLを開く:
   ```
   https://git-scm.com/download/win
   ```

2. 「**64-bit Git for Windows Setup**」をクリック
   - 自動的にダウンロードが始まります
   - ファイル名: `Git-2.xx.x-64-bit.exe` （xxはバージョン番号）
   - サイズ: 約50MB

---

### ステップ 2: インストーラーを実行

1. ダウンロードした `Git-2.xx.x-64-bit.exe` をダブルクリック

2. 「このアプリがデバイスに変更を加えることを許可しますか？」
   → **「はい」** をクリック

---

### ステップ 3: インストール設定（重要）

以下の画面が順番に表示されます。**推奨設定**を説明します。

#### 画面1: ライセンス同意
- 内容を確認
- **「Next」** をクリック

---

#### 画面2: インストール先
```
Destination Location
C:\Program Files\Git
```
- デフォルトのままでOK
- **「Next」** をクリック

---

#### 画面3: コンポーネント選択
```
Select Components
```

**推奨設定（以下にチェック）:**
- ✅ Windows Explorer integration
  - ✅ Git Bash Here
  - ✅ Git GUI Here
- ✅ Git LFS (Large File Support)
- ✅ Associate .git* configuration files with the default text editor
- ✅ Associate .sh files to be run with Bash

**「Next」** をクリック

---

#### 画面4: スタートメニュー
```
Select Start Menu Folder
```
- デフォルトのまま **「Next」** をクリック

---

#### 画面5: デフォルトエディタの選択 ⭐重要
```
Choosing the default editor used by Git
```

**推奨設定:**
- **「Use Visual Studio Code as Git's default editor」** を選択
  - VS Codeがインストール済みの場合
  
- VS Codeがない場合:
  - **「Use Notepad as Git's default editor」** を選択
  - または **「Use Vim」**（上級者向け）

**「Next」** をクリック

---

#### 画面6: 初期ブランチ名
```
Adjusting the name of the initial branch in new repositories
```

**推奨設定:**
- ● **「Override the default branch name for new repositories」** を選択
- ブランチ名に **「main」** と入力（デフォルトで入っているはず）

**「Next」** をクリック

---

#### 画面7: PATH環境変数の設定 ⭐超重要
```
Adjusting your PATH environment
```

**必須設定:**
- ● **「Git from the command line and also from 3rd-party software」**（真ん中）を選択

**説明:**
- コマンドプロンプトから `git` コマンドが使えるようになる
- 他の設定だと使えない場合がある

**「Next」** をクリック

---

#### 画面8: SSH実行ファイル
```
Choosing the SSH executable
```

**推奨設定:**
- ● **「Use bundled OpenSSH」** を選択（デフォルト）

**「Next」** をクリック

---

#### 画面9: HTTPS証明書
```
Choosing HTTPS transport backend
```

**推奨設定:**
- ● **「Use the OpenSSL library」** を選択（デフォルト）

**「Next」** をクリック

---

#### 画面10: 改行コードの変換
```
Configuring the line ending conversions
```

**推奨設定:**
- ● **「Checkout Windows-style, commit Unix-style line endings」** を選択（デフォルト）

**「Next」** をクリック

---

#### 画面11: ターミナルエミュレータ
```
Configuring the terminal emulator to use with Git Bash
```

**推奨設定:**
- ● **「Use MinTTY (the default terminal of MSYS2)」** を選択（デフォルト）

**「Next」** をクリック

---

#### 画面12: git pull の動作
```
Choose the default behavior of 'git pull'
```

**推奨設定:**
- ● **「Default (fast-forward or merge)」** を選択（デフォルト）

**「Next」** をクリック

---

#### 画面13: 認証ヘルパー
```
Choose a credential helper
```

**推奨設定:**
- ● **「Git Credential Manager」** を選択（デフォルト）

**「Next」** をクリック

---

#### 画面14: 追加オプション
```
Configuring extra options
```

**推奨設定:**
- ✅ **「Enable file system caching」** にチェック（デフォルト）
- ✅ **「Enable symbolic links」** にチェック

**「Next」** をクリック

---

#### 画面15: 実験的機能（オプション）
```
Configuring experimental options
```

**推奨設定:**
- すべて **チェックなし**（デフォルト）

**「Install」** をクリック

---

### ステップ 4: インストール完了を待つ

- プログレスバーが表示される
- ⏰ 所要時間: 2〜5分

**完了画面:**
```
Completing the Git Setup Wizard
```
- ✅ **「View Release Notes」** のチェックを外す
- **「Finish」** をクリック

---

## ✅ インストール確認

### 方法1: コマンドプロンプトで確認（推奨）

1. **コマンドプロンプトを新しく開く**
   - 🔴 重要: インストール前に開いていたものは閉じる
   - スタートメニュー → 「cmd」で検索
   - 「コマンドプロンプト」を起動

2. 以下のコマンドを実行:
```bash
git --version
```

**正常な結果:**
```
git version 2.43.0.windows.1
```
バージョン番号が表示されればOK ✅

**エラーの場合:**
```
'git' は、内部コマンドまたは外部コマンド、
操作可能なプログラムまたはバッチ ファイルとして認識されていません。
```
→ [トラブルシューティング](#トラブルシューティング) へ

---

### 方法2: Git Bashで確認

1. スタートメニューで「Git Bash」を検索
2. 「Git Bash」を起動
3. 以下のコマンドを実行:
```bash
git --version
```

**正常な結果:**
```
git version 2.43.0.windows.1
```

---

## 🔧 Git の初期設定

インストール確認ができたら、必ず以下の設定をしてください。

### ユーザー名とメールアドレスの設定

```bash
git config --global user.name "あなたの名前"
git config --global user.email "あなたのメールアドレス"
```

**例:**
```bash
git config --global user.name "Taro Yamada"
git config --global user.email "taro.yamada@example.com"
```

**説明:**
- コミット時にこの情報が記録される
- GitHubのメールアドレスと同じにするのが推奨

---

### 設定の確認

```bash
git config --global --list
```

**表示例:**
```
user.name=Taro Yamada
user.email=taro.yamada@example.com
```

---

## 🚀 プロジェクトのアップロード手順（再開）

Gitのインストールが完了したら、元の手順に戻れます。

### 1. プロジェクトフォルダに移動

```bash
cd C:\Users\あなたのユーザー名\Desktop\student-cafe-app
```

**確認:**
```bash
dir
```
`package.json` が表示されればOK

---

### 2. Gitリポジトリを初期化

```bash
git init
```

**表示される結果:**
```
Initialized empty Git repository in C:/Users/あなたのユーザー名/Desktop/student-cafe-app/.git/
```

---

### 3. 以降の手順

`GITHUB_COMMANDS.md` の手順に従って続けてください:

```bash
git add .
git commit -m "初回コミット"
git remote add origin https://github.com/あなたのユーザー名/student-cafe-app.git
git branch -M main
git push -u origin main
```

---

## 🔍 トラブルシューティング

### 問題1: `git --version` でエラーが出る

**症状:**
```
'git' は、内部コマンドまたは外部コマンド、
操作可能なプログラムまたはバッチ ファイルとして認識されていません。
```

**原因:** PATH環境変数が設定されていない

**解決方法:**

#### 手順1: コマンドプロンプトを再起動

1. 既存のコマンドプロンプトをすべて閉じる
2. 新しくコマンドプロンプトを開く
3. `git --version` を再度実行

これで解決する場合が多い ✅

---

#### 手順2: 環境変数を手動で確認

1. スタートメニューで「環境変数」と検索
2. 「システム環境変数の編集」を開く
3. 「環境変数」ボタンをクリック
4. 「システム環境変数」の「Path」を選択
5. 「編集」をクリック
6. 以下のパスが含まれているか確認:
   ```
   C:\Program Files\Git\cmd
   ```

**ない場合:**
1. 「新規」をクリック
2. `C:\Program Files\Git\cmd` と入力
3. 「OK」で閉じる
4. コマンドプロンプトを再起動

---

#### 手順3: Git Bashを使う（代替手段）

コマンドプロンプトでダメな場合、Git Bashを使う:

1. スタートメニュー → 「Git Bash」を検索
2. Git Bashを起動
3. Git Bashでコマンドを実行

```bash
cd /c/Users/あなたのユーザー名/Desktop/student-cafe-app
git init
git add .
git commit -m "初回コミット"
```

**注意:** パスの書き方が違う
- コマンドプロンプト: `C:\Users\...`
- Git Bash: `/c/Users/...`

---

### 問題2: インストールが途中で止まる

**原因:** セキュリティソフトが干渉している

**解決方法:**
1. セキュリティソフトを一時的に無効化
2. 再度インストール
3. 完了後、セキュリティソフトを有効化

---

### 問題3: 「管理者権限が必要です」エラー

**解決方法:**
1. インストーラーを右クリック
2. 「管理者として実行」を選択

---

### 問題4: ダウンロードが遅い

**代替ダウンロード先:**

Mirrorサイトからダウンロード:
```
https://github.com/git-for-windows/git/releases/latest
```

1. 「Assets」セクションを展開
2. `Git-2.xx.x-64-bit.exe` をダウンロード

---

## 📊 動作確認チェックリスト

インストール完了後、以下を確認してください:

### コマンドプロンプトで確認
- [ ] `git --version` でバージョンが表示される
- [ ] `git config --global user.name "名前"` が実行できる
- [ ] `git config --global user.email "メール"` が実行できる
- [ ] `git config --global --list` で設定が表示される

### Git Bashで確認
- [ ] スタートメニューに「Git Bash」がある
- [ ] Git Bashが起動する
- [ ] Git Bashで `git --version` が実行できる

---

## 🎓 Git Bash vs コマンドプロンプト

両方使えますが、違いを理解しておきましょう:

### コマンドプロンプト（cmd）
```bash
# パスの書き方
C:\Users\username\Desktop\project

# ディレクトリ移動
cd C:\Users\username\Desktop\project

# ファイル一覧
dir
```

**特徴:**
- ✅ Windowsの標準
- ✅ 慣れている人が多い
- ❌ Linuxコマンドが使えない

---

### Git Bash
```bash
# パスの書き方
/c/Users/username/Desktop/project

# ディレクトリ移動
cd /c/Users/username/Desktop/project

# ファイル一覧
ls
```

**特徴:**
- ✅ Linuxコマンドが使える（ls, grep, etc）
- ✅ Macと同じコマンドが使える
- ❌ パスの書き方が特殊

---

## 💡 推奨事項

### プロジェクト作業時
- **コマンドプロンプト** または **Git Bash** のどちらか一方を使う
- 混在させない（混乱するため）

### 初心者には
- **コマンドプロンプト** を推奨
  - Windowsの標準なので学習コストが低い
  - パスの書き方がわかりやすい

### 経験者には
- **Git Bash** を推奨
  - MacやLinuxと同じ操作感
  - より強力なコマンドが使える

---

## 🎯 次のステップ

Gitのインストールが完了したら:

1. **Git初期設定**
   ```bash
   git config --global user.name "あなたの名前"
   git config --global user.email "あなたのメールアドレス"
   ```

2. **GitHubアカウント作成**
   - まだの場合: https://github.com

3. **プロジェクトをアップロード**
   - `GITHUB_COMMANDS.md` の手順に従う

4. **動作確認**
   - GitHubでコードが表示されるか確認

---

## 📚 参考リンク

- **Git公式サイト**: https://git-scm.com/
- **Git for Windows**: https://gitforwindows.org/
- **GitHub**: https://github.com/
- **Git日本語ドキュメント**: https://git-scm.com/book/ja/v2

---

## ✅ 完了確認

以下が全てできたら成功です:

- [ ] Gitがインストールされている
- [ ] `git --version` でバージョンが表示される
- [ ] ユーザー名とメールアドレスを設定した
- [ ] コマンドプロンプトまたはGit Bashが使える
- [ ] プロジェクトフォルダで `git init` が実行できる

**おめでとうございます！GitHubにアップロードする準備が整いました！** 🎉

---

次は `GITHUB_COMMANDS.md` を参照して、実際にアップロードしてください！
