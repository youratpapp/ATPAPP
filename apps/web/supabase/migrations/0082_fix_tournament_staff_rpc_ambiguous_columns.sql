-- Fix tournament staff RPC ambiguous output-column references
-- Date: 2026-05-14
--
-- app_add_tournament_staff returns columns named tournament_id/user_id/role.
-- In PL/pgSQL those output columns are variables, so ON CONFLICT column
-- inference with the same names can become ambiguous.

drop function if exists public.app_add_tournament_staff(uuid, text, text);

create or replace function public.app_add_tournament_staff(
  p_tournament_id uuid,
  p_email text,
  p_role text
)
returns table(
  tournament_id uuid,
  user_id uuid,
  email text,
  role text,
  created_at timestamptz,
  status text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_user_id uuid;
  v_role text;
  v_created_at timestamptz;
begin
  if not public.app_is_tournament_owner(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  v_email := lower(trim(coalesce(p_email, '')));
  if v_email = '' then
    raise exception 'informe o email do usuario';
  end if;

  v_role := lower(trim(coalesce(p_role, '')));
  if v_role not in ('organizer', 'scorekeeper', 'checkin', 'media') then
    raise exception 'perfil de equipe invalido';
  end if;

  select u.id
    into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  if v_user_id is null then
    update public.tournament_staff_invites tsi
       set updated_at = now(),
           invited_by = auth.uid()
     where tsi.tournament_id = p_tournament_id
       and lower(tsi.email) = v_email
       and tsi.role = v_role
       and tsi.status = 'pending'
    returning tsi.created_at into v_created_at;

    if v_created_at is null then
      insert into public.tournament_staff_invites (tournament_id, email, role, invited_by)
      values (p_tournament_id, v_email, v_role, auth.uid())
      returning tournament_staff_invites.created_at into v_created_at;
    end if;

    return query
    select p_tournament_id, null::uuid, v_email, v_role, coalesce(v_created_at, now()), 'pending'::text;
    return;
  end if;

  insert into public.tournament_members (tournament_id, user_id, role)
  values (p_tournament_id, v_user_id, v_role)
  on conflict on constraint tournament_members_pkey
  do update set role = excluded.role;

  return query
  select
    tm.tournament_id,
    tm.user_id,
    v_email as email,
    tm.role,
    tm.created_at,
    'active'::text
  from public.tournament_members tm
  where tm.tournament_id = p_tournament_id
    and tm.user_id = v_user_id;
end;
$$;

revoke all on function public.app_add_tournament_staff(uuid, text, text) from public;
grant execute on function public.app_add_tournament_staff(uuid, text, text) to authenticated;
