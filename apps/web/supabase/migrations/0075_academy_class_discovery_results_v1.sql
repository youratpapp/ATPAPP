-- Direct academy class discovery results for player-facing lesson search.
-- Date: 2026-05-13

create or replace function public.app_normalize_discovery_text(p_value text)
returns text
language sql
immutable
as $$
  select lower(translate(
    coalesce(p_value, ''),
    'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
    'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'
  ));
$$;

drop function if exists public.app_search_academy_classes_for_discovery(text, text, text, integer, text, text, text, text);

create or replace function public.app_search_academy_classes_for_discovery(
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
  id uuid,
  place_id uuid,
  place_name text,
  place_city text,
  place_state text,
  coach_id uuid,
  court_id uuid,
  title text,
  coach_name text,
  weekday integer,
  starts_at time,
  ends_at time,
  level text,
  gender_scope text,
  age_group text,
  min_age integer,
  max_age integer,
  allow_makeup boolean,
  capacity integer,
  occupied_spots integer,
  available_spots integer,
  monthly_fee_cents integer,
  is_active boolean
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
      case
        when public.app_normalize_discovery_text(trim(coalesce(p_level, ''))) in ('iniciante', 'inicio', 'beginner', 'basico', 'c', 'classe c', '3a classe', 'terceira classe') then 'iniciante'
        when public.app_normalize_discovery_text(trim(coalesce(p_level, ''))) in ('intermediario', 'intermediaria', 'medio', 'b', 'classe b', '2a classe', 'segunda classe') then 'intermediario'
        when public.app_normalize_discovery_text(trim(coalesce(p_level, ''))) in ('avancado', 'avancada', 'advanced', 'a', 'classe a') then 'avancado'
        when public.app_normalize_discovery_text(trim(coalesce(p_level, ''))) in ('primeira classe', '1a classe', '1 classe', 'primeira', 'especial', 'open') then 'primeira classe'
        when public.app_normalize_discovery_text(trim(coalesce(p_level, ''))) in ('profissional', 'pro', 'atp', 'itf', 'professional') then 'profissional'
        else nullif(public.app_normalize_discovery_text(trim(coalesce(p_level, ''))), '')
      end as level_filter,
      case when p_age_group in ('kids', 'adult') then p_age_group else null end as age_group_filter,
      case when p_gender_scope in ('male', 'female', 'mixed') then p_gender_scope else null end as gender_scope_filter
  ),
  class_rows as (
    select
      p.id as place_id,
      p.name as place_name,
      p.city as place_city,
      p.state as place_state,
      c.id,
      c.coach_id,
      c.court_id,
      c.title,
      c.coach_name,
      c.weekday,
      c.starts_at,
      c.ends_at,
      c.level,
      c.gender_scope,
      c.age_group,
      c.min_age,
      c.max_age,
      c.allow_makeup,
      c.capacity,
      c.monthly_fee_cents,
      c.is_active,
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
      and (
        n.level_filter is null
        or public.app_normalize_discovery_text(coalesce(c.level, '')) like '%' || n.level_filter || '%'
        or public.app_normalize_discovery_text(c.title) like '%' || n.level_filter || '%'
      )
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
    group by
      p.id,
      p.name,
      p.city,
      p.state,
      c.id,
      c.coach_id,
      c.court_id,
      c.title,
      c.coach_name,
      c.weekday,
      c.starts_at,
      c.ends_at,
      c.level,
      c.gender_scope,
      c.age_group,
      c.min_age,
      c.max_age,
      c.allow_makeup,
      c.capacity,
      c.monthly_fee_cents,
      c.is_active
  )
  select
    cr.id,
    cr.place_id,
    cr.place_name,
    cr.place_city,
    cr.place_state,
    cr.coach_id,
    cr.court_id,
    cr.title,
    cr.coach_name,
    cr.weekday,
    cr.starts_at,
    cr.ends_at,
    cr.level,
    cr.gender_scope,
    cr.age_group,
    cr.min_age,
    cr.max_age,
    cr.allow_makeup,
    cr.capacity,
    cr.occupied_spots,
    greatest(0, cr.capacity - cr.occupied_spots)::integer as available_spots,
    cr.monthly_fee_cents,
    cr.is_active
  from class_rows cr
  where greatest(0, cr.capacity - cr.occupied_spots) > 0
  order by cr.weekday asc, cr.starts_at asc, cr.place_name asc, cr.title asc;
$$;

revoke all on function public.app_search_academy_classes_for_discovery(text, text, text, integer, text, text, text, text) from public;
grant execute on function public.app_search_academy_classes_for_discovery(text, text, text, integer, text, text, text, text) to authenticated;

notify pgrst, 'reload schema';
