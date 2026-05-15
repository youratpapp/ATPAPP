-- Place staff invite acceptance v1
-- Date: 2026-05-15
--
-- Local staff access is granted only after the invited user accepts the invite.

create or replace function public.app_search_place_staff_candidates(
  p_place_id uuid,
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
  if not exists (
    select 1
    from public.places p
    where p.id = p_place_id
      and p.owner_id = auth.uid()
  ) then
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
  where not exists (
      select 1
      from public.place_staff ps
      where ps.place_id = p_place_id
        and ps.user_id = u.id
    )
    and (
      lower(coalesce(u.email, '')) like v_like escape '\'
      or lower(coalesce(p.display_name, '')) like v_like escape '\'
      or lower(coalesce(u.raw_user_meta_data ->> 'display_name', '')) like v_like escape '\'
    )
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

revoke all on function public.app_search_place_staff_candidates(uuid, text) from public;
grant execute on function public.app_search_place_staff_candidates(uuid, text) to authenticated;

create or replace function public.app_list_place_staff(p_place_id uuid)
returns table(
  place_id uuid,
  user_id uuid,
  email text,
  display_name text,
  role text,
  created_at timestamptz,
  status text
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1
    from public.places p
    where p.id = p_place_id
      and p.owner_id = auth.uid()
  ) then
    raise exception 'nao autorizado';
  end if;

  return query
  select
    ps.place_id,
    ps.user_id,
    lower(coalesce(u.email, ''))::text,
    coalesce(
      nullif(trim(pr.display_name), ''),
      nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
      lower(u.email),
      'Usuario vinculado'
    )::text,
    ps.role::text,
    ps.created_at,
    'active'::text
  from public.place_staff ps
  left join auth.users u on u.id = ps.user_id
  left join public.profiles pr on pr.user_id = ps.user_id
  where ps.place_id = p_place_id

  union all

  select
    psi.place_id,
    null::uuid,
    lower(psi.email)::text,
    coalesce(
      nullif(trim(pr.display_name), ''),
      nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
      lower(psi.email)
    )::text,
    psi.role::text,
    psi.created_at,
    'pending'::text
  from public.place_staff_invites psi
  left join auth.users u on lower(u.email) = lower(psi.email)
  left join public.profiles pr on pr.user_id = u.id
  where psi.place_id = p_place_id
    and psi.status = 'pending'
  order by 7 desc, 6 desc;
end;
$$;

revoke all on function public.app_list_place_staff(uuid) from public;
grant execute on function public.app_list_place_staff(uuid) to authenticated;

drop function if exists public.app_add_place_staff(uuid, text, text);

create or replace function public.app_add_place_staff(
  p_place_id uuid,
  p_email text,
  p_role text default 'manager'
)
returns table(
  place_id uuid,
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
  v_user_id uuid;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_role text;
  v_created_at timestamptz;
begin
  if not exists (
    select 1
    from public.places p
    where p.id = p_place_id
      and p.owner_id = auth.uid()
  ) then
    raise exception 'nao autorizado';
  end if;

  if v_email = '' then
    raise exception 'email obrigatorio';
  end if;

  select u.id
    into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  if v_user_id is not null and exists (
    select 1
    from public.place_staff ps
    where ps.place_id = p_place_id
      and ps.user_id = v_user_id
  ) then
    raise exception 'usuario ja faz parte da equipe';
  end if;

  v_role := case when p_role in ('coach', 'frontdesk', 'finance') then p_role else 'manager' end;

  update public.place_staff_invites psi
     set updated_at = now(),
         invited_by = auth.uid()
   where psi.place_id = p_place_id
     and lower(psi.email) = v_email
     and psi.role = v_role
     and psi.status = 'pending'
  returning psi.created_at into v_created_at;

  if v_created_at is null then
    insert into public.place_staff_invites (place_id, email, role, invited_by)
    values (p_place_id, v_email, v_role, auth.uid())
    returning place_staff_invites.created_at into v_created_at;
  end if;

  return query
  select p_place_id, null::uuid, v_email, v_role, coalesce(v_created_at, now()), 'pending'::text;
end;
$$;

revoke all on function public.app_add_place_staff(uuid, text, text) from public;
grant execute on function public.app_add_place_staff(uuid, text, text) to authenticated;

create or replace function public.app_link_place_coach_by_email(
  p_coach_id uuid,
  p_email text
)
returns table(
  id uuid,
  place_id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  commission_percent integer,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
#variable_conflict use_column
declare
  v_coach public.place_coaches%rowtype;
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  select *
    into v_coach
  from public.place_coaches
  where id = p_coach_id;

  if v_coach.id is null or not public.app_can_manage_place(v_coach.place_id) then
    raise exception 'nao autorizado';
  end if;

  if v_email = '' then
    raise exception 'email obrigatorio';
  end if;

  update public.place_coaches
     set email = v_email,
         updated_at = now()
   where id = p_coach_id;

  update public.place_staff_invites psi
     set coach_id = p_coach_id,
         updated_at = now(),
         invited_by = auth.uid()
   where psi.place_id = v_coach.place_id
     and lower(psi.email) = v_email
     and psi.role = 'coach'
     and psi.status = 'pending';

  if not found then
    insert into public.place_staff_invites (place_id, coach_id, email, role, invited_by)
    values (v_coach.place_id, p_coach_id, v_email, 'coach', auth.uid());
  end if;

  return query
  select c.id, c.place_id, c.user_id, c.name, c.email, c.phone, c.commission_percent, c.is_active
  from public.place_coaches c
  where c.id = p_coach_id;
end;
$$;

revoke all on function public.app_link_place_coach_by_email(uuid, text) from public;
grant execute on function public.app_link_place_coach_by_email(uuid, text) to authenticated;

create or replace function public.app_list_my_place_staff_invites()
returns table(
  invite_id uuid,
  place_id uuid,
  place_name text,
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
    psi.id,
    psi.place_id,
    p.name,
    lower(psi.email)::text,
    psi.role,
    psi.created_at
  from public.place_staff_invites psi
  join public.places p on p.id = psi.place_id
  where psi.status = 'pending'
    and lower(psi.email) = v_email
  order by psi.created_at desc;
end;
$$;

revoke all on function public.app_list_my_place_staff_invites() from public;
grant execute on function public.app_list_my_place_staff_invites() to authenticated;

create or replace function public.app_accept_place_staff_invite(p_invite_id uuid)
returns table(
  place_id uuid,
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
  from public.place_staff_invites psi
  where psi.id = p_invite_id
    and psi.status = 'pending'
    and lower(psi.email) = v_email
  for update;

  if v_invite.id is null then
    raise exception 'convite nao encontrado';
  end if;

  insert into public.place_staff (place_id, user_id, role)
  values (v_invite.place_id, v_user_id, v_invite.role)
  on conflict (place_id, user_id)
  do update set role = excluded.role;

  if v_invite.coach_id is not null then
    update public.place_coaches pc
       set user_id = v_user_id,
           email = v_email,
           updated_at = now()
     where pc.id = v_invite.coach_id
       and pc.place_id = v_invite.place_id;
  end if;

  update public.place_staff_invites
     set status = 'accepted',
         accepted_by = v_user_id,
         accepted_at = now(),
         updated_at = now()
   where id = v_invite.id;

  return query
  select v_invite.place_id, v_user_id, v_email, v_invite.role, v_invite.created_at, 'active'::text;
end;
$$;

revoke all on function public.app_accept_place_staff_invite(uuid) from public;
grant execute on function public.app_accept_place_staff_invite(uuid) to authenticated;

create or replace function public.app_decline_place_staff_invite(p_invite_id uuid)
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

  update public.place_staff_invites psi
     set status = 'cancelled',
         updated_at = now()
   where psi.id = p_invite_id
     and psi.status = 'pending'
     and lower(psi.email) = v_email;
end;
$$;

revoke all on function public.app_decline_place_staff_invite(uuid) from public;
grant execute on function public.app_decline_place_staff_invite(uuid) to authenticated;

create or replace function public.app_claim_place_staff_invites()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  return 0;
end;
$$;

revoke all on function public.app_claim_place_staff_invites() from public;
grant execute on function public.app_claim_place_staff_invites() to authenticated;
