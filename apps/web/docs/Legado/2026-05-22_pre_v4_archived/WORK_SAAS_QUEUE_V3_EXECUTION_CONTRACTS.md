# Work SaaS Queue V3 Execution Contracts

Date: 2026-05-21  
Status: execution contract appendix for `WORK_SAAS_MASTER_EXECUTION_QUEUE_V3_COMPLETE.md`.

## Purpose

This document turns the V3 queue into implementation-ready sprint contracts.

Use it together with:

- `WORK_SAAS_MASTER_EXECUTION_QUEUE_V3_COMPLETE.md`
- `WORK_SAAS_DATABASE_MIGRATION_QUEUE.md`
- `WORK_SAAS_FINAL_DELIVERY_BLUEPRINT_2026_05_21.md`
- `WORK_SAAS_PAGE_RESPONSIBILITIES.md`

The queue tells what to execute. This contract tells what each phase must protect, inspect and validate before code changes start.

## Sprint Packet Template

Every implementation sprint must start with this packet:

```text
Queue ID:
Objective:
Primary persona:
Secondary personas:
Surface:
Routes affected:
Legacy routes preserved:
Probable files:
Data/RPC dependencies:
Permission checks:
UI states:
Mobile behavior:
Desktop behavior:
Do not change:
Acceptance criteria:
QA personas:
QA viewports:
Console/network checks:
Rollback:
Docs to update:
```

No sprint is ready if any field above is unknown.

## Phase Contracts

### Phase 0A - Documentation And Route Safety

Queue items:

- `WSAAS3-00A` through `WSAAS3-00D`

Primary objective:

- Freeze source of truth, route compatibility, role contracts and screenshot baseline before implementation.

Routes to protect:

- `/gestao`
- `/gestao/:placeId`
- `/gestao/:placeId/:module`
- `/locais/:placeId/admin`
- `/locais/:placeId/admin/:module`
- `/eventos`
- `/eventos/torneios`
- `/eventos/ligas`
- `/eventos/:id/organizacao`
- `/eventos/ligas/:leagueId`
- `/join`
- `/inscricao/:tournamentId`
- `/t/:tournamentId`
- `/reservas/alteracao/:token`

Probable files:

- `src/App.tsx`
- `src/lib/role-visibility.ts`
- `src/lib/place-admin-navigation.ts`
- `src/hooks/usePlaceAdminRouteSync.ts`
- `docs/RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
- `docs/WORK_SAAS_FINAL_HANDOFF_2026_05_21.md`

Do not change:

- route behavior;
- permissions;
- UI layout.

Done when:

- route map exists;
- persona/permission contract exists;
- screenshot baseline is indexed;
- V3 docs are the explicit source of truth.

### Phase 0B - Database Migration Closure

Queue items:

- `DBMIG-01` through `DBMIG-10`

Primary objective:

- Align local migrations, remote schema and app expectations before UI depends on them.

Known local migrations to verify:

- `0097_fix_league_generate_round_class_id_ambiguity.sql`
- `0098_fix_academy_staff_invite_attendance_ambiguity.sql`
- `0099_academy_optional_attendance_call.sql`
- duplicate-prefix files under `0092` and `0096`

Known risks:

- applying SQL to wrong project;
- remote migration history not matching local files;
- hiding stale schema with frontend fallback;
- ambiguous-column RPC errors returning during QA.

Done when:

- `WORK_SAAS_DATABASE_MIGRATION_CLOSURE_REPORT.md` exists;
- remote target and migration status are known;
- critical RPCs pass;
- visual diagnostics no longer show the known `place_academy_settings` 400s.

### Phase 1 - SaaS Shell And Context

Queue items:

- `WSAAS3-01` through `WSAAS3-04`

Primary objective:

- Establish one official SaaS Work shell for desktop and responsive web.

Primary personas:

- owner;
- manager;
- frontdesk;
- finance;
- cashier;
- coach;
- organizer.

Routes affected:

- `/gestao`
- `/gestao/:placeId`
- `/gestao/:placeId/:module`
- legacy admin aliases.

Probable files:

- app shell/layout components;
- work header/topbar components;
- place management shell;
- place admin navigation;
- role visibility helpers;
- CSS layout primitives.

Do not change:

- Player App shell;
- backend loaders;
- business rules.

Done when:

- Work has one context model: organization, unit/place, role and mode;
- logo/header/mode selector are consistent;
- unit switchboard is explicit;
- page body no longer repeats shell context unnecessarily.

### Phase 2 - Web Domain Navigation

Queue items:

- `WSAAS3-05` through `WSAAS3-08`

Primary objective:

- Replace flat module navigation with SaaS domain navigation.

Target domains:

- Trabalho;
- Agenda;
- Operacao;
- Pessoas;
- Receita;
- Competicoes;
- Relatorios;
- Administracao.

Rules:

- hide forbidden groups;
- hide empty groups unless setup is the required next step;
- daily work must not be inside `Mais`;
- setup must not compete with first fold.

Done when:

- desktop sidebar groups are predictable;
- mobile Work remains role-specific;
- old routes still load through aliases or wrappers.

### Phase 3 - Command Center And Reports

Queue items:

- `WSAAS3-09` through `WSAAS3-12`

Primary objective:

- Separate "what needs action now" from reporting and historical analysis.

Primary routes:

- `/gestao`
- `/gestao/:placeId/hoje`
- future reports routes or wrappers.

Done when:

- owner/manager see prioritized operational blockers;
- reports move out of daily first fold;
- daily cards have action, owner, due status and next CTA.

### Phase 4 - Calendar And Reservations

Queue items:

- `WSAAS3-13` through `WSAAS3-18`

Primary objective:

- Make calendar a first-class time/resource map and make reservations a lifecycle workflow.

Primary routes:

- `/gestao/:placeId/agenda`
- reservation list/detail routes or drawers;
- `/reservas/alteracao/:token`

Core states:

- available;
- occupied;
- pending payment;
- paid/confirmed;
- canceled;
- waitlist;
- reschedule requested.

Done when:

- day grid defaults to full-hour slots;
- teacher day view exists;
- reservation detail supports manual admin edit;
- WhatsApp is contextual to cancel/reschedule, not routine confirmation;
- change-request link lets player choose valid new time without admin tools.

### Phase 5 - Aulas And Professor Operations

Queue items:

- `WSAAS3-19` through `WSAAS3-23`

Primary objective:

- Separate class operation, setup, students and optional attendance.

Key decision:

- attendance/chamada is optional per academy and defaults off.

Primary personas:

- coach;
- academy manager;
- frontdesk;
- student indirectly.

Done when:

- coach sees day by hour, class, court, turma and students;
- no mandatory attendance flow appears when disabled;
- class setup is not mixed with daily operation;
- students and teachers use Pessoas/Equipe where appropriate.

### Phase 6 - Pessoas Domain

Queue items:

- `WSAAS3-24` through `WSAAS3-28`

Primary objective:

- Turn scattered contacts, clients, students, members and leads into a predictable People domain.

Entities:

- clients;
- leads;
- students;
- members;
- guardians/responsibles;
- staff/team.

Done when:

- CRM/contact record is not confused with member/student enrollment;
- people detail explains relationship to plans, classes, bookings and payments;
- staff/equipe is not hidden inside Aulas.

### Phase 7 - Receita And Payments

Queue items:

- `WSAAS3-29` through `WSAAS3-34`

Primary objective:

- Centralize local revenue without mixing it with player personal payments.

Subdomains:

- receivables;
- paid;
- expenses;
- plans/packages;
- payment stubs;
- POS revenue;
- future commissions/splits.

Done when:

- every paid action uses the same payment modal/stub;
- marking paid is explicit and auditable;
- personal payments remain in Player App/Minha Rotina;
- finance role does not see unrelated aula/cantina work as primary tasks.

### Phase 8 - POS/Cantina

Queue items:

- `WSAAS3-35` through `WSAAS3-37`

Primary objective:

- Keep cashier mobile/web flow fast while inventory/product setup remains deeper.

Done when:

- cashier first action is sell;
- product/stock setup does not interrupt sale;
- manager can access products, stock and reports from web SaaS.

### Phase 9 - Competition OS

Queue items:

- `WSAAS3-38` through `WSAAS3-43`

Primary objective:

- Separate organizer operation from player discovery.

Primary routes:

- `/eventos`
- `/eventos/torneios`
- `/eventos/ligas`
- `/eventos/:id/organizacao`
- `/eventos/ligas/:leagueId`

Lifecycle:

- draft/configuration;
- inscriptions/participants;
- generated games;
- active operation;
- results validation;
- final/historical layer.

Done when:

- player does not see admin cockpit;
- organizer does not start from public discovery;
- tournament/league first fold shows current phase blocker;
- staff roles keep authorized actions.

### Phase 10 - Mobile Work

Queue items:

- `WSAAS3-44` through `WSAAS3-48`

Primary objective:

- Build mobile Work as operational companion, not reduced web SaaS.

Role nav targets:

- Coach: Hoje, Agenda, Turmas, Alunos, Perfil.
- Frontdesk: Hoje, Reservas, Clientes, Aulas, Mais.
- Finance: Receber, Pagos, Despesas, Resumo, Perfil.
- Cashier: Vender, Hoje, Estoque, Produtos, Perfil.
- Organizer: Hoje, Torneios, Ligas, Publicacao, Perfil.
- Manager: Hoje, Agenda, Aulas, Receita, Mais.

Done when:

- 390px and 430px show main CTA early;
- no full admin tree appears on mobile;
- complex operations point to web when needed.

### Phase 11 - Player Boundary

Queue items:

- `WSAAS3-49` through `WSAAS3-51`

Primary objective:

- Keep Player App simple and personal while Work becomes deeper.

Do not mix:

- local revenue with personal payments;
- organizer cockpit with competition discovery;
- work staff tools with player profile.

Done when:

- Player nav stays focused;
- Agenda/Minha Rotina has personal commitments;
- profile does not become work account center.

### Phase 12 - QA And E2E Replay

Queue items:

- `WSAAS3-52` through `WSAAS3-56`

Primary objective:

- Prove no persona improved by breaking another.

Must replay:

- pure player;
- student;
- member;
- competitive player;
- organizer;
- coach;
- frontdesk;
- finance;
- cashier;
- manager;
- multi-role.

E2E flows:

- tournament create-to-final;
- league create-to-rounds/results;
- academy creation, courts, classes, enrollments, reservations, finance/POS smoke.

Done when:

- screenshots and diagnostics are archived;
- console/network issues are classified;
- route regression matrix passes.

### Phase 13 - Release Hardening

Queue items:

- `WSAAS3-57` through `WSAAS3-60`

Primary objective:

- Remove temporary scaffolding, sync docs and prepare rollout.

Done when:

- docs match implemented state;
- stale fallbacks are removed or justified;
- screenshot storage policy exists;
- build/typecheck/QA gates pass.

## Execution Readiness Summary

Implementation can start only after:

1. Phase 0A is completed.
2. Phase 0B is completed.
3. `WORK_SAAS_DATABASE_MIGRATION_CLOSURE_REPORT.md` exists.

Then start with Phase 1, not with isolated page fixes.

