const fs = require('fs');
let content = fs.readFileSync('supabase/migrations/20260808193000_add_rbac.sql', 'utf8');

const functionsSql = `
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

`;

if (!content.includes('get_auth_user_businesses()')) {
  content = content.replace('-- 3. Business Members & Invites Policies', functionsSql + '-- 3. Business Members & Invites Policies');
}

// Replace all user_id = auth.uid() logic
content = content.replace(/SELECT business_id FROM public\.business_members WHERE user_id = auth\.uid\(\) AND role IN \('owner', 'manager'\)/g, 'SELECT public.get_auth_user_managed_businesses()');
content = content.replace(/SELECT business_id FROM public\.business_members WHERE user_id = auth\.uid\(\) AND role = 'owner'/g, 'SELECT public.get_auth_user_owned_businesses()');
content = content.replace(/SELECT business_id FROM public\.business_members WHERE user_id = auth\.uid\(\)/g, 'SELECT public.get_auth_user_businesses()');

fs.writeFileSync('supabase/migrations/20260808193000_add_rbac.sql', content);
