-- Migration: Create Profiles Table, RLS Policies & PIN Recovery (Sprint 0 Epic 3)
-- Timestamp: 20260730140000

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  security_question text,
  security_answer text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Drop existing policies if reapplying
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- RLS Policies
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Function & Trigger to automatically create a profile record upon user sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, security_question, security_answer)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'security_question', ''),
    coalesce(new.raw_user_meta_data->>'security_answer', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    security_question = excluded.security_question,
    security_answer = excluded.security_answer,
    updated_at = now();
  return new;
end;
$$;

-- Bind trigger to auth.users table
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable pgcrypto extension for password hashing
create extension if not exists pgcrypto schema extensions;

-- RPC Helper: Allow unauthenticated users to fetch their security question by Phone/Email
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

-- RPC Helper: Reset PIN/Password using Security Question Answer (without requiring Email server or SMS)
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
