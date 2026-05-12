-- Payment stub v1
-- Date: 2026-05-11

create table if not exists public.app_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'BRL',
  status text not null default 'paid' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider text not null default 'stub',
  description text,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (target_type, target_id, user_id)
);

create index if not exists idx_app_payments_user
  on public.app_payments(user_id, created_at desc);
create index if not exists idx_app_payments_target
  on public.app_payments(target_type, target_id, status);

drop trigger if exists app_payments_set_updated_at on public.app_payments;
create trigger app_payments_set_updated_at
  before update on public.app_payments
  for each row execute function public.tg_set_updated_at();

alter table public.app_payments enable row level security;

drop policy if exists app_payments_self_read on public.app_payments;
create policy app_payments_self_read
on public.app_payments
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists app_payments_place_manager_read on public.app_payments;
create policy app_payments_place_manager_read
on public.app_payments
for select
to authenticated
using (
  target_type = 'court_booking'
  and exists (
    select 1
    from public.court_bookings b
    where b.id = target_id
      and public.app_can_manage_place(b.place_id)
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
#variable_conflict use_column
begin
  if auth.uid() is null then
    raise exception 'nao autenticado';
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
    paid_at
  )
  values (
    auth.uid(),
    trim(p_target_type),
    p_target_id,
    greatest(0, coalesce(p_amount_cents, 0)),
    'BRL',
    'paid',
    'stub',
    nullif(trim(coalesce(p_description, '')), ''),
    coalesce(p_metadata, '{}'::jsonb),
    now()
  )
  on conflict (target_type, target_id, user_id)
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
    app_payments.paid_at,
    app_payments.created_at,
    app_payments.updated_at;
end;
$$;

revoke all on function public.app_mark_stub_payment_paid(text, uuid, integer, text, jsonb) from public;
grant execute on function public.app_mark_stub_payment_paid(text, uuid, integer, text, jsonb) to authenticated;
