-- Fix process_offline_sale RPC to use correct columns for inventory_transactions
-- The inventory_transactions table only has unit_cost, not cost_price and selling_price

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
    -- Fixed: removed cost_price and selling_price columns which do not exist
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

  RETURN jsonb_build_object('success', true, 'sale_id', v_sale_id);
EXCEPTION WHEN OTHERS THEN
  -- Let Supabase automatically rollback the transaction on error
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
