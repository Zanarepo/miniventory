-- Phase 1 Retail Adaptations: Customers, Multi-Unit, Split Payments

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business customers" 
ON customers FOR SELECT 
USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert their business customers" 
ON customers FOR INSERT 
WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update their business customers" 
ON customers FOR UPDATE 
USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);

-- 2. Update Sales Table for Debt Tracking & Split Payments
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'PAID',
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0;

-- Backfill existing sales
UPDATE sales SET amount_paid = total_amount WHERE amount_paid = 0 AND total_amount > 0;

-- 3. Sale Payments Table (for split payments)
CREATE TABLE IF NOT EXISTS sale_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sale_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business sale payments" 
ON sale_payments FOR SELECT 
USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert their business sale payments" 
ON sale_payments FOR INSERT 
WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_sale_payments_sale_id ON sale_payments(sale_id);

-- 4. Update Products Table for Multi-Unit Conversions
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS bulk_unit TEXT,
ADD COLUMN IF NOT EXISTS conversion_ratio NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS bulk_cost_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS bulk_selling_price NUMERIC(12,2);

-- 5. Update process_offline_sale RPC
CREATE OR REPLACE FUNCTION process_offline_sale(
  p_sale jsonb,
  p_sale_items jsonb[],
  p_sale_payments jsonb[] DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_sale_id uuid;
  v_item jsonb;
  v_payment jsonb;
BEGIN
  -- Insert Sale Header
  INSERT INTO sales (
    id, business_id, receipt_number, subtotal, total_amount, 
    total_cost, gross_profit, payment_method, created_by, created_at,
    customer_id, payment_status, amount_paid
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
    COALESCE((p_sale->>'created_at')::timestamptz, now()),
    (p_sale->>'customer_id')::uuid,
    COALESCE(p_sale->>'payment_status', 'PAID'),
    COALESCE((p_sale->>'amount_paid')::numeric, (p_sale->>'total_amount')::numeric)
  ) RETURNING id INTO v_sale_id;

  -- Insert Sale Items & Deduct Inventory
  FOREACH v_item IN ARRAY p_sale_items
  LOOP
    INSERT INTO sale_items (
      id, sale_id, product_id, quantity, unit_cost, 
      selling_price, line_total, line_profit, custom_name, is_discounted
    ) VALUES (
      COALESCE((v_item->>'id')::uuid, gen_random_uuid()),
      v_sale_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_cost')::numeric,
      (v_item->>'selling_price')::numeric,
      (v_item->>'line_total')::numeric,
      (v_item->>'line_profit')::numeric,
      v_item->>'custom_name',
      COALESCE((v_item->>'is_discounted')::boolean, false)
    );

    -- Insert Inventory Transaction (Negative for sales)
    INSERT INTO inventory_transactions (
      business_id, product_id, movement_type, quantity, unit_cost, 
      remarks, created_by, created_at
    ) VALUES (
      (p_sale->>'business_id')::uuid,
      (v_item->>'product_id')::uuid,
      'Sales Deduction',
      -((v_item->>'quantity')::numeric),
      (v_item->>'unit_cost')::numeric,
      'Sale Receipt: ' || (p_sale->>'receipt_number'),
      (p_sale->>'created_by')::uuid,
      COALESCE((p_sale->>'created_at')::timestamptz, now())
    );
  END LOOP;

  -- Insert Sale Payments (if provided)
  IF p_sale_payments IS NOT NULL THEN
    FOREACH v_payment IN ARRAY p_sale_payments
    LOOP
      INSERT INTO sale_payments (
        id, business_id, sale_id, amount, payment_method, recorded_by, created_at
      ) VALUES (
        COALESCE((v_payment->>'id')::uuid, gen_random_uuid()),
        (p_sale->>'business_id')::uuid,
        v_sale_id,
        (v_payment->>'amount')::numeric,
        v_payment->>'payment_method',
        (p_sale->>'created_by')::uuid,
        COALESCE((v_payment->>'created_at')::timestamptz, now())
      );
    END LOOP;
  ELSE
    -- If no explicit payments array provided, create a single payment record from the sale header
    IF COALESCE((p_sale->>'amount_paid')::numeric, (p_sale->>'total_amount')::numeric) > 0 THEN
      INSERT INTO sale_payments (
        business_id, sale_id, amount, payment_method, recorded_by, created_at
      ) VALUES (
        (p_sale->>'business_id')::uuid,
        v_sale_id,
        COALESCE((p_sale->>'amount_paid')::numeric, (p_sale->>'total_amount')::numeric),
        p_sale->>'payment_method',
        (p_sale->>'created_by')::uuid,
        COALESCE((p_sale->>'created_at')::timestamptz, now())
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'sale_id', v_sale_id);
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
