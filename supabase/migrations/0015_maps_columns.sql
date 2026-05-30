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
