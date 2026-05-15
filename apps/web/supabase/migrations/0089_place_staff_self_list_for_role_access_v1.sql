-- Allow staff members to resolve their own place role without exposing the full team.
-- The management shell uses this RPC to compute role-scoped navigation.
-- Owners/managers keep the full team + pending invites view; other staff see only their active row.

create or replace function public.app_list_place_staff(p_place_id uuid)
returns table(
  place_id uuid,
  user_id uuid,
  email text,
  display_name text,
  role text,
  created_at timestamptz,
  status text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_can_manage boolean;
  v_is_staff boolean;
begin
  select exists (
    select 1
    from public.places p
    where p.id = p_place_id
      and p.owner_id = auth.uid()
  ) or exists (
    select 1
    from public.place_staff ps
    where ps.place_id = p_place_id
      and ps.user_id = auth.uid()
      and ps.role = 'manager'
  )
  into v_can_manage;

  select exists (
    select 1
    from public.place_staff ps
    where ps.place_id = p_place_id
      and ps.user_id = auth.uid()
  )
  into v_is_staff;

  if not v_can_manage and not v_is_staff then
    raise exception 'nao autorizado';
  end if;

  return query
  select
    ps.place_id,
    ps.user_id,
    lower(coalesce(u.email, ''))::text,
    coalesce(
      nullif(trim(pr.display_name), ''),
      nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
      lower(u.email),
      'Usuario vinculado'
    )::text,
    ps.role::text,
    ps.created_at,
    'active'::text
  from public.place_staff ps
  left join auth.users u on u.id = ps.user_id
  left join public.profiles pr on pr.user_id = ps.user_id
  where ps.place_id = p_place_id
    and (v_can_manage or ps.user_id = auth.uid())

  union all

  select
    psi.place_id,
    null::uuid,
    lower(psi.email)::text,
    coalesce(
      nullif(trim(pr.display_name), ''),
      nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
      lower(psi.email)
    )::text,
    psi.role::text,
    psi.created_at,
    'pending'::text
  from public.place_staff_invites psi
  left join auth.users u on lower(u.email) = lower(psi.email)
  left join public.profiles pr on pr.user_id = u.id
  where v_can_manage
    and psi.place_id = p_place_id
    and psi.status = 'pending'
  order by 7 desc, 6 desc;
end;
$$;

revoke all on function public.app_list_place_staff(uuid) from public;
grant execute on function public.app_list_place_staff(uuid) to authenticated;
