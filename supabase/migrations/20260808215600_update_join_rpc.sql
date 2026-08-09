-- Update join_business_with_code to enforce email validation
CREATE OR REPLACE FUNCTION public.join_business_with_code(join_code TEXT)
RETURNS JSON AS $$
DECLARE
  invite_record RECORD;
  user_uuid UUID;
  user_email TEXT;
BEGIN
  user_uuid := auth.uid();
  IF user_uuid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;

  -- Find valid invite
  SELECT * INTO invite_record FROM public.business_invites 
  WHERE code = join_code AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired code');
  END IF;

  -- If the invite has an email attached, ensure it matches the user's email
  IF invite_record.email IS NOT NULL AND lower(invite_record.email) != lower(user_email) THEN
    RETURN json_build_object('success', false, 'error', 'This invite was sent to a different email address');
  END IF;

  -- Insert member if not exists
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (invite_record.business_id, user_uuid, invite_record.role)
  ON CONFLICT (business_id, user_id) DO NOTHING;

  -- Consume the code if it's tied to an email (one-time use)
  IF invite_record.email IS NOT NULL THEN
    DELETE FROM public.business_invites WHERE id = invite_record.id;
  END IF;

  RETURN json_build_object('success', true, 'business_id', invite_record.business_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
