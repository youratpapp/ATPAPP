-- Place creation entitlements v1
-- Date: 2026-05-13
--
-- Professional places are Management OS workspaces, not generic player content.
-- This migration introduces an explicit entitlement gate so a free player cannot
-- create a club/academy by calling the table directly.

create table if not exists public.app_user_product_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account_type text not null default 'free_player'
    check (account_type in (
      'free_player',
      'competition_organizer',
      'coach_solo',
      'academy_starter',
      'academy_pro',
      'platform_admin'
    )),
  can_create_places boolean not null default false,
  can_create_competitions boolean not null default false,
  granted_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists app_user_product_entitlements_set_updated_at
  on public.app_user_product_entitlements;
create trigger app_user_product_entitlements_set_updated_at
  before update on public.app_user_product_entitlements
  for each row execute function public.tg_set_updated_at();

alter table public.app_user_product_entitlements enable row level security;

drop policy if exists app_user_product_entitlements_self_read
  on public.app_user_product_entitlements;
create policy app_user_product_entitlements_self_read
on public.app_user_product_entitlements
for select
to authenticated
using (user_id = auth.uid());

grant select on public.app_user_product_entitlements to authenticated;

insert into public.app_user_product_entitlements (
  user_id,
  account_type,
  can_create_places,
  can_create_competitions,
  notes
)
select distinct
  p.owner_id,
  'academy_pro',
  true,
  true,
  'Backfilled from existing place ownership.'
from public.places p
on conflict (user_id) do update
set
  account_type = case
    when public.app_user_product_entitlements.account_type = 'free_player'
      then excluded.account_type
    else public.app_user_product_entitlements.account_type
  end,
  can_create_places = public.app_user_product_entitlements.can_create_places
    or excluded.can_create_places,
  can_create_competitions = public.app_user_product_entitlements.can_create_competitions
    or excluded.can_create_competitions,
  updated_at = now();

create or replace function public.app_user_can_create_place()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.app_user_product_entitlements e
      where e.user_id = auth.uid()
        and e.can_create_places = true
    );
$$;

revoke all on function public.app_user_can_create_place() from public;
grant execute on function public.app_user_can_create_place() to authenticated;

create or replace function public.app_create_place(
  p_name text,
  p_city text default null,
  p_state text default null,
  p_description text default null,
  p_logo_url text default null,
  p_organization_id uuid default null,
  p_product_plan text default 'club_pro'
)
returns table(
  id uuid,
  owner_id uuid,
  organization_id uuid,
  product_plan text,
  name text,
  city text,
  state text,
  description text,
  logo_url text,
  cover_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_city text;
  v_state text;
  v_description text;
  v_logo_url text;
  v_product_plan text;
begin
  if auth.uid() is null then
    raise exception 'nao autenticado';
  end if;

  if not public.app_user_can_create_place() then
    raise exception 'plano sem permissao para criar local';
  end if;

  v_name := nullif(trim(coalesce(p_name, '')), '');
  if v_name is null then
    raise exception 'nome do local obrigatorio';
  end if;

  if p_organization_id is not null
    and not exists (
      select 1
      from public.place_organizations o
      where o.id = p_organization_id
        and o.owner_id = auth.uid()
    )
  then
    raise exception 'organizacao nao autorizada';
  end if;

  v_city := nullif(trim(coalesce(p_city, '')), '');
  v_state := nullif(upper(left(trim(coalesce(p_state, '')), 2)), '');
  v_description := nullif(trim(coalesce(p_description, '')), '');
  v_logo_url := nullif(trim(coalesce(p_logo_url, '')), '');
  v_product_plan := case
    when p_product_plan in ('club_basic', 'academy', 'club_pro', 'multi_unit')
      then p_product_plan
    else 'club_pro'
  end;

  return query
  insert into public.places as p (
    owner_id,
    organization_id,
    product_plan,
    name,
    city,
    state,
    description,
    logo_url
  )
  values (
    auth.uid(),
    p_organization_id,
    v_product_plan,
    v_name,
    v_city,
    v_state,
    v_description,
    v_logo_url
  )
  returning
    p.id,
    p.owner_id,
    p.organization_id,
    p.product_plan,
    p.name,
    p.city,
    p.state,
    p.description,
    p.logo_url,
    p.cover_url;
end;
$$;

revoke all on function public.app_create_place(text, text, text, text, text, uuid, text) from public;
grant execute on function public.app_create_place(text, text, text, text, text, uuid, text) to authenticated;

drop policy if exists "places_owner_insert" on public.places;
create policy "places_owner_insert"
on public.places
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and public.app_user_can_create_place()
);

notify pgrst, 'reload schema';
