-- Place finance staff role v1
-- Date: 2026-05-15
--
-- Adds a dedicated local finance role without promoting the operator to manager.

alter table public.place_staff
  drop constraint if exists place_staff_role_check;

alter table public.place_staff
  add constraint place_staff_role_check
  check (role in ('manager', 'coach', 'frontdesk', 'finance'));

alter table public.place_staff_invites
  drop constraint if exists place_staff_invites_role_check;

alter table public.place_staff_invites
  add constraint place_staff_invites_role_check
  check (role in ('manager', 'coach', 'frontdesk', 'finance'));

create or replace function public.app_can_manage_place_finance(p_place_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.app_place_staff_role(p_place_id) in ('owner', 'manager', 'finance');
$$;

grant execute on function public.app_can_manage_place_finance(uuid) to authenticated;

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
  created_at timestamptz,
  status text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_email text := lower(trim(p_email));
  v_role text;
  v_created_at timestamptz;
begin
  if not exists (
    select 1 from public.places p
    where p.id = p_place_id
      and p.owner_id = auth.uid()
  ) then
    raise exception 'nao autorizado';
  end if;

  if coalesce(v_email, '') = '' then
    raise exception 'email obrigatorio';
  end if;

  select u.id
  into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  v_role := case when p_role in ('coach', 'frontdesk', 'finance') then p_role else 'manager' end;

  if v_user_id is null then
    insert into public.place_staff_invites (place_id, email, role, invited_by)
    values (p_place_id, v_email, v_role, auth.uid())
    on conflict (place_id, (lower(email)), role) where status = 'pending'
    do update set updated_at = now(),
                  invited_by = excluded.invited_by
    returning place_staff_invites.created_at into v_created_at;

    return query
    select p_place_id, null::uuid, v_email, v_role, coalesce(v_created_at, now()), 'pending'::text;
    return;
  end if;

  insert into public.place_staff (place_id, user_id, role)
  values (p_place_id, v_user_id, v_role)
  on conflict (place_id, user_id)
  do update set role = excluded.role;

  return query
  select s.place_id, s.user_id, v_email as email, s.role, s.created_at, 'active'::text
  from public.place_staff s
  where s.place_id = p_place_id
    and s.user_id = v_user_id;
end;
$$;

revoke all on function public.app_add_place_staff(uuid, text, text) from public;
grant execute on function public.app_add_place_staff(uuid, text, text) to authenticated;

drop policy if exists court_bookings_finance_read on public.court_bookings;
create policy court_bookings_finance_read
on public.court_bookings
for select
to authenticated
using (public.app_can_manage_place_finance(place_id));

drop policy if exists app_payments_booking_ops_read on public.app_payments;
create policy app_payments_booking_ops_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'court_booking'
  and exists (
    select 1
    from public.court_bookings b
    where b.id = target_id
      and (
        public.app_can_manage_place_bookings(b.place_id)
        or public.app_can_manage_place_finance(b.place_id)
      )
  )
);

drop policy if exists place_membership_plans_read on public.place_membership_plans;
create policy place_membership_plans_read
on public.place_membership_plans
for select
to authenticated
using (is_active = true or public.app_can_manage_place(place_id) or public.app_can_manage_place_finance(place_id));

drop policy if exists place_memberships_finance_read on public.place_memberships;
create policy place_memberships_finance_read
on public.place_memberships
for select
to authenticated
using (public.app_can_manage_place_finance(place_id));

drop policy if exists place_expenses_manager_all on public.place_expenses;
create policy place_expenses_manager_all
on public.place_expenses
for all
to authenticated
using (public.app_can_manage_place(place_id) or public.app_can_manage_place_finance(place_id))
with check (public.app_can_manage_place(place_id) or public.app_can_manage_place_finance(place_id));

drop policy if exists place_credit_packages_manager_read on public.place_credit_packages;
create policy place_credit_packages_manager_read
on public.place_credit_packages
for select
to authenticated
using (public.app_can_manage_place(place_id) or public.app_can_manage_place_finance(place_id));

drop policy if exists place_credit_packages_manager_write on public.place_credit_packages;
create policy place_credit_packages_manager_write
on public.place_credit_packages
for all
to authenticated
using (public.app_can_manage_place(place_id) or public.app_can_manage_place_finance(place_id))
with check (public.app_can_manage_place(place_id) or public.app_can_manage_place_finance(place_id));

drop policy if exists place_credit_purchases_manager_read on public.place_credit_purchases;
create policy place_credit_purchases_manager_read
on public.place_credit_purchases
for select
to authenticated
using (public.app_can_manage_place(place_id) or public.app_can_manage_place_finance(place_id));

drop policy if exists place_credit_purchases_manager_write on public.place_credit_purchases;
create policy place_credit_purchases_manager_write
on public.place_credit_purchases
for all
to authenticated
using (public.app_can_manage_place(place_id) or public.app_can_manage_place_finance(place_id))
with check (public.app_can_manage_place(place_id) or public.app_can_manage_place_finance(place_id));

drop policy if exists place_academy_student_contracts_self_or_academy_read
  on public.place_academy_student_contracts;
create policy place_academy_student_contracts_self_or_academy_read
on public.place_academy_student_contracts
for select
to authenticated
using (
  user_id = auth.uid()
  or lower(coalesce(invite_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.app_can_manage_place_academy(place_id)
  or public.app_can_manage_place_finance(place_id)
);

drop policy if exists place_academy_enrollments_finance_read on public.place_academy_enrollments;
create policy place_academy_enrollments_finance_read
on public.place_academy_enrollments
for select
to authenticated
using (public.app_can_manage_place_finance(place_id));

drop policy if exists place_academy_lesson_requests_finance_read on public.place_academy_lesson_requests;
create policy place_academy_lesson_requests_finance_read
on public.place_academy_lesson_requests
for select
to authenticated
using (public.app_can_manage_place_finance(place_id));
