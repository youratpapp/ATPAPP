-- Court member pricing and availability v1
-- Date: 2026-05-12

alter table public.place_courts
  add column if not exists member_booking_fee_cents integer
  check (member_booking_fee_cents is null or member_booking_fee_cents >= 0);

create or replace function public.app_user_has_active_place_membership(
  p_place_id uuid,
  p_user_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.place_memberships m
    where m.place_id = p_place_id
      and m.user_id = p_user_id
      and m.status = 'active'
      and (m.starts_on is null or m.starts_on <= current_date)
      and (m.ends_on is null or m.ends_on >= current_date)
  );
$$;

create or replace function public.app_court_booking_price_cents(
  p_place_id uuid,
  p_court_id uuid,
  p_user_id uuid
)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select greatest(
    0,
    case
      when public.app_user_has_active_place_membership(p_place_id, p_user_id)
        then coalesce(c.member_booking_fee_cents, c.booking_fee_cents)
      else c.booking_fee_cents
    end
  )::integer
  from public.place_courts c
  where c.id = p_court_id
    and c.place_id = p_place_id;
$$;

create or replace function public.app_court_has_academy_conflict(
  p_place_id uuid,
  p_court_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.place_academy_classes c
    where c.place_id = p_place_id
      and c.court_id = p_court_id
      and c.is_active = true
      and c.weekday = extract(dow from p_starts_at)::integer
      and (p_starts_at::time < c.ends_at and p_ends_at::time > c.starts_at)
  ) or exists (
    select 1
    from public.place_academy_slots s
    where s.place_id = p_place_id
      and s.court_id = p_court_id
      and s.status in ('open', 'assigned')
      and s.weekday = extract(dow from p_starts_at)::integer
      and (p_starts_at::time < s.ends_at and p_ends_at::time > s.starts_at)
  );
$$;

create or replace function public.app_search_available_courts(
  p_place_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns table(
  court_id uuid,
  place_id uuid,
  name text,
  surface text,
  booking_fee_cents integer,
  member_booking_fee_cents integer,
  effective_fee_cents integer,
  is_member_price boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id,
    c.place_id,
    c.name,
    c.surface,
    c.booking_fee_cents,
    c.member_booking_fee_cents,
    public.app_court_booking_price_cents(c.place_id, c.id, auth.uid()) as effective_fee_cents,
    public.app_user_has_active_place_membership(c.place_id, auth.uid()) as is_member_price
  from public.place_courts c
  where auth.uid() is not null
    and p_ends_at > p_starts_at
    and c.place_id = p_place_id
    and c.is_active = true
    and not exists (
      select 1
      from public.court_bookings b
      where b.court_id = c.id
        and b.status <> 'cancelled'
        and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
    )
    and not public.app_court_has_academy_conflict(c.place_id, c.id, p_starts_at, p_ends_at)
  order by c.name asc;
$$;

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
#variable_conflict use_column
declare
  v_booking public.court_bookings%rowtype;
  v_amount integer;
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

  if public.app_court_has_academy_conflict(p_place_id, p_court_id, p_starts_at, p_ends_at) then
    raise exception 'quadra alocada para academia neste horario';
  end if;

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
  returning *
    into v_booking;

  v_amount := public.app_court_booking_price_cents(p_place_id, p_court_id, auth.uid());

  insert into public.app_payments (
    user_id,
    target_type,
    target_id,
    amount_cents,
    currency,
    status,
    provider,
    description,
    metadata,
    billing_period
  )
  values (
    auth.uid(),
    'court_booking',
    v_booking.id,
    greatest(0, coalesce(v_amount, 0)),
    'BRL',
    'pending',
    'platform',
    'Reserva de quadra',
    jsonb_build_object('place_id', p_place_id, 'court_id', p_court_id, 'source', 'court_booking_checkout_pending'),
    ''
  )
  on conflict (target_type, target_id, user_id, billing_period)
  do update set
    amount_cents = excluded.amount_cents,
    currency = excluded.currency,
    status = case when app_payments.status = 'paid' then 'paid' else 'pending' end,
    provider = excluded.provider,
    description = excluded.description,
    metadata = excluded.metadata,
    updated_at = now();

  return query
  select
    v_booking.id,
    v_booking.place_id,
    v_booking.court_id,
    v_booking.user_id,
    v_booking.player_name,
    v_booking.phone,
    v_booking.starts_at,
    v_booking.ends_at,
    v_booking.status,
    v_booking.notes,
    v_booking.created_at,
    v_booking.updated_at;
end;
$$;

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

    if public.app_court_has_academy_conflict(p_place_id, p_court_id, v_starts, v_ends) then
      raise exception 'quadra alocada para academia em %', v_starts;
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

create or replace function public.app_validate_academy_against_court_bookings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.court_id is null then
    return new;
  end if;

  if (tg_table_name = 'place_academy_classes' and new.is_active = true)
    or (tg_table_name = 'place_academy_slots' and new.status in ('open', 'assigned')) then
    if exists (
      select 1
      from public.court_bookings b
      where b.place_id = new.place_id
        and b.court_id = new.court_id
        and b.status <> 'cancelled'
        and b.ends_at >= now()
        and extract(dow from b.starts_at)::integer = new.weekday
        and (b.starts_at::time < new.ends_at and b.ends_at::time > new.starts_at)
    ) then
      raise exception 'quadra ja possui reserva neste horario';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists place_academy_classes_validate_booking_conflicts
  on public.place_academy_classes;
create trigger place_academy_classes_validate_booking_conflicts
  before insert or update on public.place_academy_classes
  for each row execute function public.app_validate_academy_against_court_bookings();

drop trigger if exists place_academy_slots_validate_booking_conflicts
  on public.place_academy_slots;
create trigger place_academy_slots_validate_booking_conflicts
  before insert or update on public.place_academy_slots
  for each row execute function public.app_validate_academy_against_court_bookings();

revoke all on function public.app_user_has_active_place_membership(uuid, uuid) from public;
grant execute on function public.app_user_has_active_place_membership(uuid, uuid) to authenticated;

revoke all on function public.app_court_booking_price_cents(uuid, uuid, uuid) from public;
grant execute on function public.app_court_booking_price_cents(uuid, uuid, uuid) to authenticated;

revoke all on function public.app_court_has_academy_conflict(uuid, uuid, timestamptz, timestamptz) from public;
grant execute on function public.app_court_has_academy_conflict(uuid, uuid, timestamptz, timestamptz) to authenticated;

revoke all on function public.app_search_available_courts(uuid, timestamptz, timestamptz) from public;
grant execute on function public.app_search_available_courts(uuid, timestamptz, timestamptz) to authenticated;

revoke all on function public.app_create_court_booking(uuid, uuid, timestamptz, timestamptz, text, text, text) from public;
grant execute on function public.app_create_court_booking(uuid, uuid, timestamptz, timestamptz, text, text, text) to authenticated;

revoke all on function public.app_create_recurring_court_bookings(uuid, uuid, timestamptz, timestamptz, integer, text, text, text) from public;
grant execute on function public.app_create_recurring_court_bookings(uuid, uuid, timestamptz, timestamptz, integer, text, text, text) to authenticated;
