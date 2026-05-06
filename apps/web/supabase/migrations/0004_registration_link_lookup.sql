-- Allow opening tournament registration page by direct link (UUID)
-- without requiring prior membership/public visibility.
-- Date: 2026-05-06

create or replace function public.app_get_tournament_for_registration(p_tournament_id uuid)
returns table(
  id uuid,
  name text,
  owner_id uuid,
  city text,
  state text,
  visibility text,
  status text,
  poster_url text,
  starts_at timestamptz,
  registration_close_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  data jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  select
    t.id,
    t.name,
    t.owner_id,
    t.city,
    t.state,
    t.visibility,
    t.status,
    t.poster_url,
    t.starts_at,
    t.registration_close_at,
    t.created_at,
    t.updated_at,
    t.data
  from public.tournaments t
  where t.id = p_tournament_id
  limit 1;
$$;

grant execute on function public.app_get_tournament_for_registration(uuid) to authenticated;

