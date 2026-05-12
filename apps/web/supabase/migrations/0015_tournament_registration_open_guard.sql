-- Tournament registration open guard
-- Date: 2026-05-11

drop policy if exists tournament_registrations_self_insert on public.tournament_registrations;
create policy tournament_registrations_self_insert
on public.tournament_registrations
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.tournaments t
    where t.id = tournament_id
      and t.status = 'registration_open'
      and (
        t.registration_close_at is null
        or t.registration_close_at >= now()
      )
  )
);

create or replace function public.app_request_tournament_registration(
  p_tournament_id uuid,
  p_category_id text,
  p_class_id text,
  p_category_name text,
  p_class_name text,
  p_player_name text,
  p_phone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tournament public.tournaments%rowtype;
  v_category_id text := nullif(trim(coalesce(p_category_id, '')), '');
  v_class_id text := trim(coalesce(p_class_id, ''));
  v_category_name text := nullif(trim(coalesce(p_category_name, '')), '');
  v_class_name text := nullif(trim(coalesce(p_class_name, '')), '');
  v_player_name text := trim(coalesce(p_player_name, ''));
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
begin
  select *
    into v_tournament
  from public.tournaments
  where id = p_tournament_id;

  if v_tournament.id is null then
    raise exception 'torneio nao encontrado';
  end if;

  if coalesce(v_tournament.status, '') <> 'registration_open' then
    raise exception 'inscricoes fechadas';
  end if;

  if v_tournament.registration_close_at is not null
    and v_tournament.registration_close_at < now() then
    raise exception 'prazo de inscricao encerrado';
  end if;

  if v_class_id = '' then
    raise exception 'selecione uma classe';
  end if;

  if v_player_name = '' then
    raise exception 'informe seu nome';
  end if;

  if exists (
    select 1
    from public.tournament_registrations r
    where r.tournament_id = p_tournament_id
      and r.user_id = auth.uid()
      and r.class_id = v_class_id
      and r.status in ('pending', 'approved', 'waitlist')
  ) then
    raise exception 'voce ja possui solicitacao pendente/aprovada ou em lista de espera nesta classe';
  end if;

  insert into public.tournament_registrations (
    tournament_id,
    user_id,
    category_id,
    class_id,
    category_name,
    class_name,
    player_name,
    phone,
    status
  )
  values (
    p_tournament_id,
    auth.uid(),
    v_category_id,
    v_class_id,
    coalesce(v_category_name, 'Categoria'),
    coalesce(v_class_name, 'Classe'),
    v_player_name,
    v_phone,
    'pending'
  );
end;
$$;

revoke all on function public.app_request_tournament_registration(uuid, text, text, text, text, text, text) from public;
grant execute on function public.app_request_tournament_registration(uuid, text, text, text, text, text, text) to authenticated;
