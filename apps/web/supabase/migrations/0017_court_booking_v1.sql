-- Court booking v1
-- Date: 2026-05-11

create extension if not exists pgcrypto;

create table if not exists public.place_courts (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  name text not null,
  surface text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_courts_place on public.place_courts(place_id, is_active, name);

drop trigger if exists place_courts_set_updated_at on public.place_courts;
create trigger place_courts_set_updated_at
  before update on public.place_courts
  for each row execute function public.tg_set_updated_at();

alter table public.place_courts enable row level security;

drop policy if exists place_courts_read on public.place_courts;
create policy place_courts_read
on public.place_courts
for select
to authenticated
using (true);

drop policy if exists place_courts_owner_insert on public.place_courts;
create policy place_courts_owner_insert
on public.place_courts
for insert
to authenticated
with check (
  exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists place_courts_owner_update on public.place_courts;
create policy place_courts_owner_update
on public.place_courts
for update
to authenticated
using (
  exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

create table if not exists public.court_bookings (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  court_id uuid not null references public.place_courts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  phone text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_court_bookings_place_time on public.court_bookings(place_id, starts_at);
create index if not exists idx_court_bookings_court_time on public.court_bookings(court_id, starts_at);
create index if not exists idx_court_bookings_user_time on public.court_bookings(user_id, starts_at);

drop trigger if exists court_bookings_set_updated_at on public.court_bookings;
create trigger court_bookings_set_updated_at
  before update on public.court_bookings
  for each row execute function public.tg_set_updated_at();

alter table public.court_bookings enable row level security;

drop policy if exists court_bookings_participant_or_owner_read on public.court_bookings;
create policy court_bookings_participant_or_owner_read
on public.court_bookings
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists court_bookings_participant_or_owner_update on public.court_bookings;
create policy court_bookings_participant_or_owner_update
on public.court_bookings
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

create or replace function public.app_create_court_booking(
  p_place_id uuid,
  p_court_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_player_name text,
  p_phone text default null,
  p_notes text default null
)
returns table(
  id uuid,
  place_id uuid,
  court_id uuid,
  user_id uuid,
  player_name text,
  phone text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'nao autorizado';
  end if;

  if p_ends_at <= p_starts_at then
    raise exception 'horario invalido';
  end if;

  if not exists (
    select 1
    from public.place_courts c
    where c.id = p_court_id
      and c.place_id = p_place_id
      and c.is_active = true
  ) then
    raise exception 'quadra indisponivel';
  end if;

  if exists (
    select 1
    from public.court_bookings b
    where b.court_id = p_court_id
      and b.status <> 'cancelled'
      and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
  ) then
    raise exception 'horario ja reservado';
  end if;

  return query
  insert into public.court_bookings (
    place_id,
    court_id,
    user_id,
    player_name,
    phone,
    starts_at,
    ends_at,
    notes
  )
  values (
    p_place_id,
    p_court_id,
    auth.uid(),
    trim(p_player_name),
    nullif(trim(coalesce(p_phone, '')), ''),
    p_starts_at,
    p_ends_at,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning
    court_bookings.id,
    court_bookings.place_id,
    court_bookings.court_id,
    court_bookings.user_id,
    court_bookings.player_name,
    court_bookings.phone,
    court_bookings.starts_at,
    court_bookings.ends_at,
    court_bookings.status,
    court_bookings.notes,
    court_bookings.created_at,
    court_bookings.updated_at;
end;
$$;

revoke all on function public.app_create_court_booking(uuid, uuid, timestamptz, timestamptz, text, text, text) from public;
grant execute on function public.app_create_court_booking(uuid, uuid, timestamptz, timestamptz, text, text, text) to authenticated;
