-- Place POS and finance v1
-- Date: 2026-05-12

create table if not exists public.place_pos_products (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  name text not null,
  category text,
  price_cents integer not null default 0 check (price_cents >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_pos_products_place
  on public.place_pos_products(place_id, is_active, name);

drop trigger if exists place_pos_products_set_updated_at
  on public.place_pos_products;
create trigger place_pos_products_set_updated_at
  before update on public.place_pos_products
  for each row execute function public.tg_set_updated_at();

alter table public.place_pos_products enable row level security;

drop policy if exists place_pos_products_manager_all on public.place_pos_products;
create policy place_pos_products_manager_all
on public.place_pos_products
for all
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

create table if not exists public.place_pos_sales (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  product_id uuid references public.place_pos_products(id) on delete set null,
  product_name text not null,
  buyer_name text,
  quantity integer not null default 1 check (quantity > 0),
  unit_amount_cents integer not null default 0 check (unit_amount_cents >= 0),
  total_amount_cents integer not null default 0 check (total_amount_cents >= 0),
  status text not null default 'paid' check (status in ('paid', 'cancelled')),
  sold_by uuid references auth.users(id) on delete set null default auth.uid(),
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_pos_sales_place
  on public.place_pos_sales(place_id, sold_at desc);

drop trigger if exists place_pos_sales_set_updated_at
  on public.place_pos_sales;
create trigger place_pos_sales_set_updated_at
  before update on public.place_pos_sales
  for each row execute function public.tg_set_updated_at();

alter table public.place_pos_sales enable row level security;

drop policy if exists place_pos_sales_manager_all on public.place_pos_sales;
create policy place_pos_sales_manager_all
on public.place_pos_sales
for all
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

create table if not exists public.place_expenses (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  category text,
  description text not null,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  spent_on date not null default current_date,
  status text not null default 'posted' check (status in ('posted', 'cancelled')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_expenses_place
  on public.place_expenses(place_id, spent_on desc);

drop trigger if exists place_expenses_set_updated_at
  on public.place_expenses;
create trigger place_expenses_set_updated_at
  before update on public.place_expenses
  for each row execute function public.tg_set_updated_at();

alter table public.place_expenses enable row level security;

drop policy if exists place_expenses_manager_all on public.place_expenses;
create policy place_expenses_manager_all
on public.place_expenses
for all
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

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
  if not public.app_can_manage_place(p_place_id) then
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
