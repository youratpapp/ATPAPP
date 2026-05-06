-- Fix RLS recursion between tournaments and tournament_members
-- Date: 2026-05-06

alter table if exists public.tournaments enable row level security;
alter table if exists public.tournament_members enable row level security;

-- Helper functions to avoid policy-to-policy recursive checks.
-- SECURITY DEFINER lets these lookups run without being blocked by RLS
-- on the same tables referenced by policies.
create or replace function public.app_is_tournament_owner(p_tournament_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.tournaments t
    where t.id = p_tournament_id
      and t.owner_id = auth.uid()
  );
$$;

create or replace function public.app_is_tournament_member(p_tournament_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.tournament_members tm
    where tm.tournament_id = p_tournament_id
      and tm.user_id = auth.uid()
  );
$$;

grant execute on function public.app_is_tournament_owner(uuid) to authenticated;
grant execute on function public.app_is_tournament_member(uuid) to authenticated;

-- Tournaments policies
drop policy if exists tournaments_owner_all on public.tournaments;
create policy tournaments_owner_all
on public.tournaments
for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists tournaments_public_read on public.tournaments;
create policy tournaments_public_read
on public.tournaments
for select
to authenticated
using (visibility = 'public');

drop policy if exists tournaments_member_read on public.tournaments;
create policy tournaments_member_read
on public.tournaments
for select
to authenticated
using (public.app_is_tournament_member(id));

-- Tournament members policies
drop policy if exists tournament_members_owner_read on public.tournament_members;
create policy tournament_members_owner_read
on public.tournament_members
for select
to authenticated
using (public.app_is_tournament_owner(tournament_id));

drop policy if exists tournament_members_self_read on public.tournament_members;
create policy tournament_members_self_read
on public.tournament_members
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists tournament_members_self_insert on public.tournament_members;
create policy tournament_members_self_insert
on public.tournament_members
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists tournament_members_self_update on public.tournament_members;
create policy tournament_members_self_update
on public.tournament_members
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
