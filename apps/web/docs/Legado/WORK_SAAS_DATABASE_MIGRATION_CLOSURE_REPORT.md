# Work SaaS Database Migration Closure Report

Date: 2026-05-21  
Queue: Phase 0B - `DBMIG-01` through `DBMIG-10`  
Status: blocked, not closed.  
Target detected: `xdopstommqojjofapzjl.supabase.co`

## Executive Result

Phase 0B cannot be marked complete in this environment because the remote database is confirmed to be missing at least one required migration column, and this session does not have a database write credential.

Implementation of UI that depends on academy settings must not assume the remote schema is current.

## What Was Verified

### Local migration inventory

Active local folder:

- `web/supabase/migrations/`

Observed:

- 101 SQL migration files.
- Range: `0001_phase1_atp.sql` through `0099_academy_optional_attendance_call.sql`.

Additional root-level migration folder:

- `../../supabase/migrations/`

Observed root files:

- `20260506_player_first_schema.sql`
- `20260506_tournament_registrations.sql`

Decision:

- The web app canonical active migration folder remains `web/supabase/migrations/`.
- Root-level migrations are historical/reference until a separate ownership decision says otherwise.

### Duplicate numeric prefixes

Observed local duplicate prefixes:

| Prefix | Files | Risk |
|---|---|---|
| `0092` | `0092_fix_tournament_result_submission_rpc_return.sql`, `0092_player_private_notes_v1.sql` | migration comparison must use full filename, not only numeric prefix |
| `0096` | `0096_court_booking_change_requests_v1.sql`, `0096_league_match_room_links_v1.sql` | migration comparison must use full filename, not only numeric prefix |

### Critical local migrations

| Migration | Local status | Remote evidence | Status |
|---|---|---|---|
| `0097_fix_league_generate_round_class_id_ambiguity.sql` | exists | not directly validated; requires DB/RPC credential or owner E2E | unknown remote |
| `0098_fix_academy_staff_invite_attendance_ambiguity.sql` | exists | previous audit documented it as missing before; current session lacks RPC validation credential | unknown remote |
| `0099_academy_optional_attendance_call.sql` | exists | REST probe confirms missing column | missing remote |

## Remote Schema Probe

Using only the configured frontend anon environment:

- `VITE_SUPABASE_URL`: present.
- `VITE_SUPABASE_ANON_KEY`: present.
- `DATABASE_URL`: not present.
- `SUPABASE_ACCESS_TOKEN`: not present.
- linked Supabase CLI project: not present.

Probe:

```text
GET /rest/v1/place_academy_settings?select=place_id,makeup_notice_hours,auto_create_makeup_credit_on_notice,require_attendance_call,updated_by,created_at,updated_at&limit=1
```

Result:

```text
status: 400
code: 42703
message: column place_academy_settings.require_attendance_call does not exist
```

Control probe:

```text
GET /rest/v1/places?select=id,name&limit=1
```

Result:

```text
status: 200
target reachable
```

Conclusion:

- The target Supabase project is reachable.
- The `place_academy_settings` table exists.
- The remote schema is missing `require_attendance_call`, which is added locally by `0099_academy_optional_attendance_call.sql`.

## Supabase CLI / Credential Check

Supabase CLI:

```text
npx supabase --version -> 2.101.0
```

Project list:

```text
Access token not provided.
```

Migration list:

```text
Cannot find project ref. Have you run supabase link?
```

Conclusion:

- CLI exists.
- Environment is not logged in/linked.
- No safe DB write can be performed from this session.

## Required SQL Before Closing Phase 0B

At minimum, apply:

```powershell
npx.cmd supabase db query --db-url "$env:DATABASE_URL" --file supabase\migrations\0099_academy_optional_attendance_call.sql
```

If previous academy/league blockers remain, also apply/verify:

```powershell
npx.cmd supabase db query --db-url "$env:DATABASE_URL" --file supabase\migrations\0097_fix_league_generate_round_class_id_ambiguity.sql
npx.cmd supabase db query --db-url "$env:DATABASE_URL" --file supabase\migrations\0098_fix_academy_staff_invite_attendance_ambiguity.sql
```

Alternative with linked CLI:

```powershell
$env:SUPABASE_ACCESS_TOKEN='<token>'
npx.cmd supabase link --project-ref xdopstommqojjofapzjl --password '<db-password>'
npx.cmd supabase db query --linked --file supabase\migrations\0097_fix_league_generate_round_class_id_ambiguity.sql
npx.cmd supabase db query --linked --file supabase\migrations\0098_fix_academy_staff_invite_attendance_ambiguity.sql
npx.cmd supabase db query --linked --file supabase\migrations\0099_academy_optional_attendance_call.sql
```

## Validation Required After SQL

After applying migrations:

1. Re-run the REST probe for `place_academy_settings`.
2. Validate `app_accept_place_staff_invite`.
3. Validate `app_mark_academy_attendance` no longer returns ambiguous `id`.
4. Validate `app_generate_next_league_round` no longer returns ambiguous `class_id`.
5. Re-run academy visual diagnostics.
6. Re-run league owner round generation smoke.

Acceptance:

- No 400 for `require_attendance_call`.
- No ambiguous-column SQL errors.
- No frontend fallback masking stale schema.

## DBMIG Status

| Item | Status | Notes |
|---|---|---|
| `DBMIG-01` Inventory local migrations | complete | 101 web migrations, 2 root reference migrations, duplicate prefixes documented |
| `DBMIG-02` Establish remote connection safely | blocked | target detected, no DB write credential available |
| `DBMIG-03` Compare remote schema | partial | REST confirms one missing column; full schema compare needs DB access |
| `DBMIG-04` Apply critical migrations | blocked | no `DATABASE_URL`, no linked CLI, no access token |
| `DBMIG-05` Validate critical RPCs | blocked | needs authenticated/authorized flow after SQL |
| `DBMIG-06` Validate seed accounts | not run in this gate | requires Playwright/login sweep after SQL |
| `DBMIG-07` Integrity queries | blocked | needs SQL execution |
| `DBMIG-08` Re-run visual diagnostics | blocked for final acceptance | should run after SQL |
| `DBMIG-09` Review temporary fallbacks | partial | known fallback risk documented |
| `DBMIG-10` Publish closure report | complete as blocked report | this file |

## Gate Decision

Phase 0B is not closed.

Safe next work:

- Documentation.
- Route/permission contracts.
- Local code refactors that do not depend on missing DB columns.
- UI shell preparation if it preserves fallback behavior and does not rely on `require_attendance_call`.

Unsafe next work:

- Removing academy settings fallbacks.
- Relying on mandatory/optional attendance settings from remote.
- Final QA signoff for academy, league round generation or staff invite flows.

