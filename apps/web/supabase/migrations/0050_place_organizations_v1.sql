-- Place organizations and multi-unit v1
-- Date: 2026-05-12

create table if not exists public.place_organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_organizations_owner
  on public.place_organizations(owner_id, name);

drop trigger if exists place_organizations_set_updated_at
  on public.place_organizations;
create trigger place_organizations_set_updated_at
  before update on public.place_organizations
  for each row execute function public.tg_set_updated_at();

alter table public.place_organizations enable row level security;

drop policy if exists place_organizations_owner_read on public.place_organizations;
create policy place_organizations_owner_read
on public.place_organizations
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists place_organizations_owner_insert on public.place_organizations;
create policy place_organizations_owner_insert
on public.place_organizations
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists place_organizations_owner_update on public.place_organizations;
create policy place_organizations_owner_update
on public.place_organizations
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

alter table public.places
  add column if not exists organization_id uuid references public.place_organizations(id) on delete set null;

create index if not exists idx_places_organization
  on public.places(organization_id);

drop policy if exists places_org_owner_update on public.places;
create policy places_org_owner_update
on public.places
for update
to authenticated
using (
  auth.uid() = owner_id
  or exists (
    select 1
    from public.place_organizations o
    where o.id = organization_id
      and o.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = owner_id
  or organization_id is null
  or exists (
    select 1
    from public.place_organizations o
    where o.id = organization_id
      and o.owner_id = auth.uid()
  )
);
