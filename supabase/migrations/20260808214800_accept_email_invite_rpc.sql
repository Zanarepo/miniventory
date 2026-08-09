-- RPC to accept email-based invite without a join code
CREATE OR REPLACE FUNCTION public.accept_email_invite(p_business_id UUID)
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

  -- Find valid invite for this email and business
  SELECT * INTO invite_record FROM public.business_invites 
  WHERE lower(email) = lower(user_email) 
    AND business_id = p_business_id
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No valid invite found for this email');
  END IF;

  -- Insert member if not exists
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (invite_record.business_id, user_uuid, invite_record.role)
  ON CONFLICT (business_id, user_id) DO NOTHING;

  -- Consume the invite
  DELETE FROM public.business_invites WHERE id = invite_record.id;

  RETURN json_build_object('success', true, 'business_id', invite_record.business_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
