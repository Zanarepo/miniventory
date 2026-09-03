-- Automatically accept all valid pending invites for the logged-in user
CREATE OR REPLACE FUNCTION public.auto_accept_all_invites()
RETURNS BOOLEAN AS $$
DECLARE
  user_uuid UUID;
  user_email TEXT;
  invite_record RECORD;
  accepted BOOLEAN := false;
BEGIN
  user_uuid := auth.uid();
  IF user_uuid IS NULL THEN
    RETURN false;
  END IF;

  -- Get user email from auth schema
  SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;

  -- Iterate over all valid invites for this email
  FOR invite_record IN 
    SELECT * FROM public.business_invites 
    WHERE lower(email) = lower(user_email) AND expires_at > now()
  LOOP
    -- Insert the user into the business
    INSERT INTO public.business_members (business_id, user_id, role)
    VALUES (invite_record.business_id, user_uuid, invite_record.role)
    ON CONFLICT (business_id, user_id) DO NOTHING;
    
    -- Consume the invite
    DELETE FROM public.business_invites WHERE id = invite_record.id;
    
    accepted := true;
  END LOOP;

  RETURN accepted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
