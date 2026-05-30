-- Round 2 — Clients
alter table public.clients
  add column if not exists name            text,
  add column if not exists type            text,           -- brand / agency / individual
  add column if not exists industry        text,
  add column if not exists contact_person  text,
  add column if not exists email           text,
  add column if not exists phone           text,
  add column if not exists whatsapp        text,
  add column if not exists country         text,
  add column if not exists city            text,
  add column if not exists status          text default 'active',  -- active / lead / dormant
  add column if not exists since           date,
  add column if not exists notes           text;

create index if not exists clients_name_idx   on public.clients (name);
create index if not exists clients_status_idx on public.clients (status);
