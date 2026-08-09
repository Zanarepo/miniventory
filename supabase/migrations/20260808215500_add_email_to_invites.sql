-- Add email column to business_invites for email-based invitations
ALTER TABLE public.business_invites 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Make the email column unique per business to prevent spamming invites to the same email
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_invites_email ON public.business_invites (business_id, email) WHERE email IS NOT NULL;
