-- Court waitlist promote to booking v1
-- Date: 2026-05-11

create or replace function public.app_promote_court_booking_waitlist(
  p_waitlist_id uuid
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
#variable_conflict use_column
declare
  v_wait public.court_booking_waitlist%rowtype;
begin
  select *
    into v_wait
  from public.court_booking_waitlist w
  where w.id = p_waitlist_id;

  if v_wait.id is null then
    raise exception 'entrada da espera nao encontrada';
  end if;

  if not public.app_can_manage_place(v_wait.place_id) then
    raise exception 'nao autorizado';
  end if;

  if v_wait.status not in ('waiting', 'invited') then
    raise exception 'entrada da espera nao pode virar reserva';
  end if;

  if exists (
    select 1
    from public.court_bookings b
    where b.court_id = v_wait.court_id
      and b.status <> 'cancelled'
      and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(v_wait.starts_at, v_wait.ends_at, '[)')
  ) then
    raise exception 'horario ja reservado';
  end if;

  update public.court_booking_waitlist
    set status = 'booked'
  where court_booking_waitlist.id = v_wait.id;

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
    v_wait.place_id,
    v_wait.court_id,
    v_wait.user_id,
    v_wait.player_name,
    v_wait.phone,
    v_wait.starts_at,
    v_wait.ends_at,
    'confirmed',
    v_wait.notes
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

revoke all on function public.app_promote_court_booking_waitlist(uuid) from public;
grant execute on function public.app_promote_court_booking_waitlist(uuid) to authenticated;
