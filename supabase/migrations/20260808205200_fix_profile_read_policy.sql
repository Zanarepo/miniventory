-- Add policy so users can view profiles of other members in the same business
CREATE POLICY "Users can view profiles of business members" ON public.profiles FOR SELECT USING (
  id IN (
    SELECT user_id FROM public.business_members WHERE business_id IN (
      SELECT public.get_auth_user_businesses()
    )
  )
);
