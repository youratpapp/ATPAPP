-- Fix tournament match confirmation ambiguity
-- Date: 2026-05-11

create or replace function public.app_confirm_tournament_match(
  p_tournament_id uuid,
  p_class_key text,
  p_class_label text,
  p_phase_key text,
  p_phase_label text,
  p_match_index integer,
  p_side text,
  p_match_title text,
  p_status text
)
returns table(
  id uuid,
  tournament_id uuid,
  user_id uuid,
  class_key text,
  class_label text,
  phase_key text,
  phase_label text,
  match_index integer,
  side text,
  match_title text,
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
  v_status text;
begin
  if not public.app_is_tournament_member(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  v_status := case when p_status = 'unavailable' then 'unavailable' else 'confirmed' end;

  insert into public.tournament_match_confirmations (
    tournament_id,
    user_id,
    class_key,
    class_label,
    phase_key,
    phase_label,
    match_index,
    side,
    match_title,
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
    v_status
  )
  on conflict (tournament_id, class_key, phase_key, match_index, user_id)
  do update set
    side = excluded.side,
    match_title = excluded.match_title,
    status = excluded.status,
    updated_at = now();

  return query
  select
    c.id,
    c.tournament_id,
    c.user_id,
    c.class_key,
    c.class_label,
    c.phase_key,
    c.phase_label,
    c.match_index,
    c.side,
    c.match_title,
    c.status,
    c.created_at,
    c.updated_at
  from public.tournament_match_confirmations c
  where c.tournament_id = p_tournament_id
    and c.class_key = trim(p_class_key)
    and c.phase_key = trim(p_phase_key)
    and c.match_index = greatest(0, p_match_index)
  order by c.updated_at desc;
end;
$$;

revoke all on function public.app_confirm_tournament_match(uuid, text, text, text, text, integer, text, text, text) from public;
grant execute on function public.app_confirm_tournament_match(uuid, text, text, text, text, integer, text, text, text) to authenticated;
