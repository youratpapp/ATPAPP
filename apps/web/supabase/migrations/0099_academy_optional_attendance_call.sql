alter table public.place_academy_settings
  add column if not exists require_attendance_call boolean not null default false;

comment on column public.place_academy_settings.require_attendance_call is
  'When true, the academy requires teachers to mark attendance. Default false keeps tennis class flow centered on agenda and prior absence notices.';

create or replace function public.app_create_academy_makeup_credit(
  p_attendance_id uuid,
  p_notes text default null
)
returns table(
  id uuid,
  place_id uuid,
  class_id uuid,
  enrollment_id uuid,
  user_id uuid,
  source_attendance_id uuid,
  status text,
  notes text,
  used_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_att public.place_academy_attendance%rowtype;
begin
  select *
    into v_att
  from public.place_academy_attendance a
  where a.id = p_attendance_id;

  if v_att.id is null then
    raise exception 'presenca nao encontrada';
  end if;

  if not public.app_can_manage_place_academy(v_att.place_id) then
    raise exception 'nao autorizado';
  end if;

  raise exception 'reposicao so pode ser gerada por aviso previo de ausencia. Nao comparecimento registrado em chamada nao gera credito.';
end;
$$;

revoke all on function public.app_create_academy_makeup_credit(uuid, text) from public;
grant execute on function public.app_create_academy_makeup_credit(uuid, text) to authenticated;
