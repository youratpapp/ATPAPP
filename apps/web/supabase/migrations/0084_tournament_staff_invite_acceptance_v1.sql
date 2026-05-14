-- Tournament staff invite acceptance v1
-- Date: 2026-05-14
--
-- Owners can search users to avoid email typos, but staff access is granted
-- only after the invited user explicitly accepts the pending invite.

create or replace function public.app_search_tournament_staff_candidates(
  p_tournament_id uuid,
  p_query text
)
returns table(
  user_id uuid,
  email text,
  display_name text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_query text := lower(trim(coalesce(p_query, '')));
  v_like text;
begin
  if not public.app_is_tournament_owner(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  if length(v_query) < 3 then
    return;
  end if;

  v_like := '%' || replace(replace(v_query, '%', '\%'), '_', '\_') || '%';

  return query
  select
    u.id,
    lower(u.email)::text,
    coalesce(
      nullif(trim(p.display_name), ''),
      nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
      lower(u.email)
    )::text
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  where lower(coalesce(u.email, '')) like v_like escape '\'
     or lower(coalesce(p.display_name, '')) like v_like escape '\'
     or lower(coalesce(u.raw_user_meta_data ->> 'display_name', '')) like v_like escape '\'
  order by
    case
      when lower(u.email) = v_query then 0
      when lower(u.email) like replace(replace(v_query, '%', '\%'), '_', '\_') || '%' escape '\' then 1
      else 2
    end,
    lower(coalesce(p.display_name, u.email)),
    lower(u.email)
  limit 8;
end;
$$;

revoke all on function public.app_search_tournament_staff_candidates(uuid, text) from public;
grant execute on function public.app_search_tournament_staff_candidates(uuid, text) to authenticated;

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
end;
$$;

revoke all on function public.app_add_tournament_staff(uuid, text, text) from public;
grant execute on function public.app_add_tournament_staff(uuid, text, text) to authenticated;

create or replace function public.app_list_my_tournament_staff_invites()
returns table(
  invite_id uuid,
  tournament_id uuid,
  tournament_name text,
  email text,
  role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  select lower(u.email)
    into v_email
  from auth.users u
  where u.id = auth.uid();

  if coalesce(trim(v_email), '') = '' then
    return;
  end if;

  return query
  select
    tsi.id,
    tsi.tournament_id,
    t.name,
    lower(tsi.email)::text,
    tsi.role,
    tsi.created_at
  from public.tournament_staff_invites tsi
  join public.tournaments t on t.id = tsi.tournament_id
  where tsi.status = 'pending'
    and lower(tsi.email) = v_email
  order by tsi.created_at desc;
end;
$$;

revoke all on function public.app_list_my_tournament_staff_invites() from public;
grant execute on function public.app_list_my_tournament_staff_invites() to authenticated;

create or replace function public.app_accept_tournament_staff_invite(p_invite_id uuid)
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
  v_user_id uuid := auth.uid();
  v_email text;
  v_invite record;
begin
  if v_user_id is null then
    raise exception 'usuario nao autenticado';
  end if;

  select lower(u.email)
    into v_email
  from auth.users u
  where u.id = v_user_id;

  select *
    into v_invite
  from public.tournament_staff_invites tsi
  where tsi.id = p_invite_id
    and tsi.status = 'pending'
    and lower(tsi.email) = v_email
  for update;

  if v_invite.id is null then
    raise exception 'convite nao encontrado';
  end if;

  insert into public.tournament_members (tournament_id, user_id, role)
  values (v_invite.tournament_id, v_user_id, v_invite.role)
  on conflict on constraint tournament_members_pkey
  do update set role = excluded.role;

  update public.tournament_staff_invites
     set status = 'accepted',
         accepted_by = v_user_id,
         accepted_at = now(),
         updated_at = now()
   where id = v_invite.id;

  return query
  select v_invite.tournament_id, v_user_id, v_email, v_invite.role, v_invite.created_at, 'active'::text;
end;
$$;

revoke all on function public.app_accept_tournament_staff_invite(uuid) from public;
grant execute on function public.app_accept_tournament_staff_invite(uuid) to authenticated;

create or replace function public.app_decline_tournament_staff_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  select lower(u.email)
    into v_email
  from auth.users u
  where u.id = auth.uid();

  update public.tournament_staff_invites tsi
     set status = 'cancelled',
         updated_at = now()
   where tsi.id = p_invite_id
     and tsi.status = 'pending'
     and lower(tsi.email) = v_email;
end;
$$;

revoke all on function public.app_decline_tournament_staff_invite(uuid) from public;
grant execute on function public.app_decline_tournament_staff_invite(uuid) to authenticated;

create or replace function public.app_claim_tournament_staff_invites()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  return 0;
end;
$$;

revoke all on function public.app_claim_tournament_staff_invites() from public;
grant execute on function public.app_claim_tournament_staff_invites() to authenticated;
