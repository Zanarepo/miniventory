-- Sprint 3: Sales Management Module

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    gross_profit NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (business_id, receipt_number)
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity NUMERIC(12,2) NOT NULL,
    unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_profit NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for reporting performance
CREATE INDEX IF NOT EXISTS idx_sales_business_created ON sales(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Sales Policies
CREATE POLICY "Users can view sales for their businesses" 
ON sales FOR SELECT 
USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can insert sales for their businesses" 
ON sales FOR INSERT 
WITH CHECK (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
));

-- Sale Items Policies
CREATE POLICY "Users can view sale items for their businesses" 
ON sale_items FOR SELECT 
USING (sale_id IN (
    SELECT id FROM sales WHERE business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
));

CREATE POLICY "Users can insert sale items for their businesses" 
ON sale_items FOR INSERT 
WITH CHECK (sale_id IN (
    SELECT id FROM sales WHERE business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
));

-- RPC: Atomic processing of an offline sale
-- Ensures the sale, line items, and inventory deductions happen in one secure server-side transaction.
CREATE OR REPLACE FUNCTION process_offline_sale(
  p_sale jsonb,
  p_sale_items jsonb[]
) RETURNS jsonb AS $$
DECLARE
  v_sale_id uuid;
  v_item jsonb;
  v_item_id uuid;
BEGIN
  -- 1. Insert Sale Header
  INSERT INTO sales (
    id, business_id, receipt_number, subtotal, total_amount, 
    total_cost, gross_profit, payment_method, created_by, created_at
  ) VALUES (
    (p_sale->>'id')::uuid,
    (p_sale->>'business_id')::uuid,
    p_sale->>'receipt_number',
    (p_sale->>'subtotal')::numeric,
    (p_sale->>'total_amount')::numeric,
    (p_sale->>'total_cost')::numeric,
    (p_sale->>'gross_profit')::numeric,
    p_sale->>'payment_method',
    (p_sale->>'created_by')::uuid,
    COALESCE((p_sale->>'created_at')::timestamptz, now())
  ) RETURNING id INTO v_sale_id;

  -- 2. Insert Sale Items & Deduct Inventory
  FOREACH v_item IN ARRAY p_sale_items
  LOOP
    -- Insert Line Item
    INSERT INTO sale_items (
      id, sale_id, product_id, quantity, unit_cost, 
      selling_price, line_total, line_profit
    ) VALUES (
      COALESCE((v_item->>'id')::uuid, gen_random_uuid()),
      v_sale_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_cost')::numeric,
      (v_item->>'selling_price')::numeric,
      (v_item->>'line_total')::numeric,
      (v_item->>'line_profit')::numeric
    );

    -- Insert Inventory Transaction (Negative for sales)
    INSERT INTO inventory_transactions (
      business_id, product_id, movement_type, quantity, cost_price, 
      selling_price, remarks, created_by, created_at
    ) VALUES (
      (p_sale->>'business_id')::uuid,
      (v_item->>'product_id')::uuid,
      'Sales Deduction',
      -((v_item->>'quantity')::numeric),
      (v_item->>'unit_cost')::numeric,
      (v_item->>'selling_price')::numeric,
      'Sale Receipt: ' || (p_sale->>'receipt_number'),
      (p_sale->>'created_by')::uuid,
      COALESCE((p_sale->>'created_at')::timestamptz, now())
    );
  END LOOP;

  RETURN jsonb_build_object('success', true, 'sale_id', v_sale_id);
EXCEPTION WHEN OTHERS THEN
  -- Let Supabase automatically rollback the transaction on error
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
