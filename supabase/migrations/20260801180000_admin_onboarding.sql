-- Migration: Admin Onboarding and Pending Role
-- Timestamp: 20260801180000

-- 1. Drop existing check constraint and add new one to allow 'pending_admin'
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'superadmin', 'pending_admin'));

-- 2. Update the user creation trigger to handle requested_role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT := 'user';
BEGIN
  -- If metadata contains requested_role = 'admin', set as pending_admin
  IF new.raw_user_meta_data->>'requested_role' = 'admin' THEN
    v_role := 'pending_admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, security_question, security_answer, role)
  VALUES (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'security_question', ''),
    coalesce(new.raw_user_meta_data->>'security_answer', ''),
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    security_question = excluded.security_question,
    security_answer = excluded.security_answer,
    role = CASE 
             WHEN public.profiles.role = 'user' AND excluded.role = 'pending_admin' THEN 'pending_admin'
             ELSE public.profiles.role 
           END,
    updated_at = now();
    
  RETURN new;
END;
$$;
