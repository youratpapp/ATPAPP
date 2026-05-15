-- QA P0 fixes: tournament registration approval and Academy SQL ambiguity
-- Date: 2026-05-14

alter table public.tournament_registrations
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists uq_place_academy_planned_absence_enrollment_date
  on public.place_academy_planned_absences(enrollment_id, absence_on);

create unique index if not exists uq_place_academy_makeup_source_absence_full
  on public.place_academy_makeup_credits(source_absence_id);

create or replace function public.app_set_tournament_registration_status(
  p_tournament_id uuid,
  p_registration_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if p_status not in ('approved', 'waitlist', 'rejected') then
    raise exception 'status invalido';
  end if;

  if not public.app_can_manage_tournament_players(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  update public.tournament_registrations tr
     set status = p_status
   where tr.id = p_registration_id
     and tr.tournament_id = p_tournament_id
  returning tr.user_id into v_user_id;

  if v_user_id is null then
    raise exception 'inscricao nao encontrada';
  end if;

  if p_status = 'approved' then
    insert into public.tournament_members (tournament_id, user_id, role)
    values (p_tournament_id, v_user_id, 'participant')
    on conflict on constraint tournament_members_pkey
    do nothing;
  else
    delete from public.tournament_members tm
     where tm.tournament_id = p_tournament_id
       and tm.user_id = v_user_id
       and tm.role = 'participant';
  end if;
end;
$$;

revoke all on function public.app_set_tournament_registration_status(uuid, uuid, text) from public;
grant execute on function public.app_set_tournament_registration_status(uuid, uuid, text) to authenticated;

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
  select e.* into v_enrollment
  from public.place_academy_enrollments e
  where e.id = p_enrollment_id;

  if v_enrollment.id is null or v_enrollment.status <> 'active' then
    raise exception 'matricula indisponivel';
  end if;

  select c.* into v_class
  from public.place_academy_classes c
  where c.id = v_enrollment.class_id;

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

create or replace function public.app_mark_stub_payment_paid_for_participant(
  p_target_type text,
  p_target_id uuid,
  p_amount_cents integer default 0,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_billing_period text default ''
)
returns table(
  id uuid,
  user_id uuid,
  target_type text,
  target_id uuid,
  amount_cents integer,
  currency text,
  status text,
  provider text,
  description text,
  metadata jsonb,
  billing_period text,
  paid_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_target_type text;
  v_user_id uuid;
  v_period text;
begin
  if auth.uid() is null then
    raise exception 'nao autenticado';
  end if;

  v_target_type := trim(coalesce(p_target_type, ''));
  v_period := coalesce(nullif(trim(coalesce(p_billing_period, '')), ''), '');

  if v_target_type = 'academy_enrollment' then
    select e.user_id
      into v_user_id
    from public.place_academy_enrollments e
    where e.id = p_target_id
      and public.app_can_manage_place_finance(e.place_id);
  elsif v_target_type = 'academy_student_contract' then
    select c.user_id
      into v_user_id
    from public.place_academy_student_contracts c
    where c.id = p_target_id
      and public.app_can_manage_place_finance(c.place_id);
  elsif v_target_type = 'academy_lesson_request' then
    select r.requested_by
      into v_user_id
    from public.place_academy_lesson_requests r
    where r.id = p_target_id
      and public.app_can_manage_place_finance(r.place_id);
  elsif v_target_type = 'court_booking' then
    select b.user_id
      into v_user_id
    from public.court_bookings b
    where b.id = p_target_id
      and public.app_can_manage_place_bookings(b.place_id);
  elsif v_target_type = 'place_membership' then
    select m.user_id
      into v_user_id
    from public.place_memberships m
    where m.id = p_target_id
      and public.app_can_manage_place_finance(m.place_id);
  elsif v_target_type = 'tournament_registration' then
    select r.user_id
      into v_user_id
    from public.tournament_registrations r
    where r.id = p_target_id
      and public.app_is_tournament_owner(r.tournament_id);
  elsif v_target_type = 'league_registration' then
    select r.user_id
      into v_user_id
    from public.league_registrations r
    where r.id = p_target_id
      and public.app_is_league_owner(r.league_id);
  else
    raise exception 'tipo de pagamento invalido';
  end if;

  if v_user_id is null then
    raise exception 'pagamento nao autorizado ou alvo nao encontrado';
  end if;

  if v_target_type = 'academy_lesson_request' then
    update public.place_academy_lesson_requests lr
       set payment_status = 'paid',
           updated_at = now()
     where lr.id = p_target_id;
  end if;

  return query
  insert into public.app_payments (
    user_id,
    target_type,
    target_id,
    amount_cents,
    currency,
    status,
    provider,
    description,
    metadata,
    billing_period,
    paid_at
  )
  values (
    v_user_id,
    v_target_type,
    p_target_id,
    greatest(0, coalesce(p_amount_cents, 0)),
    'BRL',
    'paid',
    'manual',
    nullif(trim(coalesce(p_description, '')), ''),
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object('marked_by', auth.uid(), 'source', 'manual_offline'),
    v_period,
    now()
  )
  on conflict (target_type, target_id, user_id, billing_period)
  do update set
    amount_cents = excluded.amount_cents,
    currency = excluded.currency,
    status = 'paid',
    provider = 'manual',
    description = excluded.description,
    metadata = excluded.metadata,
    paid_at = now(),
    updated_at = now()
  returning
    app_payments.id,
    app_payments.user_id,
    app_payments.target_type,
    app_payments.target_id,
    app_payments.amount_cents,
    app_payments.currency,
    app_payments.status,
    app_payments.provider,
    app_payments.description,
    app_payments.metadata,
    app_payments.billing_period,
    app_payments.paid_at,
    app_payments.created_at,
    app_payments.updated_at;
end;
$$;

revoke all on function public.app_mark_stub_payment_paid_for_participant(text, uuid, integer, text, jsonb, text) from public;
grant execute on function public.app_mark_stub_payment_paid_for_participant(text, uuid, integer, text, jsonb, text) to authenticated;
