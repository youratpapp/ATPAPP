-- League scheduler via Supabase Edge Function + pg_cron/pg_net
-- Date: 2026-05-08

create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.app_internal_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_internal_settings enable row level security;

revoke all on table public.app_internal_settings from public;
revoke all on table public.app_internal_settings from anon;
revoke all on table public.app_internal_settings from authenticated;
revoke all on table public.app_internal_settings from service_role;

create or replace function public.app_set_league_round_scheduler_config(
  p_project_url text,
  p_service_role_key text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(trim(p_project_url), '') = '' then
    raise exception 'p_project_url is required';
  end if;

  if coalesce(trim(p_service_role_key), '') = '' then
    raise exception 'p_service_role_key is required';
  end if;

  insert into public.app_internal_settings (key, value)
  values ('project_url', trim(p_project_url))
  on conflict (key)
  do update set value = excluded.value, updated_at = now();

  insert into public.app_internal_settings (key, value)
  values ('service_role_key', trim(p_service_role_key))
  on conflict (key)
  do update set value = excluded.value, updated_at = now();
end;
$$;

create or replace function public.app_enable_league_round_scheduler(
  p_cron text default '10 * * * *',
  p_limit integer default 50,
  p_job_name text default 'league-round-scheduler-hourly'
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_url text;
  v_service_role_key text;
  v_has_vault boolean;
  v_limit integer := greatest(1, least(500, coalesce(p_limit, 50)));
  v_existing_job_id bigint;
  v_schedule_sql text;
  v_job_id bigint;
begin
  select exists(
    select 1
    from pg_extension
    where extname = 'vault'
  ) into v_has_vault;

  if v_has_vault then
    select decrypted_secret into v_project_url
    from vault.decrypted_secrets
    where name = 'project_url'
    limit 1;

    select decrypted_secret into v_service_role_key
    from vault.decrypted_secrets
    where name = 'service_role_key'
    limit 1;
  else
    -- Fallback when Vault is unavailable in the project.
    -- Configure with:
    --   select public.app_set_league_round_scheduler_config('https://<project-ref>.supabase.co', '<service-role-key>');
    select s.value
      into v_project_url
    from public.app_internal_settings s
    where s.key = 'project_url'
    limit 1;

    select s.value
      into v_service_role_key
    from public.app_internal_settings s
    where s.key = 'service_role_key'
    limit 1;
  end if;

  if coalesce(trim(v_project_url), '') = '' then
    if v_has_vault then
      raise exception 'Vault secret missing: project_url';
    else
      raise exception 'Missing app_internal_settings.project_url (or enable Vault and create secret project_url).';
    end if;
  end if;

  if coalesce(trim(v_service_role_key), '') = '' then
    if v_has_vault then
      raise exception 'Vault secret missing: service_role_key';
    else
      raise exception 'Missing app_internal_settings.service_role_key (or enable Vault and create secret service_role_key).';
    end if;
  end if;

  select j.jobid
    into v_existing_job_id
  from cron.job j
  where j.jobname = p_job_name
    and j.database = current_database()
  limit 1;

  if v_existing_job_id is not null then
    perform cron.unschedule(v_existing_job_id);
  end if;

  v_schedule_sql := format($job$
    select
      net.http_post(
        url := %L || '/functions/v1/league-round-scheduler',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || %L,
          'apikey', %L
        ),
        body := jsonb_build_object('p_limit', %s)
      ) as request_id;
  $job$, v_project_url, v_service_role_key, v_service_role_key, v_limit);

  select cron.schedule(p_job_name, p_cron, v_schedule_sql)
    into v_job_id;

  return v_job_id;
end;
$$;

create or replace function public.app_disable_league_round_scheduler(
  p_job_name text default 'league-round-scheduler-hourly'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job_id bigint;
begin
  select j.jobid
    into v_job_id
  from cron.job j
  where j.jobname = p_job_name
    and j.database = current_database()
  limit 1;

  if v_job_id is null then
    return false;
  end if;

  perform cron.unschedule(v_job_id);
  return true;
end;
$$;

revoke all on function public.app_enable_league_round_scheduler(text, integer, text) from public;
revoke all on function public.app_disable_league_round_scheduler(text) from public;
revoke all on function public.app_set_league_round_scheduler_config(text, text) from public;
grant execute on function public.app_enable_league_round_scheduler(text, integer, text) to service_role;
grant execute on function public.app_disable_league_round_scheduler(text) to service_role;
grant execute on function public.app_set_league_round_scheduler_config(text, text) to service_role;
