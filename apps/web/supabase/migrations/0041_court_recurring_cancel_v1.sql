-- Court recurring cancel v1
-- Date: 2026-05-11

create or replace function public.app_cancel_court_booking_series(
  p_booking_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_booking public.court_bookings%rowtype;
  v_cancelled integer;
begin
  select *
    into v_booking
  from public.court_bookings b
  where b.id = p_booking_id;

  if v_booking.id is null then
    raise exception 'reserva nao encontrada';
  end if;

  if not (v_booking.user_id = auth.uid() or public.app_can_manage_place(v_booking.place_id)) then
    raise exception 'nao autorizado';
  end if;

  if v_booking.recurrence_group_id is null then
    update public.court_bookings
      set status = 'cancelled'
    where court_bookings.id = v_booking.id
      and court_bookings.status <> 'cancelled';
  else
    update public.court_bookings
      set status = 'cancelled'
    where court_bookings.recurrence_group_id = v_booking.recurrence_group_id
      and court_bookings.status <> 'cancelled'
      and court_bookings.ends_at >= now();
  end if;

  get diagnostics v_cancelled = row_count;
  return v_cancelled;
end;
$$;

revoke all on function public.app_cancel_court_booking_series(uuid) from public;
grant execute on function public.app_cancel_court_booking_series(uuid) to authenticated;
