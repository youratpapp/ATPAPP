-- Payment platform guardrails
-- Date: 2026-05-12

alter table public.app_payments
  alter column status set default 'pending';

drop policy if exists app_payments_booking_ops_read on public.app_payments;
create policy app_payments_booking_ops_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'court_booking'
  and exists (
    select 1
    from public.court_bookings b
    where b.id = target_id
      and public.app_can_manage_place_bookings(b.place_id)
  )
);

drop policy if exists app_payments_academy_finance_read on public.app_payments;
create policy app_payments_academy_finance_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'academy_enrollment'
  and exists (
    select 1
    from public.place_academy_enrollments e
    where e.id = target_id
      and public.app_can_manage_place_finance(e.place_id)
  )
);

create or replace function public.app_mark_stub_payment_paid(
  p_target_type text,
  p_target_id uuid,
  p_amount_cents integer default 0,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb
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
  paid_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'pagamento do aluno deve ser confirmado pela plataforma';
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

revoke all on function public.app_mark_stub_payment_paid(text, uuid, integer, text, jsonb) from public;
grant execute on function public.app_mark_stub_payment_paid(text, uuid, integer, text, jsonb) to authenticated;

revoke all on function public.app_mark_stub_payment_paid_for_participant(text, uuid, integer, text, jsonb, text) from public;
grant execute on function public.app_mark_stub_payment_paid_for_participant(text, uuid, integer, text, jsonb, text) to authenticated;
