-- League ranking snapshot RPC
-- Date: 2026-05-11

create or replace function public.app_create_league_ranking_snapshot(
  p_league_id uuid,
  p_season_id uuid,
  p_class_id uuid default null,
  p_round_id uuid default null
)
returns table(
  id uuid,
  league_id uuid,
  season_id uuid,
  class_id uuid,
  round_id uuid,
  computed_at timestamptz,
  ranking jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ranking jsonb;
begin
  if not public.app_is_league_owner(p_league_id) then
    raise exception 'nao autorizado';
  end if;

  if not exists (
    select 1 from public.league_seasons s
    where s.id = p_season_id
      and s.league_id = p_league_id
  ) then
    raise exception 'temporada invalida';
  end if;

  select coalesce(jsonb_agg(to_jsonb(r) order by r.class_level_order asc, r.position asc), '[]'::jsonb)
  into v_ranking
  from (
    select
      row_number() over (
        partition by lp.class_id
        order by
          lp.ranking_points desc,
          lp.wins desc,
          (lp.sets_for - lp.sets_against) desc,
          (lp.games_for - lp.games_against) desc,
          lp.matches_played asc,
          lp.display_name asc
      ) as position,
      lp.id as league_player_id,
      lp.user_id,
      lp.display_name,
      lp.class_id,
      lc.category_name,
      lc.class_name,
      lc.level_order as class_level_order,
      lp.matches_played,
      lp.wins,
      lp.losses,
      lp.sets_for,
      lp.sets_against,
      lp.games_for,
      lp.games_against,
      lp.ranking_points,
      lp.wo_against,
      lp.status
    from public.league_players lp
    left join public.league_classes lc on lc.id = lp.class_id
    where lp.league_id = p_league_id
      and lp.season_id = p_season_id
      and lp.status <> 'inactive'
      and (p_class_id is null or lp.class_id = p_class_id)
  ) r;

  return query
  insert into public.league_ranking_snapshots (
    league_id,
    season_id,
    class_id,
    round_id,
    ranking
  )
  values (
    p_league_id,
    p_season_id,
    p_class_id,
    p_round_id,
    v_ranking
  )
  returning
    league_ranking_snapshots.id,
    league_ranking_snapshots.league_id,
    league_ranking_snapshots.season_id,
    league_ranking_snapshots.class_id,
    league_ranking_snapshots.round_id,
    league_ranking_snapshots.computed_at,
    league_ranking_snapshots.ranking;
end;
$$;

revoke all on function public.app_create_league_ranking_snapshot(uuid, uuid, uuid, uuid) from public;
grant execute on function public.app_create_league_ranking_snapshot(uuid, uuid, uuid, uuid) to authenticated;
