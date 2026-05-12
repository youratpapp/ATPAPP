-- Open matches / find partners v1
-- Date: 2026-05-11

create extension if not exists pgcrypto;

create table if not exists public.open_matches (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid references public.places(id) on delete set null,
  city text,
  state text,
  starts_at timestamptz,
  level text,
  notes text,
  status text not null default 'open' check (status in ('open', 'closed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_open_matches_status_time on public.open_matches(status, starts_at, created_at desc);
create index if not exists idx_open_matches_place on public.open_matches(place_id, status);
create index if not exists idx_open_matches_location on public.open_matches(state, city, status);

drop trigger if exists open_matches_set_updated_at on public.open_matches;
create trigger open_matches_set_updated_at
  before update on public.open_matches
  for each row execute function public.tg_set_updated_at();

alter table public.open_matches enable row level security;

drop policy if exists open_matches_read on public.open_matches;
create policy open_matches_read
on public.open_matches
for select
to authenticated
using (true);

drop policy if exists open_matches_self_insert on public.open_matches;
create policy open_matches_self_insert
on public.open_matches
for insert
to authenticated
with check (creator_id = auth.uid());

drop policy if exists open_matches_creator_update on public.open_matches;
create policy open_matches_creator_update
on public.open_matches
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create table if not exists public.open_match_participants (
  open_match_id uuid not null references public.open_matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  phone text,
  status text not null default 'joined' check (status in ('joined', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (open_match_id, user_id)
);

create index if not exists idx_open_match_participants_user on public.open_match_participants(user_id, created_at desc);

drop trigger if exists open_match_participants_set_updated_at on public.open_match_participants;
create trigger open_match_participants_set_updated_at
  before update on public.open_match_participants
  for each row execute function public.tg_set_updated_at();

alter table public.open_match_participants enable row level security;

drop policy if exists open_match_participants_read on public.open_match_participants;
create policy open_match_participants_read
on public.open_match_participants
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.open_matches om
    where om.id = open_match_id
      and om.creator_id = auth.uid()
  )
);

drop policy if exists open_match_participants_self_insert on public.open_match_participants;
create policy open_match_participants_self_insert
on public.open_match_participants
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.open_matches om
    where om.id = open_match_id
      and om.status = 'open'
  )
);

drop policy if exists open_match_participants_self_update on public.open_match_participants;
create policy open_match_participants_self_update
on public.open_match_participants
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
