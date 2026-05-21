-- Court booking manual edits and player-approved reschedule links
-- Date: 2026-05-21

create extension if not exists pgcrypto;

create table if not exists public.court_booking_change_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.court_bookings(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  proposed_court_id uuid references public.place_courts(id) on delete restrict,
  proposed_starts_at timestamptz,
  proposed_ends_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'expired')),
  token text not null unique default encode(gen_random_bytes(18), 'hex'),
  requested_by uuid references auth.users(id) on delete set null default auth.uid(),
  expires_at timestamptz not null default (now() + interval '72 hours'),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz null
);

alter table public.court_booking_change_requests alter column proposed_court_id drop not null;
alter table public.court_booking_change_requests alter column proposed_starts_at drop not null;
alter table public.court_booking_change_requests alter column proposed_ends_at drop not null;

create index if not exists idx_court_booking_change_requests_token on public.court_booking_change_requests(token);
create index if not exists idx_court_booking_change_requests_booking on public.court_booking_change_requests(booking_id, status);

alter table public.court_booking_change_requests enable row level security;

drop policy if exists court_booking_change_requests_staff_read on public.court_booking_change_requests;
create policy court_booking_change_requests_staff_read
on public.court_booking_change_requests
for select
to authenticated
using (public.app_can_manage_place_bookings(place_id));

create or replace function public.app_booking_slot_is_free(
  p_booking_id uuid,
  p_court_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.court_bookings b
    where b.id <> p_booking_id
      and b.court_id = p_court_id
      and b.status <> 'cancelled'
      and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
  );
$$;

create or replace function public.app_update_court_booking_admin(
  p_booking_id uuid,
  p_court_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_notes text default null
)
returns table(
  id uuid,
  place_id uuid,
  court_id uuid,
  user_id uuid,
  player_name text,
  phone text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  notes text,
  recurrence_group_id uuid,
  recurrence_index integer,
  recurrence_total integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_booking public.court_bookings%rowtype;
begin
  select * into v_booking from public.court_bookings b where b.id = p_booking_id;

  if v_booking.id is null then
    raise exception 'reserva nao encontrada';
  end if;

  if v_booking.status = 'cancelled' then
    raise exception 'reserva cancelada';
  end if;

  if not public.app_can_manage_place_bookings(v_booking.place_id) then
    raise exception 'nao autorizado';
  end if;

  if p_ends_at <= p_starts_at then
    raise exception 'horario invalido';
  end if;

  if p_starts_at < now() - interval '5 minutes' then
    raise exception 'horario no passado';
  end if;

  if not exists (
    select 1
    from public.place_courts c
    where c.id = p_court_id
      and c.place_id = v_booking.place_id
      and c.is_active = true
  ) then
    raise exception 'quadra indisponivel';
  end if;

  if not public.app_booking_slot_is_free(p_booking_id, p_court_id, p_starts_at, p_ends_at) then
    raise exception 'horario ja reservado';
  end if;

  return query
  update public.court_bookings
    set court_id = p_court_id,
        starts_at = p_starts_at,
        ends_at = p_ends_at,
        notes = case when p_notes is null then court_bookings.notes else nullif(trim(p_notes), '') end
  where court_bookings.id = p_booking_id
  returning
    court_bookings.id,
    court_bookings.place_id,
    court_bookings.court_id,
    court_bookings.user_id,
    court_bookings.player_name,
    court_bookings.phone,
    court_bookings.starts_at,
    court_bookings.ends_at,
    court_bookings.status,
    court_bookings.notes,
    court_bookings.recurrence_group_id,
    court_bookings.recurrence_index,
    court_bookings.recurrence_total,
    court_bookings.created_at,
    court_bookings.updated_at;
end;
$$;

create or replace function public.app_create_court_booking_change_request(
  p_booking_id uuid,
  p_court_id uuid default null,
  p_starts_at timestamptz default null,
  p_ends_at timestamptz default null
)
returns table(
  id uuid,
  booking_id uuid,
  place_id uuid,
  token text,
  status text,
  player_name text,
  place_name text,
  current_court_id uuid,
  current_court_name text,
  current_starts_at timestamptz,
  current_ends_at timestamptz,
  proposed_court_id uuid,
  proposed_court_name text,
  proposed_starts_at timestamptz,
  proposed_ends_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz,
  confirmed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_booking public.court_bookings%rowtype;
  v_request public.court_booking_change_requests%rowtype;
  v_has_proposal boolean;
begin
  select * into v_booking from public.court_bookings b where b.id = p_booking_id;

  if v_booking.id is null then
    raise exception 'reserva nao encontrada';
  end if;

  if not public.app_can_manage_place_bookings(v_booking.place_id) then
    raise exception 'nao autorizado';
  end if;

  if v_booking.status = 'cancelled' then
    raise exception 'reserva cancelada';
  end if;

  v_has_proposal := p_court_id is not null or p_starts_at is not null or p_ends_at is not null;

  if v_has_proposal then
    if p_court_id is null or p_starts_at is null or p_ends_at is null then
      raise exception 'proposta incompleta';
    end if;

    if p_ends_at <= p_starts_at then
      raise exception 'horario invalido';
    end if;

    if not exists (
      select 1
      from public.place_courts c
      where c.id = p_court_id
        and c.place_id = v_booking.place_id
        and c.is_active = true
    ) then
      raise exception 'quadra indisponivel';
    end if;

    if not public.app_booking_slot_is_free(p_booking_id, p_court_id, p_starts_at, p_ends_at) then
      raise exception 'horario ja reservado';
    end if;
  end if;

  insert into public.court_booking_change_requests (
    booking_id,
    place_id,
    proposed_court_id,
    proposed_starts_at,
    proposed_ends_at
  )
  values (
    p_booking_id,
    v_booking.place_id,
    p_court_id,
    p_starts_at,
    p_ends_at
  )
  returning * into v_request;

  return query
  select
    r.id,
    r.booking_id,
    r.place_id,
    r.token,
    r.status,
    b.player_name,
    p.name as place_name,
    b.court_id as current_court_id,
    current_court.name as current_court_name,
    b.starts_at as current_starts_at,
    b.ends_at as current_ends_at,
    r.proposed_court_id,
    proposed_court.name as proposed_court_name,
    r.proposed_starts_at,
    r.proposed_ends_at,
    r.expires_at,
    r.created_at,
    r.confirmed_at
  from public.court_booking_change_requests r
  join public.court_bookings b on b.id = r.booking_id
  join public.places p on p.id = r.place_id
  left join public.place_courts current_court on current_court.id = b.court_id
  left join public.place_courts proposed_court on proposed_court.id = r.proposed_court_id
  where r.id = v_request.id;
end;
$$;

create or replace function public.app_get_court_booking_change_request(
  p_token text
)
returns table(
  id uuid,
  booking_id uuid,
  place_id uuid,
  token text,
  status text,
  player_name text,
  place_name text,
  current_court_id uuid,
  current_court_name text,
  current_starts_at timestamptz,
  current_ends_at timestamptz,
  proposed_court_id uuid,
  proposed_court_name text,
  proposed_starts_at timestamptz,
  proposed_ends_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz,
  confirmed_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    r.id,
    r.booking_id,
    r.place_id,
    r.token,
    case when r.status = 'pending' and r.expires_at < now() then 'expired' else r.status end as status,
    b.player_name,
    p.name as place_name,
    b.court_id as current_court_id,
    current_court.name as current_court_name,
    b.starts_at as current_starts_at,
    b.ends_at as current_ends_at,
    r.proposed_court_id,
    proposed_court.name as proposed_court_name,
    r.proposed_starts_at,
    r.proposed_ends_at,
    r.expires_at,
    r.created_at,
    r.confirmed_at
  from public.court_booking_change_requests r
  join public.court_bookings b on b.id = r.booking_id
  join public.places p on p.id = r.place_id
  left join public.place_courts current_court on current_court.id = b.court_id
  left join public.place_courts proposed_court on proposed_court.id = r.proposed_court_id
  where r.token = nullif(trim(p_token), '')
  limit 1;
$$;

drop function if exists public.app_confirm_court_booking_change_request(text);

create or replace function public.app_confirm_court_booking_change_request(
  p_token text,
  p_court_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns table(
  id uuid,
  place_id uuid,
  court_id uuid,
  user_id uuid,
  player_name text,
  phone text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  notes text,
  recurrence_group_id uuid,
  recurrence_index integer,
  recurrence_total integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_request public.court_booking_change_requests%rowtype;
  v_booking public.court_bookings%rowtype;
begin
  select * into v_request
  from public.court_booking_change_requests r
  where r.token = nullif(trim(p_token), '')
  for update;

  if v_request.id is null then
    raise exception 'solicitacao nao encontrada';
  end if;

  if v_request.status <> 'pending' or v_request.expires_at < now() then
    update public.court_booking_change_requests
      set status = case when status = 'pending' and expires_at < now() then 'expired' else status end
    where id = v_request.id;
    raise exception 'solicitacao expirada ou ja utilizada';
  end if;

  select * into v_booking from public.court_bookings b where b.id = v_request.booking_id for update;

  if v_booking.id is null or v_booking.status = 'cancelled' then
    raise exception 'reserva indisponivel';
  end if;

  if p_court_id is null or p_starts_at is null or p_ends_at is null then
    raise exception 'horario nao selecionado';
  end if;

  if p_ends_at <= p_starts_at then
    raise exception 'horario invalido';
  end if;

  if p_starts_at < now() - interval '5 minutes' then
    raise exception 'horario no passado';
  end if;

  if not exists (
    select 1
    from public.place_courts c
    where c.id = p_court_id
      and c.place_id = v_booking.place_id
      and c.is_active = true
  ) then
    raise exception 'quadra indisponivel';
  end if;

  if not public.app_booking_slot_is_free(v_booking.id, p_court_id, p_starts_at, p_ends_at) then
    raise exception 'horario ja reservado';
  end if;

  update public.court_booking_change_requests
    set status = 'confirmed',
        proposed_court_id = p_court_id,
        proposed_starts_at = p_starts_at,
        proposed_ends_at = p_ends_at,
        confirmed_at = now()
  where id = v_request.id;

  update public.court_booking_change_requests
    set status = 'cancelled'
  where booking_id = v_booking.id
    and id <> v_request.id
    and status = 'pending';

  return query
  update public.court_bookings
    set court_id = p_court_id,
        starts_at = p_starts_at,
        ends_at = p_ends_at
  where court_bookings.id = v_booking.id
  returning
    court_bookings.id,
    court_bookings.place_id,
    court_bookings.court_id,
    court_bookings.user_id,
    court_bookings.player_name,
    court_bookings.phone,
    court_bookings.starts_at,
    court_bookings.ends_at,
    court_bookings.status,
    court_bookings.notes,
    court_bookings.recurrence_group_id,
    court_bookings.recurrence_index,
    court_bookings.recurrence_total,
    court_bookings.created_at,
    court_bookings.updated_at;
end;
$$;

revoke all on function public.app_booking_slot_is_free(uuid, uuid, timestamptz, timestamptz) from public;
grant execute on function public.app_booking_slot_is_free(uuid, uuid, timestamptz, timestamptz) to authenticated;

revoke all on function public.app_update_court_booking_admin(uuid, uuid, timestamptz, timestamptz, text) from public;
grant execute on function public.app_update_court_booking_admin(uuid, uuid, timestamptz, timestamptz, text) to authenticated;

revoke all on function public.app_create_court_booking_change_request(uuid, uuid, timestamptz, timestamptz) from public;
grant execute on function public.app_create_court_booking_change_request(uuid, uuid, timestamptz, timestamptz) to authenticated;

revoke all on function public.app_get_court_booking_change_request(text) from public;
grant execute on function public.app_get_court_booking_change_request(text) to authenticated;

revoke all on function public.app_confirm_court_booking_change_request(text, uuid, timestamptz, timestamptz) from public;
grant execute on function public.app_confirm_court_booking_change_request(text, uuid, timestamptz, timestamptz) to authenticated;
