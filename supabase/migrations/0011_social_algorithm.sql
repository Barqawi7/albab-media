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
