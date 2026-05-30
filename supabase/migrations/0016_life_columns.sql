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
