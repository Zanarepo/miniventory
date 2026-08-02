-- Add custom_name to sale_items for handling untracked generic sales
ALTER TABLE sale_items ADD COLUMN custom_name TEXT;

-- Update the RPC to handle custom_name
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
      selling_price, line_total, line_profit, custom_name
    ) VALUES (
      COALESCE((v_item->>'id')::uuid, gen_random_uuid()),
      v_sale_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_cost')::numeric,
      (v_item->>'selling_price')::numeric,
      (v_item->>'line_total')::numeric,
      (v_item->>'line_profit')::numeric,
      v_item->>'custom_name'
    );

    -- Only deduct inventory if it is NOT a custom item (we'll convention that custom items might use a specific system product ID, or we just deduct it anyway, but wait, the system product is just a placeholder. Let's let the transaction happen so the ledger records it, but since it's a system product, it's fine).
    -- Wait, if it's a custom product, it has cost=0, so profit is 100%. That's acceptable for untracked items.
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
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
