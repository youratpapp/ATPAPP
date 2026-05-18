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
  is_member_price boolean,
  rule_id uuid,
  rule_name text,
  requires_approval boolean
)
language sql
security definer
set search_path = public
stable
as $$
  with rule as (
    select *
    from public.app_matching_place_booking_rule(p_place_id, auth.uid(), p_starts_at, p_ends_at)
    limit 1
  )
  select
    c.id,
    c.place_id,
    c.name,
    c.surface,
    coalesce((select price_cents from rule), c.booking_fee_cents) as booking_fee_cents,
    coalesce((select member_price_cents from rule), c.member_booking_fee_cents) as member_booking_fee_cents,
    public.app_court_booking_price_cents(c.place_id, c.id, auth.uid(), p_starts_at, p_ends_at) as effective_fee_cents,
    public.app_user_has_active_place_membership(c.place_id, auth.uid()) as is_member_price,
    (select id from rule) as rule_id,
    (select name from rule) as rule_name,
    coalesce((select requires_approval from rule), true) as requires_approval
  from public.place_courts c
  where auth.uid() is not null
    and p_ends_at > p_starts_at
    and p_starts_at > now()
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
  v_rule public.place_booking_rules%rowtype;
begin
  if auth.uid() is null then
    raise exception 'nao autorizado';
  end if;

  if p_starts_at <= now() then
    raise exception 'esse horario ja passou';
  end if;

  perform public.app_validate_place_booking_rule(p_place_id, auth.uid(), p_starts_at, p_ends_at);

  select *
    into v_rule
  from public.app_matching_place_booking_rule(p_place_id, auth.uid(), p_starts_at, p_ends_at)
  limit 1;

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
    status,
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
    case when coalesce(v_rule.requires_approval, true) then 'pending' else 'confirmed' end,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning *
    into v_booking;

  v_amount := public.app_court_booking_price_cents(p_place_id, p_court_id, auth.uid(), p_starts_at, p_ends_at);

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
    jsonb_build_object(
      'place_id', p_place_id,
      'court_id', p_court_id,
      'rule_id', v_rule.id,
      'rule_name', v_rule.name,
      'source', 'court_booking_checkout_pending'
    ),
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

  if p_starts_at <= now() then
    raise exception 'esse horario ja passou';
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

revoke all on function public.app_search_available_courts(uuid, timestamptz, timestamptz) from public;
grant execute on function public.app_search_available_courts(uuid, timestamptz, timestamptz) to authenticated;

revoke all on function public.app_create_court_booking(uuid, uuid, timestamptz, timestamptz, text, text, text) from public;
grant execute on function public.app_create_court_booking(uuid, uuid, timestamptz, timestamptz, text, text, text) to authenticated;

revoke all on function public.app_join_court_booking_waitlist(uuid, uuid, timestamptz, timestamptz, text, text, text) from public;
grant execute on function public.app_join_court_booking_waitlist(uuid, uuid, timestamptz, timestamptz, text, text, text) to authenticated;
