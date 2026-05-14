-- Tournament staff user lookup v1
-- Date: 2026-05-14
--
-- Lets tournament owners search existing users before linking staff, avoiding
-- typo-prone direct email entry while still allowing pending invites.

create or replace function public.app_search_tournament_staff_candidates(
  p_tournament_id uuid,
  p_query text
)
returns table(
  user_id uuid,
  email text,
  display_name text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_query text;
begin
  if not public.app_is_tournament_owner(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  v_query := lower(trim(coalesce(p_query, '')));
  if length(v_query) < 3 then
    return;
  end if;

  return query
  select
    u.id,
    lower(u.email)::text,
    coalesce(nullif(trim(p.display_name), ''), nullif(trim(u.raw_user_meta_data->>'display_name'), ''), lower(u.email))::text
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  where lower(u.email) like '%' || v_query || '%'
     or lower(coalesce(p.display_name, '')) like '%' || v_query || '%'
     or lower(coalesce(u.raw_user_meta_data->>'display_name', '')) like '%' || v_query || '%'
  order by
    case when lower(u.email) = v_query then 0 when lower(u.email) like v_query || '%' then 1 else 2 end,
    lower(coalesce(p.display_name, u.email)),
    lower(u.email)
  limit 8;
end;
$$;

revoke all on function public.app_search_tournament_staff_candidates(uuid, text) from public;
grant execute on function public.app_search_tournament_staff_candidates(uuid, text) to authenticated;
