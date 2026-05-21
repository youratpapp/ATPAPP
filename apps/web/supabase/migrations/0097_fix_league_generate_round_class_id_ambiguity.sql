-- Fix ambiguous output-column references in league round generation.
-- The RPC returns a column named class_id; unqualified table columns with the
-- same name can be resolved as PL/pgSQL variables in hosted Postgres.

create or replace function public.app_generate_next_league_round(
  p_league_id uuid,
  p_season_id uuid,
  p_class_id uuid default null
)
returns table(round_id uuid, class_id uuid, matches_created integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_league public.leagues%rowtype;
  v_deadline_days integer;
  v_tolerance_days integer;
  v_round_step_days integer;
  v_class record;
  v_round_id uuid;
  v_next_round integer;
  v_next_starts_at timestamptz;
  v_player_a uuid;
  v_player_b uuid;
  v_match_id uuid;
  v_matches_created integer;
  v_ids uuid[];
  v_best_candidate uuid;
  v_cycle_complete boolean;
begin
  if not public.app_is_league_owner(p_league_id) then
    raise exception 'nao autorizado';
  end if;

  select * into v_league from public.leagues l where l.id = p_league_id;
  if v_league.id is null then
    raise exception 'liga nao encontrada';
  end if;

  v_deadline_days := greatest(1, coalesce(v_league.result_deadline_days, 14));
  v_tolerance_days := greatest(0, coalesce(v_league.tolerance_days, 7));
  v_round_step_days := greatest(1, coalesce(v_league.round_interval_days, 14));

  for v_class in
    select c.id as class_id
    from public.league_classes c
    where c.season_id = p_season_id
      and (p_class_id is null or c.id = p_class_id)
    order by c.level_order
  loop
    select coalesce(max(r.round_number), 0) + 1
      into v_next_round
      from public.league_rounds r
     where r.season_id = p_season_id
       and r.class_id = v_class.class_id;

    select coalesce(
      (
        select max(r.starts_at) + make_interval(days => v_round_step_days)
        from public.league_rounds r
        where r.season_id = p_season_id
          and r.class_id = v_class.class_id
      ),
      now()
    )
      into v_next_starts_at;

    insert into public.league_rounds (
      league_id, season_id, class_id, round_number, starts_at, ends_at, tolerance_ends_at, status
    )
    values (
      p_league_id,
      p_season_id,
      v_class.class_id,
      v_next_round,
      v_next_starts_at,
      v_next_starts_at + make_interval(days => v_deadline_days),
      v_next_starts_at + make_interval(days => v_deadline_days + v_tolerance_days),
      'open'
    )
    returning id into v_round_id;

    v_matches_created := 0;

    select array_agg(lp.id order by lp.ranking_points desc, lp.wins desc, (lp.sets_for - lp.sets_against) desc, (lp.games_for - lp.games_against) desc, lp.matches_played asc, lp.display_name asc)
      into v_ids
      from public.league_players lp
     where lp.league_id = p_league_id
       and lp.season_id = p_season_id
       and lp.class_id = v_class.class_id
       and lp.status = 'active';

    if coalesce(array_length(v_ids, 1), 0) >= 2 then
      select not exists (
        select 1
        from public.league_players a
        join public.league_players b on b.id > a.id
        where a.league_id = p_league_id
          and a.season_id = p_season_id
          and a.class_id = v_class.class_id
          and a.status = 'active'
          and b.league_id = a.league_id
          and b.season_id = a.season_id
          and b.class_id = a.class_id
          and b.status = 'active'
          and not exists (
            select 1
            from public.league_pair_history h
            where h.season_id = p_season_id
              and h.class_id = v_class.class_id
              and h.relation_type = 'opponent'
              and ((h.player_a_id = a.id and h.player_b_id = b.id) or (h.player_a_id = b.id and h.player_b_id = a.id))
              and h.times_count > 0
          )
      ) into v_cycle_complete;

      while coalesce(array_length(v_ids, 1), 0) >= 2 loop
        v_player_a := v_ids[1];
        v_best_candidate := null;

        select cand.id
          into v_best_candidate
          from public.league_players base
          join public.league_players cand on cand.id = any(v_ids)
          where base.id = v_player_a
            and cand.id <> v_player_a
          order by
            case
              when not v_cycle_complete and exists (
                select 1
                from public.league_pair_history h
                where h.season_id = p_season_id
                  and h.class_id = v_class.class_id
                  and h.relation_type = 'opponent'
                  and ((h.player_a_id = base.id and h.player_b_id = cand.id) or (h.player_a_id = cand.id and h.player_b_id = base.id))
                  and h.times_count > 0
              ) then 1
              else 0
            end asc,
            abs(base.ranking_points - cand.ranking_points) asc,
            abs(base.matches_played - cand.matches_played) asc,
            abs(base.wo_against - cand.wo_against) asc,
            cand.display_name asc
          limit 1;

        if v_best_candidate is null then
          exit;
        end if;

        v_player_b := v_best_candidate;

        insert into public.league_matches (
          league_id, season_id, class_id, round_id, mode, status, format_snapshot, source
        )
        values (
          p_league_id,
          p_season_id,
          v_class.class_id,
          v_round_id,
          coalesce(v_league.league_type, 'simples'),
          'aguardando_organizacao',
          jsonb_build_object(
            'match_format', v_league.match_format,
            'no_ad_enabled', v_league.no_ad_enabled,
            'tie_break_rule', v_league.tie_break_rule
          ),
          'automatic'
        )
        returning id into v_match_id;

        insert into public.league_match_players (match_id, league_player_id, side, slot)
        values (v_match_id, v_player_a, 1, 1),
               (v_match_id, v_player_b, 2, 1);

        v_matches_created := v_matches_created + 1;

        v_ids := array_remove(array_remove(v_ids, v_player_a), v_player_b);
      end loop;
    end if;

    update public.league_seasons s
       set current_round_number = greatest(s.current_round_number, v_next_round),
           updated_at = now()
     where s.id = p_season_id;

    round_id := v_round_id;
    class_id := v_class.class_id;
    matches_created := v_matches_created;
    return next;
  end loop;
end;
$$;

revoke all on function public.app_generate_next_league_round(uuid, uuid, uuid) from public;
grant execute on function public.app_generate_next_league_round(uuid, uuid, uuid) to authenticated;
