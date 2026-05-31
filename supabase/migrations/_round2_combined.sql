-- =============================================================================
-- BAB Dashboard — Combined migration
--
-- Paste this whole file into the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/dvklqmoddcqbisnbknsj/sql/new
--
-- Everything is idempotent — safe to re-run on a database that already has
-- some of these migrations applied.
--
--   0001 — Round 1 init (18 base tables + updated_at trigger + RLS lockdown)
--   0002 — Influencers (comprehensive + focused) real columns
--   0003 — Clients
--   0004 — Models
--   0005 — Connections
--   0006 — Tasks
--   0007 — Ideas
--   0008 — Events
--   0009 — Quick Comments
--   0010 — Marketing
--   0011 — Social Algorithm (new table social_algorithm_notes)
--   0012 — Content
--   0013 — Sales (deals + quotations distinct from the new quotations table)
--   0014 — Finance (money + expenses distinct from the new expenses table)
--   0015 — Maps (map_locations)
--   0016 — Life areas
--   0017 — AI Assistant (new table ai_conversations)
--   0018 — Finance modules: invoices, quotations, expenses, cash_accounts
--   0019 — Objectives Kanban: objectives_tasks
-- =============================================================================


-- ============================================================
-- 0001_init.sql
-- ============================================================
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

-- ============================================================
-- 0002_influencers_columns.sql
-- ============================================================
-- BAB Dashboard Round 2 — Influencers room: real columns
-- Run in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/dvklqmoddcqbisnbknsj/sql/new
-- Idempotent: safe to re-run.
--
-- Applies the same column set to both influencers_comprehensive (full directory)
-- and influencers_focused (curated shortlist). The room UI renders one tab per
-- table; the schemas are deliberately identical so a record can be promoted
-- from comprehensive to focused without column gymnastics.

do $$
declare
  tbl text;
  tables text[] := array['influencers_comprehensive', 'influencers_focused'];
begin
  foreach tbl in array tables loop
    execute format($f$
      alter table public.%I
        add column if not exists name              text,
        add column if not exists country           text,
        add column if not exists city              text,

        add column if not exists instagram         text,
        add column if not exists tiktok            text,
        add column if not exists youtube           text,
        add column if not exists x_twitter         text,
        add column if not exists snapchat          text,

        add column if not exists followers_instagram bigint,
        add column if not exists followers_tiktok    bigint,
        add column if not exists followers_youtube   bigint,
        add column if not exists followers_x         bigint,
        add column if not exists followers_snapchat  bigint,
        add column if not exists primary_platform    text,

        add column if not exists niche             text,
        add column if not exists category          text,
        add column if not exists languages         text,

        add column if not exists rate_aed          numeric,
        add column if not exists payment_terms     text,
        add column if not exists currency_notes    text,

        add column if not exists status            text default 'active',
        add column if not exists notes             text,
        add column if not exists email             text,
        add column if not exists phone             text,
        add column if not exists whatsapp          text,
        add column if not exists manager_name      text
    $f$, tbl);

    execute format('create index if not exists %I on public.%I (name)',
                   tbl || '_name_idx', tbl);
    execute format('create index if not exists %I on public.%I (status)',
                   tbl || '_status_idx', tbl);
  end loop;
end $$;

-- Sanity check
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('influencers_comprehensive', 'influencers_focused')
order by table_name, ordinal_position;

-- ============================================================
-- 0003_clients_columns.sql
-- ============================================================
-- Round 2 — Clients
alter table public.clients
  add column if not exists name            text,
  add column if not exists type            text,           -- brand / agency / individual
  add column if not exists industry        text,
  add column if not exists contact_person  text,
  add column if not exists email           text,
  add column if not exists phone           text,
  add column if not exists whatsapp        text,
  add column if not exists country         text,
  add column if not exists city            text,
  add column if not exists status          text default 'active',  -- active / lead / dormant
  add column if not exists since           date,
  add column if not exists notes           text;

create index if not exists clients_name_idx   on public.clients (name);
create index if not exists clients_status_idx on public.clients (status);

-- ============================================================
-- 0004_models_columns.sql
-- ============================================================
-- Round 2 — Models
alter table public.models
  add column if not exists name             text,
  add column if not exists type             text,   -- fashion / commercial / promotion / fit
  add column if not exists height_cm        numeric,
  add column if not exists bust_cm          numeric,
  add column if not exists waist_cm         numeric,
  add column if not exists hips_cm          numeric,
  add column if not exists dress_size       text,
  add column if not exists shoe_size_eu     text,
  add column if not exists country          text,
  add column if not exists city             text,
  add column if not exists languages        text,
  add column if not exists instagram        text,
  add column if not exists tiktok           text,
  add column if not exists primary_platform text,
  add column if not exists agency           text,
  add column if not exists rate_aed         numeric,
  add column if not exists status           text default 'active',
  add column if not exists email            text,
  add column if not exists phone            text,
  add column if not exists whatsapp         text,
  add column if not exists notes            text;

create index if not exists models_name_idx   on public.models (name);
create index if not exists models_status_idx on public.models (status);

-- ============================================================
-- 0005_connections_columns.sql
-- ============================================================
-- Round 2 — Connections
alter table public.connections
  add column if not exists name          text,
  add column if not exists role_title    text,
  add column if not exists company       text,
  add column if not exists industry      text,
  add column if not exists how_met       text,
  add column if not exists country       text,
  add column if not exists city          text,
  add column if not exists email         text,
  add column if not exists phone         text,
  add column if not exists whatsapp      text,
  add column if not exists instagram     text,
  add column if not exists linkedin      text,
  add column if not exists last_contact  date,
  add column if not exists relationship  text default 'active', -- active / warm / cold / lost
  add column if not exists notes         text;

create index if not exists connections_name_idx    on public.connections (name);
create index if not exists connections_company_idx on public.connections (company);

-- ============================================================
-- 0006_tasks_columns.sql
-- ============================================================
-- Round 2 — Tasks
alter table public.tasks
  add column if not exists title     text,
  add column if not exists status    text default 'todo',   -- todo / doing / done
  add column if not exists priority  text default 'med',    -- low / med / high
  add column if not exists due_date  date,
  add column if not exists tags      text,
  add column if not exists notes     text,
  add column if not exists archived  boolean default false;

create index if not exists tasks_status_idx   on public.tasks (status);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

-- ============================================================
-- 0007_ideas_columns.sql
-- ============================================================
-- Round 2 — Ideas
alter table public.ideas
  add column if not exists title         text,
  add column if not exists category      text,
  add column if not exists status        text default 'raw',  -- raw / exploring / validated / parked / done
  add column if not exists value_score   int,                 -- 1..5
  add column if not exists effort_score  int,                 -- 1..5
  add column if not exists source        text,
  add column if not exists notes         text;

create index if not exists ideas_status_idx on public.ideas (status);

-- ============================================================
-- 0008_events_columns.sql
-- ============================================================
-- Round 2 — Events
alter table public.events
  add column if not exists name        text,
  add column if not exists event_date  date,
  add column if not exists location    text,
  add column if not exists city        text,
  add column if not exists country     text,
  add column if not exists type        text,                            -- conference / launch / dinner / gitex / etc.
  add column if not exists budget_aed  numeric,
  add column if not exists spent_aed   numeric,
  add column if not exists status      text default 'planned',          -- planned / confirmed / done / cancelled
  add column if not exists client      text,
  add column if not exists notes       text,
  add column if not exists link        text;

create index if not exists events_date_idx   on public.events (event_date);
create index if not exists events_status_idx on public.events (status);

-- ============================================================
-- 0009_quick_comments_columns.sql
-- ============================================================
-- Round 2 — Quick Comments (reusable templates)
alter table public.quick_comments
  add column if not exists text       text,
  add column if not exists category   text,   -- compliment / sales / follow-up / engagement / outreach
  add column if not exists platform   text,   -- instagram / tiktok / general / linkedin
  add column if not exists language   text default 'EN',
  add column if not exists use_count  int default 0,
  add column if not exists last_used  timestamptz,
  add column if not exists notes      text;

create index if not exists quick_comments_category_idx on public.quick_comments (category);
create index if not exists quick_comments_platform_idx on public.quick_comments (platform);

-- ============================================================
-- 0010_marketing_columns.sql
-- ============================================================
-- Round 2 — Marketing updates / campaigns
alter table public.marketing_updates
  add column if not exists campaign    text,
  add column if not exists client      text,
  add column if not exists channel     text,                            -- instagram / tiktok / google / meta / outdoor / email
  add column if not exists status      text default 'planned',          -- planned / live / paused / done / cancelled
  add column if not exists start_date  date,
  add column if not exists end_date    date,
  add column if not exists budget_aed  numeric,
  add column if not exists spent_aed   numeric,
  add column if not exists kpi         text,                            -- e.g. reach, CPM, conversions
  add column if not exists results     text,
  add column if not exists link        text,
  add column if not exists notes       text;

create index if not exists marketing_status_idx on public.marketing_updates (status);
create index if not exists marketing_start_idx  on public.marketing_updates (start_date);

-- ============================================================
-- 0011_social_algorithm.sql
-- ============================================================
-- Round 2 — Social Algorithm: new table for platform-algorithm notes.
-- The Round 1 migration did not pre-create this table; this migration creates
-- it with the same shape conventions (id, created_at, updated_at, real cols)
-- and applies the same default-deny + authenticated RLS policies.

create table if not exists public.social_algorithm_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  platform       text,                       -- instagram / tiktok / youtube / x / general
  topic          text,
  finding        text,
  impact         text default 'med',         -- low / med / high
  source         text,
  date_observed  date,
  still_valid    boolean default true,
  notes          text
);

drop trigger if exists trg_updated_at on public.social_algorithm_notes;
create trigger trg_updated_at
  before update on public.social_algorithm_notes
  for each row execute function public.set_updated_at();

alter table public.social_algorithm_notes enable row level security;
alter table public.social_algorithm_notes force  row level security;

drop policy if exists bab_select on public.social_algorithm_notes;
drop policy if exists bab_insert on public.social_algorithm_notes;
drop policy if exists bab_update on public.social_algorithm_notes;
drop policy if exists bab_delete on public.social_algorithm_notes;

create policy bab_select on public.social_algorithm_notes for select to authenticated using (true);
create policy bab_insert on public.social_algorithm_notes for insert to authenticated with check (true);
create policy bab_update on public.social_algorithm_notes for update to authenticated using (true) with check (true);
create policy bab_delete on public.social_algorithm_notes for delete to authenticated using (true);

create index if not exists social_algo_platform_idx on public.social_algorithm_notes (platform);
create index if not exists social_algo_date_idx     on public.social_algorithm_notes (date_observed);

-- ============================================================
-- 0012_content_columns.sql
-- ============================================================
-- Round 2 — Content pipeline
alter table public.content
  add column if not exists title         text,
  add column if not exists type          text,                          -- reel / post / video / carousel / blog / story
  add column if not exists platform      text,                          -- instagram / tiktok / youtube / x / web
  add column if not exists status        text default 'idea',           -- idea / scripting / filming / editing / scheduled / published
  add column if not exists publish_date  date,
  add column if not exists client        text,
  add column if not exists campaign      text,
  add column if not exists link          text,
  add column if not exists views         bigint,
  add column if not exists notes         text;

create index if not exists content_status_idx       on public.content (status);
create index if not exists content_publish_date_idx on public.content (publish_date);

-- ============================================================
-- 0013_sales_columns.sql
-- ============================================================
-- Round 2 — Sales (deals + quotations)
alter table public.sales_deals
  add column if not exists deal_name        text,
  add column if not exists client           text,
  add column if not exists stage            text default 'lead',   -- lead / qualified / proposal / won / lost
  add column if not exists value_aed        numeric,
  add column if not exists probability_pct  int,
  add column if not exists expected_close   date,
  add column if not exists actual_close     date,
  add column if not exists source           text,
  add column if not exists owner            text,
  add column if not exists notes            text;

create index if not exists sales_deals_stage_idx on public.sales_deals (stage);
create index if not exists sales_deals_close_idx on public.sales_deals (expected_close);

alter table public.sales_quotations
  add column if not exists number       text,
  add column if not exists client       text,
  add column if not exists items        text,                       -- free-form line items for now
  add column if not exists subtotal_aed numeric,
  add column if not exists vat_aed      numeric,
  add column if not exists total_aed    numeric,
  add column if not exists status       text default 'draft',       -- draft / sent / accepted / rejected / expired
  add column if not exists sent_date    date,
  add column if not exists valid_until  date,
  add column if not exists notes        text;

create index if not exists sales_quotations_status_idx on public.sales_quotations (status);
create index if not exists sales_quotations_number_idx on public.sales_quotations (number);

-- ============================================================
-- 0014_finance_columns.sql
-- ============================================================
-- Round 2 — Finance (money in + expenses)
alter table public.finance_money
  add column if not exists txn_date     date,
  add column if not exists source       text,
  add column if not exists client       text,
  add column if not exists amount_aed   numeric,
  add column if not exists category     text,
  add column if not exists status       text default 'pending',  -- pending / received / cancelled
  add column if not exists invoice_ref  text,
  add column if not exists method       text,                    -- bank / cash / paypal / etc
  add column if not exists notes        text;

create index if not exists finance_money_date_idx   on public.finance_money (txn_date);
create index if not exists finance_money_status_idx on public.finance_money (status);

alter table public.finance_expenses
  add column if not exists txn_date    date,
  add column if not exists vendor      text,
  add column if not exists amount_aed  numeric,
  add column if not exists category    text,
  add column if not exists method      text,
  add column if not exists recurring   boolean default false,
  add column if not exists notes       text,
  add column if not exists receipt_url text;

create index if not exists finance_expenses_date_idx on public.finance_expenses (txn_date);
create index if not exists finance_expenses_cat_idx  on public.finance_expenses (category);

-- ============================================================
-- 0015_maps_columns.sql
-- ============================================================
-- Round 2 — Map locations
alter table public.map_locations
  add column if not exists name      text,
  add column if not exists type      text,                  -- event / client / restaurant / studio / etc.
  add column if not exists address   text,
  add column if not exists city      text,
  add column if not exists country   text,
  add column if not exists lat       numeric,
  add column if not exists lng       numeric,
  add column if not exists link      text,
  add column if not exists notes     text;

create index if not exists map_locations_type_idx on public.map_locations (type);
create index if not exists map_locations_city_idx on public.map_locations (city);

-- ============================================================
-- 0016_life_columns.sql
-- ============================================================
-- Round 2 — Life areas (wheel-of-life style notes)
alter table public.life_areas
  add column if not exists area          text,                -- health / relationships / finance / mind / fun / etc.
  add column if not exists current_state text,
  add column if not exists goal          text,
  add column if not exists next_step     text,
  add column if not exists score         int,                  -- 1..10
  add column if not exists notes         text,
  add column if not exists reviewed_at   date;

create index if not exists life_areas_area_idx on public.life_areas (area);

-- ============================================================
-- 0017_ai_conversations.sql
-- ============================================================
-- Round 2 — AI Assistant: store chat conversations.
-- New table (not in migration 0001). Same RLS conventions.

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  title          text,
  model          text default 'claude-sonnet-4-6',
  system_prompt  text,
  messages       jsonb not null default '[]'::jsonb   -- array of { role, content, ts }
);

drop trigger if exists trg_updated_at on public.ai_conversations;
create trigger trg_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_updated_at();

alter table public.ai_conversations enable row level security;
alter table public.ai_conversations force  row level security;

drop policy if exists bab_select on public.ai_conversations;
drop policy if exists bab_insert on public.ai_conversations;
drop policy if exists bab_update on public.ai_conversations;
drop policy if exists bab_delete on public.ai_conversations;

create policy bab_select on public.ai_conversations for select to authenticated using (true);
create policy bab_insert on public.ai_conversations for insert to authenticated with check (true);
create policy bab_update on public.ai_conversations for update to authenticated using (true) with check (true);
create policy bab_delete on public.ai_conversations for delete to authenticated using (true);

-- ============================================================
-- 0018_finance_modules.sql
-- ============================================================
-- Round 2 — Invoices, Quotations, Expenses, Cash accounts.
-- These four tables are NOT in 0001 — they're new for the finance modules
-- (Invoices, Quotations, Expenses, Cash Flow). Same shape conventions and
-- RLS policy set as every other BAB Dashboard table.

do $$
declare
  tbl text;
  tables text[] := array['invoices', 'quotations', 'expenses', 'cash_accounts'];
begin
  foreach tbl in array tables loop
    execute format('
      create table if not exists public.%I (
        id uuid primary key default gen_random_uuid(),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )', tbl);

    execute format('drop trigger if exists trg_updated_at on public.%I', tbl);
    execute format('
      create trigger trg_updated_at
      before update on public.%I
      for each row execute function public.set_updated_at()', tbl);

    execute format('alter table public.%I enable row level security', tbl);
    execute format('alter table public.%I force  row level security', tbl);

    execute format('drop policy if exists bab_select on public.%I', tbl);
    execute format('drop policy if exists bab_insert on public.%I', tbl);
    execute format('drop policy if exists bab_update on public.%I', tbl);
    execute format('drop policy if exists bab_delete on public.%I', tbl);

    execute format('create policy bab_select on public.%I for select to authenticated using (true)', tbl);
    execute format('create policy bab_insert on public.%I for insert to authenticated with check (true)', tbl);
    execute format('create policy bab_update on public.%I for update to authenticated using (true) with check (true)', tbl);
    execute format('create policy bab_delete on public.%I for delete to authenticated using (true)', tbl);
  end loop;
end $$;

-- Invoices
alter table public.invoices
  add column if not exists client          text,
  add column if not exists vertical        text,
  add column if not exists invoice_number  text,
  add column if not exists revenue         numeric default 0,
  add column if not exists amount_paid     numeric default 0,
  add column if not exists due_payment     numeric default 0;

create index if not exists invoices_client_idx  on public.invoices (client);
create index if not exists invoices_number_idx  on public.invoices (invoice_number);

-- Quotations
alter table public.quotations
  add column if not exists client            text,
  add column if not exists quotation_number  text,
  add column if not exists status            text default 'pending'; -- awarded / dropped / lost / pending

create index if not exists quotations_status_idx on public.quotations (status);
create index if not exists quotations_number_idx on public.quotations (quotation_number);

-- Expenses (simple monthly expense log; separate from finance_expenses)
alter table public.expenses
  add column if not exists item    text,
  add column if not exists amount  numeric default 0;

create index if not exists expenses_item_idx on public.expenses (item);

-- Cash accounts
alter table public.cash_accounts
  add column if not exists account text,
  add column if not exists balance numeric default 0;

create index if not exists cash_accounts_account_idx on public.cash_accounts (account);

-- ============================================================
-- 0019_objectives_tasks.sql
-- ============================================================
-- Objectives: new objectives_tasks table for the day/week Kanban.
-- Idempotent. Matches the column set required by /objectives.

create table if not exists public.objectives_tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  day        text,
  week       text,
  done       boolean default false,
  position   int,
  created_at timestamptz not null default now()
);

alter table public.objectives_tasks enable row level security;
alter table public.objectives_tasks force  row level security;

drop policy if exists obj_select on public.objectives_tasks;
drop policy if exists obj_insert on public.objectives_tasks;
drop policy if exists obj_update on public.objectives_tasks;
drop policy if exists obj_delete on public.objectives_tasks;

create policy obj_select on public.objectives_tasks for select to authenticated using (true);
create policy obj_insert on public.objectives_tasks for insert to authenticated with check (true);
create policy obj_update on public.objectives_tasks for update to authenticated using (true) with check (true);
create policy obj_delete on public.objectives_tasks for delete to authenticated using (true);

create index if not exists obj_week_idx on public.objectives_tasks (week);
create index if not exists obj_week_day_idx on public.objectives_tasks (week, day);
