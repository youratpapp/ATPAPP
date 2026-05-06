-- Ensure approved registration is also reflected in tournament_members
-- so the player appears under "Participando".
-- Date: 2026-05-06

create or replace function public.app_set_tournament_registration_status(
  p_tournament_id uuid,
  p_registration_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if p_status not in ('approved', 'rejected') then
    raise exception 'status invalido';
  end if;

  if not public.app_is_tournament_owner(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  update public.tournament_registrations tr
     set status = p_status
   where tr.id = p_registration_id
     and tr.tournament_id = p_tournament_id
  returning tr.user_id into v_user_id;

  if v_user_id is null then
    raise exception 'inscricao nao encontrada';
  end if;

  if p_status = 'approved' then
    insert into public.tournament_members (tournament_id, user_id, role)
    values (p_tournament_id, v_user_id, 'participant')
    on conflict (tournament_id, user_id) do nothing;
  end if;
end;
$$;

grant execute on function public.app_set_tournament_registration_status(uuid, uuid, text) to authenticated;

-- Backfill: approved registrations should appear in participating list.
insert into public.tournament_members (tournament_id, user_id, role)
select distinct tr.tournament_id, tr.user_id, 'participant'
from public.tournament_registrations tr
where tr.status = 'approved'
on conflict (tournament_id, user_id) do nothing;
