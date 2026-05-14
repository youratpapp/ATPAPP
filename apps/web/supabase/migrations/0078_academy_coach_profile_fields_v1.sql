-- Academy coach operational profile fields
-- Date: 2026-05-14
--
-- Adds only the advanced fields needed by Academia v2 CoachDrawer.
-- Quick coach creation remains name/phone/email.

alter table public.place_coaches
  add column if not exists specialties text[] not null default '{}'::text[],
  add column if not exists level_scopes text[] not null default '{}'::text[],
  add column if not exists public_bio text not null default '',
  add column if not exists internal_notes text not null default '',
  add column if not exists public_profile_enabled boolean not null default false;

create index if not exists idx_place_coaches_specialties
  on public.place_coaches using gin (specialties);

create index if not exists idx_place_coaches_level_scopes
  on public.place_coaches using gin (level_scopes);

-- Coach profile now contains operational notes. Keep the full coach record inside
-- the academy management context instead of exposing active coaches broadly.
drop policy if exists place_coaches_read on public.place_coaches;
create policy place_coaches_read
on public.place_coaches
for select
to authenticated
using (public.app_can_manage_place_academy(place_id));
