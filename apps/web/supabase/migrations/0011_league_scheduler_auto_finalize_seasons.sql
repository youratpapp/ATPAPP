-- League scheduler: auto-finish seasons when round target is reached
-- Date: 2026-05-08

create or replace function public.app_finalize_due_league_seasons(
  p_limit integer default 50
)
returns table(
  league_id uuid,
  season_id uuid,
  movements_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rec record;
  v_total_classes integer;
  v_classes_at_target integer;
  v_classes_window_closed integer;
  v_prev_sub text;
  v_prev_role text;
  v_move record;
  v_movements integer;
  v_done integer := 0;
begin
  if coalesce(p_limit, 0) <= 0 then
    return;
  end if;

  for v_rec in
    select
      l.id as league_id,
      l.owner_id,
      greatest(1, coalesce(l.rounds_total, 1)) as target_rounds,
      s.id as season_id
    from public.leagues l
    join public.league_seasons s on s.league_id = l.id and s.status = 'active'
    where l.status = 'active'
      and l.auto_round_generation_enabled = true
    order by l.updated_at asc, s.season_number asc
  loop
    exit when v_done >= p_limit;

    select count(*)
      into v_total_classes
    from public.league_classes c
    where c.season_id = v_rec.season_id;

    if coalesce(v_total_classes, 0) = 0 then
      continue;
    end if;

    -- Every class must have reached the configured season round target.
    select count(*)
      into v_classes_at_target
    from public.league_classes c
    where c.season_id = v_rec.season_id
      and coalesce((
        select max(r.round_number)
        from public.league_rounds r
        where r.season_id = v_rec.season_id
          and r.class_id = c.id
      ), 0) >= v_rec.target_rounds;

    if coalesce(v_classes_at_target, 0) < v_total_classes then
      continue;
    end if;

    -- Only finish after the last round window (deadline + tolerance) is closed.
    select count(*)
      into v_classes_window_closed
    from public.league_classes c
    join lateral (
      select r.ends_at, r.tolerance_ends_at
      from public.league_rounds r
      where r.season_id = v_rec.season_id
        and r.class_id = c.id
      order by r.round_number desc
      limit 1
    ) lr on true
    where c.season_id = v_rec.season_id
      and coalesce(lr.tolerance_ends_at, lr.ends_at) <= now();

    if coalesce(v_classes_window_closed, 0) < v_total_classes then
      continue;
    end if;

    v_prev_sub := current_setting('request.jwt.claim.sub', true);
    v_prev_role := current_setting('request.jwt.claim.role', true);
    perform set_config('request.jwt.claim.sub', v_rec.owner_id::text, true);
    perform set_config('request.jwt.claim.role', 'authenticated', true);

    v_movements := 0;
    for v_move in
      select *
      from public.app_apply_league_season_movements(
        v_rec.league_id,
        v_rec.season_id,
        'Fechamento automatico por limite de rodadas'
      )
    loop
      v_movements := v_movements + 1;
    end loop;

    perform set_config('request.jwt.claim.sub', coalesce(v_prev_sub, ''), true);
    perform set_config('request.jwt.claim.role', coalesce(v_prev_role, ''), true);

    league_id := v_rec.league_id;
    season_id := v_rec.season_id;
    movements_count := v_movements;
    v_done := v_done + 1;
    return next;
  end loop;
end;
$$;

revoke all on function public.app_finalize_due_league_seasons(integer) from public;
grant execute on function public.app_finalize_due_league_seasons(integer) to service_role;

create or replace function public.app_run_league_round_scheduler(
  p_limit integer default 50
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows jsonb := '[]'::jsonb;
  v_count integer := 0;
  v_item record;
begin
  for v_item in
    select * from public.app_generate_due_league_rounds(p_limit)
  loop
    v_count := v_count + 1;
    v_rows := v_rows || jsonb_build_array(
      jsonb_build_object(
        'event', 'round_generated',
        'league_id', v_item.league_id,
        'season_id', v_item.season_id,
        'class_id', v_item.class_id,
        'round_id', v_item.round_id,
        'matches_created', v_item.matches_created
      )
    );
  end loop;

  for v_item in
    select * from public.app_finalize_due_league_seasons(p_limit)
  loop
    v_rows := v_rows || jsonb_build_array(
      jsonb_build_object(
        'event', 'season_finalized',
        'league_id', v_item.league_id,
        'season_id', v_item.season_id,
        'movements_count', v_item.movements_count
      )
    );
  end loop;

  insert into public.league_scheduler_runs (generated_count, details)
  values (v_count, v_rows);

  return v_count;
end;
$$;

revoke all on function public.app_run_league_round_scheduler(integer) from public;
grant execute on function public.app_run_league_round_scheduler(integer) to service_role;
