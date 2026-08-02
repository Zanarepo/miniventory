-- Migration: Fix RPC Security Question and PIN Reset function search paths & phone identifier lookup
-- Description: Ensures pgcrypto extensions schema is included in search_path so crypt() and gen_salt() succeed during password hash update, and allows matching both synthetic email and raw phone strings.

create extension if not exists pgcrypto schema extensions;

create or replace function public.get_security_question(p_identifier text)
returns text
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_question text;
begin
  select security_question into v_question
  from public.profiles
  where lower(email) = lower(p_identifier) 
     or lower(phone) = lower(p_identifier)
     or lower(phone) = lower(replace(p_identifier, '@biztrack-user.local', ''))
  limit 1;
  return v_question;
end;
$$;

create or replace function public.reset_pin_with_security_answer(
  p_identifier text,
  p_answer text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid;
  v_correct_answer text;
begin
  select id, security_answer into v_user_id, v_correct_answer
  from public.profiles
  where lower(email) = lower(p_identifier) 
     or lower(phone) = lower(p_identifier)
     or lower(phone) = lower(replace(p_identifier, '@biztrack-user.local', ''))
  limit 1;

  if v_user_id is null or v_correct_answer is null then
    return false;
  end if;

  if lower(trim(v_correct_answer)) = lower(trim(p_answer)) then
    update auth.users
    set encrypted_password = crypt(p_new_password, gen_salt('bf')),
        updated_at = now()
    where id = v_user_id;
    return true;
  else
    return false;
  end if;
end;
$$;
