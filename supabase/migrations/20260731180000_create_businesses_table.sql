-- Sprint 1 Migration: Create Businesses Table & Logo Storage
-- Description: Establishes unique business identity for every entrepreneur with strict RLS owner protection.

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  business_category text not null,
  phone text,
  email text,
  address text,
  country text not null default 'Nigeria',
  currency text not null default 'NGN',
  language text not null default 'en',
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create Index on owner_id for rapid lookups during user login and dashboard initialization
create index if not exists idx_business_owner on public.businesses(owner_id);

-- Enable Row Level Security (RLS)
alter table public.businesses enable row level security;

-- Policy: Owners manage their own businesses
drop policy if exists "Owners manage their businesses" on public.businesses;
create policy "Owners manage their businesses"
  on public.businesses
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Trigger to automatically update updated_at timestamp upon row modification
create or replace function public.update_businesses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_businesses_updated_at on public.businesses;
create trigger set_businesses_updated_at
  before update on public.businesses
  for each row execute function public.update_businesses_updated_at();

-- Setup Supabase Storage bucket for Business Logos
insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', true)
on conflict (id) do nothing;

-- RLS for storage bucket: Anyone can read public logos, authenticated owners can upload/modify their own logo
drop policy if exists "Public access to business logos" on storage.objects;
create policy "Public access to business logos"
  on storage.objects for select
  using (bucket_id = 'business-logos');

drop policy if exists "Authenticated users upload logos" on storage.objects;
create policy "Authenticated users upload logos"
  on storage.objects for insert
  with check (bucket_id = 'business-logos' and auth.role() = 'authenticated');

drop policy if exists "Users update own logo" on storage.objects;
create policy "Users update own logo"
  on storage.objects for update
  using (bucket_id = 'business-logos' and owner = auth.uid());
