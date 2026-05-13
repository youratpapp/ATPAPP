-- Add CRM ownership and interaction history for places.
-- Date: 2026-05-12

alter table public.place_crm_contacts
  add column if not exists owner_label text;

create index if not exists idx_place_crm_contacts_owner
  on public.place_crm_contacts(place_id, owner_label, status);

create table if not exists public.place_crm_interactions (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  contact_id uuid not null references public.place_crm_contacts(id) on delete cascade,
  interaction_type text not null default 'note' check (interaction_type in ('note', 'call', 'whatsapp', 'email', 'visit', 'follow_up')),
  body text not null,
  next_contact_on date,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists idx_place_crm_interactions_contact
  on public.place_crm_interactions(contact_id, created_at desc);

create index if not exists idx_place_crm_interactions_place
  on public.place_crm_interactions(place_id, created_at desc);

alter table public.place_crm_interactions enable row level security;

drop policy if exists place_crm_interactions_manager_read on public.place_crm_interactions;
create policy place_crm_interactions_manager_read
on public.place_crm_interactions
for select
to authenticated
using (public.app_can_manage_place(place_id));

drop policy if exists place_crm_interactions_manager_insert on public.place_crm_interactions;
create policy place_crm_interactions_manager_insert
on public.place_crm_interactions
for insert
to authenticated
with check (public.app_can_manage_place(place_id));

notify pgrst, 'reload schema';
