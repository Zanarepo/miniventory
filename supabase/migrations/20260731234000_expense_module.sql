-- Sprint 4: Expense Management Module Migration

-- 1. Expense Categories Table
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent unique constraints/indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_uniq_default_category ON expense_categories(name) WHERE business_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_uniq_business_category ON expense_categories(business_id, name) WHERE business_id IS NOT NULL;

-- Enable RLS
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Policies for Categories
DROP POLICY IF EXISTS "Users can view default categories and their own business categories" ON expense_categories;
CREATE POLICY "Users can view default categories and their own business categories"
ON expense_categories FOR SELECT
USING (
    business_id IS NULL OR
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert categories for their own business" ON expense_categories;
CREATE POLICY "Users can insert categories for their own business"
ON expense_categories FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update categories for their own business" ON expense_categories;
CREATE POLICY "Users can update categories for their own business"
ON expense_categories FOR UPDATE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete categories for their own business" ON expense_categories;
CREATE POLICY "Users can delete categories for their own business"
ON expense_categories FOR DELETE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
);

-- Seed Default Categories
INSERT INTO expense_categories (name, description, is_default) VALUES
('Stock Purchase', 'Purchasing stock/inventory items', TRUE),
('Transportation', 'Logistics and transportation costs', TRUE),
('Fuel', 'Generator or vehicle fuel', TRUE),
('Rent', 'Business premises rent', TRUE),
('Salaries & Wages', 'Employee salaries or daily wages', TRUE),
('Electricity', 'Power and electricity utility bills', TRUE),
('Internet', 'Data bundles and internet subscriptions', TRUE),
('Marketing', 'Advertising, flyers, or promo campaigns', TRUE),
('Packaging', 'Bags, boxes, and wrapping materials', TRUE),
('Repairs & Maintenance', 'Fixing equipment or shop structures', TRUE),
('Office Supplies', 'Stationery, pens, paper, etc.', TRUE),
('Miscellaneous', 'Other minor general expenses', TRUE)
ON CONFLICT DO NOTHING;


-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    payment_method TEXT NOT NULL,
    receipt_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_business_date ON expenses(business_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policies for Expenses
DROP POLICY IF EXISTS "Users can manage expenses for their businesses" ON expenses;
CREATE POLICY "Users can manage expenses for their businesses"
ON expenses FOR ALL
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


-- 3. Supabase Storage Bucket for Receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('expense-receipts', 'expense-receipts', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies
DROP POLICY IF EXISTS "Authenticated users can upload receipt images" ON storage.objects;
CREATE POLICY "Authenticated users can upload receipt images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'expense-receipts');

DROP POLICY IF EXISTS "Authenticated users can view receipt images" ON storage.objects;
CREATE POLICY "Authenticated users can view receipt images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'expense-receipts');

DROP POLICY IF EXISTS "Authenticated users can delete receipt images" ON storage.objects;
CREATE POLICY "Authenticated users can delete receipt images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'expense-receipts');
