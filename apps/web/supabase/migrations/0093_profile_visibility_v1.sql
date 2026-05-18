alter table public.profiles
add column if not exists profile_visibility text not null default 'public'
check (profile_visibility in ('public', 'private'));

create or replace function public.app_get_public_profiles(p_user_ids uuid[])
returns table (
  user_id uuid,
  display_name text,
  photo_url text,
  city text,
  state text,
  instagram text,
  bio text,
  profile_visibility text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.user_id,
    coalesce(nullif(trim(p.display_name), ''), 'Jogador') as display_name,
    case when p.profile_visibility = 'public' or auth.uid() = p.user_id then p.photo_url else null end as photo_url,
    case when p.profile_visibility = 'public' or auth.uid() = p.user_id then p.city else null end as city,
    case when p.profile_visibility = 'public' or auth.uid() = p.user_id then p.state else null end as state,
    case when p.profile_visibility = 'public' or auth.uid() = p.user_id then p.instagram else null end as instagram,
    case when p.profile_visibility = 'public' or auth.uid() = p.user_id then p.bio else null end as bio,
    p.profile_visibility
  from public.profiles p
  where p.user_id = any(p_user_ids);
$$;

grant execute on function public.app_get_public_profiles(uuid[]) to authenticated;
