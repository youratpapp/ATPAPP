-- Place memberships v1
-- Date: 2026-05-12

create table if not exists public.place_membership_plans (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  name text not null,
  monthly_fee_cents integer not null default 0 check (monthly_fee_cents >= 0),
  court_discount_percent integer not null default 0 check (court_discount_percent between 0 and 100),
  academy_discount_percent integer not null default 0 check (academy_discount_percent between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_membership_plans_place
  on public.place_membership_plans(place_id, is_active, created_at desc);

drop trigger if exists place_membership_plans_set_updated_at
  on public.place_membership_plans;
create trigger place_membership_plans_set_updated_at
  before update on public.place_membership_plans
  for each row execute function public.tg_set_updated_at();

alter table public.place_membership_plans enable row level security;

drop policy if exists place_membership_plans_read on public.place_membership_plans;
create policy place_membership_plans_read
on public.place_membership_plans
for select
to authenticated
using (is_active = true or public.app_can_manage_place(place_id));

drop policy if exists place_membership_plans_manager_insert on public.place_membership_plans;
create policy place_membership_plans_manager_insert
on public.place_membership_plans
for insert
to authenticated
with check (public.app_can_manage_place(place_id));

drop policy if exists place_membership_plans_manager_update on public.place_membership_plans;
create policy place_membership_plans_manager_update
on public.place_membership_plans
for update
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

create table if not exists public.place_memberships (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  plan_id uuid references public.place_membership_plans(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_name text not null,
  phone text,
  status text not null default 'pending' check (status in ('pending', 'active', 'cancelled')),
  starts_on date not null default current_date,
  ends_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_place_memberships_open_user
  on public.place_memberships(place_id, user_id)
  where status in ('pending', 'active');

create index if not exists idx_place_memberships_place
  on public.place_memberships(place_id, status, created_at desc);

create index if not exists idx_place_memberships_user
  on public.place_memberships(user_id, status, created_at desc);

drop trigger if exists place_memberships_set_updated_at
  on public.place_memberships;
create trigger place_memberships_set_updated_at
  before update on public.place_memberships
  for each row execute function public.tg_set_updated_at();

alter table public.place_memberships enable row level security;

drop policy if exists place_memberships_self_or_manager_read on public.place_memberships;
create policy place_memberships_self_or_manager_read
on public.place_memberships
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place(place_id));

drop policy if exists place_memberships_self_insert on public.place_memberships;
create policy place_memberships_self_insert
on public.place_memberships
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists place_memberships_self_or_manager_update on public.place_memberships;
create policy place_memberships_self_or_manager_update
on public.place_memberships
for update
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place(place_id))
with check (user_id = auth.uid() or public.app_can_manage_place(place_id));

create or replace function public.app_request_place_membership(
  p_place_id uuid,
  p_plan_id uuid,
  p_member_name text,
  p_phone text default null,
  p_notes text default null
)
returns table(
  id uuid,
  place_id uuid,
  plan_id uuid,
  user_id uuid,
  member_name text,
  phone text,
  status text,
  starts_on date,
  ends_on date,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_plan public.place_membership_plans%rowtype;
begin
  if auth.uid() is null then
    raise exception 'nao autenticado';
  end if;

  select *
    into v_plan
  from public.place_membership_plans
  where id = p_plan_id
    and place_id = p_place_id
    and is_active = true;

  if v_plan.id is null then
    raise exception 'plano indisponivel';
  end if;

  if exists (
    select 1
    from public.place_memberships m
    where m.place_id = p_place_id
      and m.user_id = auth.uid()
      and m.status in ('pending', 'active')
  ) then
    raise exception 'voce ja possui solicitacao ou plano ativo neste local';
  end if;

  return query
  insert into public.place_memberships (
    place_id,
    plan_id,
    user_id,
    member_name,
    phone,
    notes
  )
  values (
    p_place_id,
    p_plan_id,
    auth.uid(),
    coalesce(nullif(trim(p_member_name), ''), 'Jogador'),
    nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning
    place_memberships.id,
    place_memberships.place_id,
    place_memberships.plan_id,
    place_memberships.user_id,
    place_memberships.member_name,
    place_memberships.phone,
    place_memberships.status,
    place_memberships.starts_on,
    place_memberships.ends_on,
    place_memberships.notes,
    place_memberships.created_at,
    place_memberships.updated_at;
end;
$$;

revoke all on function public.app_request_place_membership(uuid, uuid, text, text, text) from public;
grant execute on function public.app_request_place_membership(uuid, uuid, text, text, text) to authenticated;

create or replace function public.app_update_place_membership_status(
  p_membership_id uuid,
  p_status text
)
returns table(
  id uuid,
  place_id uuid,
  plan_id uuid,
  user_id uuid,
  member_name text,
  phone text,
  status text,
  starts_on date,
  ends_on date,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_membership public.place_memberships%rowtype;
  v_status text;
begin
  select *
    into v_membership
  from public.place_memberships
  where id = p_membership_id;

  if v_membership.id is null or not public.app_can_manage_place(v_membership.place_id) then
    raise exception 'nao autorizado';
  end if;

  v_status := case
    when p_status = 'active' then 'active'
    when p_status = 'cancelled' then 'cancelled'
    else 'pending'
  end;

  return query
  update public.place_memberships m
  set
    status = v_status,
    starts_on = case when v_status = 'active' and m.starts_on is null then current_date else m.starts_on end,
    ends_on = case when v_status = 'cancelled' then current_date else null end,
    updated_at = now()
  where m.id = p_membership_id
  returning
    m.id,
    m.place_id,
    m.plan_id,
    m.user_id,
    m.member_name,
    m.phone,
    m.status,
    m.starts_on,
    m.ends_on,
    m.notes,
    m.created_at,
    m.updated_at;
end;
$$;

revoke all on function public.app_update_place_membership_status(uuid, text) from public;
grant execute on function public.app_update_place_membership_status(uuid, text) to authenticated;

drop policy if exists app_payments_membership_manager_read on public.app_payments;
create policy app_payments_membership_manager_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'place_membership'
  and exists (
    select 1
    from public.place_memberships m
    where m.id = target_id
      and public.app_can_manage_place(m.place_id)
  )
);

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
      and public.app_can_manage_place(e.place_id);
  elsif v_target_type = 'court_booking' then
    select b.user_id
      into v_user_id
    from public.court_bookings b
    where b.id = p_target_id
      and public.app_can_manage_place(b.place_id);
  elsif v_target_type = 'place_membership' then
    select m.user_id
      into v_user_id
    from public.place_memberships m
    where m.id = p_target_id
      and public.app_can_manage_place(m.place_id);
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
    'stub',
    nullif(trim(coalesce(p_description, '')), ''),
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object('marked_by', auth.uid()),
    v_period,
    now()
  )
  on conflict (target_type, target_id, user_id, billing_period)
  do update set
    amount_cents = excluded.amount_cents,
    currency = excluded.currency,
    status = 'paid',
    provider = 'stub',
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
