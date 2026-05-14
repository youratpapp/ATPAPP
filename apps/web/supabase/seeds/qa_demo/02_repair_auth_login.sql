-- QA full demo seed - auth login repair
-- Non-destructive repair for demo users already inserted into auth.users.
-- Use this if /auth/v1/token returns "Database error querying schema".

set search_path = public, auth, extensions;

create extension if not exists pgcrypto;

update auth.users
set
  instance_id = coalesce(instance_id, '00000000-0000-0000-0000-000000000000'::uuid),
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = crypt(
    case
      when lower(email) = 'escalao@gmail.com' then 'Escalao@2026!'
      when lower(email) like 'jogador%@demo.atp.local' then 'Jogador@2026!'
      else 'Staff@2026!'
    end,
    gen_salt('bf')
  ),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmation_token = coalesce(confirmation_token, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  recovery_token = coalesce(recovery_token, ''),
  raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
  raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb),
  updated_at = now()
where lower(email) = 'escalao@gmail.com'
   or lower(email) like '%@demo.atp.local';

delete from auth.identities i
using auth.users u
where i.user_id = u.id
  and (lower(u.email) = 'escalao@gmail.com' or lower(u.email) like '%@demo.atp.local');

do $$
declare
  v_identity_id_type text;
  v_has_provider_id boolean;
  v_provider_id_insertable boolean;
  v_id_expr text;
  v_columns text;
  v_selects text;
begin
  select data_type
    into v_identity_id_type
  from information_schema.columns
  where table_schema = 'auth'
    and table_name = 'identities'
    and column_name = 'id';

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'identities'
      and column_name = 'provider_id'
  )
  into v_has_provider_id;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'identities'
      and column_name = 'provider_id'
      and is_generated = 'NEVER'
  )
  into v_provider_id_insertable;

  v_id_expr := case
    when v_identity_id_type = 'uuid' then 'gen_random_uuid()'
    else 'u.id::text'
  end;

  v_columns := 'id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at';
  v_selects := v_id_expr || ', u.id, jsonb_build_object(''sub'', u.id::text, ''email'', u.email, ''email_verified'', true, ''phone_verified'', false), ''email'', now(), now(), now()';

  if v_has_provider_id and v_provider_id_insertable then
    v_columns := 'id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at';
    v_selects := v_id_expr || ', u.id, u.id::text, jsonb_build_object(''sub'', u.id::text, ''email'', u.email, ''email_verified'', true, ''phone_verified'', false), ''email'', now(), now(), now()';
  end if;

  execute 'insert into auth.identities (' || v_columns || ') select ' || v_selects || ' from auth.users u where lower(u.email) = ''escalao@gmail.com'' or lower(u.email) like ''%@demo.atp.local''';
end;
$$;

select
  'qa_demo_auth_login_repaired' as status,
  count(*) filter (where lower(email) = 'escalao@gmail.com') as owner_users,
  count(*) filter (where lower(email) like '%@demo.atp.local') as demo_users
from auth.users
where lower(email) = 'escalao@gmail.com'
   or lower(email) like '%@demo.atp.local';
