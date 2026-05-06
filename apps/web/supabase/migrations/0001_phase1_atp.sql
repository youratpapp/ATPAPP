-- =====================================================================
-- ATP — Amateur Tennis Platform — Fase 1
-- Migration idempotente. Rodar no SQL Editor do Supabase.
-- Cobre: profiles, places, place_followers, ajustes em tournaments,
-- limpeza de campeonato_states.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabela profiles (extensão 1:1 de auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  photo_url      text,
  city           text,
  state          text,
  phone          text,
  birth_date     date,
  instagram      text,
  bio            text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "profiles_public_read_basic" on public.profiles;
create policy "profiles_public_read_basic"
  on public.profiles for select
  using (true);
-- Observação: RLS de SELECT permite leitura pública dos campos básicos
-- (display_name/photo_url/city/state) para mostrar avatares em listas
-- de torneios e seguidores. Se quiser proibir, troque o using para
-- (auth.uid() = user_id) e exponha um RPC para os campos públicos.

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "profiles_self_delete" on public.profiles;
create policy "profiles_self_delete"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- Trigger para manter updated_at
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------
-- 2) Tabela places (clubes / arenas / quadras)
-- ---------------------------------------------------------------------
create table if not exists public.places (
  id           uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  city         text,
  state        text,
  description  text,
  logo_url     text,
  cover_url    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_places_city_state on public.places (state, city);
create index if not exists idx_places_owner on public.places (owner_id);

alter table public.places enable row level security;

drop policy if exists "places_public_read" on public.places;
create policy "places_public_read"
  on public.places for select
  using (true);

drop policy if exists "places_owner_insert" on public.places;
create policy "places_owner_insert"
  on public.places for insert
  with check (auth.uid() = owner_id);

drop policy if exists "places_owner_update" on public.places;
create policy "places_owner_update"
  on public.places for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "places_owner_delete" on public.places;
create policy "places_owner_delete"
  on public.places for delete
  using (auth.uid() = owner_id);

drop trigger if exists places_set_updated_at on public.places;
create trigger places_set_updated_at
  before update on public.places
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------
-- 3) place_followers — quem segue qual local
-- ---------------------------------------------------------------------
create table if not exists public.place_followers (
  place_id    uuid not null references public.places(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (place_id, user_id)
);

create index if not exists idx_place_followers_user on public.place_followers (user_id);

alter table public.place_followers enable row level security;

drop policy if exists "place_followers_public_read" on public.place_followers;
create policy "place_followers_public_read"
  on public.place_followers for select
  using (true);

drop policy if exists "place_followers_self_follow" on public.place_followers;
create policy "place_followers_self_follow"
  on public.place_followers for insert
  with check (auth.uid() = user_id);

drop policy if exists "place_followers_self_unfollow" on public.place_followers;
create policy "place_followers_self_unfollow"
  on public.place_followers for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 4) tournaments — novas colunas + CHECK constraints
-- ---------------------------------------------------------------------
alter table public.tournaments
  add column if not exists place_id          uuid references public.places(id) on delete set null,
  add column if not exists poster_url        text,
  add column if not exists entry_fee_cents   integer,
  add column if not exists max_participants  integer,
  add column if not exists prize_info        text;

create index if not exists idx_tournaments_place on public.tournaments (place_id);
create index if not exists idx_tournaments_visibility_status on public.tournaments (visibility, status);
create index if not exists idx_tournaments_state_city on public.tournaments (state, city);

-- CHECK de status (idempotente: derruba antes de criar)
alter table public.tournaments
  drop constraint if exists tournaments_status_check;
alter table public.tournaments
  add constraint tournaments_status_check
  check (status in ('draft','registration_open','registration_closed','live','finished'));

-- CHECK de visibility
alter table public.tournaments
  drop constraint if exists tournaments_visibility_check;
alter table public.tournaments
  add constraint tournaments_visibility_check
  check (visibility in ('private','public'));

-- ---------------------------------------------------------------------
-- 5) Limpeza: dropar tabela órfã campeonato_states
--    (não é usada por React nem pelo legacy)
-- ---------------------------------------------------------------------
drop table if exists public.campeonato_states;

-- ---------------------------------------------------------------------
-- 6) Storage buckets (rodar manualmente se preferir via UI)
--    avatars: foto de perfil
--    places:  logo/cover de locais
--    tournaments: pôsteres
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('places', 'places', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('tournaments', 'tournaments', true)
  on conflict (id) do nothing;

-- Storage RLS: cada usuário só escreve em uma "pasta" com o próprio id.
-- Leitura pública (buckets marcados public).

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "places_owner_write" on storage.objects;
create policy "places_owner_write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'places'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "places_owner_update" on storage.objects;
create policy "places_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'places'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "places_owner_delete" on storage.objects;
create policy "places_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'places'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "tournaments_owner_write" on storage.objects;
create policy "tournaments_owner_write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'tournaments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "tournaments_owner_update" on storage.objects;
create policy "tournaments_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'tournaments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "tournaments_owner_delete" on storage.objects;
create policy "tournaments_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'tournaments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- Fim da migration 0001_phase1_atp.sql
-- =====================================================================
