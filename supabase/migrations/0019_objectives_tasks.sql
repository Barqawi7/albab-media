-- Objectives: new objectives_tasks table for the day/week Kanban.
-- Idempotent. Matches the column set required by /objectives.

create table if not exists public.objectives_tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  day        text,
  week       text,
  done       boolean default false,
  position   int default 0,
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
