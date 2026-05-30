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
