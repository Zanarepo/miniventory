-- Fix: Ensure serialized restocks and voids also create ledger entries in inventory_transactions

-- 1. Update process_bulk_restock
CREATE OR REPLACE FUNCTION process_bulk_restock(
    p_business_id UUID,
    p_product_id UUID,
    p_quantity NUMERIC,
    p_cost_price NUMERIC,
    p_user_id UUID,
    p_serials TEXT[] DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
    v_batch_id UUID;
    v_product record;
    v_serial TEXT;
BEGIN
    SELECT * INTO v_product FROM public.products WHERE id = p_product_id AND business_id = p_business_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Product not found');
    END IF;

    -- Create batch
    INSERT INTO public.restock_batches (
        business_id, product_id, quantity, cost_price, created_by, status
    ) VALUES (
        p_business_id, p_product_id, p_quantity, p_cost_price, p_user_id, 'ACTIVE'
    ) RETURNING id INTO v_batch_id;

    IF v_product.is_serialized THEN
        IF p_serials IS NULL OR array_length(p_serials, 1) = 0 THEN
            RETURN jsonb_build_object('success', false, 'error', 'Serials are required for serialized products');
        END IF;

        -- Insert serials (uniqueness constraint will handle duplicates)
        FOREACH v_serial IN ARRAY p_serials
        LOOP
            INSERT INTO public.item_units (
                business_id, product_id, serial_barcode, status, restock_batch_id, cost_price
            ) VALUES (
                p_business_id, p_product_id, v_serial, 'AVAILABLE', v_batch_id, p_cost_price
            );
        END LOOP;
    END IF;

    -- Create the inventory transaction for BOTH serialized and non-serialized!
    -- This ensures the ledger (and therefore current_stock calculation) is updated.
    INSERT INTO public.inventory_transactions (
        business_id, product_id, movement_type, quantity, unit_cost, remarks, created_by
    ) VALUES (
        p_business_id, p_product_id, 'Stock Adjustment Increase', p_quantity, p_cost_price, 
        'Restock Batch ' || v_batch_id, p_user_id
    );

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Update void_restock_batch
CREATE OR REPLACE FUNCTION void_restock_batch(
    p_batch_id UUID,
    p_void_reason TEXT,
    p_user_id UUID
) RETURNS jsonb AS $$
DECLARE
    v_batch record;
    v_product record;
    v_sold_count INT;
BEGIN
    SELECT * INTO v_batch FROM public.restock_batches WHERE id = p_batch_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Batch not found');
    END IF;

    IF v_batch.status = 'VOID' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Batch is already voided');
    END IF;

    SELECT * INTO v_product FROM public.products WHERE id = v_batch.product_id;

    IF v_product.is_serialized THEN
        -- Check if any units in this batch are SOLD
        SELECT count(*) INTO v_sold_count FROM public.item_units WHERE restock_batch_id = p_batch_id AND status = 'SOLD';
        IF v_sold_count > 0 THEN
            RETURN jsonb_build_object('success', false, 'error', 'Cannot void batch: ' || v_sold_count || ' unit(s) are already SOLD.');
        END IF;

        -- Void units
        UPDATE public.item_units SET status = 'VOID' WHERE restock_batch_id = p_batch_id;
    END IF;

    -- Create negative inventory transaction for BOTH serialized and non-serialized
    INSERT INTO public.inventory_transactions (
        business_id, product_id, movement_type, quantity, unit_cost, remarks, created_by, created_at
    ) VALUES (
        v_batch.business_id, v_batch.product_id, 'Void Restock', -v_batch.quantity, v_batch.cost_price, 
        'Voided batch ' || v_batch.id || ' Reason: ' || p_void_reason, p_user_id, now()
    );

    -- Update batch status
    UPDATE public.restock_batches SET status = 'VOID', void_reason = p_void_reason WHERE id = p_batch_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
