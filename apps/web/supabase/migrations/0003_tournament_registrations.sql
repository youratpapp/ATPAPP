-- Tournament registrations table for player-first flow
-- Date: 2026-05-06

create table if not exists public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id text,
  class_id text,
  category_name text,
  class_name text,
  player_name text not null,
  phone text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tournament_registrations_tournament
  on public.tournament_registrations (tournament_id, created_at desc);

create index if not exists idx_tournament_registrations_user
  on public.tournament_registrations (user_id, created_at desc);

create index if not exists idx_tournament_registrations_status
  on public.tournament_registrations (tournament_id, status);

alter table if exists public.tournament_registrations
  drop constraint if exists tournament_registrations_status_check;

alter table if exists public.tournament_registrations
  add constraint tournament_registrations_status_check
  check (status in ('pending', 'approved', 'rejected'));

alter table if exists public.tournament_registrations enable row level security;

drop policy if exists tournament_registrations_self_read on public.tournament_registrations;
create policy tournament_registrations_self_read
on public.tournament_registrations
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists tournament_registrations_owner_read on public.tournament_registrations;
create policy tournament_registrations_owner_read
on public.tournament_registrations
for select
to authenticated
using (public.app_is_tournament_owner(tournament_id));

drop policy if exists tournament_registrations_self_insert on public.tournament_registrations;
create policy tournament_registrations_self_insert
on public.tournament_registrations
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists tournament_registrations_owner_update on public.tournament_registrations;
create policy tournament_registrations_owner_update
on public.tournament_registrations
for update
to authenticated
using (public.app_is_tournament_owner(tournament_id))
with check (public.app_is_tournament_owner(tournament_id));

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tournament_registrations_set_updated_at on public.tournament_registrations;
create trigger tournament_registrations_set_updated_at
before update on public.tournament_registrations
for each row execute function public.tg_set_updated_at();
