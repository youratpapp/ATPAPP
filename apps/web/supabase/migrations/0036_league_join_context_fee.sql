-- League join context fee
-- Date: 2026-05-11

drop function if exists public.app_get_league_join_context(text);

create or replace function public.app_get_league_join_context(p_token text)
returns table(
  league_id uuid,
  league_name text,
  league_type text,
  visibility text,
  public_join_enabled boolean,
  join_requires_approval boolean,
  season_id uuid,
  season_name text,
  class_id uuid,
  category_name text,
  class_name text,
  registration_fee_cents integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    l.id as league_id,
    l.name as league_name,
    l.league_type,
    l.visibility,
    l.public_join_enabled,
    l.join_requires_approval,
    s.id as season_id,
    s.name as season_name,
    c.id as class_id,
    c.category_name,
    c.class_name,
    coalesce(l.registration_fee_cents, 0) as registration_fee_cents
  from public.league_join_links jl
  join public.leagues l on l.id = jl.league_id
  left join public.league_seasons s on s.id = jl.season_id
  left join public.league_classes c on c.id = jl.class_id
  where jl.token = p_token
    and jl.active = true
    and (jl.expires_at is null or jl.expires_at > now())
    and (jl.max_uses is null or jl.used_count < jl.max_uses)
  limit 1;
$$;

grant execute on function public.app_get_league_join_context(text) to authenticated;
