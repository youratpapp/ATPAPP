-- Tournament court usage requests v1
-- Date: 2026-05-16

create table if not exists public.tournament_court_usage_requests (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  requested_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  tournament_name text not null default '',
  place_name text not null default '',
  summary text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint tournament_court_usage_requests_place_tournament_key unique (place_id, tournament_id)
);

create index if not exists tournament_court_usage_requests_place_status_idx
on public.tournament_court_usage_requests(place_id, status, updated_at desc);

create index if not exists tournament_court_usage_requests_tournament_idx
on public.tournament_court_usage_requests(tournament_id, updated_at desc);

alter table public.tournament_court_usage_requests enable row level security;

drop policy if exists tournament_court_usage_requests_select on public.tournament_court_usage_requests;
create policy tournament_court_usage_requests_select
on public.tournament_court_usage_requests
for select
using (
  requested_by = auth.uid()
  or public.app_can_manage_place_bookings(place_id)
  or public.app_is_tournament_owner(tournament_id)
);

create or replace function public.app_tournament_user_can_operate(p_tournament_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.tournaments t
    where t.id = p_tournament_id
      and t.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.tournament_members tm
    where tm.tournament_id = p_tournament_id
      and tm.user_id = auth.uid()
      and tm.role in ('organizer', 'scorekeeper')
  );
$$;

grant execute on function public.app_tournament_user_can_operate(uuid) to authenticated;

create or replace function public.app_build_tournament_court_slots(
  p_place_id uuid,
  p_agenda jsonb,
  p_court_links jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_assignment jsonb;
  v_link jsonb;
  v_slots jsonb := '[]'::jsonb;
  v_data text;
  v_hora text;
  v_hora_fim text;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
begin
  for v_assignment in
    select value
    from jsonb_array_elements(coalesce(p_agenda->'assignments', '[]'::jsonb))
  loop
    v_link := null;
    select value
      into v_link
    from jsonb_array_elements(coalesce(p_court_links, '[]'::jsonb))
    where (value->>'placeId')::uuid = p_place_id
      and lower(coalesce(value->>'label', '')) = lower(coalesce(v_assignment->>'quadra', ''))
    limit 1;

    if v_link is null then
      continue;
    end if;

    v_data := nullif(v_assignment->>'data', '');
    v_hora := nullif(v_assignment->>'hora', '');
    v_hora_fim := nullif(v_assignment->>'horaFim', '');

    if v_data is null or v_hora is null or v_hora_fim is null then
      continue;
    end if;

    begin
      v_starts_at := ((v_data || ' ' || v_hora)::timestamp at time zone 'America/Cuiaba');
      v_ends_at := ((v_data || ' ' || v_hora_fim)::timestamp at time zone 'America/Cuiaba');
    exception
      when others then
        continue;
    end;

    if v_ends_at <= v_starts_at then
      continue;
    end if;

    v_slots := v_slots || jsonb_build_object(
      'courtId', v_link->>'courtId',
      'courtName', coalesce(v_link->>'courtName', v_assignment->>'quadra'),
      'label', coalesce(v_link->>'label', v_assignment->>'quadra'),
      'startsAt', v_starts_at,
      'endsAt', v_ends_at,
      'date', v_data,
      'time', v_hora,
      'endTime', v_hora_fim,
      'matchKey', coalesce(v_assignment->>'matchKey', ''),
      'category', coalesce(v_assignment->>'categoria', ''),
      'className', coalesce(v_assignment->>'classe', ''),
      'round', coalesce(v_assignment->>'round', ''),
      'playerA', coalesce(v_assignment->>'p1', ''),
      'playerB', coalesce(v_assignment->>'p2', '')
    );
  end loop;

  return v_slots;
end;
$$;

revoke all on function public.app_build_tournament_court_slots(uuid, jsonb, jsonb) from public;
grant execute on function public.app_build_tournament_court_slots(uuid, jsonb, jsonb) to authenticated;

create or replace function public.app_apply_tournament_court_request_blocks(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.tournament_court_usage_requests%rowtype;
  v_slot jsonb;
  v_marker text;
  v_note text;
  v_blocked integer := 0;
  v_conflicts integer := 0;
  v_court_id uuid;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
begin
  select *
    into v_request
  from public.tournament_court_usage_requests
  where id = p_request_id;

  if v_request.id is null then
    raise exception 'solicitacao nao encontrada';
  end if;

  if not public.app_can_manage_place_bookings(v_request.place_id) then
    raise exception 'nao autorizado';
  end if;

  v_marker := 'ATP_TOURNAMENT_BLOCK tournament_id=' || v_request.tournament_id::text;

  update public.court_bookings
     set status = 'cancelled',
         updated_at = now()
   where place_id = v_request.place_id
     and status = 'blocked'
     and coalesce(notes, '') like '%' || v_marker || '%';

  for v_slot in
    select value
    from jsonb_array_elements(coalesce(v_request.payload->'slots', '[]'::jsonb))
  loop
    begin
      v_court_id := (v_slot->>'courtId')::uuid;
      v_starts_at := (v_slot->>'startsAt')::timestamptz;
      v_ends_at := (v_slot->>'endsAt')::timestamptz;
    exception
      when others then
        v_conflicts := v_conflicts + 1;
        continue;
    end;

    if v_ends_at <= v_starts_at then
      v_conflicts := v_conflicts + 1;
      continue;
    end if;

    if exists (
      select 1
      from public.court_bookings b
      where b.place_id = v_request.place_id
        and b.court_id = v_court_id
        and b.status <> 'cancelled'
        and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(v_starts_at, v_ends_at, '[)')
    ) then
      v_conflicts := v_conflicts + 1;
      continue;
    end if;

    v_note := v_marker
      || ' request_id=' || v_request.id::text
      || ' match=' || coalesce(v_slot->>'matchKey', '')
      || ' | ' || v_request.tournament_name
      || ' | ' || coalesce(v_slot->>'round', '')
      || ' | ' || coalesce(v_slot->>'playerA', '')
      || ' x ' || coalesce(v_slot->>'playerB', '');

    insert into public.court_bookings (
      place_id,
      court_id,
      user_id,
      player_name,
      phone,
      starts_at,
      ends_at,
      status,
      notes
    )
    values (
      v_request.place_id,
      v_court_id,
      auth.uid(),
      'Torneio',
      '',
      v_starts_at,
      v_ends_at,
      'blocked',
      v_note
    );

    v_blocked := v_blocked + 1;
  end loop;

  update public.tournament_court_usage_requests
     set payload = coalesce(payload, '{}'::jsonb) || jsonb_build_object(
           'blockedSlots', v_blocked,
           'conflicts', v_conflicts,
           'blockedAt', now()
         ),
         updated_at = now()
   where id = v_request.id;

  return jsonb_build_object('blockedSlots', v_blocked, 'conflicts', v_conflicts);
end;
$$;

revoke all on function public.app_apply_tournament_court_request_blocks(uuid) from public;
grant execute on function public.app_apply_tournament_court_request_blocks(uuid) to authenticated;

create or replace function public.app_sync_tournament_court_usage(
  p_tournament_id uuid,
  p_agenda jsonb,
  p_court_links jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tournament public.tournaments%rowtype;
  v_link_place record;
  v_place_name text;
  v_slots jsonb;
  v_slot_count integer;
  v_request_id uuid;
  v_auto_approved boolean;
  v_apply_result jsonb;
  v_pending_places integer := 0;
  v_approved_places integer := 0;
  v_blocked_slots integer := 0;
  v_conflicts integer := 0;
  v_summary text;
begin
  if not public.app_tournament_user_can_operate(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  select *
    into v_tournament
  from public.tournaments
  where id = p_tournament_id;

  if v_tournament.id is null then
    raise exception 'torneio nao encontrado';
  end if;

  for v_link_place in
    select distinct
      (value->>'placeId')::uuid as place_id,
      max(coalesce(value->>'placeName', '')) as place_name
    from jsonb_array_elements(coalesce(p_court_links, '[]'::jsonb))
    where coalesce(value->>'placeId', '') <> ''
      and coalesce(value->>'courtId', '') <> ''
      and coalesce(value->>'label', '') <> ''
    group by (value->>'placeId')::uuid
  loop
    v_slots := public.app_build_tournament_court_slots(v_link_place.place_id, p_agenda, p_court_links);
    v_slot_count := jsonb_array_length(v_slots);

    if v_slot_count = 0 then
      continue;
    end if;

    select name
      into v_place_name
    from public.places
    where id = v_link_place.place_id;

    v_summary := v_slot_count::text || ' horario(s) em ' || (
      select count(distinct slot->>'courtId')
      from jsonb_array_elements(v_slots) slot
    )::text || ' quadra(s)';
    v_auto_approved := public.app_can_manage_place_bookings(v_link_place.place_id);

    insert into public.tournament_court_usage_requests (
      place_id,
      tournament_id,
      requested_by,
      status,
      tournament_name,
      place_name,
      summary,
      payload,
      reviewed_by,
      reviewed_at,
      updated_at
    )
    values (
      v_link_place.place_id,
      p_tournament_id,
      auth.uid(),
      case when v_auto_approved then 'approved' else 'pending' end,
      coalesce(v_tournament.name, ''),
      coalesce(v_place_name, v_link_place.place_name, ''),
      v_summary,
      jsonb_build_object(
        'slots', v_slots,
        'agendaSyncedAt', now(),
        'autoApproved', v_auto_approved
      ),
      case when v_auto_approved then auth.uid() else null end,
      case when v_auto_approved then now() else null end,
      now()
    )
    on conflict (place_id, tournament_id) do update
      set requested_by = excluded.requested_by,
          status = case when excluded.status = 'approved' then 'approved' else 'pending' end,
          tournament_name = excluded.tournament_name,
          place_name = excluded.place_name,
          summary = excluded.summary,
          payload = excluded.payload,
          reviewed_by = excluded.reviewed_by,
          reviewed_at = excluded.reviewed_at,
          updated_at = now()
    returning id into v_request_id;

    if v_auto_approved then
      v_approved_places := v_approved_places + 1;
      v_apply_result := public.app_apply_tournament_court_request_blocks(v_request_id);
      v_blocked_slots := v_blocked_slots + coalesce((v_apply_result->>'blockedSlots')::integer, 0);
      v_conflicts := v_conflicts + coalesce((v_apply_result->>'conflicts')::integer, 0);
    else
      v_pending_places := v_pending_places + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'approvedPlaces', v_approved_places,
    'pendingPlaces', v_pending_places,
    'blockedSlots', v_blocked_slots,
    'conflicts', v_conflicts
  );
end;
$$;

revoke all on function public.app_sync_tournament_court_usage(uuid, jsonb, jsonb) from public;
grant execute on function public.app_sync_tournament_court_usage(uuid, jsonb, jsonb) to authenticated;

create or replace function public.app_list_place_tournament_court_requests(p_place_id uuid)
returns table(
  id uuid,
  place_id uuid,
  tournament_id uuid,
  requested_by uuid,
  reviewed_by uuid,
  status text,
  tournament_name text,
  place_name text,
  summary text,
  payload jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  reviewed_at timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.app_can_manage_place_bookings(p_place_id) then
    raise exception 'nao autorizado';
  end if;

  return query
  select
    r.id,
    r.place_id,
    r.tournament_id,
    r.requested_by,
    r.reviewed_by,
    r.status,
    r.tournament_name,
    r.place_name,
    r.summary,
    r.payload,
    r.created_at,
    r.updated_at,
    r.reviewed_at
  from public.tournament_court_usage_requests r
  where r.place_id = p_place_id
    and r.status in ('pending', 'approved', 'rejected')
    and r.updated_at >= now() - interval '45 days'
  order by case r.status when 'pending' then 0 when 'approved' then 1 else 2 end, r.updated_at desc
  limit 80;
end;
$$;

revoke all on function public.app_list_place_tournament_court_requests(uuid) from public;
grant execute on function public.app_list_place_tournament_court_requests(uuid) to authenticated;

create or replace function public.app_review_tournament_court_request(
  p_request_id uuid,
  p_status text
)
returns table(
  id uuid,
  place_id uuid,
  tournament_id uuid,
  requested_by uuid,
  reviewed_by uuid,
  status text,
  tournament_name text,
  place_name text,
  summary text,
  payload jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  reviewed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.tournament_court_usage_requests%rowtype;
  v_apply_result jsonb;
  v_marker text;
begin
  if p_status not in ('approved', 'rejected') then
    raise exception 'status invalido';
  end if;

  select *
    into v_request
  from public.tournament_court_usage_requests
  where tournament_court_usage_requests.id = p_request_id
  for update;

  if v_request.id is null then
    raise exception 'solicitacao nao encontrada';
  end if;

  if not public.app_can_manage_place_bookings(v_request.place_id) then
    raise exception 'nao autorizado';
  end if;

  v_marker := 'ATP_TOURNAMENT_BLOCK tournament_id=' || v_request.tournament_id::text;

  if p_status = 'approved' then
    update public.tournament_court_usage_requests
       set status = 'approved',
           reviewed_by = auth.uid(),
           reviewed_at = now(),
           updated_at = now()
     where tournament_court_usage_requests.id = p_request_id;

    v_apply_result := public.app_apply_tournament_court_request_blocks(p_request_id);
  else
    update public.court_bookings
       set status = 'cancelled',
           updated_at = now()
     where place_id = v_request.place_id
       and status = 'blocked'
       and coalesce(notes, '') like '%' || v_marker || '%';

    update public.tournament_court_usage_requests
       set status = 'rejected',
           reviewed_by = auth.uid(),
           reviewed_at = now(),
           payload = coalesce(payload, '{}'::jsonb) || jsonb_build_object('rejectedAt', now()),
           updated_at = now()
     where tournament_court_usage_requests.id = p_request_id;
  end if;

  return query
  select
    r.id,
    r.place_id,
    r.tournament_id,
    r.requested_by,
    r.reviewed_by,
    r.status,
    r.tournament_name,
    r.place_name,
    r.summary,
    r.payload,
    r.created_at,
    r.updated_at,
    r.reviewed_at
  from public.tournament_court_usage_requests r
  where r.id = p_request_id;
end;
$$;

revoke all on function public.app_review_tournament_court_request(uuid, text) from public;
grant execute on function public.app_review_tournament_court_request(uuid, text) to authenticated;
