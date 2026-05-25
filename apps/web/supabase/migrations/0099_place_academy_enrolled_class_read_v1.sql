drop policy if exists place_academy_classes_enrolled_student_read
  on public.place_academy_classes;

create policy place_academy_classes_enrolled_student_read
on public.place_academy_classes
for select
to authenticated
using (
  exists (
    select 1
    from public.place_academy_enrollments e
    where e.class_id = place_academy_classes.id
      and e.user_id = auth.uid()
      and e.status <> 'cancelled'
  )
);
