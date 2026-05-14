-- Search helpers for task-first place discovery.
-- Date: 2026-05-13

drop function if exists public.app_search_places_with_available_courts(text, text, text, timestamptz, timestamptz);

create or replace function public.app_search_places_with_available_courts(
  p_city text,
  p_state text,
  p_query text,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns table(
  place_id uuid,
  available_courts integer,
  min_effective_fee_cents integer,
  requires_approval boolean
)
language sql
security definer
set search_path = public
stable
as $$
  with normalized as (
    select
      nullif(trim(coalesce(p_city, '')), '') as city_filter,
      nullif(upper(trim(coalesce(p_state, ''))), '') as state_filter,
      nullif(trim(coalesce(p_query, '')), '') as query_filter
  ),
  matched_courts as (
    select
      p.id as place_id,
      c.id as court_id,
      public.app_court_booking_price_cents(p.id, c.id, auth.uid(), p_starts_at, p_ends_at) as effective_fee_cents,
      coalesce((
        select r.requires_approval
        from public.app_matching_place_booking_rule(p.id, auth.uid(), p_starts_at, p_ends_at) r
        limit 1
      ), true) as requires_approval
    from public.places p
    join public.place_courts c
      on c.place_id = p.id
     and c.is_active = true
    cross join normalized n
    where auth.uid() is not null
      and p_ends_at > p_starts_at
      and (n.city_filter is null or p.city ilike n.city_filter)
      and (n.state_filter is null or upper(coalesce(p.state, '')) = n.state_filter)
      and (
        n.query_filter is null
        or p.name ilike '%' || n.query_filter || '%'
        or coalesce(p.description, '') ilike '%' || n.query_filter || '%'
      )
      and not exists (
        select 1
        from public.court_bookings b
        where b.court_id = c.id
          and b.status <> 'cancelled'
          and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
      )
      and not public.app_court_has_academy_conflict(p.id, c.id, p_starts_at, p_ends_at)
  )
  select
    mc.place_id,
    count(mc.court_id)::integer as available_courts,
    coalesce(min(mc.effective_fee_cents), 0)::integer as min_effective_fee_cents,
    bool_or(mc.requires_approval) as requires_approval
  from matched_courts mc
  group by mc.place_id
  having count(mc.court_id) > 0
  order by count(mc.court_id) desc, coalesce(min(mc.effective_fee_cents), 0) asc;
$$;

drop function if exists public.app_search_places_with_academy_classes(text, text, text, integer, text, text, text, text);

create or replace function public.app_search_places_with_academy_classes(
  p_city text,
  p_state text,
  p_query text,
  p_weekday integer,
  p_period text,
  p_level text,
  p_age_group text,
  p_gender_scope text
)
returns table(
  place_id uuid,
  matching_classes integer,
  available_spots integer,
  min_monthly_fee_cents integer
)
language sql
security definer
set search_path = public
stable
as $$
  with normalized as (
    select
      nullif(trim(coalesce(p_city, '')), '') as city_filter,
      nullif(upper(trim(coalesce(p_state, ''))), '') as state_filter,
      nullif(trim(coalesce(p_query, '')), '') as query_filter,
      case when p_weekday between 0 and 6 then p_weekday else null end as weekday_filter,
      case when p_period in ('morning', 'afternoon', 'night') then p_period else null end as period_filter,
      nullif(trim(coalesce(p_level, '')), '') as level_filter,
      case when p_age_group in ('kids', 'adult') then p_age_group else null end as age_group_filter,
      case when p_gender_scope in ('male', 'female', 'mixed') then p_gender_scope else null end as gender_scope_filter
  ),
  class_rows as (
    select
      p.id as place_id,
      c.id as class_id,
      c.capacity,
      c.monthly_fee_cents,
      count(e.id)::integer as occupied_spots
    from public.places p
    join public.place_academy_classes c
      on c.place_id = p.id
     and c.is_active = true
    left join public.place_academy_enrollments e
      on e.class_id = c.id
     and e.status in ('pending', 'active')
    cross join normalized n
    where auth.uid() is not null
      and (n.city_filter is null or p.city ilike n.city_filter)
      and (n.state_filter is null or upper(coalesce(p.state, '')) = n.state_filter)
      and (n.weekday_filter is null or c.weekday = n.weekday_filter)
      and (
        n.period_filter is null
        or (n.period_filter = 'morning' and c.starts_at < time '12:00')
        or (n.period_filter = 'afternoon' and c.starts_at >= time '12:00' and c.starts_at < time '18:00')
        or (n.period_filter = 'night' and c.starts_at >= time '18:00')
      )
      and (n.level_filter is null or coalesce(c.level, '') ilike '%' || n.level_filter || '%')
      and (n.age_group_filter is null or c.age_group = n.age_group_filter)
      and (n.gender_scope_filter is null or c.gender_scope in ('mixed', n.gender_scope_filter))
      and (
        n.query_filter is null
        or p.name ilike '%' || n.query_filter || '%'
        or coalesce(p.description, '') ilike '%' || n.query_filter || '%'
        or c.title ilike '%' || n.query_filter || '%'
        or coalesce(c.coach_name, '') ilike '%' || n.query_filter || '%'
        or coalesce(c.level, '') ilike '%' || n.query_filter || '%'
      )
    group by p.id, c.id, c.capacity, c.monthly_fee_cents
  ),
  open_class_rows as (
    select
      cr.place_id,
      cr.class_id,
      greatest(0, cr.capacity - cr.occupied_spots)::integer as available_spots,
      cr.monthly_fee_cents
    from class_rows cr
    where greatest(0, cr.capacity - cr.occupied_spots) > 0
  )
  select
    ocr.place_id,
    count(ocr.class_id)::integer as matching_classes,
    sum(ocr.available_spots)::integer as available_spots,
    coalesce(min(ocr.monthly_fee_cents), 0)::integer as min_monthly_fee_cents
  from open_class_rows ocr
  group by ocr.place_id
  having count(ocr.class_id) > 0
  order by sum(ocr.available_spots) desc, coalesce(min(ocr.monthly_fee_cents), 0) asc;
$$;

drop function if exists public.app_public_academy_class_spots(uuid);

create or replace function public.app_public_academy_class_spots(
  p_place_id uuid
)
returns table(
  class_id uuid,
  occupied_spots integer,
  available_spots integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id as class_id,
    count(e.id)::integer as occupied_spots,
    greatest(0, c.capacity - count(e.id))::integer as available_spots
  from public.place_academy_classes c
  left join public.place_academy_enrollments e
    on e.class_id = c.id
   and e.status in ('pending', 'active')
  where auth.uid() is not null
    and c.place_id = p_place_id
    and c.is_active = true
  group by c.id, c.capacity
  order by c.weekday asc, c.starts_at asc, c.title asc;
$$;

revoke all on function public.app_search_places_with_available_courts(text, text, text, timestamptz, timestamptz) from public;
grant execute on function public.app_search_places_with_available_courts(text, text, text, timestamptz, timestamptz) to authenticated;

revoke all on function public.app_search_places_with_academy_classes(text, text, text, integer, text, text, text, text) from public;
grant execute on function public.app_search_places_with_academy_classes(text, text, text, integer, text, text, text, text) to authenticated;

revoke all on function public.app_public_academy_class_spots(uuid) from public;
grant execute on function public.app_public_academy_class_spots(uuid) to authenticated;

notify pgrst, 'reload schema';
