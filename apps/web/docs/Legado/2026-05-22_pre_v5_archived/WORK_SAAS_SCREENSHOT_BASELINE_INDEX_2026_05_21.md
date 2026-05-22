# Work SaaS Screenshot Baseline Index - 2026-05-21

Date: 2026-05-21  
Queue: `WSAAS3-00D`  
Status: Phase 0A baseline index.

## Purpose

Make the current visual/UX evidence easy to compare after each Work SaaS sprint.

This baseline is not the target design. It is the evidence set showing current problems and current state before the V3 implementation.

## Evidence Summary

| Folder | Persona/scope | Screenshot count | Size MB | Use |
|---|---|---:|---:|---|
| `docs/screenshots/work-saas-final-architecture-2026-05-21-player-owner/` | player + owner mixed routes | 52 | 47.26 | player/work boundary, owner first fold, route smoke |
| `docs/screenshots/work-saas-final-architecture-2026-05-21-manager/` | manager/owner SaaS work | 56 | 75.77 | web work shell, unit/admin pages, reports/settings clutter |
| `docs/screenshots/work-saas-final-architecture-2026-05-21-coach/` | coach-only | 24 | 43.81 | professor mobile/work operation and permission filtering |
| `docs/screenshots/work-saas-final-architecture-2026-05-21-frontdesk/` | frontdesk | 32 | 61.98 | reservation/client/aula operational flow |
| `docs/screenshots/work-saas-final-architecture-2026-05-21-finance/` | finance | 28 | 50.56 | revenue separation and finance-only nav |
| `docs/screenshots/work-saas-final-architecture-2026-05-21-cashier/` | cashier/POS | 28 | 31.63 | sell-first mobile/web flow |
| `docs/screenshots/work-saas-final-architecture-2026-05-21-organizer/` | organizer/Competition OS | 28 | 23.07 | work competition hub and organizer boundary |

Total:

- 248 screenshots.
- About 334 MB.

## Viewports

Each major future sprint must compare:

- mobile 390px;
- mobile 430px;
- desktop 1366px;
- desktop wide.

## Critical Comparison Routes

### Player App

- `/inicio`
- `/locais`
- `/eventos`
- `/agenda`
- `/perfil`

Check:

- player first fold does not show work/admin;
- personal agenda includes reservations, classes, matches and payments;
- no duplicate Aulas/Pagamentos nav when Agenda already owns personal timeline.

### SaaS Web Work

- `/gestao`
- `/gestao/:placeId`
- `/gestao/:placeId/agenda`
- `/gestao/:placeId/academia`
- `/gestao/:placeId/clientes`
- `/gestao/:placeId/financeiro`
- `/gestao/:placeId/cantina`
- `/gestao/:placeId/equipe`
- `/gestao/:placeId/ajustes`

Check:

- one Work shell;
- logo/header/mode selector consistent;
- domain navigation not a flat module dump;
- page first fold answers what needs action now;
- setup/reports are not competing with daily work.

### Mobile Work

- coach `/gestao`;
- frontdesk `/gestao`;
- finance `/gestao`;
- cashier `/gestao`;
- organizer work route.

Check:

- no full SaaS tree on mobile;
- CTA appears early;
- role-specific nav is visible and short;
- long setup/report pages are avoided.

### Competition OS

- `/eventos?modo=organizing`
- `/eventos/torneios?view=organizing`
- `/eventos/ligas?view=organizing`
- `/eventos/:tournamentId/organizacao`
- `/eventos/ligas/:leagueId`

Check:

- player discovery remains separate from organizer operation;
- tournament/league phase blocker appears in first fold;
- staff roles do not lose authorized tools.

## Screenshot Naming For New Sprints

Use:

```text
docs/screenshots/work-saas-v3-<phase>-<date>-<persona>/<viewport>-<route-slug>.png
```

Examples:

- `docs/screenshots/work-saas-v3-phase1-2026-05-21-manager/1366-gestao-place-agenda.png`
- `docs/screenshots/work-saas-v3-phase10-2026-05-21-coach/390-gestao-home.png`

## Storage Policy

- Keep this baseline until Phase 13 release hardening.
- Do not create unbounded screenshot folders.
- Each sprint should keep only baseline, after, and diagnostic-critical screenshots.
- If a screenshot folder is exploratory and no longer needed, move it to an archive decision in `WSAAS3-59`.

## Baseline Acceptance

Phase 0A is complete when:

- this baseline index exists;
- the evidence folders are listed;
- future sprints know exactly which routes/viewports to compare;
- screenshot growth policy exists.

