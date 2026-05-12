-- Academy lesson fit requests v1
-- Date: 2026-05-12

create table if not exists public.place_academy_lesson_requests (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  class_id uuid not null references public.place_academy_classes(id) on delete cascade,
  absence_id uuid references public.place_academy_planned_absences(id) on delete set null,
  makeup_credit_id uuid references public.place_academy_makeup_credits(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null default auth.uid(),
  requested_on date not null,
  request_type text not null default 'drop_in' check (request_type in ('makeup', 'drop_in')),
  player_name text not null,
  phone text,
  email text,
  age integer,
  level_label text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'waived')),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_academy_lesson_requests_place_status
  on public.place_academy_lesson_requests(place_id, status, requested_on, created_at desc);

create index if not exists idx_place_academy_lesson_requests_requested_by
  on public.place_academy_lesson_requests(requested_by, requested_on desc);

drop trigger if exists place_academy_lesson_requests_set_updated_at
  on public.place_academy_lesson_requests;
create trigger place_academy_lesson_requests_set_updated_at
  before update on public.place_academy_lesson_requests
  for each row execute function public.tg_set_updated_at();

alter table public.place_academy_lesson_requests enable row level security;

drop policy if exists place_academy_lesson_requests_self_or_academy_read
  on public.place_academy_lesson_requests;
create policy place_academy_lesson_requests_self_or_academy_read
on public.place_academy_lesson_requests
for select
to authenticated
using (requested_by = auth.uid() or public.app_can_manage_place_academy(place_id));

drop policy if exists place_academy_lesson_requests_self_insert
  on public.place_academy_lesson_requests;
create policy place_academy_lesson_requests_self_insert
on public.place_academy_lesson_requests
for insert
to authenticated
with check (requested_by = auth.uid());

drop policy if exists place_academy_lesson_requests_self_or_academy_update
  on public.place_academy_lesson_requests;
create policy place_academy_lesson_requests_self_or_academy_update
on public.place_academy_lesson_requests
for update
to authenticated
using (requested_by = auth.uid() or public.app_can_manage_place_academy(place_id))
with check (requested_by = auth.uid() or public.app_can_manage_place_academy(place_id));

create or replace function public.app_search_academy_lesson_fit_slots(
  p_place_id uuid,
  p_requested_on date,
  p_level text default null,
  p_period text default null,
  p_coach_id uuid default null,
  p_age integer default null,
  p_gender_scope text default null
)
returns table(
  class_id uuid,
  place_id uuid,
  title text,
  coach_id uuid,
  coach_name text,
  court_id uuid,
  weekday integer,
  starts_at time,
  ends_at time,
  level text,
  gender_scope text,
  age_group text,
  min_age integer,
  max_age integer,
  capacity integer,
  active_enrollments integer,
  open_absences integer,
  approved_requests integer,
  available_spots integer,
  monthly_fee_cents integer
)
language sql
security definer
set search_path = public
stable
as $$
  with scoped as (
    select
      c.*,
      (
        select count(*)::integer
        from public.place_academy_enrollments e
        where e.class_id = c.id
          and e.status = 'active'
      ) as active_enrollments,
      (
        select count(*)::integer
        from public.place_academy_planned_absences a
        where a.class_id = c.id
          and a.absence_on = p_requested_on
          and a.status = 'open'
      ) as open_absences,
      (
        select count(*)::integer
        from public.place_academy_lesson_requests r
        where r.class_id = c.id
          and r.requested_on = p_requested_on
          and r.status = 'approved'
      ) as approved_requests
    from public.place_academy_classes c
    where c.place_id = p_place_id
      and c.is_active = true
      and c.weekday = extract(dow from p_requested_on)::integer
      and exists (select 1 from public.places p where p.id = c.place_id)
      and (p_coach_id is null or c.coach_id = p_coach_id)
      and (nullif(trim(coalesce(p_level, '')), '') is null or lower(coalesce(c.level, '')) like '%' || lower(trim(p_level)) || '%')
      and (nullif(trim(coalesce(p_gender_scope, '')), '') is null or c.gender_scope in ('mixed', trim(p_gender_scope)))
      and (p_age is null or (c.min_age is null or c.min_age <= p_age) and (c.max_age is null or c.max_age >= p_age))
      and (
        nullif(trim(coalesce(p_period, '')), '') is null
        or (trim(p_period) = 'morning' and c.starts_at < time '12:00')
        or (trim(p_period) = 'afternoon' and c.starts_at >= time '12:00' and c.starts_at < time '18:00')
        or (trim(p_period) = 'night' and c.starts_at >= time '18:00')
      )
  )
  select
    scoped.id,
    scoped.place_id,
    scoped.title,
    scoped.coach_id,
    scoped.coach_name,
    scoped.court_id,
    scoped.weekday,
    scoped.starts_at,
    scoped.ends_at,
    scoped.level,
    scoped.gender_scope,
    scoped.age_group,
    scoped.min_age,
    scoped.max_age,
    scoped.capacity,
    scoped.active_enrollments,
    scoped.open_absences,
    scoped.approved_requests,
    greatest(0, scoped.capacity - scoped.active_enrollments + scoped.open_absences - scoped.approved_requests)::integer as available_spots,
    scoped.monthly_fee_cents
  from scoped
  where greatest(0, scoped.capacity - scoped.active_enrollments + scoped.open_absences - scoped.approved_requests) > 0
  order by scoped.starts_at asc, scoped.title asc;
$$;

create or replace function public.app_request_academy_lesson_fit(
  p_place_id uuid,
  p_class_id uuid,
  p_requested_on date,
  p_request_type text default 'drop_in',
  p_player_name text default null,
  p_phone text default null,
  p_email text default null,
  p_age integer default null,
  p_level text default null,
  p_notes text default null,
  p_makeup_credit_id uuid default null
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
  v_class public.place_academy_classes%rowtype;
  v_type text;
  v_available integer;
  v_absence_id uuid;
  v_amount integer;
begin
  if auth.uid() is null then
    raise exception 'nao autenticado';
  end if;

  select *
    into v_class
  from public.place_academy_classes c
  where c.id = p_class_id
    and c.place_id = p_place_id
    and c.is_active = true;

  if v_class.id is null then
    raise exception 'turma nao encontrada';
  end if;

  if extract(dow from p_requested_on)::integer <> v_class.weekday then
    raise exception 'data nao corresponde ao dia da turma';
  end if;

  v_type := case when p_request_type = 'makeup' then 'makeup' else 'drop_in' end;

  select s.available_spots
    into v_available
  from public.app_search_academy_lesson_fit_slots(
    p_place_id,
    p_requested_on,
    null,
    null,
    null,
    p_age,
    null
  ) s
  where s.class_id = p_class_id;

  if coalesce(v_available, 0) <= 0 then
    raise exception 'turma sem vaga para encaixe nesta data';
  end if;

  select a.id
    into v_absence_id
  from public.place_academy_planned_absences a
  where a.class_id = p_class_id
    and a.absence_on = p_requested_on
    and a.status = 'open'
  order by a.created_at asc
  limit 1;

  if v_type = 'makeup' and p_makeup_credit_id is not null then
    if not exists (
      select 1
      from public.place_academy_makeup_credits m
      where m.id = p_makeup_credit_id
        and m.place_id = p_place_id
        and m.status = 'open'
        and (m.user_id is null or m.user_id = auth.uid() or public.app_can_manage_place_academy(m.place_id))
    ) then
      raise exception 'reposicao indisponivel';
    end if;
  end if;

  v_amount := case when v_type = 'makeup' then 0 else greatest(0, coalesce(v_class.monthly_fee_cents, 0) / 4) end;

  return query
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
    payment_status,
    amount_cents
  )
  values (
    p_place_id,
    p_class_id,
    v_absence_id,
    p_makeup_credit_id,
    auth.uid(),
    p_requested_on,
    v_type,
    coalesce(nullif(trim(coalesce(p_player_name, '')), ''), 'Aluno'),
    nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_email, '')), ''),
    p_age,
    nullif(trim(coalesce(p_level, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    case when v_type = 'makeup' then 'waived' else 'pending' end,
    v_amount
  )
  returning
    place_academy_lesson_requests.id,
    place_academy_lesson_requests.place_id,
    place_academy_lesson_requests.class_id,
    place_academy_lesson_requests.absence_id,
    place_academy_lesson_requests.makeup_credit_id,
    place_academy_lesson_requests.requested_by,
    place_academy_lesson_requests.requested_on,
    place_academy_lesson_requests.request_type,
    place_academy_lesson_requests.player_name,
    place_academy_lesson_requests.phone,
    place_academy_lesson_requests.email,
    place_academy_lesson_requests.age,
    place_academy_lesson_requests.level_label,
    place_academy_lesson_requests.notes,
    place_academy_lesson_requests.status,
    place_academy_lesson_requests.payment_status,
    place_academy_lesson_requests.amount_cents,
    place_academy_lesson_requests.approved_by,
    place_academy_lesson_requests.approved_at,
    place_academy_lesson_requests.created_at,
    place_academy_lesson_requests.updated_at;
end;
$$;

create or replace function public.app_update_academy_lesson_request_status(
  p_request_id uuid,
  p_status text,
  p_payment_status text default null
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
  v_request public.place_academy_lesson_requests%rowtype;
  v_status text;
  v_payment_status text;
begin
  select *
    into v_request
  from public.place_academy_lesson_requests r
  where r.id = p_request_id;

  if v_request.id is null then
    raise exception 'solicitacao nao encontrada';
  end if;

  if not public.app_can_manage_place_academy(v_request.place_id) then
    raise exception 'nao autorizado';
  end if;

  v_status := case when p_status in ('approved', 'rejected', 'cancelled') then p_status else 'pending' end;
  v_payment_status := case
    when p_payment_status in ('paid', 'waived') then p_payment_status
    when v_request.request_type = 'makeup' and v_status = 'approved' then 'waived'
    else v_request.payment_status
  end;

  update public.place_academy_lesson_requests
  set
    status = v_status,
    payment_status = v_payment_status,
    approved_by = case when v_status = 'approved' then auth.uid() else approved_by end,
    approved_at = case when v_status = 'approved' then now() else approved_at end,
    updated_at = now()
  where place_academy_lesson_requests.id = p_request_id
  returning *
    into v_request;

  if v_status = 'approved' and v_request.absence_id is not null then
    update public.place_academy_planned_absences
    set status = 'used',
        updated_at = now()
    where id = v_request.absence_id
      and status = 'open';
  end if;

  if v_status = 'approved' and v_request.makeup_credit_id is not null then
    update public.place_academy_makeup_credits
    set status = 'used',
        used_at = now(),
        updated_at = now()
    where id = v_request.makeup_credit_id
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
    update public.place_academy_lesson_requests
    set payment_status = 'paid',
        updated_at = now()
    where id = p_target_id;
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

drop policy if exists app_payments_academy_lesson_request_finance_read on public.app_payments;
create policy app_payments_academy_lesson_request_finance_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'academy_lesson_request'
  and exists (
    select 1
    from public.place_academy_lesson_requests r
    where r.id = target_id
      and public.app_can_manage_place_finance(r.place_id)
  )
);

revoke all on function public.app_search_academy_lesson_fit_slots(uuid, date, text, text, uuid, integer, text) from public;
grant execute on function public.app_search_academy_lesson_fit_slots(uuid, date, text, text, uuid, integer, text) to authenticated;

revoke all on function public.app_request_academy_lesson_fit(uuid, uuid, date, text, text, text, text, integer, text, text, uuid) from public;
grant execute on function public.app_request_academy_lesson_fit(uuid, uuid, date, text, text, text, text, integer, text, text, uuid) to authenticated;

revoke all on function public.app_update_academy_lesson_request_status(uuid, text, text) from public;
grant execute on function public.app_update_academy_lesson_request_status(uuid, text, text) to authenticated;

revoke all on function public.app_mark_stub_payment_paid_for_participant(text, uuid, integer, text, jsonb, text) from public;
grant execute on function public.app_mark_stub_payment_paid_for_participant(text, uuid, integer, text, jsonb, text) to authenticated;
