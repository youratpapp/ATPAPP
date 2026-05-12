-- Place academy classes v1
-- Date: 2026-05-11

create extension if not exists pgcrypto;

create table if not exists public.place_academy_classes (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  title text not null,
  coach_name text,
  weekday integer not null default 1 check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  level text,
  capacity integer not null default 8 check (capacity > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_place_academy_classes_place
  on public.place_academy_classes(place_id, is_active, weekday, starts_at);

drop trigger if exists place_academy_classes_set_updated_at on public.place_academy_classes;
create trigger place_academy_classes_set_updated_at
  before update on public.place_academy_classes
  for each row execute function public.tg_set_updated_at();

alter table public.place_academy_classes enable row level security;

drop policy if exists place_academy_classes_read on public.place_academy_classes;
create policy place_academy_classes_read
on public.place_academy_classes
for select
to authenticated
using (
  is_active = true
  or exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists place_academy_classes_owner_insert on public.place_academy_classes;
create policy place_academy_classes_owner_insert
on public.place_academy_classes
for insert
to authenticated
with check (
  exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists place_academy_classes_owner_update on public.place_academy_classes;
create policy place_academy_classes_owner_update
on public.place_academy_classes
for update
to authenticated
using (
  exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

create table if not exists public.place_academy_enrollments (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  class_id uuid not null references public.place_academy_classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  phone text,
  status text not null default 'pending' check (status in ('pending', 'active', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_academy_enrollments_place
  on public.place_academy_enrollments(place_id, status, created_at desc);
create index if not exists idx_place_academy_enrollments_user
  on public.place_academy_enrollments(user_id, status, created_at desc);

drop trigger if exists place_academy_enrollments_set_updated_at on public.place_academy_enrollments;
create trigger place_academy_enrollments_set_updated_at
  before update on public.place_academy_enrollments
  for each row execute function public.tg_set_updated_at();

alter table public.place_academy_enrollments enable row level security;

drop policy if exists place_academy_enrollments_self_insert on public.place_academy_enrollments;
create policy place_academy_enrollments_self_insert
on public.place_academy_enrollments
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.place_academy_classes c
    where c.id = class_id
      and c.place_id = place_id
      and c.is_active = true
  )
);

drop policy if exists place_academy_enrollments_participant_or_owner_read on public.place_academy_enrollments;
create policy place_academy_enrollments_participant_or_owner_read
on public.place_academy_enrollments
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists place_academy_enrollments_participant_or_owner_update on public.place_academy_enrollments;
create policy place_academy_enrollments_participant_or_owner_update
on public.place_academy_enrollments
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);
