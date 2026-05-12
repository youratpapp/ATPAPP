-- Academy payment pricing v1
-- Date: 2026-05-11

alter table public.place_academy_classes
  add column if not exists monthly_fee_cents integer not null default 0
  check (monthly_fee_cents >= 0);

drop policy if exists app_payments_academy_manager_read on public.app_payments;
create policy app_payments_academy_manager_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'academy_enrollment'
  and exists (
    select 1
    from public.place_academy_enrollments e
    where e.id = target_id
      and public.app_can_manage_place(e.place_id)
  )
);
