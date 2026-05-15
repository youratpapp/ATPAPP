-- Place cashier staff role v1
-- Date: 2026-05-15
--
-- Adds a dedicated POS/canteen role without promoting the operator to manager
-- or finance.

alter table public.place_staff
  drop constraint if exists place_staff_role_check;

alter table public.place_staff
  add constraint place_staff_role_check
  check (role in ('manager', 'coach', 'frontdesk', 'finance', 'cashier'));

alter table public.place_staff_invites
  drop constraint if exists place_staff_invites_role_check;

alter table public.place_staff_invites
  add constraint place_staff_invites_role_check
  check (role in ('manager', 'coach', 'frontdesk', 'finance', 'cashier'));

create or replace function public.app_can_manage_place_canteen(p_place_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.app_place_staff_role(p_place_id) in ('owner', 'manager', 'cashier');
$$;

grant execute on function public.app_can_manage_place_canteen(uuid) to authenticated;

drop function if exists public.app_add_place_staff(uuid, text, text);

create or replace function public.app_add_place_staff(
  p_place_id uuid,
  p_email text,
  p_role text default 'manager'
)
returns table(
  place_id uuid,
  user_id uuid,
  email text,
  role text,
  created_at timestamptz,
  status text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_role text;
  v_created_at timestamptz;
begin
  if not exists (
    select 1
    from public.places p
    where p.id = p_place_id
      and p.owner_id = auth.uid()
  ) then
    raise exception 'nao autorizado';
  end if;

  if v_email = '' then
    raise exception 'email obrigatorio';
  end if;

  select u.id
    into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  if v_user_id is not null and exists (
    select 1
    from public.place_staff ps
    where ps.place_id = p_place_id
      and ps.user_id = v_user_id
  ) then
    raise exception 'usuario ja faz parte da equipe';
  end if;

  v_role := case when p_role in ('coach', 'frontdesk', 'finance', 'cashier') then p_role else 'manager' end;

  update public.place_staff_invites psi
     set updated_at = now(),
         invited_by = auth.uid()
   where psi.place_id = p_place_id
     and lower(psi.email) = v_email
     and psi.role = v_role
     and psi.status = 'pending'
  returning psi.created_at into v_created_at;

  if v_created_at is null then
    insert into public.place_staff_invites (place_id, email, role, invited_by)
    values (p_place_id, v_email, v_role, auth.uid())
    returning place_staff_invites.created_at into v_created_at;
  end if;

  return query
  select p_place_id, null::uuid, v_email, v_role, coalesce(v_created_at, now()), 'pending'::text;
end;
$$;

revoke all on function public.app_add_place_staff(uuid, text, text) from public;
grant execute on function public.app_add_place_staff(uuid, text, text) to authenticated;

drop policy if exists place_pos_products_manager_all on public.place_pos_products;
create policy place_pos_products_manager_all
on public.place_pos_products
for all
to authenticated
using (public.app_can_manage_place(place_id) or public.app_can_manage_place_canteen(place_id))
with check (public.app_can_manage_place(place_id) or public.app_can_manage_place_canteen(place_id));

drop policy if exists place_pos_sales_manager_all on public.place_pos_sales;
create policy place_pos_sales_manager_all
on public.place_pos_sales
for all
to authenticated
using (public.app_can_manage_place(place_id) or public.app_can_manage_place_canteen(place_id))
with check (public.app_can_manage_place(place_id) or public.app_can_manage_place_canteen(place_id));

create or replace function public.app_record_place_pos_sale(
  p_place_id uuid,
  p_product_id uuid default null,
  p_product_name text default null,
  p_buyer_name text default null,
  p_quantity integer default 1,
  p_unit_amount_cents integer default 0
)
returns table(
  id uuid,
  place_id uuid,
  product_id uuid,
  product_name text,
  buyer_name text,
  quantity integer,
  unit_amount_cents integer,
  total_amount_cents integer,
  status text,
  sold_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_product public.place_pos_products%rowtype;
  v_name text;
  v_unit integer;
  v_quantity integer;
begin
  if not public.app_can_manage_place_canteen(p_place_id) then
    raise exception 'nao autorizado';
  end if;

  v_quantity := greatest(1, coalesce(p_quantity, 1));
  v_unit := greatest(0, coalesce(p_unit_amount_cents, 0));
  v_name := nullif(trim(coalesce(p_product_name, '')), '');

  if p_product_id is not null then
    select *
      into v_product
    from public.place_pos_products
    where id = p_product_id
      and place_id = p_place_id
      and is_active = true;

    if v_product.id is null then
      raise exception 'produto indisponivel';
    end if;

    v_name := coalesce(v_name, v_product.name);
    v_unit := case when v_unit > 0 then v_unit else v_product.price_cents end;

    update public.place_pos_products
    set stock_quantity = greatest(0, stock_quantity - v_quantity),
        updated_at = now()
    where id = v_product.id;
  end if;

  if v_name is null then
    raise exception 'informe o produto';
  end if;

  return query
  insert into public.place_pos_sales (
    place_id,
    product_id,
    product_name,
    buyer_name,
    quantity,
    unit_amount_cents,
    total_amount_cents,
    sold_by
  )
  values (
    p_place_id,
    p_product_id,
    v_name,
    nullif(trim(coalesce(p_buyer_name, '')), ''),
    v_quantity,
    v_unit,
    v_quantity * v_unit,
    auth.uid()
  )
  returning
    place_pos_sales.id,
    place_pos_sales.place_id,
    place_pos_sales.product_id,
    place_pos_sales.product_name,
    place_pos_sales.buyer_name,
    place_pos_sales.quantity,
    place_pos_sales.unit_amount_cents,
    place_pos_sales.total_amount_cents,
    place_pos_sales.status,
    place_pos_sales.sold_at,
    place_pos_sales.created_at,
    place_pos_sales.updated_at;
end;
$$;

revoke all on function public.app_record_place_pos_sale(uuid, uuid, text, text, integer, integer) from public;
grant execute on function public.app_record_place_pos_sale(uuid, uuid, text, text, integer, integer) to authenticated;
