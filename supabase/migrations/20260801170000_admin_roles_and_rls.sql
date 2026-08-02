-- Migration: Add Admin Roles & Update RLS
-- Timestamp: 20260801170000

-- 1. Add role column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin'));

-- 2. Create function to get user role securely without recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- 3. Add RLS policies for Admins on Profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));

CREATE POLICY "Superadmins can update profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'superadmin');

-- 4. Add RLS policies for Admins on Businesses
CREATE POLICY "Admins can view all businesses"
  ON public.businesses
  FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));

CREATE POLICY "Superadmins can update businesses"
  ON public.businesses
  FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can delete businesses"
  ON public.businesses
  FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'superadmin');

-- 5. Add RLS policies for Admins on Audit Logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
