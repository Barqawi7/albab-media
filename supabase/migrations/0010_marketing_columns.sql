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
