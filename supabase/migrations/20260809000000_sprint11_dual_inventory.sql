-- Sprint 11: Unified Inventory Schema (Serialized & Non-Serialized)

-- 1. Update Products Table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_serialized BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Enforce barcode uniqueness per business (for non-serialized lookup)
-- We only want unique constraint if barcode is provided
DROP INDEX IF EXISTS idx_products_business_barcode;
CREATE UNIQUE INDEX idx_products_business_barcode ON public.products(business_id, barcode) WHERE barcode IS NOT NULL;

-- 2. Create Locations (for future multi-location support)
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage locations" ON public.locations FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid() OR id IN (SELECT business_id FROM public.business_members WHERE user_id = auth.uid()))
);

-- 3. Create Product Locations (for location-specific reorder thresholds)
CREATE TABLE IF NOT EXISTS public.product_locations (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  reorder_threshold NUMERIC(12,2) DEFAULT 5,
  quantity NUMERIC(12,2) DEFAULT 0,
  PRIMARY KEY(product_id, location_id)
);

ALTER TABLE public.product_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage product locations" ON public.product_locations FOR ALL USING (
    product_id IN (SELECT id FROM public.products WHERE business_id IN (
        SELECT id FROM public.businesses WHERE owner_id = auth.uid() OR id IN (SELECT business_id FROM public.business_members WHERE user_id = auth.uid())
    ))
);

-- 4. Create Restock Batches
CREATE TABLE IF NOT EXISTS public.restock_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity NUMERIC(12,2) NOT NULL,
  cost_price NUMERIC(12,2) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VOID')),
  void_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.restock_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage restock batches" ON public.restock_batches FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid() OR id IN (SELECT business_id FROM public.business_members WHERE user_id = auth.uid()))
);

-- 5. Create Item Units (Serialized Inventory)
CREATE TABLE IF NOT EXISTS public.item_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  serial_barcode TEXT NOT NULL,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'SOLD', 'VOID')),
  restock_batch_id UUID REFERENCES public.restock_batches(id) ON DELETE SET NULL,
  cost_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure serial barcodes are unique per business across all statuses
CREATE UNIQUE INDEX idx_item_units_business_serial ON public.item_units(business_id, serial_barcode);

ALTER TABLE public.item_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage item units" ON public.item_units FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid() OR id IN (SELECT business_id FROM public.business_members WHERE user_id = auth.uid()))
);


-- 6. RPC for Voiding a Restock Batch
CREATE OR REPLACE FUNCTION void_restock_batch(
    p_batch_id UUID,
    p_void_reason TEXT,
    p_user_id UUID
) RETURNS jsonb AS $$
DECLARE
    v_batch record;
    v_product record;
    v_sold_count integer;
BEGIN
    -- Get batch
    SELECT * INTO v_batch FROM public.restock_batches WHERE id = p_batch_id AND status = 'ACTIVE';
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Batch not found or already voided');
    END IF;

    -- Get product
    SELECT * INTO v_product FROM public.products WHERE id = v_batch.product_id;

    IF v_product.is_serialized THEN
        -- Check if any units in this batch are SOLD
        SELECT count(*) INTO v_sold_count FROM public.item_units WHERE restock_batch_id = p_batch_id AND status = 'SOLD';
        IF v_sold_count > 0 THEN
            RETURN jsonb_build_object('success', false, 'error', 'Cannot void batch: ' || v_sold_count || ' unit(s) are already SOLD.');
        END IF;

        -- Void units
        UPDATE public.item_units SET status = 'VOID' WHERE restock_batch_id = p_batch_id;
    ELSE
        -- Non-serialized: Check if voiding would result in negative stock
        -- (simplified check: we just insert a negative inventory transaction, which might bring stock below zero)
        -- Since inventory is a ledger, we add a negative transaction
        INSERT INTO public.inventory_transactions (
            business_id, product_id, movement_type, quantity, unit_cost, remarks, created_by, created_at
        ) VALUES (
            v_batch.business_id, v_batch.product_id, 'Void Restock', -v_batch.quantity, v_batch.cost_price, 
            'Voided batch ' || v_batch.id || ' Reason: ' || p_void_reason, p_user_id, now()
        );
    END IF;

    -- Update batch status
    UPDATE public.restock_batches SET status = 'VOID', void_reason = p_void_reason WHERE id = p_batch_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. RPC for Processing Bulk Restock
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

        -- Insert serials (uniqueness constraint will handle duplicates and abort transaction automatically)
        FOREACH v_serial IN ARRAY p_serials
        LOOP
            INSERT INTO public.item_units (
                business_id, product_id, serial_barcode, status, restock_batch_id, cost_price
            ) VALUES (
                p_business_id, p_product_id, v_serial, 'AVAILABLE', v_batch_id, p_cost_price
            );
        END LOOP;

        -- Create a ledger entry for the serialized items so stock computes correctly
        INSERT INTO public.inventory_transactions (
            business_id, product_id, movement_type, quantity, unit_cost, remarks, created_by
        ) VALUES (
            p_business_id, p_product_id, 'Stock Adjustment Increase', p_quantity, p_cost_price, 
            'Restock Batch ' || v_batch_id || ' (Serialized)', p_user_id
        );
    ELSE
        -- Non-serialized: Add inventory transaction
        INSERT INTO public.inventory_transactions (
            business_id, product_id, movement_type, quantity, unit_cost, remarks, created_by
        ) VALUES (
            p_business_id, p_product_id, 'Stock Adjustment Increase', p_quantity, p_cost_price, 
            'Restock Batch ' || v_batch_id, p_user_id
        );
    END IF;

    RETURN jsonb_build_object('success', true, 'batch_id', v_batch_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
