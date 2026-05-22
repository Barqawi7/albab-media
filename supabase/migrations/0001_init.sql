-- BAB Dashboard — initial schema + RLS lockdown
-- Run this in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/dvklqmoddcqbisnbknsj/sql/new
-- Idempotent: safe to re-run.

-- ── 1. updated_at trigger function ───────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 2. Create all 18 BAB Dashboard tables with uniform shape ─────────────────
-- Shape: id (uuid pk), created_at, updated_at, data (jsonb).
-- Per-room column schemas are added in Round 2.
do $$
declare
  tbl text;
  tables text[] := array[
    'influencers_comprehensive',
    'influencers_focused',
    'clients',
    'real_estate',
    'sales_deals',
    'sales_quotations',
    'finance_money',
    'finance_expenses',
    'tasks',
    'ideas',
    'events',
    'models',
    'connections',
    'content',
    'quick_comments',
    'marketing_updates',
    'life_areas',
    'map_locations'
  ];
begin
  foreach tbl in array tables loop
    execute format('
      create table if not exists public.%I (
        id uuid primary key default gen_random_uuid(),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        data jsonb not null default ''{}''::jsonb
      )', tbl);

    execute format('drop trigger if exists trg_updated_at on public.%I', tbl);
    execute format('
      create trigger trg_updated_at
      before update on public.%I
      for each row execute function public.set_updated_at()', tbl);
  end loop;
end $$;

-- ── 3. RLS on EVERY public table (covers the 18 plus property_owners and
--      anything else already in the schema). Default-deny + four explicit
--      authenticated-only policies. ─────────────────────────────────────────
do $$
declare
  r record;
begin
  for r in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
    execute format('alter table public.%I force row level security', r.tablename);

    -- Drop any prior BAB policies so this migration is idempotent
    execute format('drop policy if exists bab_select on public.%I', r.tablename);
    execute format('drop policy if exists bab_insert on public.%I', r.tablename);
    execute format('drop policy if exists bab_update on public.%I', r.tablename);
    execute format('drop policy if exists bab_delete on public.%I', r.tablename);

    -- Allow only authenticated users (anon and public get nothing)
    execute format('create policy bab_select on public.%I for select to authenticated using (true)', r.tablename);
    execute format('create policy bab_insert on public.%I for insert to authenticated with check (true)', r.tablename);
    execute format('create policy bab_update on public.%I for update to authenticated using (true) with check (true)', r.tablename);
    execute format('create policy bab_delete on public.%I for delete to authenticated using (true)', r.tablename);
  end loop;
end $$;

-- ── 4. Sanity check — should show every public table with rls_enabled=true
--      and policy_count=4 ─────────────────────────────────────────────────────
select
  t.tablename,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = t.tablename) as policy_count
from pg_tables t
join pg_class c on c.relname = t.tablename
where t.schemaname = 'public'
order by t.tablename;
