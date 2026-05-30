-- Round 2 — Models
alter table public.models
  add column if not exists name             text,
  add column if not exists type             text,   -- fashion / commercial / promotion / fit
  add column if not exists height_cm        numeric,
  add column if not exists bust_cm          numeric,
  add column if not exists waist_cm         numeric,
  add column if not exists hips_cm          numeric,
  add column if not exists dress_size       text,
  add column if not exists shoe_size_eu     text,
  add column if not exists country          text,
  add column if not exists city             text,
  add column if not exists languages        text,
  add column if not exists instagram        text,
  add column if not exists tiktok           text,
  add column if not exists primary_platform text,
  add column if not exists agency           text,
  add column if not exists rate_aed         numeric,
  add column if not exists status           text default 'active',
  add column if not exists email            text,
  add column if not exists phone            text,
  add column if not exists whatsapp         text,
  add column if not exists notes            text;

create index if not exists models_name_idx   on public.models (name);
create index if not exists models_status_idx on public.models (status);
