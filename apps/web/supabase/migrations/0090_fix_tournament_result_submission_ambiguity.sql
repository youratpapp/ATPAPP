-- Fix tournament player result submission ambiguity
-- Date: 2026-05-15

create or replace function public.app_submit_tournament_match_result(
  p_tournament_id uuid,
  p_class_key text,
  p_class_label text,
  p_phase_key text,
  p_phase_label text,
  p_match_index integer,
  p_side text,
  p_match_title text,
  p_score_text text
)
returns table(
  id uuid,
  tournament_id uuid,
  submitted_by uuid,
  class_key text,
  class_label text,
  phase_key text,
  phase_label text,
  match_index integer,
  side text,
  match_title text,
  score_text text,
  normalized_score text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_score text;
  v_side_count integer;
  v_score_count integer;
begin
  if not exists (
    select 1
    from public.tournaments t
    where t.id = p_tournament_id
      and t.player_result_submission_enabled = true
  ) then
    raise exception 'envio de resultado por jogador desativado';
  end if;

  if not public.app_is_tournament_member(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  v_score := lower(regexp_replace(trim(coalesce(p_score_text, '')), '\s+', '', 'g'));
  if char_length(v_score) < 1 then
    raise exception 'placar vazio';
  end if;

  insert into public.tournament_match_result_submissions (
    tournament_id,
    submitted_by,
    class_key,
    class_label,
    phase_key,
    phase_label,
    match_index,
    side,
    match_title,
    score_text,
    normalized_score,
    status
  )
  values (
    p_tournament_id,
    auth.uid(),
    trim(p_class_key),
    trim(p_class_label),
    trim(p_phase_key),
    trim(p_phase_label),
    greatest(0, p_match_index),
    case when p_side = 'b' then 'b' else 'a' end,
    trim(p_match_title),
    trim(p_score_text),
    v_score,
    'pending'
  )
  on conflict (tournament_id, class_key, phase_key, match_index, submitted_by)
  do update set
    side = excluded.side,
    match_title = excluded.match_title,
    score_text = excluded.score_text,
    normalized_score = excluded.normalized_score,
    status = 'pending',
    updated_at = now();

  select count(distinct s.side), count(distinct s.normalized_score)
    into v_side_count, v_score_count
  from public.tournament_match_result_submissions s
  where s.tournament_id = p_tournament_id
    and s.class_key = trim(p_class_key)
    and s.phase_key = trim(p_phase_key)
    and s.match_index = greatest(0, p_match_index)
    and s.status in ('pending', 'accepted', 'conflict');

  if v_side_count >= 2 and v_score_count = 1 then
    update public.tournament_match_result_submissions s
       set status = 'accepted',
           updated_at = now()
     where s.tournament_id = p_tournament_id
       and s.class_key = trim(p_class_key)
       and s.phase_key = trim(p_phase_key)
       and s.match_index = greatest(0, p_match_index)
       and s.status in ('pending', 'conflict', 'accepted');
  elsif v_side_count >= 2 and v_score_count > 1 then
    update public.tournament_match_result_submissions s
       set status = 'conflict',
           updated_at = now()
     where s.tournament_id = p_tournament_id
       and s.class_key = trim(p_class_key)
       and s.phase_key = trim(p_phase_key)
       and s.match_index = greatest(0, p_match_index)
       and s.status in ('pending', 'conflict', 'accepted');
  end if;

  return query
  select
    s.id,
    s.tournament_id,
    s.submitted_by,
    s.class_key,
    s.class_label,
    s.phase_key,
    s.phase_label,
    s.match_index,
    s.side,
    s.match_title,
    s.score_text,
    s.normalized_score,
    s.status,
    s.created_at,
    s.updated_at
  from public.tournament_match_result_submissions s
  where s.tournament_id = p_tournament_id
    and s.class_key = trim(p_class_key)
    and s.phase_key = trim(p_phase_key)
    and s.match_index = greatest(0, p_match_index)
  order by s.updated_at desc;
end;
$$;

revoke all on function public.app_submit_tournament_match_result(uuid, text, text, text, text, integer, text, text, text) from public;
grant execute on function public.app_submit_tournament_match_result(uuid, text, text, text, text, integer, text, text, text) to authenticated;
