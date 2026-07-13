-- BAB Dashboard Round 3 — restructure: new tables for Sales Pipeline, Marketing
-- ideas, and Home reminders. Same shape + open (anon + authenticated) RLS as the
-- rest of the app.
--
-- ⚠️  Run this in the Supabase SQL Editor:
--      https://supabase.com/dashboard/project/dvklqmoddcqbisnbknsj/sql/new
--    Idempotent — safe to re-run. Existing data in every other table is untouched.

-- ── 1. Create the new tables (uniform id/created_at/updated_at base) ─────────
do $$
declare
  tbl text;
  tables text[] := array['pipeline_opportunities', 'marketing_ideas', 'reminders'];
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
  end loop;
end $$;

-- ── 2. Sales Pipeline opportunities ──────────────────────────────────────────
-- Stages: prospect / funnel / upside / committed / awarded / dropped / lost.
alter table public.pipeline_opportunities
  add column if not exists name           text,
  add column if not exists client         text,
  add column if not exists stage          text default 'prospect',
  add column if not exists value_aed      numeric default 0,
  add column if not exists probability    int,
  add column if not exists close_date     date,
  add column if not exists source         text,
  add column if not exists owner          text,
  add column if not exists quotation_id   uuid,           -- link → quotations.id
  add column if not exists invoice_number text,           -- set when awarded
  add column if not exists notes          text;

create index if not exists pipeline_stage_idx  on public.pipeline_opportunities (stage);
create index if not exists pipeline_client_idx on public.pipeline_opportunities (client);

-- ── 3. Marketing ideas & strategies (my own notes, separate from campaigns) ──
alter table public.marketing_ideas
  add column if not exists title  text,
  add column if not exists body   text,
  add column if not exists tags   text,
  add column if not exists pinned boolean default false;

-- ── 4. Home reminders / quick-add ────────────────────────────────────────────
alter table public.reminders
  add column if not exists text     text,
  add column if not exists due_date date,
  add column if not exists done     boolean default false;

create index if not exists reminders_done_idx on public.reminders (done);

-- ── 5. Open RLS (anon + authenticated) on the three new tables ───────────────
do $$
declare
  tbl text;
  names text[] := array['pipeline_opportunities', 'marketing_ideas', 'reminders'];
begin
  foreach tbl in array names loop
    execute format('alter table public.%I enable row level security', tbl);

    execute format('drop policy if exists bab_open_select on public.%I', tbl);
    execute format('drop policy if exists bab_open_insert on public.%I', tbl);
    execute format('drop policy if exists bab_open_update on public.%I', tbl);
    execute format('drop policy if exists bab_open_delete on public.%I', tbl);

    execute format('create policy bab_open_select on public.%I for select to anon, authenticated using (true)', tbl);
    execute format('create policy bab_open_insert on public.%I for insert to anon, authenticated with check (true)', tbl);
    execute format('create policy bab_open_update on public.%I for update to anon, authenticated using (true) with check (true)', tbl);
    execute format('create policy bab_open_delete on public.%I for delete to anon, authenticated using (true)', tbl);
  end loop;
end $$;

-- Sanity check
select tablename,
  (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = t.tablename) as policy_count
from pg_tables t
where schemaname = 'public'
  and tablename in ('pipeline_opportunities', 'marketing_ideas', 'reminders')
order by tablename;
