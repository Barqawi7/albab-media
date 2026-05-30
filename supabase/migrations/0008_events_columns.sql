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
