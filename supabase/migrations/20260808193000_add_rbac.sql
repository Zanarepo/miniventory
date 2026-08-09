-- Migration: Add RBAC and Team Management
-- Adds business_members, business_invites, and updates all existing RLS policies.

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_business_members_business_id ON public.business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_business_members_user_id ON public.business_members(user_id);

CREATE TABLE IF NOT EXISTS public.business_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('manager', 'cashier')),
  code TEXT, -- 6 digit join code
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_invites_code ON public.business_invites(code) WHERE code IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_invites ENABLE ROW LEVEL SECURITY;

-- 2. Backfill existing owners into business_members
INSERT INTO public.business_members (business_id, user_id, role)
SELECT id, owner_id, 'owner'
FROM public.businesses
ON CONFLICT (business_id, user_id) DO NOTHING;

-- Trigger to automatically add owner to business_members on business creation
CREATE OR REPLACE FUNCTION public.handle_new_business() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_business_created ON public.businesses;
CREATE TRIGGER on_business_created
  AFTER INSERT ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_business();



-- 2.5 Security Definer Functions to avoid RLS Infinite Recursion
CREATE OR REPLACE FUNCTION public.get_auth_user_businesses()
RETURNS SETOF UUID AS $$
  SELECT business_id FROM public.business_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_user_managed_businesses()
RETURNS SETOF UUID AS $$
  SELECT business_id FROM public.business_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager');
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_user_owned_businesses()
RETURNS SETOF UUID AS $$
  SELECT business_id FROM public.business_members WHERE user_id = auth.uid() AND role = 'owner';
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- 3. Business Members & Invites Policies
-- Owners and managers can view members. Users can view members of businesses they are part of.
DROP POLICY IF EXISTS "Users can view members of their businesses" ON public.business_members;
CREATE POLICY "Users can view members of their businesses" ON public.business_members
  FOR SELECT USING (
    business_id IN (SELECT public.get_auth_user_businesses())
  );

-- Only owners can insert/update/delete members
DROP POLICY IF EXISTS "Owners can manage members" ON public.business_members;
CREATE POLICY "Owners can manage members" ON public.business_members
  FOR ALL USING (
    business_id IN (SELECT public.get_auth_user_owned_businesses())
  );

-- Business invites policies
DROP POLICY IF EXISTS "Users view invites for their businesses" ON public.business_invites;
CREATE POLICY "Users view invites for their businesses" ON public.business_invites
  FOR SELECT USING (
    business_id IN (SELECT public.get_auth_user_managed_businesses())
  );

DROP POLICY IF EXISTS "Owners and managers manage invites" ON public.business_invites;
CREATE POLICY "Owners and managers manage invites" ON public.business_invites
  FOR ALL USING (
    business_id IN (SELECT public.get_auth_user_managed_businesses())
  );

-- 4. Update Existing RLS Policies

-- Businesses
DROP POLICY IF EXISTS "Owners manage their businesses" ON public.businesses;
DROP POLICY IF EXISTS "Members can view businesses" ON public.businesses;
CREATE POLICY "Members can view businesses" ON public.businesses FOR SELECT USING (
  id IN (SELECT public.get_auth_user_businesses())
);
DROP POLICY IF EXISTS "Owners can manage businesses" ON public.businesses;
CREATE POLICY "Owners can manage businesses" ON public.businesses FOR ALL USING (
  owner_id = auth.uid()
);

-- Products & Categories (All members read, Managers/Owners write)
DROP POLICY IF EXISTS "Business owns product categories" ON public.product_categories;
DROP POLICY IF EXISTS "Members read product categories" ON public.product_categories;
CREATE POLICY "Members read product categories" ON public.product_categories FOR SELECT USING (
  business_id IN (SELECT public.get_auth_user_businesses())
);
DROP POLICY IF EXISTS "Managers manage product categories" ON public.product_categories;
CREATE POLICY "Managers manage product categories" ON public.product_categories FOR ALL USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
);

DROP POLICY IF EXISTS "Business owns products" ON public.products;
DROP POLICY IF EXISTS "Members read products" ON public.products;
CREATE POLICY "Members read products" ON public.products FOR SELECT USING (
  business_id IN (SELECT public.get_auth_user_businesses())
);
DROP POLICY IF EXISTS "Managers manage products" ON public.products;
CREATE POLICY "Managers manage products" ON public.products FOR ALL USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
);

-- Inventory Transactions (All members can insert (sales), Managers/Owners can do anything)
DROP POLICY IF EXISTS "Business owns inventory transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Members read inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Members read inventory transactions" ON public.inventory_transactions FOR SELECT USING (
  business_id IN (SELECT public.get_auth_user_businesses())
);
DROP POLICY IF EXISTS "All members can insert inventory transactions" ON public.inventory_transactions;
CREATE POLICY "All members can insert inventory transactions" ON public.inventory_transactions FOR INSERT WITH CHECK (
  business_id IN (SELECT public.get_auth_user_businesses())
);
DROP POLICY IF EXISTS "Managers manage inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Managers manage inventory transactions" ON public.inventory_transactions FOR ALL USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
);

-- Customers (All members read/write)
DROP POLICY IF EXISTS "Business owns customers" ON public.customers;
DROP POLICY IF EXISTS "Members manage customers" ON public.customers;
CREATE POLICY "Members manage customers" ON public.customers FOR ALL USING (
  business_id IN (SELECT public.get_auth_user_businesses())
);

-- Sales & Sale Items (Cashiers can read all or insert, Managers/Owners can update/delete)
DROP POLICY IF EXISTS "Business owns sales" ON public.sales;
DROP POLICY IF EXISTS "Members read sales" ON public.sales;
CREATE POLICY "Members read sales" ON public.sales FOR SELECT USING (
  business_id IN (SELECT public.get_auth_user_businesses())
);
DROP POLICY IF EXISTS "Members insert sales" ON public.sales;
CREATE POLICY "Members insert sales" ON public.sales FOR INSERT WITH CHECK (
  business_id IN (SELECT public.get_auth_user_businesses())
);
DROP POLICY IF EXISTS "Managers manage sales" ON public.sales;
CREATE POLICY "Managers manage sales" ON public.sales FOR UPDATE USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
);
DROP POLICY IF EXISTS "Managers delete sales" ON public.sales;
CREATE POLICY "Managers delete sales" ON public.sales FOR DELETE USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
);

DROP POLICY IF EXISTS "Business owns sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Members read sale items" ON public.sale_items;
CREATE POLICY "Members read sale items" ON public.sale_items FOR SELECT USING (
  sale_id IN (SELECT id FROM public.sales WHERE business_id IN (SELECT public.get_auth_user_businesses()))
);
DROP POLICY IF EXISTS "Members insert sale items" ON public.sale_items;
CREATE POLICY "Members insert sale items" ON public.sale_items FOR INSERT WITH CHECK (
  sale_id IN (SELECT id FROM public.sales WHERE business_id IN (SELECT public.get_auth_user_businesses()))
);
DROP POLICY IF EXISTS "Managers manage sale items" ON public.sale_items;
CREATE POLICY "Managers manage sale items" ON public.sale_items FOR ALL USING (
  sale_id IN (SELECT id FROM public.sales WHERE business_id IN (SELECT public.get_auth_user_managed_businesses()))
);

DROP POLICY IF EXISTS "Business owns sale payments" ON public.sale_payments;
DROP POLICY IF EXISTS "Members read sale payments" ON public.sale_payments;
CREATE POLICY "Members read sale payments" ON public.sale_payments FOR SELECT USING (
  business_id IN (SELECT public.get_auth_user_businesses())
);
DROP POLICY IF EXISTS "Members insert sale payments" ON public.sale_payments;
CREATE POLICY "Members insert sale payments" ON public.sale_payments FOR INSERT WITH CHECK (
  business_id IN (SELECT public.get_auth_user_businesses())
);
DROP POLICY IF EXISTS "Managers manage sale payments" ON public.sale_payments;
CREATE POLICY "Managers manage sale payments" ON public.sale_payments FOR ALL USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
);


-- Expenses (Managers & Owners only)
DROP POLICY IF EXISTS "Business owns expense categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Managers manage expense categories" ON public.expense_categories;
CREATE POLICY "Managers manage expense categories" ON public.expense_categories FOR ALL USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
);

DROP POLICY IF EXISTS "Business owns expenses" ON public.expenses;
DROP POLICY IF EXISTS "Managers manage expenses" ON public.expenses;
CREATE POLICY "Managers manage expenses" ON public.expenses FOR ALL USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
);


-- Report History (Managers & Owners only)
DROP POLICY IF EXISTS "Business owns report history" ON public.report_history;
DROP POLICY IF EXISTS "Managers manage report history" ON public.report_history;
CREATE POLICY "Managers manage report history" ON public.report_history FOR ALL USING (
  business_id IN (SELECT public.get_auth_user_managed_businesses())
);


-- Join Business RPC
CREATE OR REPLACE FUNCTION public.join_business_with_code(join_code TEXT)
RETURNS JSON AS $$
DECLARE
  invite_record RECORD;
  user_uuid UUID;
BEGIN
  user_uuid := auth.uid();
  IF user_uuid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Find valid invite
  SELECT * INTO invite_record FROM public.business_invites 
  WHERE code = join_code AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired code');
  END IF;

  -- Insert member if not exists
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (invite_record.business_id, user_uuid, invite_record.role)
  ON CONFLICT (business_id, user_id) DO NOTHING;

  -- Optional: consume the code (delete it) if it's meant for one-time use, 
  -- but usually join codes are shared with multiple staff. Let's keep it until it expires.

  RETURN json_build_object('success', true, 'business_id', invite_record.business_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
