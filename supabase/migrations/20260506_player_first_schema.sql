-- Player-first tournament schema update
-- Date: 2026-05-06

alter table if exists public.tournaments
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists visibility text default 'private',
  add column if not exists status text default 'draft',
  add column if not exists registration_open_at timestamptz,
  add column if not exists registration_close_at timestamptz,
  add column if not exists starts_at timestamptz;

update public.tournaments t
set city = coalesce(t.city, nullif(trim(t.data->'discovery'->>'city'), '')),
    state = coalesce(t.state, nullif(trim(t.data->'discovery'->>'state'), '')),
    visibility = coalesce(t.visibility, nullif(trim(t.data->'discovery'->>'visibility'), ''), 'private'),
    status = coalesce(t.status, nullif(trim(t.data->>'tournamentStatus'), ''), 'draft')
where true;

update public.tournaments
set state = upper(left(regexp_replace(coalesce(state, ''), '[^A-Za-z]', '', 'g'), 2));

update public.tournaments
set visibility = case when visibility in ('public','private') then visibility else 'private' end,
    status = case when status in ('draft','registration_open','registration_closed','live','finished') then status else 'draft' end;

create index if not exists idx_tournaments_visibility_state_city on public.tournaments (visibility, state, city);
create index if not exists idx_tournaments_owner_updated on public.tournaments (owner_id, updated_at desc);
create index if not exists idx_tournaments_status_updated on public.tournaments (status, updated_at desc);

alter table if exists public.tournaments enable row level security;
alter table if exists public.tournament_members enable row level security;

-- RLS policies for tournaments

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
using (
  exists (
    select 1
    from public.tournament_members tm
    where tm.tournament_id = tournaments.id
      and tm.user_id = auth.uid()
  )
);

-- RLS policies for tournament_members

drop policy if exists tournament_members_owner_read on public.tournament_members;
create policy tournament_members_owner_read
on public.tournament_members
for select
to authenticated
using (
  exists (
    select 1
    from public.tournaments t
    where t.id = tournament_members.tournament_id
      and t.owner_id = auth.uid()
  )
);

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

-- RPC: Search public tournaments safely (returns only public-visible rows)
create or replace function public.app_search_public_tournaments(
  p_city text default null,
  p_state text default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table(
  id uuid,
  name text,
  owner_id uuid,
  city text,
  state text,
  visibility text,
  status text,
  updated_at timestamptz,
  data jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  select
    t.id,
    t.name,
    t.owner_id,
    t.city,
    t.state,
    t.visibility,
    t.status,
    t.updated_at,
    t.data
  from public.tournaments t
  where t.visibility = 'public'
    and (p_city is null or p_city = '' or coalesce(t.city, '') ilike ('%' || p_city || '%'))
    and (p_state is null or p_state = '' or upper(coalesce(t.state, '')) = upper(p_state))
  order by t.updated_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 200))
  offset greatest(0, coalesce(p_offset, 0));
$$;

grant execute on function public.app_search_public_tournaments(text, text, integer, integer) to authenticated;

-- RPC: Return player dashboard events (created + participating)
create or replace function public.app_my_events()
returns table(
  id uuid,
  name text,
  owner_id uuid,
  city text,
  state text,
  visibility text,
  status text,
  updated_at timestamptz,
  role text,
  data jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  with mine as (
    select
      t.id, t.name, t.owner_id, t.city, t.state, t.visibility, t.status, t.updated_at, 'owner'::text as role, t.data
    from public.tournaments t
    where t.owner_id = auth.uid()
  ),
  member as (
    select
      t.id, t.name, t.owner_id, t.city, t.state, t.visibility, t.status, t.updated_at,
      coalesce(tm.role, 'participant')::text as role,
      t.data
    from public.tournament_members tm
    join public.tournaments t on t.id = tm.tournament_id
    where tm.user_id = auth.uid()
      and t.owner_id <> auth.uid()
  )
  select * from mine
  union all
  select * from member
  order by updated_at desc;
$$;

grant execute on function public.app_my_events() to authenticated;
