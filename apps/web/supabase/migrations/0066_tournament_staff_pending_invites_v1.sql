-- Tournament staff pending invites v1
-- Date: 2026-05-12

create table if not exists public.tournament_staff_invites (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  email text not null,
  role text not null check (role in ('organizer', 'scorekeeper', 'checkin', 'media')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'cancelled')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_tournament_staff_invites_pending_email
  on public.tournament_staff_invites(tournament_id, lower(email), role)
  where status = 'pending';

create index if not exists idx_tournament_staff_invites_email_status
  on public.tournament_staff_invites(lower(email), status, created_at desc);

alter table public.tournament_staff_invites enable row level security;

drop policy if exists tournament_staff_invites_owner_read on public.tournament_staff_invites;
create policy tournament_staff_invites_owner_read
on public.tournament_staff_invites
for select
to authenticated
using (public.app_is_tournament_owner(tournament_id));

drop policy if exists tournament_staff_invites_owner_delete on public.tournament_staff_invites;
create policy tournament_staff_invites_owner_delete
on public.tournament_staff_invites
for delete
to authenticated
using (public.app_is_tournament_owner(tournament_id));

create or replace function public.app_claim_tournament_staff_invites()
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
    from public.tournament_staff_invites
    where status = 'pending'
      and lower(email) = lower(v_email)
  loop
    insert into public.tournament_members (tournament_id, user_id, role)
    values (v_invite.tournament_id, v_user_id, v_invite.role)
    on conflict (tournament_id, user_id)
    do update set role = excluded.role;

    update public.tournament_staff_invites
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

revoke all on function public.app_claim_tournament_staff_invites() from public;
grant execute on function public.app_claim_tournament_staff_invites() to authenticated;

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
    insert into public.tournament_staff_invites (tournament_id, email, role, invited_by)
    values (p_tournament_id, v_email, v_role, auth.uid())
    on conflict (tournament_id, (lower(email)), role) where status = 'pending'
    do update set updated_at = now(),
                  invited_by = excluded.invited_by
    returning tournament_staff_invites.created_at into v_created_at;

    return query
    select p_tournament_id, null::uuid, v_email, v_role, coalesce(v_created_at, now()), 'pending'::text;
    return;
  end if;

  insert into public.tournament_members (tournament_id, user_id, role)
  values (p_tournament_id, v_user_id, v_role)
  on conflict (tournament_id, user_id)
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
