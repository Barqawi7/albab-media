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
