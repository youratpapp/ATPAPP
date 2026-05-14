create or replace function public.app_report_academy_absence(
  p_enrollment_id uuid,
  p_absence_on date,
  p_notes text default null
)
returns table(
  id uuid,
  place_id uuid,
  class_id uuid,
  enrollment_id uuid,
  user_id uuid,
  absence_on date,
  status text,
  notes text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_absence public.place_academy_planned_absences%rowtype;
  v_auto_create boolean := true;
  v_class public.place_academy_classes%rowtype;
  v_enrollment public.place_academy_enrollments%rowtype;
  v_lesson_starts_at timestamptz;
  v_notice_hours integer := 12;
begin
  select * into v_enrollment
  from public.place_academy_enrollments
  where id = p_enrollment_id;

  if v_enrollment.id is null or v_enrollment.status <> 'active' then
    raise exception 'matricula indisponivel';
  end if;

  select * into v_class
  from public.place_academy_classes
  where id = v_enrollment.class_id;

  if v_class.id is null or v_class.is_active is distinct from true then
    raise exception 'turma indisponivel';
  end if;

  if v_enrollment.user_id is distinct from auth.uid()
    and not public.app_can_manage_place_academy(v_enrollment.place_id) then
    raise exception 'nao autorizado';
  end if;

  if coalesce(v_class.allow_makeup, true) = false then
    raise exception 'reposicao desabilitada para esta turma';
  end if;

  if extract(dow from p_absence_on)::integer <> coalesce(v_class.weekday, extract(dow from p_absence_on)::integer) then
    raise exception 'data da ausencia nao corresponde ao dia da turma';
  end if;

  select
    coalesce(s.makeup_notice_hours, 12),
    coalesce(s.auto_create_makeup_credit_on_notice, true)
  into v_notice_hours, v_auto_create
  from public.place_academy_settings s
  where s.place_id = v_enrollment.place_id;

  v_lesson_starts_at := (p_absence_on::timestamp + v_class.starts_at)::timestamptz;

  insert into public.place_academy_planned_absences (
    place_id,
    class_id,
    enrollment_id,
    user_id,
    absence_on,
    status,
    notes,
    created_by
  )
  values (
    v_enrollment.place_id,
    v_enrollment.class_id,
    v_enrollment.id,
    v_enrollment.user_id,
    p_absence_on,
    'open',
    nullif(trim(coalesce(p_notes, '')), ''),
    auth.uid()
  )
  on conflict (enrollment_id, absence_on)
  do update set
    status = 'open',
    notes = excluded.notes,
    updated_at = now()
  returning * into v_absence;

  if v_auto_create and v_lesson_starts_at >= now() + make_interval(hours => greatest(0, v_notice_hours)) then
    insert into public.place_academy_makeup_credits (
      place_id,
      class_id,
      enrollment_id,
      user_id,
      source_absence_id,
      status,
      notes
    )
    values (
      v_absence.place_id,
      v_absence.class_id,
      v_absence.enrollment_id,
      v_absence.user_id,
      v_absence.id,
      'open',
      'Credito gerado por ausencia avisada com antecedencia.'
    )
    on conflict (source_absence_id)
    do update set
      status = case
        when public.place_academy_makeup_credits.status = 'cancelled' then 'open'
        else public.place_academy_makeup_credits.status
      end,
      notes = coalesce(public.place_academy_makeup_credits.notes, excluded.notes),
      updated_at = now();
  end if;

  return query
  select
    v_absence.id,
    v_absence.place_id,
    v_absence.class_id,
    v_absence.enrollment_id,
    v_absence.user_id,
    v_absence.absence_on,
    v_absence.status,
    v_absence.notes,
    v_absence.created_by,
    v_absence.created_at,
    v_absence.updated_at;
end;
$$;

revoke all on function public.app_report_academy_absence(uuid, date, text) from public;
grant execute on function public.app_report_academy_absence(uuid, date, text) to authenticated;
