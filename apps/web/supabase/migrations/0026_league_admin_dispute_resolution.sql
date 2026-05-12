-- League admin dispute resolution
-- Date: 2026-05-11

create or replace function public.app_admin_resolve_league_match_result(
  p_match_id uuid,
  p_payload jsonb,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.league_matches%rowtype;
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_round_num integer;
  v_result_summary text;
begin
  select * into v_match from public.league_matches where id = p_match_id;
  if v_match.id is null then
    raise exception 'partida nao encontrada';
  end if;

  if not public.app_is_league_owner(v_match.league_id) then
    raise exception 'nao autorizado';
  end if;

  if v_match.status in ('encerrada', 'wo') then
    raise exception 'partida ja encerrada';
  end if;

  update public.league_match_result_submissions
     set status = 'rejected',
         updated_at = now()
   where match_id = p_match_id
     and status = 'pending';

  update public.league_matches
     set result_payload = v_payload,
         winner_side = nullif(coalesce((v_payload->>'winner_side')::integer, 0), 0),
         is_wo = coalesce((v_payload->>'is_wo')::boolean, false),
         status = case when coalesce((v_payload->>'is_wo')::boolean, false) then 'wo' else 'encerrada' end,
         needs_admin_review = false,
         updated_at = now()
   where id = p_match_id;

  perform public.app_apply_league_match_result_to_ranking(p_match_id, v_payload);

  select round_number into v_round_num from public.league_rounds where id = v_match.round_id;
  v_result_summary := coalesce(v_payload->>'summary', format('Partida resolvida pelo admin (rodada %s)', coalesce(v_round_num::text, '?')));

  insert into public.league_round_results (round_id, match_id, result_summary)
  values (v_match.round_id, v_match.id, v_result_summary)
  on conflict (round_id, match_id) do update
    set result_summary = excluded.result_summary,
        published_at = now();

  insert into public.league_admin_decisions (league_id, season_id, match_id, action, reason, payload, created_by)
  values (
    v_match.league_id,
    v_match.season_id,
    v_match.id,
    'resultado_admin_resolvido',
    coalesce(nullif(trim(coalesce(p_reason, '')), ''), 'Resultado resolvido pelo administrador'),
    v_payload,
    auth.uid()
  );
end;
$$;

revoke all on function public.app_admin_resolve_league_match_result(uuid, jsonb, text) from public;
grant execute on function public.app_admin_resolve_league_match_result(uuid, jsonb, text) to authenticated;
