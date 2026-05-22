# Work SaaS Implementation Queue V1

Date: 2026-05-21  
Status: execution queue draft.  
Scope: implementation queue for the Work SaaS restructure. Do not execute all at once.

## Queue Rules

Each item must:

- preserve legacy routes;
- preserve permissions;
- avoid backend changes unless explicitly listed;
- avoid visual redesign outside structure/layout needs;
- include mobile and desktop acceptance;
- include rollback path.

## Recommended Sprint Order

1. Route and shell foundation.
2. Work web navigation.
3. Work Today command center.
4. Calendar first-class module.
5. Reservations cleanup.
6. Aulas cleanup.
7. Pessoas domain.
8. Receita domain.
9. POS/cantina cleanup.
10. Competition OS route/surface cleanup.
11. Admin/reports separation.
12. Mobile work role layer.
13. QA and regression.

## Foundation

### WSAAS-00A - Route Compatibility Audit

Objective: document and protect every current work route before refactor.

Routes involved:

- `/gestao`
- `/trabalho`
- `/gestao/:placeId`
- `/gestao/:placeId/:module`
- `/locais/:placeId/admin`
- `/locais/:placeId/admin/:module`
- `/eventos?modo=organizing`
- `/trabalho/competicoes`
- `/eventos/:tournamentId/organizacao`
- `/eventos/ligas/:leagueId`

Files likely:

- `src/App.tsx`
- `src/lib/place-admin-navigation.ts`
- `src/hooks/usePlaceAdminRouteSync.ts`
- route tests or audit docs

Change:

- create a route transition table in code/docs;
- add manual test checklist;
- no UI change.

Do not change:

- loaders;
- permissions;
- public routes.

Acceptance:

- every old route opens;
- query param `visao` is preserved or canonicalized;
- no redirect loop.

QA:

- desktop 1366;
- mobile 390;
- direct URL load;
- refresh page.

Rollback:

- remove added wrappers/checklist only.

### WSAAS-00B - Source Of Truth Policy

Objective: establish that new work docs supersede older conflicting product docs.

Files likely:

- `docs/RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
- new docs index/README

Change:

- add note that `WORK_*` docs are current for Work SaaS restructure after validation.

Acceptance:

- future agents know which docs to follow.

## Shell And Navigation

### WSAAS-01A - Web Work Shell Context

Objective: make web Trabalho clearly SaaS-like with stable mode, org/unit and user context.

Files likely:

- `src/components/BottomNav.tsx`
- `src/components/AppShell.tsx` if present
- `src/components/place/PlaceAdminShell.tsx`
- `src/pages/ManagementHubPage.tsx`
- CSS files

Change:

- stabilize header/logo/mode selector;
- add or prepare org/unit context slot;
- keep premium dark visual DNA.

Do not change:

- backend;
- role access logic;
- player navigation.

Acceptance:

- Player/Work selector is visually consistent;
- web Work no longer looks like secondary admin;
- current user and active context are clear.

QA:

- home player vs work web screenshots;
- manager, coach, finance, cashier roles.

### WSAAS-01B - Grouped Desktop Sidebar

Objective: replace flat work menu with grouped SaaS domains.

Files likely:

- `src/components/BottomNav.tsx`
- `src/lib/place-management.ts`
- `src/lib/place-admin-navigation.ts`

Change:

- render groups by permission:
  - Trabalho;
  - Operacao;
  - Pessoas;
  - Receita;
  - Competicoes;
  - Relatorios;
  - Administracao.

Do not change:

- actual modules initially;
- route destinations beyond wrappers.

Acceptance:

- no empty group;
- no forbidden item;
- daily items not hidden;
- setup items under Admin.

QA:

- owner/manager;
- frontdesk;
- coach;
- finance;
- cashier;
- organizer independent.

### WSAAS-01C - Mobile Work Nav Contract

Objective: keep mobile nav role-specific and operational.

Files likely:

- `src/components/BottomNav.tsx`
- role helpers

Change:

- confirm nav sets:
  - coach: Hoje/Agenda/Turmas/Alunos/Perfil;
  - frontdesk: Hoje/Reservas/Clientes/Aulas/Mais;
  - finance: Receber/Pagos/Despesas/Resumo/Perfil;
  - cashier: Vender/Hoje/Estoque/Produtos/Perfil;
  - organizer: Hoje/Torneios/Ligas/Publicacao/Perfil;
  - manager: Hoje/Agenda/Aulas/Financeiro/Mais.

Acceptance:

- mobile does not expose full SaaS tree;
- `Mais` is not a dumping ground.

## Command Center

### WSAAS-02A - Work Today Role Model

Objective: define role-specific data and card priorities for `Hoje`.

Files likely:

- `src/pages/ManagementHubPage.tsx`
- `src/components/place/PlaceOperationsDashboard.tsx`
- `src/components/place/PlaceManagementCockpit.tsx`

Change:

- create priority model by role:
  - manager/owner blockers;
  - coach classes/replacements;
  - frontdesk reservations/waitlist;
  - finance receivables;
  - cashier sell/stock;
  - organizer competition blockers.

Do not change:

- data source/loaders.

Acceptance:

- first fold has one primary answer per role;
- setup only appears if blocking operation.

### WSAAS-02B - Work Today Empty States

Objective: replace poor empty states with next-step guidance.

Acceptance:

- no "nothing found" dead end;
- every empty state includes why and next step.

## Calendar

### WSAAS-03A - First-Class Calendar Route

Objective: create or expose Work Calendar as a primary module.

Routes:

- new wrapper suggested: `/trabalho/calendario` or `/trabalho/locais/:placeId/calendario`;
- existing: `/gestao/:placeId/agenda?visao=calendario`.

Files likely:

- `src/App.tsx`
- `src/pages/PlacesPage.tsx`
- `src/components/place/PlaceBookingCalendarModule.tsx`
- `src/components/place/PlaceAcademyTeacherCalendarModule.tsx`

Change:

- present calendar as Work domain, not booking subtab.
- show booking/class/event layers.

Acceptance:

- frontdesk sees courts/reservations;
- coach sees day classes;
- manager can filter layers.

### WSAAS-03B - Calendar Full-Hour Grid

Objective: align work calendar to hour blocks as requested.

Change:

- default display by full hour;
- still support actual reservation/class durations inside hour cells.

Acceptance:

- no half-hour default grid unless user zooms/detail.

## Reservations

### WSAAS-04A - Reservations IA Cleanup

Objective: remove confusing submenu semantics: Hoje, Espera, Ajustes as competing booking views.

Routes:

- keep aliases:
  - `hoje` -> reservations filtered today;
  - `espera` -> reservations with waitlist section;
  - `ajustes` -> Admin resources.

Acceptance:

- sidebar shows Reservas as lifecycle area;
- calendar is external;
- waitlist is contextual;
- setup is Admin.

### WSAAS-04B - Reservation Detail Drawer

Objective: centralize reservation edit/cancel/reschedule/payment/WhatsApp.

Files likely:

- `src/components/place/PlaceBookingReservationsModule.tsx`
- `src/components/place/PlaceBookingDetailedListModule.tsx`
- `src/pages/BookingChangeConfirmPage.tsx`

Acceptance:

- admin can edit reservation manually;
- player change link can open agenda selector;
- paid status preserved during reschedule.

### WSAAS-04C - Waitlist Action Semantics

Objective: fix confusing labels like invite/guest where action is contact/reschedule.

Acceptance:

- if slot unavailable, no enabled `Criar reserva`;
- CTA says `Sugerir horarios`, `Contactar`, or `Reagendar`;
- WhatsApp alternatives are generated from real availability.

## Aulas

### WSAAS-05A - Aulas IA Cleanup

Objective: remove submenus that belong elsewhere.

Move:

- calendar -> Work Calendar;
- resources/settings -> Admin;
- coaches -> People/Team;
- clients -> Pessoas.

Keep:

- day classes;
- classes;
- students;
- requests/replacements;
- student detail/progress.

Acceptance:

- Aulas is about teaching operation and class/student lifecycle.

### WSAAS-05B - Optional Attendance UX

Objective: attendance/chamada appears only when setting is enabled.

Files likely:

- `src/components/place/PlaceAcademyTodayModule.tsx`
- `src/components/place/PlaceAcademyStudentsModule.tsx`
- `src/components/place/PlaceAcademyResourcesModule.tsx`

Acceptance:

- default academy does not push chamada;
- if enabled, UI and copy are explicit.

### WSAAS-05C - Student Detail Responsive Drawer

Objective: fix modal sizing and make student detail robust.

Acceptance:

- adapts to desktop, wide, 430px and 390px;
- footer does not obscure content;
- fields remain readable;
- mobile uses sheet/page pattern.

## Pessoas

### WSAAS-06A - People Domain Landing

Objective: create a clear People/Pessoas entry with unified search.

Files likely:

- `src/pages/PlacesPage.tsx`
- clients modules
- academy students module
- team modules

Change:

- present subdomains: CRM, Alunos, Socios, Equipe.

Acceptance:

- "Clientes" no longer means every person type at once.

### WSAAS-06B - CRM Flow Clarity

Objective: CRM becomes lead/contact relationship area.

Acceptance:

- lead follow-up, interaction, owner and conversion are clear;
- converted contact can start student/member flow.

### WSAAS-06C - Members And Students Separation

Objective: clarify members/socios vs students/alunos.

Acceptance:

- member plan and student enrollment are separate concepts;
- both can link to the same person in future.

## Receita

### WSAAS-07A - Revenue Domain Structure

Objective: centralize business money.

Subpages:

- Recebiveis;
- Pagamentos;
- Despesas;
- Planos e pacotes;
- POS revenue;
- future commissions.

Acceptance:

- finance user sees only revenue;
- contextual payment buttons update same ledger.

### WSAAS-07B - Unified Payment Stub Modal

Objective: all payment points use the same modal and state pattern.

Existing points:

- booking;
- academy enrollment;
- lesson request;
- membership;
- tournament registration;
- league registration;
- personal agenda/payment.

Acceptance:

- modal shows amount, description, target, payer when available;
- button marks paid in current stub;
- future payment provider can replace internals.

## Cantina/POS

### WSAAS-08A - Cashier Mobile First

Objective: cashier mobile starts at sale.

Acceptance:

- `Vender` is first;
- products/stock do not block sale;
- low stock appears as alert.

### WSAAS-08B - POS Web Organization

Objective: clean web POS into Sell, Today, Stock, Products.

Acceptance:

- product setup is secondary;
- sales day and stock are easy to reach.

## Competition OS

### WSAAS-09A - Competition OS Work Shell

Objective: make organizer work feel separate from player discovery.

Routes:

- preserve `/eventos?modo=organizing`;
- add/prepare `/trabalho/competicoes`.

Acceptance:

- public discovery is not first fold for organizer;
- independent organizer without local place is supported.

### WSAAS-09B - Tournament Cockpit Phase Cleanup

Objective: first fold changes by phase.

Phases:

- draft;
- registration open;
- registration closed;
- games generated;
- in progress;
- finished.

Acceptance:

- each phase has one primary CTA;
- advanced actions are outside operation.

### WSAAS-09C - Tournament Role Views

Objective: owner, organizer, checkin, scorekeeper and media see proper tasks.

Acceptance:

- scorekeeper sees results;
- checkin sees registrations;
- media sees publishing/chat;
- player never sees admin tools.

### WSAAS-09D - League Owner/Participant Separation

Objective: league page changes by role and phase.

Acceptance:

- owner sees round blockers and setup;
- participant sees own round, opponent, chat, result, standings;
- config stays owner-only.

## Admin And Reports

### WSAAS-10A - Admin Separation

Objective: move setup/advanced out of daily modules.

Includes:

- public profile;
- resources/courts;
- booking rules;
- academy rules;
- permissions/team;
- publication;
- advanced.

Acceptance:

- no dangerous/setup action in first fold of daily modules.

### WSAAS-10B - Reports Entry

Objective: create report layer without mixing with execution.

Acceptance:

- reports are web-first;
- mobile sees only summaries/alerts.

## Mobile Work

### WSAAS-11A - Mobile Work Home By Role

Objective: role-specific home as operational dashboard.

Acceptance:

- professor, frontdesk, finance, cashier, manager and organizer each see different first fold.

### WSAAS-11B - Mobile Action Sheets

Objective: reusable sheets for high-frequency actions.

Sheets:

- reservation detail/change;
- payment stub;
- WhatsApp communication;
- class detail;
- student quick detail;
- result entry;
- CRM follow-up.

Acceptance:

- no desktop modal squeezed into mobile.

## QA

### WSAAS-12A - Persona QA

Objective: validate all roles.

Acceptance:

- no role gains forbidden function;
- no role loses daily function.

### WSAAS-12B - Route Regression QA

Objective: validate every legacy route.

Acceptance:

- old routes, public links and query params still work.

### WSAAS-12C - Visual Consistency QA

Objective: ensure Work web/mobile still uses approved premium dark DNA.

Acceptance:

- logo, header, mode selector, hero/proportions and spacing are consistent.

## Queue Completion Definition

The queue is complete only when:

- docs are updated after each implemented phase;
- screenshots exist for mobile 390, mobile 430, desktop 1366 and wide;
- console has no blocking errors on primary routes;
- flows pass by persona;
- no old route is broken;
- no daily operation is hidden under setup.
