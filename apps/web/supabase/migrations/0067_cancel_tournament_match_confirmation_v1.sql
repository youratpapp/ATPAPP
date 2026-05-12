-- Allow players to undo their own tournament match confirmation.
-- Date: 2026-05-12

create or replace function public.app_cancel_tournament_match_confirmation(
  p_tournament_id uuid,
  p_class_key text,
  p_phase_key text,
  p_match_index integer
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
begin
  if not public.app_is_tournament_member(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  delete from public.tournament_match_confirmations c
  where c.tournament_id = p_tournament_id
    and c.class_key = trim(p_class_key)
    and c.phase_key = trim(p_phase_key)
    and c.match_index = greatest(0, p_match_index)
    and c.user_id = auth.uid();

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

revoke all on function public.app_cancel_tournament_match_confirmation(uuid, text, text, integer) from public;
grant execute on function public.app_cancel_tournament_match_confirmation(uuid, text, text, integer) to authenticated;

drop policy if exists tournament_match_confirmations_member_self_delete on public.tournament_match_confirmations;
create policy tournament_match_confirmations_member_self_delete
on public.tournament_match_confirmations
for delete
to authenticated
using (
  user_id = auth.uid()
  and public.app_is_tournament_member(tournament_id)
);

notify pgrst, 'reload schema';
