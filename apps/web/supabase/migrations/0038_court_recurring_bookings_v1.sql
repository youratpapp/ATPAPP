-- Court recurring bookings v1
-- Date: 2026-05-11

alter table public.court_bookings
  add column if not exists recurrence_group_id uuid,
  add column if not exists recurrence_index integer,
  add column if not exists recurrence_total integer;

create index if not exists idx_court_bookings_recurrence
  on public.court_bookings(recurrence_group_id)
  where recurrence_group_id is not null;

create or replace function public.app_create_recurring_court_bookings(
  p_place_id uuid,
  p_court_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_weeks integer,
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
declare
  v_weeks integer;
  v_group_id uuid;
  v_idx integer;
  v_starts timestamptz;
  v_ends timestamptz;
begin
  if auth.uid() is null then
    raise exception 'nao autorizado';
  end if;

  if p_ends_at <= p_starts_at then
    raise exception 'horario invalido';
  end if;

  v_weeks := least(26, greatest(1, coalesce(p_weeks, 1)));

  if not exists (
    select 1
    from public.place_courts c
    where c.id = p_court_id
      and c.place_id = p_place_id
      and c.is_active = true
  ) then
    raise exception 'quadra indisponivel';
  end if;

  for v_idx in 0..(v_weeks - 1) loop
    v_starts := p_starts_at + make_interval(weeks => v_idx);
    v_ends := p_ends_at + make_interval(weeks => v_idx);

    if exists (
      select 1
      from public.court_bookings b
      where b.court_id = p_court_id
        and b.status <> 'cancelled'
        and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(v_starts, v_ends, '[)')
    ) then
      raise exception 'horario recorrente ja reservado em %', v_starts;
    end if;
  end loop;

  v_group_id := gen_random_uuid();

  return query
  with series as (
    select
      gs as idx,
      p_starts_at + make_interval(weeks => gs) as starts_at,
      p_ends_at + make_interval(weeks => gs) as ends_at
    from generate_series(0, v_weeks - 1) gs
  )
  insert into public.court_bookings (
    place_id,
    court_id,
    user_id,
    player_name,
    phone,
    starts_at,
    ends_at,
    notes,
    recurrence_group_id,
    recurrence_index,
    recurrence_total
  )
  select
    p_place_id,
    p_court_id,
    auth.uid(),
    trim(p_player_name),
    nullif(trim(coalesce(p_phone, '')), ''),
    series.starts_at,
    series.ends_at,
    nullif(trim(coalesce(p_notes, '')), ''),
    v_group_id,
    series.idx + 1,
    v_weeks
  from series
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

revoke all on function public.app_create_recurring_court_bookings(uuid, uuid, timestamptz, timestamptz, integer, text, text, text) from public;
grant execute on function public.app_create_recurring_court_bookings(uuid, uuid, timestamptz, timestamptz, integer, text, text, text) to authenticated;
