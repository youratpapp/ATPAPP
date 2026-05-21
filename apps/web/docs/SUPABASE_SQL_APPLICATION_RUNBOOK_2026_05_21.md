# Supabase SQL Application Runbook - 2026-05-21

## Contexto

O E2E de academia confirmou que a migration local `supabase/migrations/0098_fix_academy_staff_invite_attendance_ambiguity.sql` precisa ser aplicada no Supabase remoto `xdopstommqojjofapzjl`.

O ambiente atual possui `npx supabase` com `db query`, mas nao possui:

- projeto Supabase linkado;
- `SUPABASE_ACCESS_TOKEN`;
- `DATABASE_URL`;
- senha Postgres;
- service role key.

Por isso o SQL nao pode ser aplicado remotamente nesta sessao sem uma credencial de banco ou login do Supabase CLI.

## Migration pendente

```text
supabase/migrations/0098_fix_academy_staff_invite_attendance_ambiguity.sql
```

Ela corrige:

- `app_accept_place_staff_invite`: erro `column reference "place_id" is ambiguous`;
- `app_mark_academy_attendance`: erro `column reference "id" is ambiguous`.

## Opcao A - DATABASE_URL

Com `DATABASE_URL` de Postgres configurado no ambiente:

```powershell
npx.cmd supabase db query --db-url "$env:DATABASE_URL" --file supabase\migrations\0098_fix_academy_staff_invite_attendance_ambiguity.sql
```

## Opcao B - Projeto linkado pelo CLI

Com `SUPABASE_ACCESS_TOKEN` e senha do banco:

```powershell
$env:SUPABASE_ACCESS_TOKEN='<token>'
npx.cmd supabase link --project-ref xdopstommqojjofapzjl --password '<db-password>'
npx.cmd supabase db query --linked --file supabase\migrations\0098_fix_academy_staff_invite_attendance_ambiguity.sql
```

## QA obrigatorio apos aplicar

```powershell
$env:ATP_ACADEMY_FLOW_OUT_DIR='docs/screenshots/academy-e2e-flow-v1-2026-05-21-run5-after-0098'
node scripts\academy-e2e-flow-audit.mjs
```

Aceite:

- `completed: true`;
- `failedRequests: []`;
- `pageErrors: []`;
- `flowIssues: []` ou sem itens `staff-invite`;
- console sem `app_mark_academy_attendance` ambiguous;
- staff da academia nova aceita convite sem fallback;
- chamada persiste `Presente`/`Falta`.
