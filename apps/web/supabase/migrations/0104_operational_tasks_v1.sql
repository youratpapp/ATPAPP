create table if not exists public.app_operational_tasks (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  title text not null,
  description text not null default '',
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  due_at timestamptz,
  assigned_to uuid references public.profiles(user_id) on delete set null,
  created_by uuid references public.profiles(user_id) on delete set null default auth.uid(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_operational_tasks_place_status_due
  on public.app_operational_tasks(place_id, status, due_at, created_at desc);

create index if not exists idx_app_operational_tasks_entity
  on public.app_operational_tasks(place_id, entity_type, entity_id);

alter table public.app_operational_tasks enable row level security;

drop policy if exists app_operational_tasks_staff_read on public.app_operational_tasks;
create policy app_operational_tasks_staff_read
on public.app_operational_tasks
for select
using (
  exists (
    select 1
    from public.place_staff ps
    where ps.place_id = app_operational_tasks.place_id
      and ps.user_id = auth.uid()
  )
);

drop policy if exists app_operational_tasks_staff_write on public.app_operational_tasks;
create policy app_operational_tasks_staff_write
on public.app_operational_tasks
for all
using (
  exists (
    select 1
    from public.place_staff ps
    where ps.place_id = app_operational_tasks.place_id
      and ps.user_id = auth.uid()
      and ps.role in ('owner', 'manager', 'frontdesk', 'finance', 'cashier', 'coach')
  )
)
with check (
  exists (
    select 1
    from public.place_staff ps
    where ps.place_id = app_operational_tasks.place_id
      and ps.user_id = auth.uid()
      and ps.role in ('owner', 'manager', 'frontdesk', 'finance', 'cashier', 'coach')
  )
);

create or replace function public.app_touch_operational_task_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status = 'done' and old.status is distinct from 'done' and new.completed_at is null then
    new.completed_at := now();
  end if;
  if new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_app_operational_tasks_updated_at on public.app_operational_tasks;
create trigger trg_app_operational_tasks_updated_at
before update on public.app_operational_tasks
for each row execute function public.app_touch_operational_task_updated_at();

create or replace function public.app_create_operational_task(
  p_place_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_title text,
  p_description text default '',
  p_priority text default 'normal',
  p_due_at timestamptz default null,
  p_assigned_to uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.app_operational_tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  created_task public.app_operational_tasks;
begin
  if not exists (
    select 1
    from public.place_staff ps
    where ps.place_id = p_place_id
      and ps.user_id = auth.uid()

      and ps.role in ('owner', 'manager', 'frontdesk', 'finance', 'cashier', 'coach')
  ) then
    raise exception 'not allowed';
  end if;

  insert into public.app_operational_tasks (
    place_id,
    entity_type,
    entity_id,
    title,
    description,
    priority,
    due_at,
    assigned_to,
    metadata,
    created_by
  )
  values (
    p_place_id,
    nullif(trim(p_entity_type), ''),
    p_entity_id,
    nullif(trim(p_title), ''),
    coalesce(p_description, ''),
    coalesce(nullif(p_priority, ''), 'normal'),
    p_due_at,
    p_assigned_to,
    coalesce(p_metadata, '{}'::jsonb),
    auth.uid()
  )
  returning * into created_task;

  return created_task;
end;
$$;

create or replace function public.app_update_operational_task_status(
  p_task_id uuid,
  p_status text
)
returns public.app_operational_tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_task public.app_operational_tasks;
begin
  update public.app_operational_tasks t
  set status = coalesce(nullif(p_status, ''), t.status)
  where t.id = p_task_id
    and exists (
      select 1
      from public.place_staff ps
      where ps.place_id = t.place_id
        and ps.user_id = auth.uid()

        and ps.role in ('owner', 'manager', 'frontdesk', 'finance', 'cashier', 'coach')
    )
  returning * into updated_task;

  if updated_task.id is null then
    raise exception 'task not found or not allowed';
  end if;

  return updated_task;
end;
$$;
