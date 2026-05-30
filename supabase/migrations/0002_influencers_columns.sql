-- BAB Dashboard Round 2 — Influencers room: real columns
-- Run in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/dvklqmoddcqbisnbknsj/sql/new
-- Idempotent: safe to re-run.
--
-- Applies the same column set to both influencers_comprehensive (full directory)
-- and influencers_focused (curated shortlist). The room UI renders one tab per
-- table; the schemas are deliberately identical so a record can be promoted
-- from comprehensive to focused without column gymnastics.

do $$
declare
  tbl text;
  tables text[] := array['influencers_comprehensive', 'influencers_focused'];
begin
  foreach tbl in array tables loop
    execute format($f$
      alter table public.%I
        add column if not exists name              text,
        add column if not exists country           text,
        add column if not exists city              text,

        add column if not exists instagram         text,
        add column if not exists tiktok            text,
        add column if not exists youtube           text,
        add column if not exists x_twitter         text,
        add column if not exists snapchat          text,

        add column if not exists followers_instagram bigint,
        add column if not exists followers_tiktok    bigint,
        add column if not exists followers_youtube   bigint,
        add column if not exists followers_x         bigint,
        add column if not exists followers_snapchat  bigint,
        add column if not exists primary_platform    text,

        add column if not exists niche             text,
        add column if not exists category          text,
        add column if not exists languages         text,

        add column if not exists rate_aed          numeric,
        add column if not exists payment_terms     text,
        add column if not exists currency_notes    text,

        add column if not exists status            text default 'active',
        add column if not exists notes             text,
        add column if not exists email             text,
        add column if not exists phone             text,
        add column if not exists whatsapp          text,
        add column if not exists manager_name      text
    $f$, tbl);

    execute format('create index if not exists %I on public.%I (name)',
                   tbl || '_name_idx', tbl);
    execute format('create index if not exists %I on public.%I (status)',
                   tbl || '_status_idx', tbl);
  end loop;
end $$;

-- Sanity check
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('influencers_comprehensive', 'influencers_focused')
order by table_name, ordinal_position;
