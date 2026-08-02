-- Sprint 2 Migration: Product Categories, Products, Inventory Transactions Ledger & Summary View
-- All tables protected via Row Level Security (RLS) scoped to the business owner

-- 1. Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business owns product categories" ON product_categories;
CREATE POLICY "Business owns product categories"
  ON product_categories
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_product_categories_business_id ON product_categories(business_id);


-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  minimum_stock NUMERIC(12,2) DEFAULT 5,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business owns products" ON products;
CREATE POLICY "Business owns products"
  ON products
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);


-- 3. Inventory Transactions Ledger (Immutable Record of Stock Movement)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL, -- 'Opening Stock', 'Stock Adjustment Increase', 'Stock Adjustment Decrease', 'Damaged Stock', 'Returned Stock', 'Sales Deduction'
  quantity NUMERIC(12,2) NOT NULL, -- Positive for additions, negative for deductions
  unit_cost NUMERIC(12,2),
  remarks TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business owns inventory transactions" ON inventory_transactions;
CREATE POLICY "Business owns inventory transactions"
  ON inventory_transactions
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_business_id ON inventory_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at DESC);


-- 4. Inventory Summary View
-- Computes real-time stock balance directly from immutable transaction logs
CREATE OR REPLACE VIEW inventory_summary 
WITH (security_invoker = true) AS
SELECT 
  product_id,
  SUM(quantity) AS current_stock
FROM inventory_transactions
GROUP BY product_id;
