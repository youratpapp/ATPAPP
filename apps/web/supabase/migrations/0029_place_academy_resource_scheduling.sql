-- Place academy resource scheduling
-- Date: 2026-05-11

create table if not exists public.place_coaches (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_coaches_place
  on public.place_coaches(place_id, is_active, name);

drop trigger if exists place_coaches_set_updated_at on public.place_coaches;
create trigger place_coaches_set_updated_at
  before update on public.place_coaches
  for each row execute function public.tg_set_updated_at();

alter table public.place_coaches enable row level security;

drop policy if exists place_coaches_read on public.place_coaches;
create policy place_coaches_read
on public.place_coaches
for select
to authenticated
using (is_active = true or public.app_can_manage_place(place_id));

drop policy if exists place_coaches_manager_insert on public.place_coaches;
create policy place_coaches_manager_insert
on public.place_coaches
for insert
to authenticated
with check (public.app_can_manage_place(place_id));

drop policy if exists place_coaches_manager_update on public.place_coaches;
create policy place_coaches_manager_update
on public.place_coaches
for update
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

alter table public.place_academy_classes
  add column if not exists coach_id uuid references public.place_coaches(id) on delete set null,
  add column if not exists court_id uuid references public.place_courts(id) on delete set null;

create index if not exists idx_place_academy_classes_resources
  on public.place_academy_classes(place_id, weekday, starts_at, coach_id, court_id);
