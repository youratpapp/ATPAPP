-- Court booking waitlist v1
-- Date: 2026-05-11

create table if not exists public.court_booking_waitlist (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  court_id uuid not null references public.place_courts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  phone text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'waiting' check (status in ('waiting', 'invited', 'cancelled', 'booked')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_court_booking_waitlist_place_time
  on public.court_booking_waitlist(place_id, starts_at, status);
create index if not exists idx_court_booking_waitlist_user
  on public.court_booking_waitlist(user_id, created_at desc);

drop trigger if exists court_booking_waitlist_set_updated_at on public.court_booking_waitlist;
create trigger court_booking_waitlist_set_updated_at
  before update on public.court_booking_waitlist
  for each row execute function public.tg_set_updated_at();

alter table public.court_booking_waitlist enable row level security;

drop policy if exists court_booking_waitlist_self_or_manager_read on public.court_booking_waitlist;
create policy court_booking_waitlist_self_or_manager_read
on public.court_booking_waitlist
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place(place_id));

drop policy if exists court_booking_waitlist_self_insert on public.court_booking_waitlist;
create policy court_booking_waitlist_self_insert
on public.court_booking_waitlist
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists court_booking_waitlist_self_or_manager_update on public.court_booking_waitlist;
create policy court_booking_waitlist_self_or_manager_update
on public.court_booking_waitlist
for update
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place(place_id))
with check (user_id = auth.uid() or public.app_can_manage_place(place_id));

create or replace function public.app_join_court_booking_waitlist(
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

  return query
  insert into public.court_booking_waitlist (
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
    court_booking_waitlist.id,
    court_booking_waitlist.place_id,
    court_booking_waitlist.court_id,
    court_booking_waitlist.user_id,
    court_booking_waitlist.player_name,
    court_booking_waitlist.phone,
    court_booking_waitlist.starts_at,
    court_booking_waitlist.ends_at,
    court_booking_waitlist.status,
    court_booking_waitlist.notes,
    court_booking_waitlist.created_at,
    court_booking_waitlist.updated_at;
end;
$$;

revoke all on function public.app_join_court_booking_waitlist(uuid, uuid, timestamptz, timestamptz, text, text, text) from public;
grant execute on function public.app_join_court_booking_waitlist(uuid, uuid, timestamptz, timestamptz, text, text, text) to authenticated;
