-- Round 2 — Invoices, Quotations, Expenses, Cash accounts.
-- These four tables are NOT in 0001 — they're new for the finance modules
-- (Invoices, Quotations, Expenses, Cash Flow). Same shape conventions and
-- RLS policy set as every other BAB Dashboard table.

do $$
declare
  tbl text;
  tables text[] := array['invoices', 'quotations', 'expenses', 'cash_accounts'];
begin
  foreach tbl in array tables loop
    execute format('
      create table if not exists public.%I (
        id uuid primary key default gen_random_uuid(),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )', tbl);

    execute format('drop trigger if exists trg_updated_at on public.%I', tbl);
    execute format('
      create trigger trg_updated_at
      before update on public.%I
      for each row execute function public.set_updated_at()', tbl);

    execute format('alter table public.%I enable row level security', tbl);
    execute format('alter table public.%I force  row level security', tbl);

    execute format('drop policy if exists bab_select on public.%I', tbl);
    execute format('drop policy if exists bab_insert on public.%I', tbl);
    execute format('drop policy if exists bab_update on public.%I', tbl);
    execute format('drop policy if exists bab_delete on public.%I', tbl);

    execute format('create policy bab_select on public.%I for select to authenticated using (true)', tbl);
    execute format('create policy bab_insert on public.%I for insert to authenticated with check (true)', tbl);
    execute format('create policy bab_update on public.%I for update to authenticated using (true) with check (true)', tbl);
    execute format('create policy bab_delete on public.%I for delete to authenticated using (true)', tbl);
  end loop;
end $$;

-- Invoices
alter table public.invoices
  add column if not exists client          text,
  add column if not exists vertical        text,
  add column if not exists invoice_number  text,
  add column if not exists revenue         numeric default 0,
  add column if not exists amount_paid     numeric default 0,
  add column if not exists due_payment     numeric default 0;

create index if not exists invoices_client_idx  on public.invoices (client);
create index if not exists invoices_number_idx  on public.invoices (invoice_number);

-- Quotations
alter table public.quotations
  add column if not exists client            text,
  add column if not exists quotation_number  text,
  add column if not exists status            text default 'pending'; -- awarded / dropped / lost / pending

create index if not exists quotations_status_idx on public.quotations (status);
create index if not exists quotations_number_idx on public.quotations (quotation_number);

-- Expenses (simple monthly expense log; separate from finance_expenses)
alter table public.expenses
  add column if not exists item    text,
  add column if not exists amount  numeric default 0;

create index if not exists expenses_item_idx on public.expenses (item);

-- Cash accounts
alter table public.cash_accounts
  add column if not exists name    text,
  add column if not exists balance numeric default 0,
  add column if not exists notes   text;

create index if not exists cash_accounts_name_idx on public.cash_accounts (name);
