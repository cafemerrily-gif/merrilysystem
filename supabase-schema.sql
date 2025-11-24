-- ============================================
-- 学生経営カフェ管理システム - Supabase版
-- データベーススキーマ定義
-- ============================================

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

-- ============================================
-- インデックス作成
-- ============================================
CREATE INDEX idx_categories_display_order ON categories(display_order);
CREATE INDEX idx_categories_deleted_at ON categories(deleted_at);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);

CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_time_slot ON sales(time_slot);
CREATE INDEX idx_sales_entered_by ON sales(entered_by);
CREATE INDEX idx_sales_deleted_at ON sales(deleted_at);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX idx_sale_items_deleted_at ON sale_items(deleted_at);

CREATE INDEX idx_collection_products_collection_id ON collection_products(collection_id);
CREATE INDEX idx_collection_products_product_id ON collection_products(product_id);

-- ============================================
-- Row Level Security (RLS) 設定
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

-- サービスロールには全権限を付与（API経由のアクセス用）
CREATE POLICY "Enable all for service role" ON categories 
  FOR ALL TO service_role USING (true);

CREATE POLICY "Enable all for service role" ON products 
  FOR ALL TO service_role USING (true);

CREATE POLICY "Enable all for service role" ON sales 
  FOR ALL TO service_role USING (true);

CREATE POLICY "Enable all for service role" ON sale_items 
  FOR ALL TO service_role USING (true);

CREATE POLICY "Enable all for service role" ON product_collections 
  FOR ALL TO service_role USING (true);

CREATE POLICY "Enable all for service role" ON collection_products 
  FOR ALL TO service_role USING (true);

-- ============================================
-- サンプルデータ挿入（オプション）
-- ============================================

-- カテゴリサンプル
INSERT INTO categories (name, description, display_order) VALUES
('ドリンク', 'コーヒー、紅茶、ジュースなど', 1),
('フード', 'サンドイッチ、ケーキなど', 2),
('季節限定', '季節ごとの特別メニュー', 3);

-- 商品サンプル
INSERT INTO products (category_id, name, cost_price, selling_price, is_available) VALUES
(1, 'ブレンドコーヒー', 100, 400, true),
(1, 'カフェラテ', 150, 500, true),
(1, 'アイスコーヒー', 120, 450, true),
(2, 'ミックスサンド', 250, 600, true),
(2, 'チーズケーキ', 200, 500, true),
(3, 'クリスマスラテ', 200, 650, true);

-- コレクションサンプル
INSERT INTO product_collections (name, description) VALUES
('2025クリスマス商品', '2025年クリスマスシーズン限定商品');

-- コレクション商品紐付けサンプル
INSERT INTO collection_products (collection_id, product_id) VALUES
(1, 6); -- クリスマスラテをクリスマスコレクションに追加
