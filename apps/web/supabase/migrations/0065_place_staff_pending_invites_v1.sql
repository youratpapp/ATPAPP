-- Place staff pending invites v1
-- Date: 2026-05-12

create table if not exists public.place_staff_invites (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  coach_id uuid references public.place_coaches(id) on delete set null,
  email text not null,
  role text not null default 'manager' check (role in ('manager', 'coach', 'frontdesk')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'cancelled')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_place_staff_invites_pending_email
  on public.place_staff_invites(place_id, lower(email), role)
  where status = 'pending';

create index if not exists idx_place_staff_invites_email_status
  on public.place_staff_invites(lower(email), status, created_at desc);

alter table public.place_staff_invites enable row level security;

drop policy if exists place_staff_invites_owner_read on public.place_staff_invites;
create policy place_staff_invites_owner_read
on public.place_staff_invites
for select
to authenticated
using (
  exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists place_staff_invites_owner_delete on public.place_staff_invites;
create policy place_staff_invites_owner_delete
on public.place_staff_invites
for delete
to authenticated
using (
  exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

create or replace function public.app_claim_place_staff_invites()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_count integer := 0;
  v_invite record;
begin
  if v_user_id is null then
    return 0;
  end if;

  select email into v_email
  from auth.users
  where id = v_user_id;

  if coalesce(trim(v_email), '') = '' then
    return 0;
  end if;

  for v_invite in
    select *
    from public.place_staff_invites
    where status = 'pending'
      and lower(email) = lower(v_email)
  loop
    insert into public.place_staff (place_id, user_id, role)
    values (v_invite.place_id, v_user_id, v_invite.role)
    on conflict (place_id, user_id)
    do update set role = excluded.role;

    if v_invite.coach_id is not null then
      update public.place_coaches
         set user_id = v_user_id,
             email = coalesce(nullif(trim(v_email), ''), email),
             updated_at = now()
       where id = v_invite.coach_id
         and place_id = v_invite.place_id
         and user_id is null;
    end if;

    update public.place_staff_invites
       set status = 'accepted',
           accepted_by = v_user_id,
           accepted_at = now(),
           updated_at = now()
     where id = v_invite.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.app_claim_place_staff_invites() from public;
grant execute on function public.app_claim_place_staff_invites() to authenticated;

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
  v_email text := lower(trim(p_email));
  v_role text;
  v_created_at timestamptz;
begin
  if not exists (
    select 1 from public.places p
    where p.id = p_place_id
      and p.owner_id = auth.uid()
  ) then
    raise exception 'nao autorizado';
  end if;

  if coalesce(v_email, '') = '' then
    raise exception 'email obrigatorio';
  end if;

  select u.id
  into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  v_role := case when p_role in ('coach', 'frontdesk') then p_role else 'manager' end;

  if v_user_id is null then
    insert into public.place_staff_invites (place_id, email, role, invited_by)
    values (p_place_id, v_email, v_role, auth.uid())
    on conflict (place_id, (lower(email)), role) where status = 'pending'
    do update set updated_at = now(),
                  invited_by = excluded.invited_by
    returning place_staff_invites.created_at into v_created_at;

    return query
    select p_place_id, null::uuid, v_email, v_role, coalesce(v_created_at, now()), 'pending'::text;
    return;
  end if;

  insert into public.place_staff (place_id, user_id, role)
  values (p_place_id, v_user_id, v_role)
  on conflict (place_id, user_id)
  do update set role = excluded.role;

  return query
  select s.place_id, s.user_id, v_email as email, s.role, s.created_at, 'active'::text
  from public.place_staff s
  where s.place_id = p_place_id
    and s.user_id = v_user_id;
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
  v_user_id uuid;
  v_email text := lower(trim(p_email));
begin
  select * into v_coach
  from public.place_coaches
  where id = p_coach_id;

  if v_coach.id is null or not public.app_can_manage_place(v_coach.place_id) then
    raise exception 'nao autorizado';
  end if;

  if coalesce(v_email, '') = '' then
    raise exception 'email obrigatorio';
  end if;

  select u.id
    into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  if v_user_id is null then
    update public.place_coaches
       set email = v_email,
           updated_at = now()
     where id = p_coach_id;

    insert into public.place_staff_invites (place_id, coach_id, email, role, invited_by)
    values (v_coach.place_id, p_coach_id, v_email, 'coach', auth.uid())
    on conflict (place_id, (lower(email)), role) where status = 'pending'
    do update set coach_id = excluded.coach_id,
                  updated_at = now(),
                  invited_by = excluded.invited_by;

    return query
    select c.id, c.place_id, c.user_id, c.name, c.email, c.phone, c.commission_percent, c.is_active
    from public.place_coaches c
    where c.id = p_coach_id;
    return;
  end if;

  update public.place_coaches
     set user_id = v_user_id,
         email = v_email,
         updated_at = now()
   where id = p_coach_id;

  insert into public.place_staff (place_id, user_id, role)
  values (v_coach.place_id, v_user_id, 'coach')
  on conflict (place_id, user_id)
  do update set role = 'coach';

  return query
  select c.id, c.place_id, c.user_id, c.name, coalesce(c.email, v_email), c.phone, c.commission_percent, c.is_active
  from public.place_coaches c
  where c.id = p_coach_id;
end;
$$;

revoke all on function public.app_link_place_coach_by_email(uuid, text) from public;
grant execute on function public.app_link_place_coach_by_email(uuid, text) to authenticated;
