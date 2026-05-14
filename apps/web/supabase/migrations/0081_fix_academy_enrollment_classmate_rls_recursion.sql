-- Fix academy enrollment classmate RLS recursion
-- Date: 2026-05-14
--
-- The old classmate policy queried place_academy_enrollments from inside a
-- policy on the same table, which triggers Postgres infinite RLS recursion.

create or replace function public.app_user_has_active_academy_enrollment(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.place_academy_enrollments e
    where e.class_id = p_class_id
      and e.user_id = auth.uid()
      and e.status = 'active'
  );
$$;

revoke all on function public.app_user_has_active_academy_enrollment(uuid) from public;
grant execute on function public.app_user_has_active_academy_enrollment(uuid) to authenticated;

drop policy if exists place_academy_enrollments_classmate_read
  on public.place_academy_enrollments;

create policy place_academy_enrollments_classmate_read
on public.place_academy_enrollments
for select
using (
  status = 'active'
  and public.app_user_has_active_academy_enrollment(class_id)
);
