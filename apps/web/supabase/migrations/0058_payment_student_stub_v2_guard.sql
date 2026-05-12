-- Payment student-side stub v2 guard
-- Date: 2026-05-12

create or replace function public.app_mark_stub_payment_paid_v2(
  p_target_type text,
  p_target_id uuid,
  p_amount_cents integer default 0,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_billing_period text default ''
)
returns table(
  id uuid,
  user_id uuid,
  target_type text,
  target_id uuid,
  amount_cents integer,
  currency text,
  status text,
  provider text,
  description text,
  metadata jsonb,
  billing_period text,
  paid_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'pagamento do aluno deve ser confirmado pela plataforma';
end;
$$;

revoke all on function public.app_mark_stub_payment_paid_v2(text, uuid, integer, text, jsonb, text) from public;
grant execute on function public.app_mark_stub_payment_paid_v2(text, uuid, integer, text, jsonb, text) to authenticated;
