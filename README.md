# 学生経営カフェ管理システム (Supabase版)

Next.js 14 + TypeScript + Supabase で構築された学生経営カフェ向けの業務管理Webアプリケーション

## 機能

- **メニュー管理** (開発部向け)
  - カテゴリの追加・一覧表示
  - 商品の追加・一覧表示
  - カテゴリ別商品管理

- **売上入力** (会計部向け)
  - POSレジ風の商品選択UI
  - カート機能
  - 日時指定での売上登録
  - トランザクション処理による安全な登録

- **コレクション管理** (将来拡張用)
  - 特定コレクション(例: 2025クリスマス商品)の商品一覧取得API

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React 18, TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド**: Next.js Route Handlers
- **データベース**: Supabase (PostgreSQL)
- **DB接続**: @supabase/supabase-js

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスし、新規プロジェクトを作成
2. Project Settings > API から以下の情報を取得:
   - Project URL
   - API Keys (anon/public と service_role)

### 3. 環境変数の設定

`.env.local` ファイルをプロジェクトルートに作成し、以下の内容を設定してください:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Supabaseデータベーススキーマの作成

SupabaseのSQL Editorで以下のSQLを実行してください:

```sql
-- カテゴリテーブル
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_seasonal BOOLEAN NOT NULL DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  created_by BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 商品テーブル
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  image_url VARCHAR(255),
  created_by BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 売上ヘッダテーブル
CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  sale_date DATE NOT NULL,
  sale_time TIME NOT NULL,
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('morning', 'lunch', 'afternoon', 'evening')),
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'qr', 'other')),
  note TEXT,
  entered_by BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 売上明細テーブル
CREATE TABLE sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- コレクションテーブル（将来拡張用）
CREATE TABLE product_collections (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- コレクション商品紐付けテーブル
CREATE TABLE collection_products (
  id BIGSERIAL PRIMARY KEY,
  collection_id BIGINT NOT NULL REFERENCES product_collections(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(collection_id, product_id)
);

-- インデックス作成
CREATE INDEX idx_categories_display_order ON categories(display_order);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_time_slot ON sales(time_slot);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- Row Level Security (RLS) を有効化（オプション）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- サービスロールには全権限を付与（API経由のアクセス用）
CREATE POLICY "Enable all for service role" ON categories FOR ALL TO service_role USING (true);
CREATE POLICY "Enable all for service role" ON products FOR ALL TO service_role USING (true);
CREATE POLICY "Enable all for service role" ON sales FOR ALL TO service_role USING (true);
CREATE POLICY "Enable all for service role" ON sale_items FOR ALL TO service_role USING (true);
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ディレクトリ構造

```
student-cafe-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # トップページ
│   │   ├── layout.tsx                  # ルートレイアウト
│   │   ├── globals.css                 # グローバルスタイル
│   │   ├── admin/
│   │   │   └── menu/
│   │   │       └── page.tsx            # メニュー管理画面
│   │   ├── accounting/
│   │   │   └── sales/
│   │   │       └── page.tsx            # 売上入力画面
│   │   └── api/
│   │       ├── categories/
│   │       │   └── route.ts            # カテゴリAPI
│   │       ├── products/
│   │       │   └── route.ts            # 商品API
│   │       ├── sales/
│   │       │   └── route.ts            # 売上API
│   │       └── collections/
│   │           └── [id]/
│   │               └── products/
│   │                   └── route.ts    # コレクション商品API
│   └── lib/
│       └── supabase.ts                  # Supabase接続ユーティリティ
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
└── .env.local                           # 環境変数（要作成）
```

## API エンドポイント

### カテゴリ管理
- `GET /api/categories` - カテゴリ一覧取得
- `POST /api/categories` - カテゴリ新規作成

### 商品管理
- `GET /api/products` - 商品一覧取得
- `POST /api/products` - 商品新規作成

### 売上管理
- `POST /api/sales` - 売上登録

### コレクション
- `GET /api/collections/[id]/products` - コレクション別商品取得

## MySQL版からの移行のポイント

### 主な変更点

1. **データベース接続**
   - `mysql2/promise` → `@supabase/supabase-js`
   - `src/lib/db.ts` → `src/lib/supabase.ts`

2. **クエリ構文**
   - SQL文の直接実行 → Supabaseのクエリビルダー
   - JOINクエリ → `select()` での関連データ取得

3. **環境変数**
   - `DB_HOST`, `DB_USER` 等 → `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`

4. **トランザクション処理**
   - MySQL の BEGIN/COMMIT → Supabaseは自動トランザクション + エラー時のロールバック処理

5. **型システム**
   - Supabaseは型安全なクエリが可能（Database型定義を活用）

## 変更をGitHubに反映する手順

ローカルで修正したコードをGitHubに送る際の最短手順です。詳細な解説は同梱の [GITHUB_GUIDE.md](./GITHUB_GUIDE.md) を参照してください。

1. **変更を確認**
   ```bash
   git status
   ```

2. **必要なファイルをステージング**
   ```bash
   git add <変更したファイルパス>
   ```

3. **コミットメッセージを付けて記録**
   ```bash
   git commit -m "更新内容を要約したメッセージ"
   ```

4. **リモート(mainブランチ)へプッシュ**
   ```bash
   git push origin main
   ```

5. **Pull Request を作成（ブランチ運用の場合）**
   - 作業ブランチにプッシュ後、GitHub上でPRを作成し、レビュアーに共有します。

> **ヒント:** 初回のみ `git remote add origin <リポジトリURL>` を設定してください（GITHUB_GUIDE.md のステップ4を参照）。


## 今後の拡張予定

- [ ] Supabase Authによる認証機能の実装
- [ ] Row Level Security (RLS) の詳細設定
- [ ] 部門別権限管理
- [ ] 売上分析ダッシュボード
- [ ] 在庫管理機能
- [ ] Realtime機能の活用（リアルタイム在庫更新など）
- [ ] Supabase Storageを使った商品画像管理

## トラブルシューティング

### 環境変数が読み込めない
- `.env.local`ファイルがプロジェクトルートにあることを確認
- `NEXT_PUBLIC_` プレフィックスは**クライアントサイド**で使用可能
- サーバーサイド専用の変数には `NEXT_PUBLIC_` を付けない

### Supabaseへの接続エラー
- Project URLとAPI Keyが正しいか確認
- Supabaseダッシュボードでプロジェクトが起動しているか確認

### RLSエラー
- 開発中はサービスロールキーを使用（`supabaseAdmin`）
- RLSポリシーでサービスロールには全権限を付与

## ライセンス

MIT
