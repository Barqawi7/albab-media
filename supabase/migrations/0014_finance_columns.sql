-- Round 2 — Finance (money in + expenses)
alter table public.finance_money
  add column if not exists txn_date     date,
  add column if not exists source       text,
  add column if not exists client       text,
  add column if not exists amount_aed   numeric,
  add column if not exists category     text,
  add column if not exists status       text default 'pending',  -- pending / received / cancelled
  add column if not exists invoice_ref  text,
  add column if not exists method       text,                    -- bank / cash / paypal / etc
  add column if not exists notes        text;

create index if not exists finance_money_date_idx   on public.finance_money (txn_date);
create index if not exists finance_money_status_idx on public.finance_money (status);

alter table public.finance_expenses
  add column if not exists txn_date    date,
  add column if not exists vendor      text,
  add column if not exists amount_aed  numeric,
  add column if not exists category    text,
  add column if not exists method      text,
  add column if not exists recurring   boolean default false,
  add column if not exists notes       text,
  add column if not exists receipt_url text;

create index if not exists finance_expenses_date_idx on public.finance_expenses (txn_date);
create index if not exists finance_expenses_cat_idx  on public.finance_expenses (category);
