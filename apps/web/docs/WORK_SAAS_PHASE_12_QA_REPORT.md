# Work SaaS Phase 12 QA Report

Date: 2026-05-21

## Scope

Phase 12 covered the transversal QA gate for the work/player/competition restructure sprint:

- persona navigation smoke;
- route regression smoke;
- console diagnostics by viewport;
- build/lint/type gates;
- source scans for removed product terms and mojibake.

This report records the final state after the schema-compatible academy settings fallback and copy cleanup.

## Automated Gates

| Gate | Result | Notes |
| --- | --- | --- |
| `npm.cmd run lint` | Pass | ESLint completed with 0 errors/warnings after removing a dead league block and a redundant hook dependency. |
| `npm.cmd run build` | Pass | TypeScript project build and Vite production build passed. |
| `npx.cmd tsc -b --pretty false` | Pass | Typecheck passed during the fallback correction. |
| Source scan | Pass | No hits for `false &&`, `fluxo`, `Fluxo`, `Ã`, `Â`, or visible `Clientes` in `src/pages`, `src/components`, `src/lib`. |

## Visual/Console Smoke

Final broad smoke:

- Folder: `docs/screenshots/work-saas-sprint-final-smoke-after-fallback-2026-05-21`
- Routes: `#/inicio`, `#/locais`, `#/eventos`, `#/agenda`, `#/perfil`, `#/gestao`
- Viewports: `mobile-390`, `mobile-430`, `desktop-1366`, `desktop-wide`
- Screenshots: 24
- Diagnostic JSON files: 27
- Console errors/warnings: 0

Final work copy recheck:

- Folder: `docs/screenshots/work-saas-sprint-final-work-after-copy-2026-05-21`
- Route: `#/gestao`
- Viewports: `mobile-390`, `mobile-430`, `desktop-1366`, `desktop-wide`
- Console errors/warnings: 0

## Persona Coverage

| Persona | Coverage In This Gate | Result |
| --- | --- | --- |
| Jogador puro | `#/inicio`, `#/locais`, `#/eventos`, `#/agenda`, `#/perfil` | Pass smoke |
| Aluno | `#/agenda` with personal agenda structure | Pass smoke |
| Sócio/reservas | `#/locais` and `#/agenda` route smoke | Pass smoke |
| Jogador competitivo | `#/eventos` and personal agenda route smoke | Pass smoke |
| Professor | `#/gestao` role-aware work entry smoke | Pass smoke |
| Recepção | Work navigation/copy covered by source and previous role screenshots | Pass source/build; needs role-specific manual replay before release |
| Financeiro | Revenue naming/build covered by source and prior screenshots | Pass source/build; needs role-specific manual replay before release |
| Caixa | POS naming/build covered by source and prior screenshots | Pass source/build; needs role-specific manual replay before release |
| Gestor | `#/gestao` management entry smoke | Pass smoke |
| Organizador | `#/eventos` player boundary and work route smoke | Pass smoke; tournament/league E2E remains separate |
| Multi-papel | Mode selector present in smoke screenshots | Pass smoke |

## Issues Found And Fixed During Phase 12

1. `LeagueDetailsPage.tsx` had a dead `false && showOwnerLeagueFocus` panel from a previous league cockpit transition. It broke lint and risked future confusion. Removed.
2. `ManagementHubPage.tsx` had an unnecessary `places.length` dependency in a memo. Removed.
3. `/gestao` produced repeated Supabase REST `400` diagnostics for `place_academy_settings.require_attendance_call` while the remote migration is not applied. Fixed frontend compatibility by selecting `*` and treating the column as optional.
4. Remaining visible `Clientes` labels in the manager hub were changed to `Pessoas` / `Pessoas/CRM`, while preserving the internal `clients` module and legacy route alias.

## Route Regression Notes

Smoke confirmed direct navigation for:

- `#/inicio`
- `#/locais`
- `#/eventos`
- `#/agenda`
- `#/perfil`
- `#/gestao`

Previously preserved aliases remain in code:

- `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas`, `/meus-pagamentos` as personal agenda entries/wrappers.
- `/gestao/:placeId/clientes` as legacy alias to the Pessoas module.
- `/gestao/:placeId/financeiro` as legacy alias to Receita.

## Remaining Risk

The remote database still should receive `supabase/migrations/0099_academy_optional_attendance_call.sql` so `requireAttendanceCall` can persist as a real setting. The frontend no longer throws console errors without it, but saving that specific setting relies on either the migration or the fallback path that omits the new column.

Full tournament, league and academy E2E scripts exist and were part of the broader workstream. This Phase 12 closeout performed broad route smoke plus final console gates, not another full data-mutating tournament/league/academy replay.

