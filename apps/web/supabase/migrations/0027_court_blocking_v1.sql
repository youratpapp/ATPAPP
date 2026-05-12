-- Court blocking v1
-- Date: 2026-05-11

alter table public.court_bookings
  drop constraint if exists court_bookings_status_check;

alter table public.court_bookings
  add constraint court_bookings_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'blocked'));

create or replace function public.app_create_court_block(
  p_place_id uuid,
  p_court_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
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
  if p_ends_at <= p_starts_at then
    raise exception 'horario invalido';
  end if;

  if not public.app_can_manage_place(p_place_id) then
    raise exception 'nao autorizado';
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
    raise exception 'horario indisponivel';
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
    status,
    notes
  )
  values (
    p_place_id,
    p_court_id,
    auth.uid(),
    'Bloqueio',
    '',
    p_starts_at,
    p_ends_at,
    'blocked',
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

revoke all on function public.app_create_court_block(uuid, uuid, timestamptz, timestamptz, text) from public;
grant execute on function public.app_create_court_block(uuid, uuid, timestamptz, timestamptz, text) to authenticated;
