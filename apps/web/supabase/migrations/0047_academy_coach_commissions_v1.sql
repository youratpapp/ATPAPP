-- Academy coach commissions v1
-- Date: 2026-05-12

alter table public.place_coaches
  add column if not exists commission_percent integer not null default 0
  check (commission_percent between 0 and 100);
