-- Place CRM contacts v1
-- Date: 2026-05-12

create table if not exists public.place_crm_contacts (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  source text,
  interest text,
  status text not null default 'lead' check (status in ('lead', 'contacted', 'converted', 'archived')),
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_crm_contacts_place
  on public.place_crm_contacts(place_id, status, created_at desc);

drop trigger if exists place_crm_contacts_set_updated_at
  on public.place_crm_contacts;
create trigger place_crm_contacts_set_updated_at
  before update on public.place_crm_contacts
  for each row execute function public.tg_set_updated_at();

alter table public.place_crm_contacts enable row level security;

drop policy if exists place_crm_contacts_manager_read on public.place_crm_contacts;
create policy place_crm_contacts_manager_read
on public.place_crm_contacts
for select
to authenticated
using (public.app_can_manage_place(place_id));

drop policy if exists place_crm_contacts_manager_insert on public.place_crm_contacts;
create policy place_crm_contacts_manager_insert
on public.place_crm_contacts
for insert
to authenticated
with check (public.app_can_manage_place(place_id));

drop policy if exists place_crm_contacts_manager_update on public.place_crm_contacts;
create policy place_crm_contacts_manager_update
on public.place_crm_contacts
for update
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));
