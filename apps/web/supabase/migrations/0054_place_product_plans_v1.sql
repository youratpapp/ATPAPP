-- Place product plans v1
-- Date: 2026-05-12

alter table public.places
  add column if not exists product_plan text not null default 'club_pro';

alter table public.places
  drop constraint if exists places_product_plan_check;

alter table public.places
  add constraint places_product_plan_check
  check (product_plan in ('club_basic', 'academy', 'club_pro', 'multi_unit'));

update public.places
set product_plan = 'club_pro'
where product_plan is null
   or product_plan not in ('club_basic', 'academy', 'club_pro', 'multi_unit');

create or replace function public.app_update_place_product_plan(
  p_place_id uuid,
  p_product_plan text
)
returns table(
  id uuid,
  owner_id uuid,
  organization_id uuid,
  name text,
  city text,
  state text,
  description text,
  logo_url text,
  cover_url text,
  product_plan text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
begin
  if not public.app_can_manage_place(p_place_id) then
    raise exception 'nao autorizado';
  end if;

  v_plan := case
    when p_product_plan in ('club_basic', 'academy', 'club_pro', 'multi_unit') then p_product_plan
    else 'club_pro'
  end;

  return query
  update public.places
     set product_plan = v_plan
   where places.id = p_place_id
  returning
    places.id,
    places.owner_id,
    places.organization_id,
    places.name,
    places.city,
    places.state,
    places.description,
    places.logo_url,
    places.cover_url,
    places.product_plan;
end;
$$;

revoke all on function public.app_update_place_product_plan(uuid, text) from public;
grant execute on function public.app_update_place_product_plan(uuid, text) to authenticated;
