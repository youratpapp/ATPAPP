-- Consolidated place operations report.
-- Date: 2026-05-27

create or replace function public.app_place_operations_report(
  p_place_id uuid,
  p_starts_at timestamptz default date_trunc('day', now()),
  p_ends_at timestamptz default date_trunc('day', now()) + interval '1 day'
)
returns table(
  metric_key text,
  metric_label text,
  metric_value numeric,
  amount_cents integer,
  detail text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_end timestamptz;
begin
  if p_place_id is null then
    raise exception 'local obrigatorio';
  end if;

  if not (
    public.app_can_manage_place(p_place_id)
    or public.app_can_manage_place_bookings(p_place_id)
    or public.app_can_manage_place_academy(p_place_id)
    or public.app_can_manage_place_finance(p_place_id)
  ) then
    raise exception 'nao autorizado';
  end if;

  v_start := coalesce(p_starts_at, date_trunc('day', now()));
  v_end := coalesce(p_ends_at, v_start + interval '1 day');

  if v_end <= v_start then
    raise exception 'periodo invalido';
  end if;

  return query
  select
    'bookings_total'::text,
    'Reservas no periodo'::text,
    count(*)::numeric,
    null::integer,
    'Reservas confirmadas ou pendentes no periodo selecionado.'::text
  from public.court_bookings b
  where b.place_id = p_place_id
    and b.status <> 'cancelled'
    and b.starts_at >= v_start
    and b.starts_at < v_end;

  return query
  select
    'booking_hours'::text,
    'Horas reservadas'::text,
    coalesce(sum(extract(epoch from (least(b.ends_at, v_end) - greatest(b.starts_at, v_start))) / 3600), 0)::numeric,
    null::integer,
    'Soma de horas ocupadas por reservas dentro do periodo.'::text
  from public.court_bookings b
  where b.place_id = p_place_id
    and b.status <> 'cancelled'
    and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(v_start, v_end, '[)');

  return query
  select
    'bookings_cancelled'::text,
    'Reservas canceladas'::text,
    count(*)::numeric,
    null::integer,
    'Cancelamentos dentro do periodo selecionado.'::text
  from public.court_bookings b
  where b.place_id = p_place_id
    and b.status = 'cancelled'
    and b.updated_at >= v_start
    and b.updated_at < v_end;

  return query
  select
    'active_classes'::text,
    'Turmas ativas'::text,
    count(*)::numeric,
    null::integer,
    'Turmas ativas da academia.'::text
  from public.place_academy_classes c
  where c.place_id = p_place_id
    and c.is_active = true;

  return query
  select
    'active_enrollments'::text,
    'Alunos ativos em turmas'::text,
    count(*)::numeric,
    null::integer,
    'Matriculas ativas vinculadas a turmas.'::text
  from public.place_academy_enrollments e
  where e.place_id = p_place_id
    and e.status = 'active';

  return query
  select
    'active_memberships'::text,
    'Socios ativos'::text,
    count(*)::numeric,
    null::integer,
    'Planos de socio ativos.'::text
  from public.place_memberships m
  where m.place_id = p_place_id
    and m.status = 'active';

  return query
  select
    'expenses_total'::text,
    'Despesas no periodo'::text,
    count(*)::numeric,
    coalesce(sum(e.amount_cents), 0)::integer,
    'Despesas registradas no periodo.'::text
  from public.place_expenses e
  where e.place_id = p_place_id
    and e.status <> 'cancelled'
    and e.spent_on >= v_start::date
    and e.spent_on < v_end::date;

  return query
  select
    'pos_sales_total'::text,
    'Vendas POS no periodo'::text,
    count(*)::numeric,
    coalesce(sum(s.total_amount_cents), 0)::integer,
    'Vendas de loja/POS no periodo.'::text
  from public.place_pos_sales s
  where s.place_id = p_place_id
    and s.status <> 'cancelled'
    and s.sold_at >= v_start
    and s.sold_at < v_end;
end;
$$;

revoke all on function public.app_place_operations_report(uuid, timestamptz, timestamptz) from public;
grant execute on function public.app_place_operations_report(uuid, timestamptz, timestamptz) to authenticated;
