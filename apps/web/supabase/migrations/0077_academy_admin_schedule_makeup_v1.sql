-- Academy admin schedule makeup credit
-- Date: 2026-05-14
-- Lets academy operators schedule a specific student's open makeup credit without depending on the student's session.

create or replace function public.app_admin_schedule_academy_makeup_credit(
  p_place_id uuid,
  p_credit_id uuid,
  p_class_id uuid,
  p_requested_on date,
  p_notes text default null
)
returns table(
  id uuid,
  place_id uuid,
  class_id uuid,
  absence_id uuid,
  makeup_credit_id uuid,
  requested_by uuid,
  requested_on date,
  request_type text,
  player_name text,
  phone text,
  email text,
  age integer,
  level_label text,
  notes text,
  status text,
  payment_status text,
  amount_cents integer,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_credit public.place_academy_makeup_credits%rowtype;
  v_class public.place_academy_classes%rowtype;
  v_enrollment public.place_academy_enrollments%rowtype;
  v_available integer;
  v_absence_id uuid;
  v_request public.place_academy_lesson_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'nao autenticado';
  end if;

  if not public.app_can_manage_place_academy(p_place_id) then
    raise exception 'nao autorizado';
  end if;

  select *
    into v_credit
  from public.place_academy_makeup_credits m
  where m.id = p_credit_id
    and m.place_id = p_place_id
  for update;

  if v_credit.id is null then
    raise exception 'reposicao nao encontrada';
  end if;

  if v_credit.status <> 'open' then
    raise exception 'reposicao indisponivel';
  end if;

  if exists (
    select 1
    from public.place_academy_lesson_requests r
    where r.makeup_credit_id = p_credit_id
      and r.status in ('pending', 'approved')
  ) then
    raise exception 'reposicao ja possui solicitacao ativa';
  end if;

  select *
    into v_enrollment
  from public.place_academy_enrollments e
  where e.id = v_credit.enrollment_id
    and e.place_id = p_place_id;

  if v_enrollment.id is null then
    raise exception 'matricula da reposicao nao encontrada';
  end if;

  select *
    into v_class
  from public.place_academy_classes c
  where c.id = p_class_id
    and c.place_id = p_place_id
    and c.is_active = true;

  if v_class.id is null then
    raise exception 'turma indisponivel';
  end if;

  if extract(dow from p_requested_on)::integer <> v_class.weekday then
    raise exception 'data nao corresponde ao dia da turma';
  end if;

  select s.available_spots
    into v_available
  from public.app_search_academy_lesson_fit_slots(
    p_place_id,
    p_requested_on,
    null,
    null,
    null,
    null,
    null
  ) s
  where s.class_id = p_class_id;

  if coalesce(v_available, 0) <= 0 then
    raise exception 'turma sem vaga para reposicao nesta data';
  end if;

  select a.id
    into v_absence_id
  from public.place_academy_planned_absences a
  where a.class_id = p_class_id
    and a.absence_on = p_requested_on
    and a.status = 'open'
  order by a.created_at asc
  limit 1;

  insert into public.place_academy_lesson_requests (
    place_id,
    class_id,
    absence_id,
    makeup_credit_id,
    requested_by,
    requested_on,
    request_type,
    player_name,
    phone,
    email,
    age,
    level_label,
    notes,
    status,
    payment_status,
    amount_cents,
    approved_by,
    approved_at
  )
  values (
    p_place_id,
    p_class_id,
    v_absence_id,
    p_credit_id,
    v_credit.user_id,
    p_requested_on,
    'makeup',
    v_enrollment.player_name,
    nullif(trim(coalesce(v_enrollment.phone, '')), ''),
    null,
    null,
    nullif(trim(coalesce(v_class.level, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    'approved',
    'waived',
    0,
    auth.uid(),
    now()
  )
  returning *
    into v_request;

  update public.place_academy_makeup_credits
  set status = 'used',
      used_at = now(),
      updated_at = now()
  where id = p_credit_id
    and status = 'open';

  if not found then
    raise exception 'reposicao indisponivel';
  end if;

  if v_absence_id is not null then
    update public.place_academy_planned_absences
    set status = 'used',
        updated_at = now()
    where id = v_absence_id
      and status = 'open';
  end if;

  return query
  select
    v_request.id,
    v_request.place_id,
    v_request.class_id,
    v_request.absence_id,
    v_request.makeup_credit_id,
    v_request.requested_by,
    v_request.requested_on,
    v_request.request_type,
    v_request.player_name,
    v_request.phone,
    v_request.email,
    v_request.age,
    v_request.level_label,
    v_request.notes,
    v_request.status,
    v_request.payment_status,
    v_request.amount_cents,
    v_request.approved_by,
    v_request.approved_at,
    v_request.created_at,
    v_request.updated_at;
end;
$$;

revoke all on function public.app_admin_schedule_academy_makeup_credit(
  uuid,
  uuid,
  uuid,
  date,
  text
) from public;

grant execute on function public.app_admin_schedule_academy_makeup_credit(
  uuid,
  uuid,
  uuid,
  date,
  text
) to authenticated;
