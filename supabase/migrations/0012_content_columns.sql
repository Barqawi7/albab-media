-- Round 2 — Content pipeline
alter table public.content
  add column if not exists title         text,
  add column if not exists type          text,                          -- reel / post / video / carousel / blog / story
  add column if not exists platform      text,                          -- instagram / tiktok / youtube / x / web
  add column if not exists status        text default 'idea',           -- idea / scripting / filming / editing / scheduled / published
  add column if not exists publish_date  date,
  add column if not exists client        text,
  add column if not exists campaign      text,
  add column if not exists link          text,
  add column if not exists views         bigint,
  add column if not exists notes         text;

create index if not exists content_status_idx       on public.content (status);
create index if not exists content_publish_date_idx on public.content (publish_date);
