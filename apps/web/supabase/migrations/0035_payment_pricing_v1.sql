-- Payment pricing v1
-- Date: 2026-05-11

alter table public.tournaments
  add column if not exists registration_fee_cents integer not null default 0
  check (registration_fee_cents >= 0);

alter table public.leagues
  add column if not exists registration_fee_cents integer not null default 0
  check (registration_fee_cents >= 0);

alter table public.place_courts
  add column if not exists booking_fee_cents integer not null default 0
  check (booking_fee_cents >= 0);

drop policy if exists app_payments_tournament_owner_read on public.app_payments;
create policy app_payments_tournament_owner_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'tournament_registration'
  and exists (
    select 1
    from public.tournament_registrations r
    where r.id = target_id
      and public.app_is_tournament_owner(r.tournament_id)
  )
);

drop policy if exists app_payments_league_owner_read on public.app_payments;
create policy app_payments_league_owner_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'league_registration'
  and exists (
    select 1
    from public.league_registrations r
    where r.id = target_id
      and public.app_is_league_owner(r.league_id)
  )
);
