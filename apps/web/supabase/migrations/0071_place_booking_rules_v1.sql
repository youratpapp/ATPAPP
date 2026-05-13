-- Professional booking rules for courts.
-- Date: 2026-05-13

create table if not exists public.place_booking_rules (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  name text not null,
  profile_scope text not null default 'all'
    check (profile_scope in ('all', 'public', 'member')),
  weekdays integer[] not null default array[0, 1, 2, 3, 4, 5, 6],
  starts_at time not null default time '06:00',
  ends_at time not null default time '23:00',
  price_cents integer check (price_cents is null or price_cents >= 0),
  member_price_cents integer check (member_price_cents is null or member_price_cents >= 0),
  min_minutes integer not null default 60 check (min_minutes > 0),
  max_minutes integer not null default 120 check (max_minutes > 0),
  advance_days integer not null default 14 check (advance_days >= 0),
  requires_approval boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (max_minutes >= min_minutes)
);

create index if not exists idx_place_booking_rules_place_active
  on public.place_booking_rules(place_id, is_active, profile_scope);

drop trigger if exists place_booking_rules_set_updated_at on public.place_booking_rules;
create trigger place_booking_rules_set_updated_at
  before update on public.place_booking_rules
  for each row execute function public.tg_set_updated_at();

alter table public.place_booking_rules enable row level security;

drop policy if exists place_booking_rules_manager_read on public.place_booking_rules;
create policy place_booking_rules_manager_read
on public.place_booking_rules
for select
to authenticated
using (public.app_can_manage_place(place_id));

drop policy if exists place_booking_rules_manager_write on public.place_booking_rules;
create policy place_booking_rules_manager_write
on public.place_booking_rules
for all
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

create or replace function public.app_place_booking_profile(
  p_place_id uuid,
  p_user_id uuid
)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select case
    when public.app_user_has_active_place_membership(p_place_id, p_user_id) then 'member'
    else 'public'
  end;
$$;

create or replace function public.app_matching_place_booking_rule(
  p_place_id uuid,
  p_user_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns setof public.place_booking_rules
language sql
security definer
set search_path = public
stable
as $$
  with input as (
    select
      public.app_place_booking_profile(p_place_id, p_user_id) as booking_profile,
      extract(dow from p_starts_at)::integer as booking_weekday
  )
  select r.*
  from public.place_booking_rules r, input i
  where r.place_id = p_place_id
    and r.is_active = true
    and r.profile_scope in ('all', i.booking_profile)
    and i.booking_weekday = any(r.weekdays)
    and p_starts_at::time >= r.starts_at
    and p_ends_at::time <= r.ends_at
  order by
    case when r.profile_scope = i.booking_profile then 0 else 1 end,
    r.starts_at desc,
    r.created_at asc
  limit 1;
$$;

create or replace function public.app_court_booking_price_cents(
  p_place_id uuid,
  p_court_id uuid,
  p_user_id uuid,
  p_starts_at timestamptz default null,
  p_ends_at timestamptz default null
)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  with rule as (
    select *
    from public.app_matching_place_booking_rule(
      p_place_id,
      p_user_id,
      coalesce(p_starts_at, now()),
      coalesce(p_ends_at, now() + interval '1 hour')
    )
    limit 1
  )
  select greatest(
    0,
    case
      when public.app_user_has_active_place_membership(p_place_id, p_user_id)
        then coalesce((select member_price_cents from rule), c.member_booking_fee_cents, (select price_cents from rule), c.booking_fee_cents)
      else coalesce((select price_cents from rule), c.booking_fee_cents)
    end
  )::integer
  from public.place_courts c
  where c.id = p_court_id
    and c.place_id = p_place_id;
$$;

create or replace function public.app_validate_place_booking_rule(
  p_place_id uuid,
  p_user_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rule public.place_booking_rules%rowtype;
  v_duration integer;
begin
  if p_ends_at <= p_starts_at then
    raise exception 'horario invalido';
  end if;

  select *
    into v_rule
  from public.app_matching_place_booking_rule(p_place_id, p_user_id, p_starts_at, p_ends_at)
  limit 1;

  if v_rule.id is null then
    return;
  end if;

  v_duration := floor(extract(epoch from (p_ends_at - p_starts_at)) / 60)::integer;

  if v_duration < v_rule.min_minutes then
    raise exception 'duracao minima para este horario: % minutos', v_rule.min_minutes;
  end if;

  if v_duration > v_rule.max_minutes then
    raise exception 'duracao maxima para este horario: % minutos', v_rule.max_minutes;
  end if;

  if p_starts_at > now() + make_interval(days => v_rule.advance_days) then
    raise exception 'antecedencia maxima para este horario: % dias', v_rule.advance_days;
  end if;
end;
$$;

-- The v0061 version returned fewer OUT columns; PostgreSQL cannot change a
-- table-returning function shape with CREATE OR REPLACE.
drop function if exists public.app_search_available_courts(uuid, timestamptz, timestamptz);

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

revoke all on function public.app_place_booking_profile(uuid, uuid) from public;
grant execute on function public.app_place_booking_profile(uuid, uuid) to authenticated;

revoke all on function public.app_matching_place_booking_rule(uuid, uuid, timestamptz, timestamptz) from public;
grant execute on function public.app_matching_place_booking_rule(uuid, uuid, timestamptz, timestamptz) to authenticated;

revoke all on function public.app_validate_place_booking_rule(uuid, uuid, timestamptz, timestamptz) from public;
grant execute on function public.app_validate_place_booking_rule(uuid, uuid, timestamptz, timestamptz) to authenticated;

revoke all on function public.app_search_available_courts(uuid, timestamptz, timestamptz) from public;
grant execute on function public.app_search_available_courts(uuid, timestamptz, timestamptz) to authenticated;

revoke all on function public.app_create_court_booking(uuid, uuid, timestamptz, timestamptz, text, text, text) from public;
grant execute on function public.app_create_court_booking(uuid, uuid, timestamptz, timestamptz, text, text, text) to authenticated;

notify pgrst, 'reload schema';
