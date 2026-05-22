# Work SaaS Master Execution Queue V3 Complete

Date: 2026-05-21  
Status: complete execution queue before implementation.  
Scope: Work/Gestao as professional SaaS web, Mobile Work as operational app, Player App boundary, DB/migrations closure, QA and release gates.

## Why This Queue Exists

The V2 queue defined the right product direction, but the database/migration closure needed to be made explicit before implementation starts.

This V3 queue is the complete pre-implementation execution map. It should be treated as the governing queue for the Work SaaS restructure.

## Governing Documents

Use in this order:

1. `WORK_SAAS_FINAL_HANDOFF_2026_05_21.md`
2. `WORK_SAAS_FINAL_SCREEN_AUDIT_2026_05_21.md`
3. `WORK_SAAS_FINAL_DELIVERY_BLUEPRINT_2026_05_21.md`
4. `WORK_SAAS_MASTER_EXECUTION_QUEUE_V3_COMPLETE.md`
5. `WORK_SAAS_QUEUE_V3_EXECUTION_CONTRACTS.md`
6. `WORK_AREA_FUNCTION_INVENTORY.md`
7. `WORK_SAAS_INFORMATION_ARCHITECTURE.md`
8. `WORK_MOBILE_OPERATIONAL_SCOPE.md`
9. `WORK_SAAS_PAGE_RESPONSIBILITIES.md`
10. `WORK_SAAS_QA_ACCEPTANCE_MATRIX.md`

## Non-Negotiable Rules

- Preserve all legacy routes.
- Preserve all public routes.
- Preserve permissions.
- Do not relax RLS.
- Do not duplicate backend loaders unless explicitly required.
- Do not make mobile Work a full SaaS tree.
- Do not mix Player App personal finance with Work local revenue.
- Do not mix player discovery with organizer operation.
- Do not put rare setup in daily first fold.
- Do not hide daily work inside `Mais`, `Ajustes`, `Admin` or third-level tabs.
- Do not remove any existing function without a replacement path.
- Every sprint must update docs when it changes product architecture.

## Global Definition Of Ready

A sprint can start only when:

- affected routes are listed;
- affected roles are listed;
- permissions are understood;
- current screenshots or previous audit evidence exist;
- DB dependencies are known;
- rollback path is defined;
- QA personas and viewports are defined.

## Global Definition Of Done

A sprint is done only when:

- code compiles;
- route compatibility is verified;
- permissions are preserved;
- empty states and blocked states are handled;
- mobile 390 and 430 are checked;
- desktop 1366 and wide are checked;
- console/network diagnostics are reviewed;
- docs/queue status is updated.

## Phase Map

| Phase | Name | Items | Purpose |
|---|---|---:|---|
| 0A | Documentation and route safety | 4 | Freeze source of truth and compatibility contracts. |
| 0B | Database migration closure | 10 | Align local/remote schema before UI depends on it. |
| 1 | SaaS shell and context | 4 | Create professional web Work foundation. |
| 2 | Web domain navigation | 4 | Replace module list with SaaS domains. |
| 3 | Command center and reports | 4 | Separate daily action from analysis. |
| 4 | Calendar and reservations | 6 | Make time/resource and booking lifecycle clear. |
| 5 | Aulas and professor operations | 5 | Separate class operation, students, settings and optional attendance. |
| 6 | Pessoas domain | 5 | Create predictable home for people. |
| 7 | Receita and payments | 6 | Centralize local money and payment stubs. |
| 8 | POS/Cantina | 3 | Keep cashier fast, web inventory deep. |
| 9 | Competition OS | 6 | Separate organizer operation from player discovery. |
| 10 | Mobile Work | 5 | Build operational mobile, not shrunken SaaS. |
| 11 | Player boundary | 3 | Keep player simple and personal. |
| 12 | QA and E2E replay | 5 | Validate no persona broke. |
| 13 | Release hardening | 4 | Clean fallbacks, docs, screenshots and rollout checks. |

Total planned queue items: 74.

## Phase 0A - Documentation And Route Safety

### WSAAS3-00A - Source Of Truth Lock

Objective:

- Ensure all future work follows the final Work SaaS docs.

Files:

- `docs/RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
- `docs/WORK_SAAS_FINAL_HANDOFF_2026_05_21.md`

Actions:

- Point source-of-truth policy to this V3 queue.
- Mark older Work queues as historical/reference when conflicting.

Do not alter:

- product UI;
- backend;
- routes.

Acceptance:

- A future coding agent can identify the current queue without guessing.

Rollback:

- Revert doc pointers only.

### WSAAS3-00B - Route Compatibility Contract

Objective:

- Freeze routes before shell/domain refactor.

Routes:

- `/gestao`
- `/trabalho`
- `/gestao/:placeId`
- `/gestao/:placeId/:module`
- `/locais/:placeId/admin`
- `/locais/:placeId/admin/:module`
- `/eventos?modo=organizing`
- `/eventos/torneios?view=organizing`
- `/eventos/ligas?view=organizing`
- `/eventos/:tournamentId/organizacao`
- `/eventos/ligas/:leagueId`
- `/join/:tournamentId`
- `/inscricao/:tournamentId`
- `/t/:tournamentId`
- `/reservas/alteracao/:token`

Files likely:

- `src/App.tsx`
- `src/hooks/usePlaceAdminRouteSync.ts`
- `src/lib/role-visibility.ts`
- `src/components/AppShell.tsx`

Actions:

- Create route contract doc/table.
- Confirm canonical and legacy paths.
- Preserve query params: `visao`, `view`, `modo`, `tab`, `room`, `join`.

Acceptance:

- Direct URL load and browser refresh work for every route.

QA:

- owner;
- player;
- organizer;
- frontdesk;
- mobile 390 and desktop 1366.

### WSAAS3-00C - Permission Contract

Objective:

- Freeze role access before navigation changes.

Roles:

- owner;
- manager;
- coach;
- frontdesk;
- finance;
- cashier;
- organizer;
- scorekeeper;
- checkin;
- media;
- league owner;
- league participant;
- player-only.

Actions:

- Document what each role can see.
- Document what each role must never see.
- Confirm redirects/wrappers for forbidden routes.

Acceptance:

- Navigation refactor has a permission matrix to follow.

### WSAAS3-00D - Screenshot Baseline Index

Objective:

- Make current visual baseline easy to compare after each sprint.

Evidence:

- `docs/screenshots/work-saas-final-architecture-2026-05-21-*`

Actions:

- List reference screenshots by role and route.
- Mark critical before/after screenshots.

Acceptance:

- Future QA can compare exact route/persona/viewport.

## Phase 0B - Database Migration Closure

This phase must be completed before implementation relies on new DB-backed behavior.

### DBMIG-01 - Migration Source Inventory

Objective:

- Inventory all local migration sources and detect numbering/path conflicts.

Known sources:

- `web/supabase/migrations/0001...0099`
- root `supabase/migrations/20260506_*`

Known numbering attention:

- duplicate `0092_*` files exist;
- duplicate `0096_*` files exist.

Actions:

- List migration files by path, timestamp/name and purpose.
- Identify duplicate numeric prefixes.
- Decide whether root `../../supabase/migrations` is legacy, active or external.
- Decide canonical migration folder for Work SaaS.

Acceptance:

- A human can see exactly which migrations are in scope.
- Duplicate prefixes are documented and not accidentally skipped.

Rollback:

- Documentation only.

### DBMIG-02 - Remote Project Connection And Backup Plan

Objective:

- Define how remote SQL will be applied safely.

Inputs needed:

- Supabase project ref;
- `DATABASE_URL` or linked Supabase CLI auth;
- backup/export method;
- target environment confirmation.

Actions:

- Confirm target project is staging/QA before applying.
- Record command pattern:

```powershell
npx.cmd supabase db query --db-url "$env:DATABASE_URL" --file supabase\migrations\<file>.sql
```

Alternative:

```powershell
npx.cmd supabase link --project-ref <project-ref>
npx.cmd supabase db push
```

Acceptance:

- No migration is applied without target and rollback/backup noted.

### DBMIG-03 - Remote Applied-Migration Comparison

Objective:

- Compare local migrations to remote applied schema.

Actions:

- Query Supabase migration history table when available.
- If unavailable, run schema probes for required tables/columns/functions.
- Create a report of:
  - applied;
  - missing;
  - uncertain;
  - needs manual confirmation.

Critical schema probes:

- `place_academy_settings.require_attendance_call`
- `place_academy_settings.makeup_notice_hours`
- `place_academy_settings.auto_create_makeup_credit_on_notice`
- `place_staff_invites`
- `place_academy_attendance`
- `court_booking_change_requests`
- league round generation functions
- tournament result functions
- payment stub tables/functions.

Acceptance:

- Remote schema state is known before UI implementation.

### DBMIG-04 - Critical Migration Apply Set

Objective:

- Apply or confirm critical migrations required by known blockers.

Known critical migrations:

- `0097_fix_league_generate_round_class_id_ambiguity.sql`
- `0098_fix_academy_staff_invite_attendance_ambiguity.sql`
- `0099_academy_optional_attendance_call.sql`

Likely verify also:

- `0095_booking_past_time_guard_v1.sql`
- `0096_court_booking_change_requests_v1.sql`
- `0096_league_match_room_links_v1.sql`
- `0090_fix_tournament_result_submission_ambiguity.sql`
- `0092_fix_tournament_result_submission_rpc_return.sql`

Actions:

- Apply only missing migrations.
- Record exact command and result.
- Reload PostgREST schema cache if required.

Acceptance:

- Known ambiguity errors no longer occur:
  - `app_accept_place_staff_invite`;
  - `app_mark_academy_attendance`;
  - `app_generate_next_league_round`.

Rollback:

- Use database backup/restore for destructive mistakes.
- For additive columns/functions, keep forward-compatible unless harmful.

### DBMIG-05 - RPC Smoke Test Matrix

Objective:

- Validate functions relied on by Work SaaS.

RPCs/functions to test:

- `app_accept_place_staff_invite`
- `app_mark_academy_attendance`
- `app_generate_next_league_round`
- `app_submit_tournament_match_result`
- `app_set_tournament_registration_status`
- `app_admin_schedule_makeup`
- booking change request functions
- payment mark-paid functions
- staff role helpers:
  - academy;
  - booking;
  - finance;
  - canteen.

Actions:

- Execute via app flow where possible.
- Use SQL/RPC direct tests only for controlled setup.

Acceptance:

- No ambiguous-column errors.
- No raw SQL errors exposed in UI.

### DBMIG-06 - Seed/Login/Role Validation

Objective:

- Confirm demo users and role assignments are valid after migrations.

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

Actions:

- Login smoke test.
- Work entry route smoke test.
- Forbidden route smoke test.

Acceptance:

- QA personas can be used for screenshots/E2E.

### DBMIG-07 - Data Integrity Smoke Tests

Objective:

- Confirm core entities remain valid.

Domains:

- places;
- courts;
- bookings;
- waitlist;
- academy classes;
- enrollments;
- receivables;
- POS products/sales;
- tournaments;
- leagues;
- staff;
- CRM.

Actions:

- Run seed integrity queries when available:
  - `supabase/seeds/qa_demo/10_verify_seed_integrity.sql`
- Run app-level smoke flows for high-risk areas.

Acceptance:

- No critical missing relation for planned UI work.

### DBMIG-08 - Diagnostics Re-run

Objective:

- Prove migration closure fixed runtime network/schema errors.

Actions:

- Re-run visual audit subset:
  - manager work entry;
  - coach work entry;
  - player-owner work entry;
  - academy today;
  - academy settings/resources if used.

Acceptance:

- No repeated 400 on `place_academy_settings`.
- No page console errors for known DB issues.

### DBMIG-09 - Fallback Review

Objective:

- Identify temporary fallbacks added because remote migrations were missing.

Known candidates:

- league round generation fallback in `src/lib/leagues.ts`;
- UI guards around stale academy settings;
- any try/catch converting DB missing columns into default behavior.

Actions:

- Decide per fallback:
  - keep as resilience;
  - remove after migration;
  - leave with explicit stale-schema message.

Acceptance:

- No silent fallback hides a real production schema problem.

### DBMIG-10 - Database Closure Report

Objective:

- Produce a final DB readiness note before UI work.

Document:

- `docs/WORK_SAAS_DATABASE_MIGRATION_CLOSURE_REPORT.md`

Must include:

- applied migrations;
- skipped migrations and why;
- remaining schema risks;
- RPC smoke result;
- login/seed result;
- screenshots/diagnostics folder.

Acceptance:

- Work SaaS implementation can start without guessing DB state.

## Phase 1 - SaaS Shell And Context

### WSAAS3-01 - Work SaaS Shell Foundation

Objective:

- Make web Work a professional SaaS shell.

Files likely:

- `src/components/AppShell.tsx`
- `src/components/BottomNav.tsx`
- `src/components/place/PlaceAdminShell.tsx`
- `src/pages/ManagementHubPage.tsx`
- shared styles.

Actions:

- Centralize ATP identity, mode selector, user, context and notifications.
- Prepare slots for organization/unit selector and breadcrumb.
- Remove duplicated mode selector from page content when shell owns it.

Do not alter:

- Player App route behavior;
- backend loaders;
- role permissions.

Acceptance:

- Desktop Work topbar communicates:
  - active mode;
  - user;
  - active context;
  - work surface.
- Player App still looks and behaves as player surface.

QA:

- player home;
- work entry;
- place workspace;
- competition work hub.

### WSAAS3-02 - Organization And Unit Context Model

Objective:

- Make multiunit/multiacademy usage understandable.

Actions:

- Define active context types:
  - organization;
  - place/unit;
  - independent organizer;
  - competition.
- Add or prepare unit switcher in Work shell.
- Keep unit identity out of repeated page body cards.

Acceptance:

- User with many units knows which unit is active.
- `/gestao` is clearly all-work/switchboard.
- `/gestao/:placeId` is clearly one-unit workspace.

### WSAAS3-03 - Breadcrumb And Page Header Contract

Objective:

- Stop page bodies from repeating entire context.

Actions:

- Standardize page header:
  - title;
  - short purpose;
  - primary CTA;
  - secondary actions.
- Add breadcrumb pattern.

Acceptance:

- Agenda, Aulas, Clientes/Pessoas, Financeiro/Receita, Cantina, Equipe and Ajustes have consistent structure.

### WSAAS3-04 - Shell QA Pass

Objective:

- Confirm shell did not break routing or layout.

QA:

- 390;
- 430;
- 1366;
- wide desktop;
- player, manager, coach, frontdesk, finance, cashier, organizer.

Acceptance:

- No overlapping topbar/sidebar/bottom nav.
- Mode selector is consistent.
- No forbidden item appears.

## Phase 2 - Web Domain Navigation

### WSAAS3-05 - Grouped Domain Sidebar

Objective:

- Replace flat module list with SaaS domains.

Groups:

- Trabalho;
- Operacao;
- Pessoas;
- Receita;
- Competicoes;
- Relatorios;
- Administracao.

Acceptance:

- Empty groups hidden.
- Forbidden groups hidden.
- Daily work is not under Admin.
- Setup is not in first daily layer.

### WSAAS3-06 - Domain Route Mapping

Objective:

- Preserve old module routes while new IA emerges.

Actions:

- Map existing modules:
  - `agenda` -> Calendar/Reservations depending view;
  - `academy` -> Aulas;
  - `clients` -> Pessoas;
  - `finance` -> Receita;
  - `canteen` -> POS;
  - `team` -> Pessoas/Administracao;
  - `settings` -> Administracao.

Acceptance:

- Old URLs still resolve.
- New labels do not create broken routes.

### WSAAS3-07 - Secondary Navigation Policy

Objective:

- Prevent duplicated tabs/submenus.

Rules:

- Page-level tabs must be domain filters or subpages, not duplicate main navigation.
- CTA actions should not be tabs.
- Setup should link to Admin.

Acceptance:

- Reservations no longer has redundant Hoje/Espera/Ajustes submenus.
- Aulas no longer exposes professores/alunos/settings as confusing peer tabs when those belong elsewhere.

### WSAAS3-08 - Navigation QA

Objective:

- Validate nav by role.

Acceptance:

- Coach sees Aulas/Agenda/Turmas/Alunos style access, not finance/POS/admin.
- Frontdesk sees Calendar/Reservations/People/Aulas.
- Finance sees Revenue.
- Cashier sees POS.
- Organizer sees Competition OS.

## Phase 3 - Command Center And Reports

### WSAAS3-09 - Work Switchboard `/gestao`

Objective:

- Transform `/gestao` into work command center and context selector.

Actions:

- Prioritize:
  - critical blockers;
  - active units;
  - active competitions;
  - invites.
- Avoid:
  - report walls;
  - full module list;
  - all historical items.

Acceptance:

- Owner knows where to enter.
- Staff sees role-specific next action.
- Organizer independent sees competitions without needing a local place.

### WSAAS3-10 - Unit Today

Objective:

- Scope one-unit daily command center.

Actions:

- Show unit-specific blockers.
- Use primary CTA per dominant role.
- Link to domain detail.

Acceptance:

- One unit workspace feels scoped, not global.

### WSAAS3-11 - Reports Extraction

Objective:

- Move analytics/report content out of daily first fold.

Actions:

- Create report domain wrappers.
- Move operational metrics there or link from Hoje.

Acceptance:

- Mobile Work no longer shows huge report grids by default.
- Owner still has reports reachable.

### WSAAS3-12 - Command Center QA

Acceptance:

- First fold answers "what needs to be resolved now?"
- No setup/report blocks dominate daily work.

## Phase 4 - Calendar And Reservations

### WSAAS3-13 - Calendar First-Class Web Module

Objective:

- Calendar becomes time/resource map, not reservation submenu.

Actions:

- Day hour grid default.
- Resource/court view.
- Teacher day view.
- Layers for reservations, blocks, classes and competition allocations.

Acceptance:

- Staff can understand time conflicts in one place.

### WSAAS3-14 - Calendar Mobile Role Views

Objective:

- Mobile calendar is role-specific and lighter.

Actions:

- Coach: day by hour with class, court, turma, students.
- Frontdesk: today schedule and quick reservation.
- Manager: critical occupancy and conflicts.

Acceptance:

- Mobile does not render complex report/calendar desktop page.

### WSAAS3-15 - Reservation Lifecycle Detail

Objective:

- Make booking lifecycle clear.

Actions:

- Web detail drawer.
- Mobile sheet.
- State labels:
  - pending payment;
  - confirmed;
  - cancelled;
  - past;
  - reschedule requested;
  - waitlist.

Acceptance:

- Occupied slot cannot look available.
- Admin can manually edit.

### WSAAS3-16 - Reservation Payment Stub Integration

Objective:

- All reservation payment actions use the unified payment modal.

Acceptance:

- Future payment provider has one integration surface.

### WSAAS3-17 - WhatsApp Reservation Communication

Objective:

- Professional WhatsApp messages for cancel/reschedule/waitlist.

Actions:

- Message includes:
  - customer name;
  - academy/place name;
  - reservation details;
  - sender/staff name when available;
  - reason;
  - next step;
  - reschedule link or agenda selector.

Acceptance:

- WhatsApp is communication support, not extra confirmation when payment/reservation already confirms the booking.

### WSAAS3-18 - Reservation QA

Flows:

- create reservation;
- mark paid;
- edit;
- cancel;
- waitlist contact;
- reschedule via player link.

## Phase 5 - Aulas And Professor Operations

### WSAAS3-19 - Aulas Web Domain

Objective:

- Clean Aulas into class operation.

Actions:

- Keep:
  - day classes;
  - agenda;
  - turmas;
  - replacements;
  - progress.
- Move:
  - coach staff permission to Pessoas/Equipe/Admin;
  - finance to Receita;
  - settings to Administracao.

Acceptance:

- Aulas is understandable without nested admin clutter.

### WSAAS3-20 - Professor Mobile Operation

Objective:

- Professor mobile focuses on day agenda.

Actions:

- Show each full-hour slot.
- Show class, court, turma, students.
- Open class detail sheet.

Acceptance:

- Professor can use it during the day without searching modules.

### WSAAS3-21 - Attendance Optional Default Off

Objective:

- Apply product decision.

Requires:

- `place_academy_settings.require_attendance_call`.

Actions:

- Default off.
- If off, no mandatory chamada.
- If on, show attendance action.

Acceptance:

- Tennis class flow is not forced into school-style attendance.

### WSAAS3-22 - Student Detail Responsive Pattern

Objective:

- Replace broken modal behavior with drawer/sheet.

Acceptance:

- Works at 390, 430, 1366 and wide.

### WSAAS3-23 - Aulas QA

Flows:

- coach sees day;
- opens class;
- sees students;
- registers planned absence;
- handles replacement;
- manager edits class on web.

## Phase 6 - Pessoas

### WSAAS3-24 - People Domain Shell

Objective:

- Establish Pessoas as home for humans.

Actions:

- Unified search over existing data.
- Link current clients/students/members/staff.

Acceptance:

- User searches once and finds the person.

### WSAAS3-25 - CRM/Clients Redefinition

Objective:

- Make Clients mean relationship/CRM, not all people.

Actions:

- Keep leads, contacts, follow-up queue.
- Move student/member/staff mental model under Pessoas.

Acceptance:

- Frontdesk understands which people need contact.

### WSAAS3-26 - Student And Member Contracts

Objective:

- Give alunos/socios predictable detail paths.

Actions:

- Student detail links:
  - classes;
  - progress;
  - payments;
  - history.
- Member detail links:
  - plan;
  - rules;
  - payments;
  - reservations.

Acceptance:

- No student/member data is lost.

### WSAAS3-27 - Staff/Team Boundary

Objective:

- Equipe is person/staff domain plus admin permission links.

Acceptance:

- Staff management findable.
- Permission changes remain admin/owner-only.

### WSAAS3-28 - Pessoas QA

Flows:

- search lead;
- convert/contact;
- open student;
- open member;
- open coach/staff;
- verify finance handoff.

## Phase 7 - Receita And Payments

### WSAAS3-29 - Receita Domain Shell

Objective:

- Turn Finance into complete Revenue domain.

Subdomains:

- Recebiveis;
- Pagamentos;
- Despesas;
- Planos/Pacotes;
- POS revenue;
- future commissions/splits.

Acceptance:

- Finance role sees only revenue work.

### WSAAS3-30 - Unified Payment Modal

Objective:

- Same modal for every "Pagar/Marcar pago" action.

Sources:

- reservation;
- academy enrollment;
- membership;
- competition registration;
- packages;
- POS if needed.

Acceptance:

- Shows value, payer, source, due date, status and action.

### WSAAS3-31 - Receivables Desktop Density

Objective:

- Make 100+ receivables usable.

Actions:

- Dense row/table mode.
- Filters.
- Batch actions.
- Detail drawer.

Acceptance:

- Finance can scan overdue list without card fatigue.

### WSAAS3-32 - Expenses And Paid Ledger

Objective:

- Separate operational receivables from paid/history/expenses.

Acceptance:

- Paid and expenses do not compete with collect-now flow.

### WSAAS3-33 - Revenue Reports

Objective:

- Move summary/analytics into Relatorios/Receita.

Acceptance:

- Reports available but not daily first fold.

### WSAAS3-34 - Receita QA

Flows:

- mark paid;
- send reminder;
- register expense;
- see paid;
- contextual payment from reservation/student.

## Phase 8 - POS/Cantina

### WSAAS3-35 - POS Quick Sale

Objective:

- Cashier starts with sale.

Acceptance:

- Product setup does not block selling.

### WSAAS3-36 - Inventory/Product Web Depth

Objective:

- Web supports products, stock, low stock and future supplier/cost slots.

Acceptance:

- Cashier authorized actions are clear.

### WSAAS3-37 - POS QA

Flows:

- sell product;
- sell manual item;
- see day sales;
- low stock;
- product edit if allowed.

## Phase 9 - Competition OS

### WSAAS3-38 - Competition OS Work Shell

Objective:

- Organizer operation becomes Work domain, not public event mode.

Actions:

- Canonical work competition wrappers.
- Keep legacy public routes.

Acceptance:

- Organizer sees Work identity.
- Player discovery remains separate.

### WSAAS3-39 - Tournament Phase Cockpit

Objective:

- Tournament admin first fold changes by phase.

Phases:

- Draft;
- Inscricoes abertas;
- Inscricoes encerradas;
- Jogos gerados;
- Em andamento;
- Finalizado.

Acceptance:

- One phase blocker and CTA dominates.

### WSAAS3-40 - Tournament Staff Role Views

Objective:

- Role-specific tournament operation.

Roles:

- owner;
- organizer;
- checkin;
- scorekeeper;
- media;
- player.

Acceptance:

- Staff sees authorized tools.
- Player does not see admin tools.

### WSAAS3-41 - League Owner/Participant Split

Objective:

- League surface changes by role and phase.

Acceptance:

- Participant sees current round first.
- Owner sees pending round work first.

### WSAAS3-42 - Competition Payments And Communication

Objective:

- Registration payments and announcements follow shared patterns.

Acceptance:

- Payment modal reused.
- Communication contextual.

### WSAAS3-43 - Competition OS QA

Flows:

- create tournament;
- register players;
- approve;
- generate games;
- fill results by admin/player;
- finalize;
- create league;
- generate round;
- submit/confirm results;
- close round.

## Phase 10 - Mobile Work

### WSAAS3-44 - Mobile Work Shell

Objective:

- Mobile Work becomes operational, not full SaaS.

Actions:

- Role-first home.
- Compact context.
- 3 to 5 nav items.

Acceptance:

- 390 and 430 show primary CTA early.

### WSAAS3-45 - Role-Based Mobile Navigation

Targets:

- Coach: Hoje, Agenda, Turmas, Alunos, Perfil.
- Frontdesk: Hoje, Reservas, Clientes, Aulas, Mais.
- Finance: Receber, Pagos, Despesas, Resumo, Perfil.
- Cashier: Vender, Hoje, Estoque, Produtos, Perfil.
- Organizer: Hoje, Torneios, Ligas, Publicacao, Perfil.
- Manager: Hoje, Agenda, Aulas, Receita, Mais.

Acceptance:

- `Mais` is not a hidden ERP.

### WSAAS3-46 - Mobile Action Sheets

Sheets:

- reservation;
- payment;
- WhatsApp;
- class;
- student;
- result;
- receivable;
- POS sale.

Acceptance:

- Common actions finish without page maze.

### WSAAS3-47 - Mobile Web Handoff

Objective:

- Complex setup/report/admin opens web path with clear explanation.

Acceptance:

- User understands why the action is web-only.

### WSAAS3-48 - Mobile Work QA

Acceptance:

- No horizontal overflow.
- CTA early.
- No report walls.
- No setup rare actions in daily work.

## Phase 11 - Player Boundary

### WSAAS3-49 - Player Navigation Boundary

Objective:

- Keep Player App simple.

Nav:

- Inicio;
- Jogar;
- Competir;
- Rotina;
- Perfil.

Acceptance:

- Aulas and Pagamentos stay inside Rotina unless product later decides otherwise.

### WSAAS3-50 - Player/Work Context Switching

Objective:

- Multi-role user switches intentionally.

Acceptance:

- Work entry is clear but not mixed into player first fold.

### WSAAS3-51 - Player Boundary QA

Personas:

- player pure;
- student;
- member;
- competitive;
- organizer who also plays.

Acceptance:

- No admin/local finance leaks into player surface.

## Phase 12 - QA And E2E Replay

### WSAAS3-52 - Persona QA Matrix

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
- multi-role.

Acceptance:

- First screen, CTA, nav, permissions, empty states and diagnostics pass.

### WSAAS3-53 - Route Regression Matrix

Objective:

- Direct URL/refresh for all public, legacy and canonical routes.

Acceptance:

- No public link broken.

### WSAAS3-54 - Tournament E2E Replay

Objective:

- Create and run tournament end-to-end after restructure.

Acceptance:

- Functional completion plus UX notes and screenshots.

### WSAAS3-55 - League E2E Replay

Objective:

- Create and run league end-to-end after restructure.

Acceptance:

- Functional completion plus UX notes and screenshots.

### WSAAS3-56 - Academy/Place E2E Replay

Objective:

- Create academy, courts, classes, enroll students, reserve court, waitlist, finance/POS smoke.

Acceptance:

- Functional completion plus UX notes and screenshots.

## Phase 13 - Release Hardening

### WSAAS3-57 - Fallback And Dead-Code Cleanup

Objective:

- Remove temporary fallbacks that are no longer needed after migrations.

Acceptance:

- No stale schema workaround remains undocumented.

### WSAAS3-58 - Documentation Sync

Objective:

- Update docs with implemented reality.

Acceptance:

- Queue item statuses reflect real state.

### WSAAS3-59 - Screenshot Archive Cleanup Policy

Objective:

- Avoid uncontrolled screenshot/storage growth.

Actions:

- Keep final baseline folders.
- Mark older exploratory folders as archival or removable after backup.

Acceptance:

- Future audits know where screenshots belong.

### WSAAS3-60 - Final Release Gate

Objective:

- Confirm product is ready for next implementation/release branch.

Acceptance:

- Build/typecheck pass.
- Diagnostics reviewed.
- QA matrix passed or documented.
- DB closure report exists.
- Rollback plan documented.

## Start Recommendation

Do not start UI implementation until:

1. Phase 0A is complete.
2. Phase 0B DB migration closure is complete.
3. `WORK_SAAS_DATABASE_MIGRATION_CLOSURE_REPORT.md` exists.

## Sprint Execution Status - 2026-05-21

The current implementation sprint completed the active pass through Phases 5-13.

Status reports:

- `WORK_SAAS_PHASE_5_STATUS.md`
- `WORK_SAAS_PHASE_6_STATUS.md`
- `WORK_SAAS_PHASE_7_STATUS.md`
- `WORK_SAAS_PHASE_8_STATUS.md`
- `WORK_SAAS_PHASE_9_STATUS.md`
- `WORK_SAAS_PHASE_10_STATUS.md`
- `WORK_SAAS_PHASE_11_STATUS.md`
- `WORK_SAAS_PHASE_12_QA_REPORT.md`
- `WORK_SAAS_PHASE_13_RELEASE_HARDENING.md`
- `WORK_SAAS_SPRINT_COMPLETION_2026_05_21.md`

Final gates:

- `npm.cmd run lint`: pass.
- `npm.cmd run build`: pass.
- `npx.cmd tsc -b --pretty false`: pass.
- Final broad smoke screenshots: `docs/screenshots/work-saas-sprint-final-smoke-after-fallback-2026-05-21`.
- Final work route recheck: `docs/screenshots/work-saas-sprint-final-work-after-copy-2026-05-21`.
- Final console diagnostics: 0 errors/warnings in the final smoke and work recheck.

Remaining documented external gate:

- Apply `supabase/migrations/0099_academy_optional_attendance_call.sql` remotely when database credentials are available. The frontend is compatible before the migration, but the migration keeps the persisted setting first-class.

After that, begin with:

1. `WSAAS3-01`
2. `WSAAS3-02`
3. `WSAAS3-03`
4. `WSAAS3-04`

Reason:

- Shell/context is foundational. Page-by-page fixes before shell/context will create rework.

## Page By Page SaaS Audit Addendum - 2026-05-21

New audit documents:

- `WORK_SAAS_PAGE_BY_PAGE_AUDIT_2026_05_21.md`
- `WORK_SAAS_PERFECT_SAAS_CHANGE_QUEUE_2026_05_21.md`

Evidence:

- 140 screenshots across Player App, Competition OS and Management OS.
- Viewports: mobile 390px, mobile 430px, desktop 1366px, desktop amplo.
- Screenshot folder: `docs/screenshots/page-by-page-saas-audit-2026-05-21`.
- Console errors captured in the broad audit: 0.

Applied P0 fixes from this addendum:

1. Navigation now respects the active place modules, not only the primary place modules.
2. Navigation active state now differentiates query-string views.
3. Competition work routes now use Competition OS navigation in work mode.
4. Public place hero now exposes the place name as the page `h1`.

Remaining SaaS-grade work:

1. SaaS web shell with unit selector, breadcrumbs and domain navigation.
2. Work Today as an operational blocker queue.
3. Tournament/league operational cockpit density reduction on mobile.
4. Academy attendance optional by company, default off.
5. Responsive student detail panel.
6. Reservation edit/rebooking and WhatsApp communication flow.
7. People/CRM module architecture.
8. Finance/payment architecture.
