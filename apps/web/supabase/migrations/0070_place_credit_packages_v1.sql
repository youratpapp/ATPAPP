-- Credit packages for courts, lessons and day passes.
-- Date: 2026-05-12

create table if not exists public.place_credit_packages (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  name text not null,
  package_type text not null default 'court_credit' check (package_type in ('court_credit', 'lesson_credit', 'day_pass')),
  quantity integer not null default 1 check (quantity > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  validity_days integer not null default 30 check (validity_days > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_credit_packages_place
  on public.place_credit_packages(place_id, is_active, created_at desc);

drop trigger if exists place_credit_packages_set_updated_at
  on public.place_credit_packages;
create trigger place_credit_packages_set_updated_at
  before update on public.place_credit_packages
  for each row execute function public.tg_set_updated_at();

alter table public.place_credit_packages enable row level security;

drop policy if exists place_credit_packages_manager_read on public.place_credit_packages;
create policy place_credit_packages_manager_read
on public.place_credit_packages
for select
to authenticated
using (public.app_can_manage_place(place_id));

drop policy if exists place_credit_packages_manager_write on public.place_credit_packages;
create policy place_credit_packages_manager_write
on public.place_credit_packages
for all
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

create table if not exists public.place_credit_purchases (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  package_id uuid references public.place_credit_packages(id) on delete set null,
  package_name text not null,
  package_type text not null default 'court_credit' check (package_type in ('court_credit', 'lesson_credit', 'day_pass')),
  buyer_name text not null,
  phone text,
  initial_quantity integer not null default 1 check (initial_quantity > 0),
  remaining_quantity integer not null default 1 check (remaining_quantity >= 0),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  purchased_on date not null default current_date,
  expires_on date,
  status text not null default 'active' check (status in ('active', 'used', 'expired', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_credit_purchases_place
  on public.place_credit_purchases(place_id, status, expires_on);

drop trigger if exists place_credit_purchases_set_updated_at
  on public.place_credit_purchases;
create trigger place_credit_purchases_set_updated_at
  before update on public.place_credit_purchases
  for each row execute function public.tg_set_updated_at();

alter table public.place_credit_purchases enable row level security;

drop policy if exists place_credit_purchases_manager_read on public.place_credit_purchases;
create policy place_credit_purchases_manager_read
on public.place_credit_purchases
for select
to authenticated
using (public.app_can_manage_place(place_id));

drop policy if exists place_credit_purchases_manager_write on public.place_credit_purchases;
create policy place_credit_purchases_manager_write
on public.place_credit_purchases
for all
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

create or replace function public.app_record_place_credit_purchase(
  p_place_id uuid,
  p_package_id uuid,
  p_buyer_name text,
  p_phone text default null,
  p_notes text default null
)
returns setof public.place_credit_purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  v_package public.place_credit_packages%rowtype;
begin
  if not public.app_can_manage_place(p_place_id) then
    raise exception 'nao autorizado';
  end if;

  select *
    into v_package
  from public.place_credit_packages
  where id = p_package_id
    and place_id = p_place_id
    and is_active = true;

  if v_package.id is null then
    raise exception 'pacote nao encontrado';
  end if;

  return query
  insert into public.place_credit_purchases (
    place_id,
    package_id,
    package_name,
    package_type,
    buyer_name,
    phone,
    initial_quantity,
    remaining_quantity,
    amount_cents,
    purchased_on,
    expires_on,
    notes
  )
  values (
    p_place_id,
    p_package_id,
    v_package.name,
    v_package.package_type,
    trim(p_buyer_name),
    nullif(trim(coalesce(p_phone, '')), ''),
    v_package.quantity,
    v_package.quantity,
    v_package.price_cents,
    current_date,
    current_date + v_package.validity_days,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning *;
end;
$$;

revoke all on function public.app_record_place_credit_purchase(uuid, uuid, text, text, text) from public;
grant execute on function public.app_record_place_credit_purchase(uuid, uuid, text, text, text) to authenticated;

create or replace function public.app_consume_place_credit_purchase(
  p_purchase_id uuid,
  p_units integer default 1
)
returns setof public.place_credit_purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase public.place_credit_purchases%rowtype;
  v_units integer := greatest(1, coalesce(p_units, 1));
  v_remaining integer;
begin
  select *
    into v_purchase
  from public.place_credit_purchases
  where id = p_purchase_id
  for update;

  if v_purchase.id is null then
    raise exception 'compra nao encontrada';
  end if;

  if not public.app_can_manage_place(v_purchase.place_id) then
    raise exception 'nao autorizado';
  end if;

  if v_purchase.status <> 'active' then
    raise exception 'compra sem saldo ativo';
  end if;

  v_remaining := greatest(0, v_purchase.remaining_quantity - v_units);

  return query
  update public.place_credit_purchases
    set remaining_quantity = v_remaining,
        status = case when v_remaining = 0 then 'used' else status end
  where id = p_purchase_id
  returning *;
end;
$$;

revoke all on function public.app_consume_place_credit_purchase(uuid, integer) from public;
grant execute on function public.app_consume_place_credit_purchase(uuid, integer) to authenticated;

notify pgrst, 'reload schema';
