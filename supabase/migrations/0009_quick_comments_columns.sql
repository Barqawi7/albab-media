-- Round 2 — Quick Comments (reusable templates)
alter table public.quick_comments
  add column if not exists text       text,
  add column if not exists category   text,   -- compliment / sales / follow-up / engagement / outreach
  add column if not exists platform   text,   -- instagram / tiktok / general / linkedin
  add column if not exists language   text default 'EN',
  add column if not exists use_count  int default 0,
  add column if not exists last_used  timestamptz,
  add column if not exists notes      text;

create index if not exists quick_comments_category_idx on public.quick_comments (category);
create index if not exists quick_comments_platform_idx on public.quick_comments (platform);
