-- Place staff permissions v1
-- Date: 2026-05-11

create table if not exists public.place_staff (
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'manager' check (role in ('manager', 'coach', 'frontdesk')),
  created_at timestamptz not null default now(),
  primary key (place_id, user_id)
);

create index if not exists idx_place_staff_user on public.place_staff(user_id, created_at desc);

alter table public.place_staff enable row level security;

create or replace function public.app_can_manage_place(p_place_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.places p
    where p.id = p_place_id
      and p.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.place_staff s
    where s.place_id = p_place_id
      and s.user_id = auth.uid()
  );
$$;

grant execute on function public.app_can_manage_place(uuid) to authenticated;

drop policy if exists place_staff_owner_or_self_read on public.place_staff;
create policy place_staff_owner_or_self_read
on public.place_staff
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

drop policy if exists place_staff_owner_delete on public.place_staff;
create policy place_staff_owner_delete
on public.place_staff
for delete
to authenticated
using (
  exists (
    select 1 from public.places p
    where p.id = place_id
      and p.owner_id = auth.uid()
  )
);

create or replace function public.app_add_place_staff(
  p_place_id uuid,
  p_email text,
  p_role text default 'manager'
)
returns table(
  place_id uuid,
  user_id uuid,
  email text,
  role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_email text;
  v_role text;
begin
  if not exists (
    select 1 from public.places p
    where p.id = p_place_id
      and p.owner_id = auth.uid()
  ) then
    raise exception 'nao autorizado';
  end if;

  select u.id, u.email
  into v_user_id, v_email
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
  limit 1;

  if v_user_id is null then
    raise exception 'usuario nao encontrado';
  end if;

  v_role := case when p_role in ('coach', 'frontdesk') then p_role else 'manager' end;

  insert into public.place_staff (place_id, user_id, role)
  values (p_place_id, v_user_id, v_role)
  on conflict (place_id, user_id)
  do update set role = excluded.role;

  return query
  select s.place_id, s.user_id, v_email as email, s.role, s.created_at
  from public.place_staff s
  where s.place_id = p_place_id
    and s.user_id = v_user_id;
end;
$$;

revoke all on function public.app_add_place_staff(uuid, text, text) from public;
grant execute on function public.app_add_place_staff(uuid, text, text) to authenticated;

drop policy if exists place_courts_staff_insert on public.place_courts;
create policy place_courts_staff_insert
on public.place_courts
for insert
to authenticated
with check (public.app_can_manage_place(place_id));

drop policy if exists place_courts_staff_update on public.place_courts;
create policy place_courts_staff_update
on public.place_courts
for update
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

drop policy if exists court_bookings_staff_read on public.court_bookings;
create policy court_bookings_staff_read
on public.court_bookings
for select
to authenticated
using (public.app_can_manage_place(place_id));

drop policy if exists court_bookings_staff_update on public.court_bookings;
create policy court_bookings_staff_update
on public.court_bookings
for update
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

drop policy if exists place_academy_classes_staff_insert on public.place_academy_classes;
create policy place_academy_classes_staff_insert
on public.place_academy_classes
for insert
to authenticated
with check (public.app_can_manage_place(place_id));

drop policy if exists place_academy_classes_staff_update on public.place_academy_classes;
create policy place_academy_classes_staff_update
on public.place_academy_classes
for update
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

drop policy if exists place_academy_enrollments_staff_read on public.place_academy_enrollments;
create policy place_academy_enrollments_staff_read
on public.place_academy_enrollments
for select
to authenticated
using (public.app_can_manage_place(place_id));

drop policy if exists place_academy_enrollments_staff_update on public.place_academy_enrollments;
create policy place_academy_enrollments_staff_update
on public.place_academy_enrollments
for update
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));
