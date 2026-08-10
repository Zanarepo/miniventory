ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS serials JSONB DEFAULT '[]'::jsonb;

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
      selling_price, line_total, line_profit, custom_name, is_discounted, is_voided, serials
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
      COALESCE((v_item->>'is_discounted')::boolean, false),
      COALESCE((v_item->>'is_voided')::boolean, false),
      COALESCE((v_item->>'serials')::jsonb, '[]'::jsonb)
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
        id, sale_id, amount, payment_method, reference_number, created_at, created_by
      ) VALUES (
        COALESCE((v_payment->>'id')::uuid, gen_random_uuid()),
        v_sale_id,
        (v_payment->>'amount')::numeric,
        v_payment->>'payment_method',
        v_payment->>'reference_number',
        COALESCE((v_payment->>'created_at')::timestamptz, now()),
        (p_sale->>'created_by')::uuid
      );
    END LOOP;
  END IF;

  RETURN jsonb_build_object('success', true, 'sale_id', v_sale_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
 LANGUAGE plpgsql;
