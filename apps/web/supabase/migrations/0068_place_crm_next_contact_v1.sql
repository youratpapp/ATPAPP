-- Add next contact date to place CRM contacts.
-- Date: 2026-05-12

alter table public.place_crm_contacts
  add column if not exists next_contact_on date;

create index if not exists idx_place_crm_contacts_next_contact
  on public.place_crm_contacts(place_id, next_contact_on, status);

notify pgrst, 'reload schema';
