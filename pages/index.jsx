create table events (
  id bigint generated always as identity primary key,
  title text not null,
  type text default 'Campaign',
  status text default 'Upcoming',
  date date,
  end_date date,
  client text,
  notes text,
  created_at timestamptz default now()
);
