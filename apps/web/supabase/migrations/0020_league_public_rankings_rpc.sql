-- League public rankings RPC
-- Date: 2026-05-11

create or replace function public.app_public_league_rankings(
  p_state text default null,
  p_city text default null,
  p_league_id uuid default null,
  p_season_id uuid default null
)
returns table(
  league_player_id uuid,
  league_id uuid,
  league_name text,
  season_id uuid,
  season_name text,
  class_id uuid,
  category_name text,
  class_name text,
  display_name text,
  user_id uuid,
  city text,
  state text,
  matches_played integer,
  wins integer,
  losses integer,
  sets_for integer,
  sets_against integer,
  games_for integer,
  games_against integer,
  ranking_points integer,
  wo_against integer,
  "position" integer
)
language sql
security definer
set search_path = public
stable
as $$
  with base as (
    select
      lp.id as league_player_id,
      l.id as league_id,
      l.name as league_name,
      s.id as season_id,
      s.name as season_name,
      lc.id as class_id,
      lc.category_name,
      lc.class_name,
      lp.display_name,
      lp.user_id,
      coalesce(p.city, '') as city,
      coalesce(p.state, '') as state,
      lp.matches_played,
      lp.wins,
      lp.losses,
      lp.sets_for,
      lp.sets_against,
      lp.games_for,
      lp.games_against,
      lp.ranking_points,
      lp.wo_against
    from public.league_players lp
    join public.leagues l on l.id = lp.league_id
    join public.league_seasons s on s.id = lp.season_id
    left join public.league_classes lc on lc.id = lp.class_id
    left join public.profiles p on p.user_id = lp.user_id
    where lp.status <> 'inactive'
      and public.app_can_read_league(l.id)
      and (p_league_id is null or l.id = p_league_id)
      and (p_season_id is null or s.id = p_season_id)
      and (nullif(trim(coalesce(p_state, '')), '') is null or lower(coalesce(p.state, '')) = lower(trim(p_state)))
      and (nullif(trim(coalesce(p_city, '')), '') is null or lower(coalesce(p.city, '')) = lower(trim(p_city)))
  )
  select
    base.*,
    row_number() over (
      partition by base.league_id, base.season_id, base.class_id
      order by
        base.ranking_points desc,
        base.wins desc,
        (base.sets_for - base.sets_against) desc,
        (base.games_for - base.games_against) desc,
        base.matches_played asc,
        base.display_name asc
    )::integer as "position"
  from base
  order by
    ranking_points desc,
    wins desc,
    (sets_for - sets_against) desc,
    (games_for - games_against) desc,
    matches_played asc,
    display_name asc
  limit 200;
$$;

revoke all on function public.app_public_league_rankings(text, text, uuid, uuid) from public;
grant execute on function public.app_public_league_rankings(text, text, uuid, uuid) to authenticated;
