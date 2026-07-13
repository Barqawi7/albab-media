-- BAB Dashboard — Business OS one-pass import (Round 4)
-- Creates 6 canonical tables whose columns match the import CSV headers 1:1, and
-- grants anon SELECT so the app can read them (the gap that silently broke it
-- before). Also grants anon+authenticated write so tabs stay editable.
--
-- Reused tables `real_estate` and `influencers_master` are NOT recreated — only
-- their anon read policy is (re)applied.
--
-- Run in the SQL Editor:
--   https://supabase.com/dashboard/project/dvklqmoddcqbisnbknsj/sql/new
--
-- Idempotent — safe to re-run.
-- ⚠️  Drops & recreates `clients` and `quotations` (approved) so their columns
--     are canonical. Any rows currently in those two tables are removed; the CSV
--     imports become the source of truth. The other four tables are new.

-- ── 1. Fresh canonical tables ────────────────────────────────────────────────
drop table if exists public.finance_invoices cascade;
create table public.finance_invoices (
  id             bigint generated always as identity primary key,
  invoice_number text,
  client_name    text,
  vertical       text,
  revenue        numeric,
  amount_paid    numeric,
  due_payment    numeric,
  created_at     timestamptz default now()
);

drop table if exists public.quotations cascade;
create table public.quotations (
  id               bigint generated always as identity primary key,
  quotation_number text,
  client_name      text,
  status           text,
  created_at       timestamptz default now()
);

drop table if exists public.sales_leads cascade;
create table public.sales_leads (
  id            bigint generated always as identity primary key,
  client        text,
  vertical      text,
  spoc          text,
  position      text,
  phone         text,
  email         text,
  lead_type     text,
  quarter       text,
  stage         text,
  value         text,
  action_needed text,
  comments      text,
  pool          text,
  created_at    timestamptz default now()
);

drop table if exists public.clients cascade;
create table public.clients (
  id             bigint generated always as identity primary key,
  company        text,
  category       text,
  contact_person text,
  position       text,
  email          text,
  phone          text,
  website        text,
  location       text,
  instagram      text,
  stage          text,
  notes          text,
  source         text,
  created_at     timestamptz default now()
);

drop table if exists public.content_assets cascade;
create table public.content_assets (
  id         bigint generated always as identity primary key,
  name       text,
  status     text,
  on_hdd     text,
  created_at timestamptz default now()
);

drop table if exists public.objectives cascade;
create table public.objectives (
  id         bigint generated always as identity primary key,
  category   text,
  task       text,
  created_at timestamptz default now()
);

-- ── 2. RLS on the 6 new tables: anon SELECT (+ anon/authenticated write) ─────
do $$
declare
  tbl text;
  names text[] := array['finance_invoices','quotations','sales_leads','clients','content_assets','objectives'];
begin
  foreach tbl in array names loop
    execute format('alter table public.%I enable row level security', tbl);

    -- anon read — the policy the app needs to display data
    execute format('drop policy if exists "anon_read" on public.%I', tbl);
    execute format('create policy "anon_read" on public.%I for select to anon using (true)', tbl);

    -- write access so the in-app add/edit/delete keep working
    execute format('drop policy if exists "app_write" on public.%I', tbl);
    execute format('create policy "app_write" on public.%I for all to anon, authenticated using (true) with check (true)', tbl);
  end loop;
end $$;

-- ── 3. Anon read on the reused tables (guarded — no data touched) ────────────
do $$
declare
  tbl text;
  names text[] := array['real_estate','influencers_master'];
begin
  foreach tbl in array names loop
    if to_regclass('public.' || tbl) is not null then
      execute format('alter table public.%I enable row level security', tbl);
      execute format('drop policy if exists "anon_read" on public.%I', tbl);
      execute format('create policy "anon_read" on public.%I for select to anon using (true)', tbl);
    end if;
  end loop;
end $$;

-- ── 4. Sanity check — every table below should show has_anon_read = true ─────
select t.tablename,
  exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = t.tablename and p.policyname = 'anon_read'
  ) as has_anon_read
from pg_tables t
where t.schemaname = 'public'
  and t.tablename in ('finance_invoices','quotations','sales_leads','clients','content_assets','objectives','real_estate','influencers_master')
order by t.tablename;
