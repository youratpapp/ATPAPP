-- Payment reminders v1
-- Date: 2026-05-12

create table if not exists public.app_payment_reminders (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.places(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  billing_period text not null default '',
  channel text not null default 'manual' check (channel in ('manual', 'whatsapp', 'email', 'push')),
  status text not null default 'queued' check (status in ('queued', 'sent', 'cancelled')),
  message text not null,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_payment_reminders_target
  on public.app_payment_reminders(target_type, target_id, billing_period, created_at desc);

create index if not exists idx_app_payment_reminders_place
  on public.app_payment_reminders(place_id, status, created_at desc);

drop trigger if exists app_payment_reminders_set_updated_at
  on public.app_payment_reminders;
create trigger app_payment_reminders_set_updated_at
  before update on public.app_payment_reminders
  for each row execute function public.tg_set_updated_at();

alter table public.app_payment_reminders enable row level security;

drop policy if exists app_payment_reminders_self_or_manager_read on public.app_payment_reminders;
create policy app_payment_reminders_self_or_manager_read
on public.app_payment_reminders
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place_finance(place_id));

drop policy if exists app_payment_reminders_manager_insert on public.app_payment_reminders;
create policy app_payment_reminders_manager_insert
on public.app_payment_reminders
for insert
to authenticated
with check (public.app_can_manage_place_finance(place_id));

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

revoke all on function public.app_create_payment_reminder_for_participant(text, uuid, text, text, text) from public;
grant execute on function public.app_create_payment_reminder_for_participant(text, uuid, text, text, text) to authenticated;
