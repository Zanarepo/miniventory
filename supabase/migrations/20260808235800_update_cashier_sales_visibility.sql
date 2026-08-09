-- Update Sales Visibility for Cashiers
-- Cashiers should only see their own sales, Managers/Owners can see all sales.

-- 1. Update sales policy
DROP POLICY IF EXISTS "Members read sales" ON public.sales;
CREATE POLICY "Members read sales" ON public.sales FOR SELECT USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
  OR
  (business_id IN (SELECT public.get_auth_user_businesses()) AND created_by = auth.uid())
);

-- 2. Update sale_items policy
DROP POLICY IF EXISTS "Members read sale items" ON public.sale_items;
CREATE POLICY "Members read sale items" ON public.sale_items FOR SELECT USING (
  sale_id IN (
    SELECT id FROM public.sales WHERE 
      business_id IN (SELECT public.get_auth_user_managed_businesses())
      OR 
      (business_id IN (SELECT public.get_auth_user_businesses()) AND created_by = auth.uid())
  )
);

-- 3. Update sale_payments policy
DROP POLICY IF EXISTS "Members read sale payments" ON public.sale_payments;
CREATE POLICY "Members read sale payments" ON public.sale_payments FOR SELECT USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
  OR 
  (business_id IN (SELECT public.get_auth_user_businesses()) AND recorded_by = auth.uid())
);
