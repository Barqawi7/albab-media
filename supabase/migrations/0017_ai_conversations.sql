-- Round 2 — AI Assistant: store chat conversations.
-- New table (not in migration 0001). Same RLS conventions.

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  title          text,
  model          text default 'claude-sonnet-4-6',
  system_prompt  text,
  messages       jsonb not null default '[]'::jsonb   -- array of { role, content, ts }
);

drop trigger if exists trg_updated_at on public.ai_conversations;
create trigger trg_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_updated_at();

alter table public.ai_conversations enable row level security;
alter table public.ai_conversations force  row level security;

drop policy if exists bab_select on public.ai_conversations;
drop policy if exists bab_insert on public.ai_conversations;
drop policy if exists bab_update on public.ai_conversations;
drop policy if exists bab_delete on public.ai_conversations;

create policy bab_select on public.ai_conversations for select to authenticated using (true);
create policy bab_insert on public.ai_conversations for insert to authenticated with check (true);
create policy bab_update on public.ai_conversations for update to authenticated using (true) with check (true);
create policy bab_delete on public.ai_conversations for delete to authenticated using (true);
