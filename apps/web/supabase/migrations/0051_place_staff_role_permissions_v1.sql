-- Place staff role permissions v1
-- Date: 2026-05-12

create or replace function public.app_place_staff_role(p_place_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select case
    when exists (
      select 1
      from public.places p
      where p.id = p_place_id
        and p.owner_id = auth.uid()
    ) then 'owner'
    else coalesce((
      select s.role
      from public.place_staff s
      where s.place_id = p_place_id
        and s.user_id = auth.uid()
      limit 1
    ), '')
  end;
$$;

grant execute on function public.app_place_staff_role(uuid) to authenticated;

create or replace function public.app_can_manage_place(p_place_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.app_place_staff_role(p_place_id) in ('owner', 'manager');
$$;

grant execute on function public.app_can_manage_place(uuid) to authenticated;

create or replace function public.app_can_manage_place_bookings(p_place_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.app_place_staff_role(p_place_id) in ('owner', 'manager', 'frontdesk');
$$;

grant execute on function public.app_can_manage_place_bookings(uuid) to authenticated;

create or replace function public.app_can_manage_place_academy(p_place_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.app_place_staff_role(p_place_id) in ('owner', 'manager', 'coach');
$$;

grant execute on function public.app_can_manage_place_academy(uuid) to authenticated;

create or replace function public.app_can_manage_place_finance(p_place_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.app_place_staff_role(p_place_id) in ('owner', 'manager');
$$;

grant execute on function public.app_can_manage_place_finance(uuid) to authenticated;

drop policy if exists court_bookings_frontdesk_read on public.court_bookings;
create policy court_bookings_frontdesk_read
on public.court_bookings
for select
to authenticated
using (public.app_can_manage_place_bookings(place_id));

drop policy if exists court_bookings_frontdesk_update on public.court_bookings;
create policy court_bookings_frontdesk_update
on public.court_bookings
for update
to authenticated
using (public.app_can_manage_place_bookings(place_id))
with check (public.app_can_manage_place_bookings(place_id));

drop policy if exists place_courts_frontdesk_read on public.place_courts;
create policy place_courts_frontdesk_read
on public.place_courts
for select
to authenticated
using (is_active = true or public.app_can_manage_place_bookings(place_id));

drop policy if exists court_booking_waitlist_frontdesk_read on public.court_booking_waitlist;
create policy court_booking_waitlist_frontdesk_read
on public.court_booking_waitlist
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place_bookings(place_id));

drop policy if exists court_booking_waitlist_frontdesk_update on public.court_booking_waitlist;
create policy court_booking_waitlist_frontdesk_update
on public.court_booking_waitlist
for update
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place_bookings(place_id))
with check (user_id = auth.uid() or public.app_can_manage_place_bookings(place_id));

drop policy if exists place_academy_classes_coach_read on public.place_academy_classes;
create policy place_academy_classes_coach_read
on public.place_academy_classes
for select
to authenticated
using (is_active = true or public.app_can_manage_place_academy(place_id));

drop policy if exists place_academy_enrollments_coach_read on public.place_academy_enrollments;
create policy place_academy_enrollments_coach_read
on public.place_academy_enrollments
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place_academy(place_id));

drop policy if exists place_academy_enrollments_coach_update on public.place_academy_enrollments;
create policy place_academy_enrollments_coach_update
on public.place_academy_enrollments
for update
to authenticated
using (public.app_can_manage_place_academy(place_id))
with check (public.app_can_manage_place_academy(place_id));

drop policy if exists place_academy_attendance_coach_read on public.place_academy_attendance;
create policy place_academy_attendance_coach_read
on public.place_academy_attendance
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place_academy(place_id));

drop policy if exists place_academy_makeups_coach_read on public.place_academy_makeup_credits;
create policy place_academy_makeups_coach_read
on public.place_academy_makeup_credits
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place_academy(place_id));

drop policy if exists place_academy_progress_coach_read on public.place_academy_progress_notes;
create policy place_academy_progress_coach_read
on public.place_academy_progress_notes
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place_academy(place_id));

drop policy if exists app_payments_finance_membership_read on public.app_payments;
create policy app_payments_finance_membership_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'place_membership'
  and exists (
    select 1
    from public.place_memberships m
    where m.id = target_id
      and public.app_can_manage_place_finance(m.place_id)
  )
);
