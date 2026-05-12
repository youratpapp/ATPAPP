-- League scheduler run visibility for organizers
-- Date: 2026-05-11

create or replace function public.app_get_league_scheduler_runs(
  p_league_id uuid,
  p_limit integer default 5
)
returns table(
  id uuid,
  executed_at timestamptz,
  generated_count integer,
  details jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.leagues l
    where l.id = p_league_id
      and l.owner_id = auth.uid()
  ) then
    raise exception 'nao autorizado';
  end if;

  return query
  select
    r.id,
    r.executed_at,
    r.generated_count,
    coalesce(
      (
        select jsonb_agg(item)
        from jsonb_array_elements(r.details) item
        where item->>'league_id' = p_league_id::text
      ),
      '[]'::jsonb
    ) as details
  from public.league_scheduler_runs r
  where exists (
    select 1
    from jsonb_array_elements(r.details) item
    where item->>'league_id' = p_league_id::text
  )
  order by r.executed_at desc
  limit greatest(1, least(20, coalesce(p_limit, 5)));
end;
$$;

revoke all on function public.app_get_league_scheduler_runs(uuid, integer) from public;
grant execute on function public.app_get_league_scheduler_runs(uuid, integer) to authenticated;
