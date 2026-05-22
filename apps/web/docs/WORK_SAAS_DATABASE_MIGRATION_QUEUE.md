# Work SaaS Database Migration Queue

Date: 2026-05-21  
Status: DB-specific queue to complete before Work SaaS UI implementation. Current closure report: `WORK_SAAS_DATABASE_MIGRATION_CLOSURE_REPORT.md`.

## Objective

Close the gap between local migrations, remote schema and the app code before starting the Work SaaS restructure.

This is required because the final visual audit found repeated `400` responses for `place_academy_settings`, and previous E2E reports documented ambiguous-column RPC errors in academy and league flows.

## Known Local Migration Scope

Canonical active folder for the web app:

- `web/supabase/migrations/`

Observed range:

- `0001_phase1_atp.sql` through `0099_academy_optional_attendance_call.sql`

Additional root-level migration folder observed:

- `../../supabase/migrations/`

Root files observed:

- `20260506_player_first_schema.sql`
- `20260506_tournament_registrations.sql`

Before applying anything, decide whether root-level migrations are legacy/reference or belong to another app/package.

## Known Numbering Attention

The active web migrations include duplicate numeric prefixes:

- `0092_fix_tournament_result_submission_rpc_return.sql`
- `0092_player_private_notes_v1.sql`
- `0096_court_booking_change_requests_v1.sql`
- `0096_league_match_room_links_v1.sql`

This is not automatically wrong, but migration comparison must not rely only on numeric prefix.

## Known DB Blockers

### ACADEMY-DB-01

Error:

- `app_accept_place_staff_invite`: `column reference "place_id" is ambiguous`

Fix source:

- `supabase/migrations/0098_fix_academy_staff_invite_attendance_ambiguity.sql`

Required validation:

- professor, frontdesk and finance staff can accept invite in a newly created academy without fallback.

### ACADEMY-DB-02

Error:

- `app_mark_academy_attendance`: `column reference "id" is ambiguous`

Fix source:

- `supabase/migrations/0098_fix_academy_staff_invite_attendance_ambiguity.sql`

Required validation:

- attendance RPC no longer throws raw SQL error.
- product decision still defaults attendance off unless required.

### ACADEMY-DB-03

Error:

- `place_academy_settings` select returns `400` when requesting:
  - `require_attendance_call`
  - `makeup_notice_hours`
  - `auto_create_makeup_credit_on_notice`

Fix sources to verify:

- earlier academy settings migrations;
- `0099_academy_optional_attendance_call.sql`.

Required validation:

- manager/coach/player-owner visual audit has no repeated 400 for this select.

Current 2026-05-21 probe:

- Remote target is reachable.
- `place_academy_settings.require_attendance_call` is still missing remotely.
- `WORK_SAAS_DATABASE_MIGRATION_CLOSURE_REPORT.md` marks Phase 0B as blocked until `0099_academy_optional_attendance_call.sql` is applied.

### LEAGUE-DB-01

Error:

- `app_generate_next_league_round`: ambiguous `class_id`.

Fix source:

- `supabase/migrations/0097_fix_league_generate_round_class_id_ambiguity.sql`

Required validation:

- owner can generate next league round without fallback.

## DB Queue Items

### DBMIG-01 - Inventory Local Migrations

Deliverable:

- migration inventory table with file, path, purpose, risk and status.

Acceptance:

- duplicate prefixes are documented.
- root vs web migration ownership is decided.

### DBMIG-02 - Establish Remote Connection Safely

Deliverable:

- target project confirmed.
- backup/export plan documented.
- command style selected.

Commands to document:

```powershell
npx.cmd supabase db query --db-url "$env:DATABASE_URL" --file supabase\migrations\<file>.sql
```

or

```powershell
npx.cmd supabase link --project-ref <project-ref>
npx.cmd supabase db push
```

Acceptance:

- no SQL is applied to an unknown target.

### DBMIG-03 - Compare Remote Schema

Deliverable:

- remote schema comparison report.

Must probe:

- columns required by app;
- RPC function definitions;
- table existence;
- policies/permissions relevant to staff roles.

Acceptance:

- missing/uncertain/applied migrations are listed.

### DBMIG-04 - Apply Critical Migrations

Minimum critical set:

- `0097_fix_league_generate_round_class_id_ambiguity.sql`
- `0098_fix_academy_staff_invite_attendance_ambiguity.sql`
- `0099_academy_optional_attendance_call.sql`

Verify whether these are already applied before applying.

Acceptance:

- command result recorded;
- no schema cache mismatch remains.

### DBMIG-05 - Validate Critical RPCs

RPCs:

- `app_accept_place_staff_invite`
- `app_mark_academy_attendance`
- `app_generate_next_league_round`
- `app_submit_tournament_match_result`
- `app_set_tournament_registration_status`
- booking change request functions;
- payment mark-paid functions;
- staff role permission helpers.

Acceptance:

- no raw SQL ambiguity errors.

### DBMIG-06 - Validate Seed Accounts

Accounts:

- `escalao@gmail.com`
- `qa.jogador.puro@demo.atp.local`
- `jogador001@demo.atp.local`
- `jogador002@demo.atp.local`
- `organizador.circuito@demo.atp.local`
- `prof.renato@demo.atp.local`
- `prof.lais@demo.atp.local`
- `recepcao.prime@demo.atp.local`
- `recepcao.dourados@demo.atp.local`
- `financeiro.prime@demo.atp.local`
- `caixa.prime@demo.atp.local`

Acceptance:

- each role can log in and reach expected first route.

### DBMIG-07 - Run Integrity Queries

Sources:

- `supabase/seeds/qa_demo/10_verify_seed_integrity.sql`

Acceptance:

- no critical entity missing for planned QA.

### DBMIG-08 - Re-run Visual Diagnostics

Routes:

- `/gestao`
- professor work entry;
- manager academy route;
- academy today;
- league owner route;
- tournament organization route.

Acceptance:

- no repeated 400 for academy settings.
- diagnostics summary reviewed.

### DBMIG-09 - Review Temporary Fallbacks

Deliverable:

- list of fallbacks to keep/remove after migrations.

Acceptance:

- no hidden fallback masks stale production schema.

### DBMIG-10 - Publish Closure Report

File:

- `docs/WORK_SAAS_DATABASE_MIGRATION_CLOSURE_REPORT.md`

Acceptance:

- Work SaaS UI implementation can start with known DB state.

## Completion Gate

DB closure is complete only when:

- remote target is known;
- migration status is known;
- critical migrations are applied or confirmed;
- critical RPCs pass;
- seed accounts pass;
- visual diagnostics no longer show known schema 400s;
- a closure report exists.
