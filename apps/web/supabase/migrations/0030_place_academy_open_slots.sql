-- Place academy open slots
-- Date: 2026-05-11

create table if not exists public.place_academy_slots (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  coach_id uuid references public.place_coaches(id) on delete set null,
  court_id uuid references public.place_courts(id) on delete set null,
  weekday integer not null default 1 check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  capacity integer not null default 8 check (capacity > 0),
  status text not null default 'open' check (status in ('open', 'assigned', 'blocked')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_place_academy_slots_place
  on public.place_academy_slots(place_id, weekday, starts_at, status);

drop trigger if exists place_academy_slots_set_updated_at on public.place_academy_slots;
create trigger place_academy_slots_set_updated_at
  before update on public.place_academy_slots
  for each row execute function public.tg_set_updated_at();

alter table public.place_academy_slots enable row level security;

drop policy if exists place_academy_slots_read on public.place_academy_slots;
create policy place_academy_slots_read
on public.place_academy_slots
for select
to authenticated
using (status = 'open' or public.app_can_manage_place(place_id));

drop policy if exists place_academy_slots_manager_insert on public.place_academy_slots;
create policy place_academy_slots_manager_insert
on public.place_academy_slots
for insert
to authenticated
with check (public.app_can_manage_place(place_id));

drop policy if exists place_academy_slots_manager_update on public.place_academy_slots;
create policy place_academy_slots_manager_update
on public.place_academy_slots
for update
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));
