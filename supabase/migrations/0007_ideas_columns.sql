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
