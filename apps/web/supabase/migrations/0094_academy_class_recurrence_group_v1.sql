alter table public.place_academy_classes
add column if not exists recurrence_group_id uuid;

update public.place_academy_classes
set recurrence_group_id = id
where recurrence_group_id is null;

create index if not exists place_academy_classes_recurrence_group_id_idx
on public.place_academy_classes (place_id, recurrence_group_id);
