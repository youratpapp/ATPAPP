-- Academy student contracts: one student/user can have one weekly plan with multiple class enrollments.

create or replace function public.app_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table if not exists public.place_academy_student_contracts (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id),
  user_id uuid references auth.users(id),
  invite_email text,
  student_name text not null,
  phone text,
  status text not null default 'pending'
    check (status = any (array['pending'::text, 'active'::text, 'cancelled'::text])),
  weekly_lessons_count integer not null default 1
    check (weekly_lessons_count >= 1 and weekly_lessons_count <= 14),
  monthly_fee_cents integer not null default 0
    check (monthly_fee_cents >= 0),
  starts_on date not null default current_date,
  ends_on date,
  notes text,
  created_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint place_academy_student_contracts_dates_check
    check (ends_on is null or ends_on >= starts_on),
  constraint place_academy_student_contracts_identity_check
    check (user_id is not null or nullif(trim(coalesce(invite_email, '')), '') is not null)
);

create index if not exists idx_place_academy_student_contracts_place
  on public.place_academy_student_contracts(place_id, status, student_name);

create index if not exists idx_place_academy_student_contracts_user
  on public.place_academy_student_contracts(user_id, status, created_at desc);

create unique index if not exists uq_place_academy_student_contracts_active_user
  on public.place_academy_student_contracts(place_id, user_id)
  where user_id is not null and status in ('pending', 'active');

create unique index if not exists uq_place_academy_student_contracts_active_invite
  on public.place_academy_student_contracts(place_id, lower(invite_email))
  where invite_email is not null and status in ('pending', 'active');

drop trigger if exists place_academy_student_contracts_set_updated_at
  on public.place_academy_student_contracts;
create trigger place_academy_student_contracts_set_updated_at
  before update on public.place_academy_student_contracts
  for each row execute function public.app_set_updated_at();

alter table public.place_academy_student_contracts enable row level security;

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
);

drop policy if exists place_academy_student_contracts_academy_insert
  on public.place_academy_student_contracts;
create policy place_academy_student_contracts_academy_insert
on public.place_academy_student_contracts
for insert
to authenticated
with check (public.app_can_manage_place_academy(place_id));

drop policy if exists place_academy_student_contracts_academy_update
  on public.place_academy_student_contracts;
create policy place_academy_student_contracts_academy_update
on public.place_academy_student_contracts
for update
to authenticated
using (public.app_can_manage_place_academy(place_id))
with check (public.app_can_manage_place_academy(place_id));

alter table public.place_academy_enrollments
  add column if not exists contract_id uuid references public.place_academy_student_contracts(id) on delete set null;

create index if not exists idx_place_academy_enrollments_contract
  on public.place_academy_enrollments(contract_id, status);

create table if not exists public.place_academy_settings (
  place_id uuid primary key references public.places(id),
  makeup_notice_hours integer not null default 12
    check (makeup_notice_hours >= 0 and makeup_notice_hours <= 168),
  auto_create_makeup_credit_on_notice boolean not null default true,
  updated_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists place_academy_settings_set_updated_at
  on public.place_academy_settings;
create trigger place_academy_settings_set_updated_at
  before update on public.place_academy_settings
  for each row execute function public.app_set_updated_at();

alter table public.place_academy_settings enable row level security;

drop policy if exists place_academy_settings_authenticated_read
  on public.place_academy_settings;
create policy place_academy_settings_authenticated_read
on public.place_academy_settings
for select
to authenticated
using (true);

drop policy if exists place_academy_settings_academy_upsert
  on public.place_academy_settings;
create policy place_academy_settings_academy_upsert
on public.place_academy_settings
for all
to authenticated
using (public.app_can_manage_place_academy(place_id))
with check (public.app_can_manage_place_academy(place_id));

alter table public.place_academy_makeup_credits
  add column if not exists source_absence_id uuid references public.place_academy_planned_absences(id) on delete set null;

create unique index if not exists uq_place_academy_makeup_source_absence
  on public.place_academy_makeup_credits(source_absence_id)
  where source_absence_id is not null;

create or replace function public.app_create_academy_student_contract(
  p_place_id uuid,
  p_student_name text,
  p_email text,
  p_phone text default null,
  p_weekly_lessons_count integer default 1,
  p_monthly_fee_cents integer default 0,
  p_starts_on date default current_date,
  p_notes text default null,
  p_class_ids uuid[] default '{}'::uuid[],
  p_status text default 'active'
)
returns table(
  id uuid,
  place_id uuid,
  user_id uuid,
  invite_email text,
  student_name text,
  phone text,
  status text,
  weekly_lessons_count integer,
  monthly_fee_cents integer,
  starts_on date,
  ends_on date,
  notes text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
#variable_conflict use_column
declare
  v_email text;
  v_status text;
  v_user_id uuid;
  v_contract_id uuid;
  v_distinct_class_count integer;
  v_valid_class_count integer;
  v_class_id uuid;
begin
  if not public.app_can_manage_place_academy(p_place_id) then
    raise exception 'nao autorizado';
  end if;

  v_email := lower(nullif(trim(coalesce(p_email, '')), ''));

  if nullif(trim(coalesce(p_student_name, '')), '') is null then
    raise exception 'nome do aluno obrigatorio';
  end if;

  if v_email is null then
    raise exception 'email do aluno obrigatorio para vinculo ou convite';
  end if;

  select u.id
    into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  v_status := case when p_status in ('pending', 'active', 'cancelled') then p_status else 'active' end;

  select count(*)
    into v_distinct_class_count
  from (select distinct unnest(coalesce(p_class_ids, '{}'::uuid[])) as class_id) selected
  where selected.class_id is not null;

  if coalesce(v_distinct_class_count, 0) < 1 then
    raise exception 'selecione pelo menos um horario da grade';
  end if;

  select count(*)
    into v_valid_class_count
  from (
    select distinct unnest(coalesce(p_class_ids, '{}'::uuid[])) as class_id
  ) selected
  join public.place_academy_classes c on c.id = selected.class_id
  where c.place_id = p_place_id
    and c.is_active = true;

  if v_valid_class_count <> v_distinct_class_count then
    raise exception 'uma ou mais turmas nao pertencem a academia ou estao inativas';
  end if;

  insert into public.place_academy_student_contracts (
    place_id,
    user_id,
    invite_email,
    student_name,
    phone,
    status,
    weekly_lessons_count,
    monthly_fee_cents,
    starts_on,
    notes,
    created_by
  )
  values (
    p_place_id,
    v_user_id,
    case when v_user_id is null then v_email else null end,
    trim(p_student_name),
    nullif(trim(coalesce(p_phone, '')), ''),
    v_status,
    greatest(1, least(14, coalesce(p_weekly_lessons_count, 1))),
    greatest(0, coalesce(p_monthly_fee_cents, 0)),
    coalesce(p_starts_on, current_date),
    nullif(trim(coalesce(p_notes, '')), ''),
    auth.uid()
  )
  returning place_academy_student_contracts.id into v_contract_id;

  for v_class_id in
    select selected.class_id
    from (select distinct unnest(coalesce(p_class_ids, '{}'::uuid[])) as class_id) selected
    where selected.class_id is not null
  loop
    insert into public.place_academy_enrollments (
      place_id,
      class_id,
      contract_id,
      user_id,
      player_name,
      phone,
      status,
      notes,
      source
    )
    values (
      p_place_id,
      v_class_id,
      v_contract_id,
      v_user_id,
      trim(p_student_name),
      nullif(trim(coalesce(p_phone, '')), ''),
      v_status,
      nullif(trim(coalesce(p_notes, '')), ''),
      case when v_user_id is null then 'admin' else 'linked' end
    );
  end loop;

  return query
  select
    c.id,
    c.place_id,
    c.user_id,
    c.invite_email,
    c.student_name,
    c.phone,
    c.status,
    c.weekly_lessons_count,
    c.monthly_fee_cents,
    c.starts_on,
    c.ends_on,
    c.notes,
    c.created_by,
    c.created_at,
    c.updated_at
  from public.place_academy_student_contracts c
  where c.id = v_contract_id;
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

create or replace function public.app_create_payment_reminder_for_participant(
  p_target_type text,
  p_target_id uuid,
  p_billing_period text default '',
  p_message text default null,
  p_channel text default 'manual'
)
returns table(
  id uuid,
  place_id uuid,
  user_id uuid,
  target_type text,
  target_id uuid,
  billing_period text,
  channel text,
  status text,
  message text,
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
  v_place_id uuid;
  v_user_id uuid;
  v_message text;
  v_channel text;
begin
  if auth.uid() is null then
    raise exception 'nao autenticado';
  end if;

  v_target_type := trim(coalesce(p_target_type, ''));
  v_channel := case when p_channel in ('whatsapp', 'email', 'push') then p_channel else 'manual' end;

  if v_target_type = 'academy_enrollment' then
    select e.place_id, e.user_id
      into v_place_id, v_user_id
    from public.place_academy_enrollments e
    where e.id = p_target_id;
  elsif v_target_type = 'academy_student_contract' then
    select c.place_id, c.user_id
      into v_place_id, v_user_id
    from public.place_academy_student_contracts c
    where c.id = p_target_id;
  elsif v_target_type = 'place_membership' then
    select m.place_id, m.user_id
      into v_place_id, v_user_id
    from public.place_memberships m
    where m.id = p_target_id;
  elsif v_target_type = 'court_booking' then
    select b.place_id, b.user_id
      into v_place_id, v_user_id
    from public.court_bookings b
    where b.id = p_target_id;
  else
    raise exception 'tipo de cobranca invalido';
  end if;

  if v_place_id is null or v_user_id is null or not public.app_can_manage_place_finance(v_place_id) then
    raise exception 'nao autorizado';
  end if;

  v_message := coalesce(nullif(trim(coalesce(p_message, '')), ''), 'Pagamento pendente. Regularize para manter sua participacao ativa.');

  return query
  insert into public.app_payment_reminders (
    place_id,
    user_id,
    target_type,
    target_id,
    billing_period,
    channel,
    message,
    created_by
  )
  values (
    v_place_id,
    v_user_id,
    v_target_type,
    p_target_id,
    coalesce(nullif(trim(coalesce(p_billing_period, '')), ''), ''),
    v_channel,
    v_message,
    auth.uid()
  )
  returning
    app_payment_reminders.id,
    app_payment_reminders.place_id,
    app_payment_reminders.user_id,
    app_payment_reminders.target_type,
    app_payment_reminders.target_id,
    app_payment_reminders.billing_period,
    app_payment_reminders.channel,
    app_payment_reminders.status,
    app_payment_reminders.message,
    app_payment_reminders.created_at,
    app_payment_reminders.updated_at;
end;
$$;

drop policy if exists app_payments_academy_student_contract_finance_read on public.app_payments;
create policy app_payments_academy_student_contract_finance_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'academy_student_contract'
  and exists (
    select 1
    from public.place_academy_student_contracts c
    where c.id = target_id
      and (c.user_id = auth.uid() or public.app_can_manage_place_finance(c.place_id))
  )
);

drop policy if exists app_payment_reminders_academy_student_contract_read on public.app_payment_reminders;
create policy app_payment_reminders_academy_student_contract_read
on public.app_payment_reminders
for select
to authenticated
using (
  target_type = 'academy_student_contract'
  and exists (
    select 1
    from public.place_academy_student_contracts c
    where c.id = target_id
      and (c.user_id = auth.uid() or public.app_can_manage_place_finance(c.place_id))
  )
);

revoke all on function public.app_create_academy_student_contract(
  uuid,
  text,
  text,
  text,
  integer,
  integer,
  date,
  text,
  uuid[],
  text
) from public;
grant execute on function public.app_create_academy_student_contract(
  uuid,
  text,
  text,
  text,
  integer,
  integer,
  date,
  text,
  uuid[],
  text
) to authenticated;

revoke all on function public.app_mark_stub_payment_paid_for_participant(text, uuid, integer, text, jsonb, text) from public;
grant execute on function public.app_mark_stub_payment_paid_for_participant(text, uuid, integer, text, jsonb, text) to authenticated;

revoke all on function public.app_create_payment_reminder_for_participant(text, uuid, text, text, text) from public;
grant execute on function public.app_create_payment_reminder_for_participant(text, uuid, text, text, text) to authenticated;
