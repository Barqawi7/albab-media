-- Round 2 — Sales (deals + quotations)
alter table public.sales_deals
  add column if not exists deal_name        text,
  add column if not exists client           text,
  add column if not exists stage            text default 'lead',   -- lead / qualified / proposal / won / lost
  add column if not exists value_aed        numeric,
  add column if not exists probability_pct  int,
  add column if not exists expected_close   date,
  add column if not exists actual_close     date,
  add column if not exists source           text,
  add column if not exists owner            text,
  add column if not exists notes            text;

create index if not exists sales_deals_stage_idx on public.sales_deals (stage);
create index if not exists sales_deals_close_idx on public.sales_deals (expected_close);

alter table public.sales_quotations
  add column if not exists number       text,
  add column if not exists client       text,
  add column if not exists items        text,                       -- free-form line items for now
  add column if not exists subtotal_aed numeric,
  add column if not exists vat_aed      numeric,
  add column if not exists total_aed    numeric,
  add column if not exists status       text default 'draft',       -- draft / sent / accepted / rejected / expired
  add column if not exists sent_date    date,
  add column if not exists valid_until  date,
  add column if not exists notes        text;

create index if not exists sales_quotations_status_idx on public.sales_quotations (status);
create index if not exists sales_quotations_number_idx on public.sales_quotations (number);
