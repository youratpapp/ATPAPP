-- QA full demo seed - 06/08
-- CRM, POS, expenses, credit packages and credit purchases
-- Run files 01 through 08 in order on a staging/parallel Supabase project.

set search_path = public, auth, extensions;

-- ---------------------------------------------------------------------
-- 6) CRM, POS, sales and expenses
-- ---------------------------------------------------------------------

drop table if exists
  public.seed_products,
  public.seed_crm_contacts
cascade;

delete from public.app_payment_reminders
where target_type in ('academy_lesson_request', 'academy_student_contract', 'place_membership', 'court_booking')
  and (
    user_id in (select id from public.seed_users)
    or place_id in (select id from public.seed_places)
  );

delete from public.app_payments
where target_type = 'academy_lesson_request'
  and target_id in (
    select id
    from public.place_academy_lesson_requests
    where place_id in (select id from public.seed_places)
  );

delete from public.place_credit_purchases
where place_id in (select id from public.seed_places);

delete from public.place_credit_packages
where place_id in (select id from public.seed_places);

delete from public.place_expenses
where place_id in (select id from public.seed_places);

delete from public.place_pos_sales
where place_id in (select id from public.seed_places);

delete from public.place_pos_products
where place_id in (select id from public.seed_places);

delete from public.place_crm_interactions
where place_id in (select id from public.seed_places);

delete from public.place_crm_contacts
where place_id in (select id from public.seed_places);

create table public.seed_crm_contacts (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null,
  name text not null,
  phone text,
  email text,
  source text,
  interest text,
  status text,
  owner_label text,
  next_contact_on date
);

insert into public.seed_crm_contacts (place_id, name, phone, email, source, interest, status, owner_label, next_contact_on)
select
  p.id,
  u.display_name,
  u.phone,
  u.email,
  (array['Instagram','Indicacao','Pagina publica','WhatsApp','Evento'])[((n - 1) % 5) + 1],
  (array['Aula experimental','Plano mensal','Reserva recorrente','Torneio','Kids'])[((n - 1) % 5) + 1],
  case when n % 11 = 0 then 'archived' when n % 7 = 0 then 'converted' when n % 3 = 0 then 'contacted' else 'lead' end,
  (array['Recepcao','Comercial','Professor','Gestao'])[((n - 1) % 4) + 1],
  current_date + ((n % 9) - 4)
from public.seed_places p
cross join generate_series(1, 36) as gs(n)
join public.seed_users u on u.seq = 1000 + (((case p.key when 'adt' then 20 when 'pantanal' then 90 else 150 end) + n * 5) % 240) + 1;

insert into public.place_crm_contacts (
  id, place_id, name, phone, email, source, interest, status, notes, owner_label, next_contact_on, created_by, created_at, updated_at
)
select
  id,
  place_id,
  name,
  phone,
  email,
  source,
  interest,
  status,
  'Contato demo criado para validar CRM e follow-up.',
  owner_label,
  next_contact_on,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - ((20 + abs(('x' || substr(md5(id::text), 1, 4))::bit(16)::int) % 120) || ' days')::interval,
  now()
from public.seed_crm_contacts;

insert into public.place_crm_interactions (
  place_id, contact_id, interaction_type, body, next_contact_on, created_by, created_at
)
select
  c.place_id,
  c.id,
  (array['whatsapp','call','follow_up'])[((n - 1) % 3) + 1],
  case n when 1 then 'Primeiro contato realizado. Interesse confirmado.' else 'Retorno registrado. Definir proxima acao.' end,
  c.next_contact_on + n,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - ((n * 3 + 1) || ' days')::interval
from public.seed_crm_contacts c
cross join generate_series(1, 2) as gs(n);

create table public.seed_products (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null,
  name text not null,
  category text not null,
  price_cents integer not null,
  stock_quantity integer not null
);

insert into public.seed_products (place_id, name, category, price_cents, stock_quantity)
select p.id, x.product_name, x.category, x.price_cents, x.stock_quantity
from public.seed_places p
cross join (
  values
    ('Agua sem gas', 'Bebidas', 500, 40),
    ('Isotonico', 'Bebidas', 900, 22),
    ('Cafe espresso', 'Bebidas', 700, 60),
    ('Sanduiche natural', 'Lanches', 1800, 12),
    ('Barra de proteina', 'Lanches', 1500, 9),
    ('Overgrip', 'Pro shop', 2500, 18),
    ('Bola tubo', 'Pro shop', 5200, 7),
    ('Munhequeira', 'Pro shop', 3900, 4),
    ('Aluguel raquete', 'Servicos', 2000, 5),
    ('Suco natural', 'Bebidas', 1200, 16)
) as x(product_name, category, price_cents, stock_quantity);

insert into public.place_pos_products (
  id, place_id, name, category, price_cents, stock_quantity, is_active, created_at, updated_at
)
select id, place_id, name, category, price_cents, stock_quantity, true, now() - interval '5 months', now()
from public.seed_products;

insert into public.place_pos_sales (
  place_id, product_id, product_name, buyer_name, quantity, unit_amount_cents, total_amount_cents, status, sold_by, sold_at, created_at, updated_at
)
select
  pr.place_id,
  pr.id,
  pr.name,
  u.display_name,
  1 + (n % 2),
  pr.price_cents,
  (1 + (n % 2)) * pr.price_cents,
  'paid',
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - ((day_no || ' days')::interval) + make_interval(hours => 8 + (n % 10)),
  now() - ((day_no || ' days')::interval),
  now()
from public.seed_places p
join public.seed_products pr on pr.place_id = p.id
cross join generate_series(0, 90) as days(day_no)
cross join generate_series(1, 2) as gs(n)
join public.seed_users u on u.seq = 1000 + (((day_no * 7 + n * 13 + length(p.key)) % 240) + 1)
where pr.name in ('Agua sem gas', 'Isotonico', 'Cafe espresso', 'Sanduiche natural', 'Overgrip')
  and (day_no + n + length(pr.name)) % 5 <> 0;

insert into public.place_expenses (
  place_id, category, description, amount_cents, spent_on, status, created_by, created_at, updated_at
)
select
  p.id,
  x.category,
  x.description,
  x.amount_cents,
  (date_trunc('month', current_date) - (month_no || ' months')::interval + ((month_no % 8) + 2) * interval '1 day')::date,
  'posted',
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  date_trunc('month', current_date) - (month_no || ' months')::interval,
  now()
from public.seed_places p
cross join generate_series(0, 5) as months(month_no)
cross join (
  values
    ('Manutencao', 'Manutencao de quadras e iluminacao', 180000),
    ('Equipe', 'Comissao e apoio operacional', 260000),
    ('Produtos', 'Reposicao da cantina/pro shop', 95000)
) as x(category, description, amount_cents);


-- ---------------------------------------------------------------------
-- 6b) Credit packages and credit purchases
-- ---------------------------------------------------------------------

insert into public.place_credit_packages (
  place_id, name, package_type, quantity, price_cents, validity_days, is_active, created_at, updated_at
)
select
  p.id,
  pkg.name,
  pkg.package_type,
  pkg.quantity,
  pkg.price_cents,
  pkg.validity_days,
  true,
  now() - interval '4 months',
  now()
from public.seed_places p
cross join (
  values
    ('Pacote 10 reservas', 'court_credit', 10, 110000, 90),
    ('Pacote 5 reservas off-peak', 'court_credit', 5, 42000, 60),
    ('Aula avulsa particular', 'lesson_credit', 1, 9500, 30),
    ('Day pass visitante', 'day_pass', 1, 5500, 7)
) as pkg(name, package_type, quantity, price_cents, validity_days);

insert into public.place_credit_purchases (
  place_id, package_id, package_name, package_type, buyer_name, phone, initial_quantity, remaining_quantity,
  amount_cents, purchased_on, expires_on, status, notes, created_at, updated_at
)
select
  p.place_id,
  p.id,
  p.name,
  p.package_type,
  u.display_name,
  u.phone,
  p.quantity,
  case
    when n % 13 = 0 then 0
    when n % 7 = 0 then greatest(0, p.quantity - 1)
    else greatest(0, p.quantity - (n % greatest(1, p.quantity)))
  end,
  p.price_cents,
  (current_date - ((n * 5) || ' days')::interval)::date,
  (current_date - ((n * 5) || ' days')::interval + (p.validity_days || ' days')::interval)::date,
  case
    when n % 23 = 0 then 'cancelled'
    when current_date > (current_date - ((n * 5) || ' days')::interval + (p.validity_days || ' days')::interval)::date then 'expired'
    when n % 13 = 0 then 'used'
    else 'active'
  end,
  'Compra demo para validar pacotes, creditos e day pass.',
  now() - ((n * 5) || ' days')::interval,
  now()
from public.place_credit_packages p
join public.seed_places sp on sp.id = p.place_id
cross join generate_series(1, 18) as gs(n)
join public.seed_users u on u.seq = 1000 + (((case sp.key when 'adt' then 30 when 'pantanal' then 100 else 170 end) + n * 9) % 240) + 1;


-- ---------------------------------------------------------------------
-- 6c) Lesson request payments and payment reminders
-- ---------------------------------------------------------------------

insert into public.app_payments (
  user_id, target_type, target_id, amount_cents, currency, status, provider, description, metadata, billing_period, paid_at, created_at, updated_at
)
select
  r.requested_by,
  'academy_lesson_request',
  r.id,
  r.amount_cents,
  'BRL',
  case
    when r.payment_status = 'paid' then 'paid'
    when (abs(('x' || substr(md5(r.id::text), 1, 6))::bit(24)::int) % 23) = 0 then 'failed'
    else 'pending'
  end,
  'stub',
  case when r.request_type = 'drop_in' then 'Aula avulsa/drop-in' else 'Reposicao de aula' end,
  jsonb_build_object(
    'seed', true,
    'place_id', r.place_id,
    'class_id', r.class_id,
    'payment_kind', 'academy_lesson_request',
    'request_type', r.request_type
  ),
  '',
  case when r.payment_status = 'paid' then coalesce(r.approved_at, r.created_at + interval '1 hour') else null end,
  r.created_at,
  now()
from public.place_academy_lesson_requests r
where r.place_id in (select id from public.seed_places)
  and r.request_type = 'drop_in'
  and r.amount_cents > 0
  and r.status <> 'rejected'
  and r.requested_by is not null;

insert into public.app_payment_reminders (
  place_id, user_id, target_type, target_id, billing_period, channel, status, message, created_by, created_at, updated_at
)
select
  case
    when p.metadata ? 'place_id' then (p.metadata->>'place_id')::uuid
    else null
  end,
  p.user_id,
  p.target_type,
  p.target_id,
  p.billing_period,
  (array['manual','whatsapp','email'])[(((row_number() over (order by p.created_at, p.id) - 1) % 3) + 1)::integer],
  case
    when row_number() over (order by p.created_at, p.id) % 11 = 0 then 'cancelled'
    when row_number() over (order by p.created_at, p.id) % 4 = 0 then 'sent'
    else 'queued'
  end,
  'Lembrete demo de pagamento pendente: ' || coalesce(p.description, p.target_type),
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - (((row_number() over (order by p.created_at, p.id) % 9)::text || ' days')::interval),
  now()
from public.app_payments p
where p.status = 'pending'
  and p.target_type in ('academy_student_contract', 'place_membership', 'court_booking', 'academy_lesson_request')
  and (
    p.user_id in (select id from public.seed_users)
    or (p.metadata ? 'place_id' and (p.metadata->>'place_id')::uuid in (select id from public.seed_places))
  )
limit 160;


