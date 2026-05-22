# Work SaaS Implementation Queue V2 Final

Date: 2026-05-21  
Status: historical/base queue. Superseded by `WORK_SAAS_MASTER_EXECUTION_QUEUE_V3_COMPLETE.md`.  
Depends on:

- `WORK_SAAS_FINAL_SCREEN_AUDIT_2026_05_21.md`
- `WORK_SAAS_FINAL_DELIVERY_BLUEPRINT_2026_05_21.md`
- `WORK_AREA_FUNCTION_INVENTORY.md`
- `WORK_SAAS_INFORMATION_ARCHITECTURE.md`
- `WORK_MOBILE_OPERATIONAL_SCOPE.md`
- `WORK_SAAS_PAGE_RESPONSIBILITIES.md`

## Superseded By V3

This queue remains useful as planning context, but it is no longer the governing execution queue.

Use instead:

- `WORK_SAAS_MASTER_EXECUTION_QUEUE_V3_COMPLETE.md`
- `WORK_SAAS_QUEUE_V3_EXECUTION_CONTRACTS.md`
- `WORK_SAAS_DATABASE_MIGRATION_QUEUE.md`
- `WORK_SAAS_FINAL_HANDOFF_2026_05_21.md`

When V2 and V3 conflict, V3 wins.

## Execution Rules

- Execute in order unless a blocker requires a small prerequisite.
- Preserve all legacy routes.
- Preserve permissions.
- Do not redesign backend.
- Do not turn mobile Work into full web SaaS.
- Keep Player App simple.
- Validate 390, 430, 1366 and wide desktop after every large phase.
- Run route diagnostics after shell/navigation changes.

## Phase 0 - Foundation And Safety

### WSAAS2-00A - Source Of Truth Lock

Objective:

- Mark the final Work SaaS docs as the current source for the Work restructure.

Files:

- `docs/RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
- `docs/WORK_SAAS_COMPLETE_DELIVERY_SPEC.md`

Change:

- Add a short index pointing to final audit, blueprint and V2 queue.

Acceptance:

- Future agents know not to follow older MDs when they conflict.

Rollback:

- Remove the index note.

### WSAAS2-00B - Route Compatibility Contract

Objective:

- Freeze public, legacy and work routes before architecture changes.

Files:

- `src/App.tsx`
- `src/hooks/usePlaceAdminRouteSync.ts`
- `src/lib/role-visibility.ts`
- route audit doc

Change:

- Create a route table in docs and optional route constants if helpful.
- No user-visible change required.

Acceptance:

- Direct load and refresh work for:
  - `/gestao`;
  - `/gestao/:placeId/:module`;
  - `/locais/:placeId/admin/:module`;
  - `/eventos?modo=organizing`;
  - `/eventos/torneios?view=organizing`;
  - `/eventos/ligas?view=organizing`;
  - `/eventos/:id/organizacao`;
  - `/join`, `/inscricao`, `/t`.

### WSAAS2-00C - DB Compatibility Check

Objective:

- Prevent UI work from hiding schema mismatches.

Problem:

- Visual audit found 400s on `place_academy_settings` select fields.

Files:

- Supabase migrations;
- `src/lib/academy` or settings loaders;
- diagnostics doc.

Change:

- Confirm required columns exist remotely or guard loader gracefully.

Acceptance:

- Manager/coach/player-owner visual audit has no repeated 400 for academy settings.

Non-goal:

- No product UI restructure in this task.

## Phase 1 - SaaS Shell And Context

### WSAAS2-01 - Work SaaS Shell

Objective:

- Make web Work feel like a mature SaaS shell instead of an app page with nested modules.

Files likely:

- `src/components/AppShell.tsx`
- `src/components/BottomNav.tsx`
- `src/components/place/PlaceAdminShell.tsx`
- `src/pages/ManagementHubPage.tsx`
- shared CSS.

Change:

- Move mode selector, user, org/unit context and breadcrumbs into the shell.
- Remove repeated mode/context controls from page body where duplicated.
- Keep ATP logo and premium dark DNA.

Acceptance:

- Desktop Work has one clear topbar context.
- Place pages do not repeat the entire identity stack.
- Mode selector is visible and consistent.
- Player shell remains unchanged in behavior.

### WSAAS2-02 - Organization And Unit Switchboard

Objective:

- Make `/gestao` the official Work Switchboard for multiunit and multi-role users.

Files likely:

- `src/pages/ManagementHubPage.tsx`
- place/work data helpers.

Change:

- Show critical work across contexts.
- Show unit/competition cards with "enter workspace".
- Keep invites/onboarding.
- Avoid full metric/report walls.

Acceptance:

- Owner with many academies can pick the active unit quickly.
- Coach/frontdesk/finance/cashier see role-specific entry.
- Organizer without place still sees competitions.

### WSAAS2-03 - Unit Workspace Page Header Contract

Objective:

- Standardize `/gestao/:placeId/*` page structure.

Change:

- Page body starts with domain header, not repeated full unit card.
- Keep page title, purpose, one primary CTA.
- Move active unit display to shell.

Acceptance:

- Agenda, Aulas, Clientes, Financeiro, Cantina, Equipe and Ajustes share a predictable header rhythm.

## Phase 2 - Web Domain Navigation

### WSAAS2-04 - Grouped SaaS Sidebar

Objective:

- Replace flat module feeling with grouped SaaS domains.

Target groups:

- Trabalho;
- Operacao;
- Pessoas;
- Receita;
- Competicoes;
- Relatorios;
- Administracao.

Acceptance:

- No empty group.
- No forbidden item.
- No daily action hidden under Admin.
- Setup stays out of daily first fold.

### WSAAS2-05 - Canonical Domain Wrapper Layer

Objective:

- Preserve current routes while allowing new domain concepts.

Change:

- Keep existing `/gestao/:placeId/:module`.
- Add internal mapping from old modules to canonical domains.
- Preserve query param `visao`.

Acceptance:

- Old links still work.
- New navigation labels can be tested without breaking routes.

## Phase 3 - Command Center And Reports Separation

### WSAAS2-06 - Hoje Command Center

Objective:

- Turn `Hoje/Painel` into action queue, not report wall.

Change:

- First fold: blockers, next work, primary CTA.
- Move reports to Relatorios.

Acceptance:

- Manager first fold answers "what should I solve now?"
- Mobile Work Today does not show report grids.

### WSAAS2-07 - Reports Domain Extraction

Objective:

- Give reports their own SaaS home.

Change:

- Create/report wrapper for operation, revenue, people and competition reports.
- Existing report cards move or link there.

Acceptance:

- Reports still reachable for owner/manager.
- They no longer dominate daily operation.

## Phase 4 - Calendar And Reservations

### WSAAS2-08 - Calendar First-Class Module

Objective:

- Make Calendar the operational time map.

Change:

- Calendar shows reservations, blocks, classes and resource layers.
- Keep day hour grid.
- Teacher day view is supported.

Acceptance:

- Frontdesk sees court/resource view.
- Coach sees day-by-hour class view.
- Manager can filter by court, professor, class and status.

### WSAAS2-09 - Reservation Lifecycle Redesign

Objective:

- Make reservation state and actions obvious.

Change:

- List/table + detail drawer on web.
- Sheet on mobile.
- Actions: edit, cancel, reschedule, pay, send WhatsApp, waitlist.

Acceptance:

- If slot is occupied, button does not imply normal availability.
- Admin can manually edit reservation.
- Player reschedule link opens agenda selector.
- WhatsApp messages are professional and contextual.

### WSAAS2-10 - Waitlist Flow Cleanup

Objective:

- Make waitlist part of reservation lifecycle, not a competing submenu.

Change:

- Waitlist appears as queue/filter/context.
- Contact/reschedule actions use current agenda options.

Acceptance:

- Frontdesk knows whether to contact, promote or remove.

## Phase 5 - Aulas And Professor Operations

### WSAAS2-11 - Aulas Domain Contract

Objective:

- Separate class operation from setup, people and finance.

Change:

- Aulas pages: Hoje, Agenda, Turmas, Reposicoes, Evolucao.
- Student/person detail links to Pessoas.
- Payment links to Receita.
- Settings links to Admin.

Acceptance:

- Coach-only user does not see ERP/admin.
- Manager can still configure classes from web.

### WSAAS2-12 - Attendance Optional Setting

Objective:

- Implement product decision: chamada default off, company can require it.

Change:

- Load/use `require_attendance_call`.
- Default false.
- Hide mandatory attendance flow when false.

Acceptance:

- Professor sees agenda/students/replacements without being forced into chamada.
- If setting true, attendance appears.

### WSAAS2-13 - Student Detail Drawer

Objective:

- Fix modal scaling by adopting responsive detail pattern.

Change:

- Desktop right drawer or centered max-height modal.
- Mobile full-screen sheet.
- Keep data/edit actions.

Acceptance:

- No cropped footer/fields at 390, 430, 1366, wide.

## Phase 6 - Pessoas Domain

### WSAAS2-14 - Unified People Directory

Objective:

- Create predictable home for clients, leads, students, members and staff.

Change:

- Start as unified read/search over existing data.
- Do not require backend merge yet.

Acceptance:

- User can search person once and see linked roles.

### WSAAS2-15 - CRM/Clients Cleanup

Objective:

- Separate contacts/leads/follow-ups from students/members/staff.

Change:

- CRM queue for frontdesk.
- Person detail with communication history.

Acceptance:

- "Cliente" no longer feels like random contact registry.

### WSAAS2-16 - Staff/Coach Boundary

Objective:

- Move coach login/roles toward Pessoas/Equipe/Admin, not Aulas routine.

Acceptance:

- Coach records are findable.
- Staff permissions stay admin-only.

## Phase 7 - Receita

### WSAAS2-17 - Revenue Domain IA

Objective:

- Make Finance a complete Revenue domain.

Change:

- Receivables, payments, expenses, plans/packages, POS revenue.

Acceptance:

- Local finance is separate from player payments.
- Finance role lands in receivables.

### WSAAS2-18 - Unified Payment Modal

Objective:

- Use same payment stub everywhere payment is required.

Change:

- Contextual buttons open payment modal with value, payer, source and mark-paid action.

Acceptance:

- Reservation, enrollment, membership and competition payment share one pattern.

### WSAAS2-19 - Finance Desktop Density

Objective:

- Make finance usable for 100+ receivables.

Change:

- Dense table/list hybrid, filters, batch actions, detail drawer.

Acceptance:

- Finance user can scan overdue items without card wall fatigue.

## Phase 8 - POS/Cantina

### WSAAS2-20 - POS Role Surface

Objective:

- Keep cashier flow fast while preserving inventory depth.

Change:

- Mobile starts at Sell.
- Web supports products, stock, sales and future reports.

Acceptance:

- Cashier does not see broad finance.
- Product setup does not block sale.

## Phase 9 - Competition OS

### WSAAS2-21 - Competition OS Canonical Shell

Objective:

- Separate organizer work from player discovery.

Change:

- Add/prepare canonical work competition routes.
- Existing event organizing URLs wrap to work shell.

Acceptance:

- Organizer understands they are in Work.
- Player `/eventos` remains discovery/participation.

### WSAAS2-22 - Tournament Cockpit By Phase

Objective:

- Each tournament phase has one first-fold blocker and CTA.

Phases:

- draft;
- registration open;
- registration closed;
- draw/games generated;
- in progress;
- finished.

Acceptance:

- Owner/staff see only relevant phase actions first.
- Dangerous/setup actions are not near event operation.

### WSAAS2-23 - League Owner/Participant Split

Objective:

- League page composition changes by role and phase.

Acceptance:

- Participant sees round/opponent/result/standings.
- Owner sees round blockers, participants, pending results and next-round CTA.

## Phase 10 - Mobile Work

### WSAAS2-24 - Mobile Work Shell

Objective:

- Stop rendering full SaaS web composition on mobile.

Change:

- Role-specific Work Today.
- Compact active unit.
- Bottom nav with 3 to 5 operational destinations.

Acceptance:

- 390/430 screenshots show CTA early.
- No report wall in mobile Work.

### WSAAS2-25 - Mobile Action Sheets

Objective:

- Standardize quick operations.

Sheets:

- reservation detail/edit;
- payment stub;
- WhatsApp message;
- class detail;
- student summary;
- result entry;
- receivable detail;
- POS sale confirmation.

Acceptance:

- User completes common mobile actions without page maze.

## Phase 11 - Player Boundary Cleanup

### WSAAS2-26 - Player Menu Simplicity

Objective:

- Keep Player App separate and personal.

Change:

- Ensure player menu remains Inicio, Jogar, Competir, Rotina, Perfil.
- No work admin cards in first fold.

Acceptance:

- Multi-role users can switch, but player surface stays player-first.

## Phase 12 - QA And Regression

### WSAAS2-27 - Persona QA Matrix

Personas:

- player pure;
- student;
- member;
- competitive player;
- owner/manager;
- coach;
- frontdesk;
- finance;
- cashier;
- organizer;
- multi-role user.

Viewports:

- 390;
- 430;
- 1366;
- wide desktop.

Acceptance:

- First screen, CTA, nav, permissions, empty states, public routes and console diagnostics pass.

### WSAAS2-28 - End-To-End Flow Replays

Flows:

- create and run tournament;
- create and run league;
- create academy, courts, classes, students, reservation and waitlist;
- frontdesk reservation and reschedule;
- coach day agenda;
- finance payment;
- cashier sale.

Acceptance:

- Functional completion plus UX notes.
- Screenshots and diagnostics archived.

## Do Not Start With

- Renaming every menu before shell context exists.
- Moving reports without route plan.
- Creating new backend tables for People unification.
- Rebuilding the player app.
- Turning mobile into full web SaaS.
- Removing legacy routes.

## Best First Sprint

Recommended first implementation sprint:

1. `WSAAS2-00A`
2. `WSAAS2-00B`
3. `WSAAS2-00C`
4. `WSAAS2-01`
5. `WSAAS2-02`
6. `WSAAS2-03`

Reason:

- Shell and context are the highest leverage work.
- Most current confusion comes from context duplication, multiunit ambiguity and page responsibility, not missing features.
