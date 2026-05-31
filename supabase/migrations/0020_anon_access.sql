-- Open RLS to anonymous + authenticated roles so the dashboard can read/write
-- without requiring a sign-in. The Round 1 migration created policies that
-- only allowed the `authenticated` role; this widens them to `anon` as well.
--
-- Idempotent — safe to re-run.
--
-- ⚠️  Run this in the SQL Editor:
--      https://supabase.com/dashboard/project/dvklqmoddcqbisnbknsj/sql/new
--    Until you do, the app will load but every Supabase query will silently
--    return empty results because RLS blocks the anon role.

do $$
declare
  r record;
begin
  for r in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', r.tablename);

    -- Drop any prior BAB / objectives policies so the new open policies replace them
    execute format('drop policy if exists bab_select       on public.%I', r.tablename);
    execute format('drop policy if exists bab_insert       on public.%I', r.tablename);
    execute format('drop policy if exists bab_update       on public.%I', r.tablename);
    execute format('drop policy if exists bab_delete       on public.%I', r.tablename);
    execute format('drop policy if exists obj_select       on public.%I', r.tablename);
    execute format('drop policy if exists obj_insert       on public.%I', r.tablename);
    execute format('drop policy if exists obj_update       on public.%I', r.tablename);
    execute format('drop policy if exists obj_delete       on public.%I', r.tablename);
    execute format('drop policy if exists bab_open_select  on public.%I', r.tablename);
    execute format('drop policy if exists bab_open_insert  on public.%I', r.tablename);
    execute format('drop policy if exists bab_open_update  on public.%I', r.tablename);
    execute format('drop policy if exists bab_open_delete  on public.%I', r.tablename);

    -- Open policies — anon + authenticated can read/write everything.
    execute format('create policy bab_open_select on public.%I for select to anon, authenticated using (true)',                            r.tablename);
    execute format('create policy bab_open_insert on public.%I for insert to anon, authenticated with check (true)',                        r.tablename);
    execute format('create policy bab_open_update on public.%I for update to anon, authenticated using (true) with check (true)',           r.tablename);
    execute format('create policy bab_open_delete on public.%I for delete to anon, authenticated using (true)',                            r.tablename);
  end loop;
end $$;

-- Sanity check
select
  t.tablename,
  c.relrowsecurity as rls_enabled,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = t.tablename) as policy_count
from pg_tables t
join pg_class c on c.relname = t.tablename
where t.schemaname = 'public'
order by t.tablename;
