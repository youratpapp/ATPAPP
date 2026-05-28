-- Operational event log for SaaS actions that need traceability.
-- Date: 2026-05-27

create extension if not exists pgcrypto;

create table if not exists public.app_operation_events (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.places(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  message text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  actor_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists idx_app_operation_events_place_entity
  on public.app_operation_events(place_id, entity_type, entity_id, created_at desc);

create index if not exists idx_app_operation_events_actor
  on public.app_operation_events(actor_id, created_at desc);

alter table public.app_operation_events enable row level security;

drop policy if exists app_operation_events_staff_read on public.app_operation_events;
create policy app_operation_events_staff_read
on public.app_operation_events
for select
to authenticated
using (
  place_id is null
  or public.app_can_manage_place(place_id)
  or public.app_can_manage_place_bookings(place_id)
  or public.app_can_manage_place_academy(place_id)
  or public.app_can_manage_place_finance(place_id)
);

create or replace function public.app_log_operation_event(
  p_place_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_message text default '',
  p_metadata jsonb default '{}'::jsonb
)
returns table(
  id uuid,
  place_id uuid,
  entity_type text,
  entity_id uuid,
  action text,
  message text,
  metadata jsonb,
  actor_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  if nullif(trim(coalesce(p_entity_type, '')), '') is null then
    raise exception 'tipo de entidade obrigatorio';
  end if;

  if nullif(trim(coalesce(p_action, '')), '') is null then
    raise exception 'acao obrigatoria';
  end if;

  if p_place_id is not null
    and not (
      public.app_can_manage_place(p_place_id)
      or public.app_can_manage_place_bookings(p_place_id)
      or public.app_can_manage_place_academy(p_place_id)
      or public.app_can_manage_place_finance(p_place_id)
    )
  then
    raise exception 'nao autorizado';
  end if;

  return query
  insert into public.app_operation_events (
    place_id,
    entity_type,
    entity_id,
    action,
    message,
    metadata
  )
  values (
    p_place_id,
    lower(trim(p_entity_type)),
    p_entity_id,
    lower(trim(p_action)),
    coalesce(p_message, ''),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning
    app_operation_events.id,
    app_operation_events.place_id,
    app_operation_events.entity_type,
    app_operation_events.entity_id,
    app_operation_events.action,
    app_operation_events.message,
    app_operation_events.metadata,
    app_operation_events.actor_id,
    app_operation_events.created_at;
end;
$$;

revoke all on function public.app_log_operation_event(uuid, text, uuid, text, text, jsonb) from public;
grant execute on function public.app_log_operation_event(uuid, text, uuid, text, text, jsonb) to authenticated;
