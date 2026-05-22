# Work SaaS Final Screen Audit - 2026-05-21

Status: final architecture audit before implementation.  
Scope: Player App boundary, Work SaaS web, Mobile Work, Competition OS.  
Output type: analysis and product architecture, no code implementation in this round.

## Purpose

This audit exists because the next step is not another visual polish sprint. The goal is to transform the web Work area into a powerful SaaS while keeping mobile Work as an operational tool and preserving the Player App as a simple player experience.

The audit uses the running app, screenshots, route diagnostics, existing code routes, previous E2E reports, and external UX sanity checks.

## Evidence Captured

Auditor:

- `scripts/capture-visual-audit.mjs`

Viewports:

- `mobile-390`: 390 x 844
- `mobile-430`: 430 x 932
- `desktop-1366`: 1366 x 900
- `desktop-wide`: 1920 x 1080

Evidence folders:

| Persona/area | Folder | Screenshots | Notes |
|---|---|---:|---|
| Player + owner | `docs/screenshots/work-saas-final-architecture-2026-05-21-player-owner/` | 52 | Player home, Jogar, Competir, Rotina, Perfil, Work entry. |
| Manager/owner | `docs/screenshots/work-saas-final-architecture-2026-05-21-manager/` | 56 | Place workspace, agenda, reservations, academy, clients, finance, canteen, team, settings. |
| Coach | `docs/screenshots/work-saas-final-architecture-2026-05-21-coach/` | 24 | Professor work entry and academy views. |
| Frontdesk | `docs/screenshots/work-saas-final-architecture-2026-05-21-frontdesk/` | 32 | Reservations, new reservation, waitlist, clients, academy access. |
| Finance | `docs/screenshots/work-saas-final-architecture-2026-05-21-finance/` | 28 | Receivables, paid, expenses, summary, forbidden route checks. |
| Cashier | `docs/screenshots/work-saas-final-architecture-2026-05-21-cashier/` | 28 | POS, stock, products, forbidden route checks. |
| Organizer | `docs/screenshots/work-saas-final-architecture-2026-05-21-organizer/` | 28 | Competition work hub, tournaments, leagues, player context check. |

Total new screenshots in this round: 248.

## External UX Checks Used

These were used only as sanity checks, not as a product template:

- Material Design bottom navigation: bottom nav is primarily mobile and should expose a small set of top-level destinations; desktop should use side navigation patterns. Source: https://m1.material.io/components/bottom-navigation.html
- Android responsive navigation guidance: compact screens can use bottom navigation while larger screens can use navigation rail/drawer with persistent leading navigation. Source: https://developer.android.com/develop/ui/views/layout/build-responsive-navigation
- Nielsen Norman Group mobile enterprise/intranet guidance: mobile enterprise apps should be optimized for mobile constraints instead of repurposing the desktop surface. Source: https://media.nngroup.com/media/reports/free/Mobile_Intranets_and_Enterprise_Apps.pdf
- Empty state guidance from complex-app patterns: empty states should explain status and provide the next useful action, not just say that there is no data.

## High-Level Finding

The visual DNA is now close to the intended premium dark product, but the Work area is still structurally closer to an adapted app workspace than a mature SaaS.

The current product has enough functional depth to become a serious SaaS:

- reservations;
- calendar;
- waitlist;
- academy/classes;
- students/enrollments;
- CRM/clients;
- finance/receivables;
- POS/canteen;
- team/permissions;
- competition operation;
- reports and settings.

The core problem is no longer "do we have the feature?". The core problem is:

1. Does each function have the right home?
2. Does web behave like a SaaS?
3. Does mobile behave like a field operation tool?
4. Does the user know the active organization, unit, mode and next action?
5. Can the architecture receive future modules without becoming a menu pile?

## What Is Already Working

### Player App

The Player App is visually coherent and has clear primary areas:

- Inicio;
- Jogar;
- Competir;
- Rotina;
- Perfil.

The renaming from Agenda to Rotina helps because it now contains reservations, classes, matches, personal payments and history. This prevents duplicate top-level items for Aulas/Pagamentos in player navigation.

The Player App should remain simple. It should not inherit SaaS work complexity.

### Work Role Boundaries

Role-based routing is directionally correct:

- coach-only users land in an academy-focused work surface;
- frontdesk users see reservations/clients/classes, not full finance/admin;
- finance users see finance first;
- cashier users see POS/canteen first;
- organizer users see competition operation.

Forbidden route checks generally redirect or constrain the surface instead of exposing forbidden modules.

### Premium Dark Visual Layer

Most surfaces now share:

- dark court imagery;
- green primary CTA;
- rounded panels;
- clear contrast;
- consistent ATP identity;
- left nav on desktop;
- bottom nav on mobile.

This should be preserved. The next work is architectural, not a visual restart.

### Calendar Direction

The calendar is moving in the right direction:

- hour-by-hour slots;
- court/resource view;
- class layer;
- waitlist and reservations can coexist;
- professor day agenda is possible.

This supports making Calendar a first-class SaaS module.

### Finance Direction

Finance has the right conceptual ingredients:

- receivables;
- paid;
- expenses;
- plans;
- summary;
- pay/reminder actions.

It is already more than a simple screen. It should become the Revenue domain of the SaaS.

### Competition OS Direction

The organizer hub is structurally close:

- work competition hub;
- grouped by blocking phase;
- primary action "Abrir cockpit da fase";
- player discovery stays separate in the normal `/eventos` flow.

This should be formalized as Competition OS inside Work.

## Critical Structural Findings

### AUDIT-01 - Web Work still lacks a true SaaS shell

Observed:

- Place workspace starts with a large page title.
- Then another inner card repeats local identity, role, product, active unit and active module.
- The sidebar has work groups, but the page content still behaves like a module cockpit inside another cockpit.
- In screenshots, the same page can show: page title, unit card, active module card, CTA buttons and reports before the user reaches the actual work.

Impact:

- The user has to parse shell, context, module and content at once.
- Multiunit users still need too much visual effort to know what is active.
- It feels like a polished admin page, not yet a full SaaS workspace.

Target:

- Web SaaS shell must own context globally:
  - organization;
  - unit;
  - mode;
  - user;
  - breadcrumbs;
  - global search;
  - notifications.
- The page body should start with the actual domain responsibility, not repeat the whole identity stack.

Recommendation:

- Create a Work SaaS shell with:
  - topbar context;
  - organization/unit switcher;
  - breadcrumb;
  - grouped sidebar;
  - page header with one title and one primary CTA;
  - optional right drawer for detail.

### AUDIT-02 - Multiunit workflow needs a dedicated Organization Switchboard

Observed:

- `/gestao` aggregates many places and competitions.
- Place workspace has an active unit card, but unit switching still lives inside a place page.
- Users with more than one academy/club can feel the app is mixing "all work" and "this unit work".

Impact:

- Owner/manager mental model is unclear:
  - Am I operating all units?
  - Am I inside one unit?
  - Is this number global or local?
  - Where do I change unit?

Target:

- `/gestao` should become the Work Switchboard:
  - "Today across my work";
  - organization selector;
  - units with critical blockers;
  - competitions with critical blockers;
  - invites/onboarding;
  - direct enter buttons.
- Once inside `/gestao/:placeId`, the user is in a Unit Workspace.
- Unit Workspace should not repeatedly show all-unit concepts unless explicitly requested.

Recommendation:

- Add a top-level `Organizacao/Unidade` context model.
- Add a unit switcher in the topbar, not buried inside module content.
- Use `All units` only for executive dashboards and reports.

### AUDIT-03 - Painel currently mixes command center and reports

Observed:

- `Painel` shows "Hoje e prioridades" and then a large "Relatorios do local" block.
- On mobile, reports dominate the page and create a long scroll.
- Reports include many zero-value cards and executive metrics.

Impact:

- The daily command center loses priority.
- Manager sees a wall of metrics instead of the next operational decision.
- Mobile becomes heavy and not task-oriented.

Target:

- `Hoje` or `Painel` should answer: "What needs action now?"
- Reports should move to `Relatorios`.
- Executive dashboard should be a desktop-first report page, not mobile default.

Recommendation:

- Split:
  - `Trabalho > Hoje`: actionable queue.
  - `Relatorios > Operacao`: occupancy, period summaries.
  - `Relatorios > Receita`: finance trends.
  - `Relatorios > Pessoas`: CRM/student/member health.

### AUDIT-04 - Mobile Work is still receiving too much web SaaS content

Observed:

- Mobile manager place page renders large web-like workspace headers, reports, active module cards and deep page content.
- Bottom nav overlays content in long captures.
- Mobile professor view is useful, but it still contains module framing meant for web.
- Mobile frontdesk new reservation works, but still lives under the same large local workspace header.

Impact:

- Mobile feels heavy for staff doing field work.
- Key actions may be below too much context.
- The app risks becoming a tiny SaaS instead of an operational mobile tool.

Target:

- Mobile Work should have its own operational shell:
  - compact mode/context;
  - active unit;
  - role-specific today card;
  - primary CTA;
  - action sheets;
  - no report walls;
  - no deep setup.

Recommendation:

- Web Work and Mobile Work should share data and route compatibility, but not identical page composition.
- Mobile can redirect to web for deep setup/reporting.

### AUDIT-05 - Calendar should become a first-class Work module

Observed:

- Calendar now includes reservations, blocks, classes and waitlist context.
- It is still accessed under `Agenda`, with historical reservation semantics.
- Academy has its own calendar/day agenda.

Impact:

- Calendar is not merely a reservation subpage.
- Staff must learn multiple calendar locations.

Target:

- `Calendario` is the operational time map.
- Reservations and classes are layers inside Calendar.
- `Reservas` owns reservation lifecycle.
- `Aulas` owns class lifecycle.

Recommendation:

- Web:
  - `Calendario`: day/week/resource/teacher views.
  - `Reservas`: list/detail/lifecycle/waitlist/payment/communication.
  - `Aulas`: classes/students/replacements/progress.
- Mobile:
  - role calendar by day, not a full multi-resource planner.

### AUDIT-06 - Reservations are close, but need lifecycle clarity

Observed:

- Reservation row now has cancel, edit and "Avisar troca".
- Waitlist row has WhatsApp options.
- New reservation flow correctly uses search before reservation.
- Some labels still expose implementation state, such as "Reservar apos buscar".

Impact:

- Staff can complete the work, but the lifecycle language is not yet SaaS-grade.

Target reservation lifecycle:

1. Draft/search availability.
2. Reserve.
3. Await payment or paid/confirmed.
4. Edit/reschedule.
5. Cancel.
6. Communicate.
7. Move to history.

Target waitlist lifecycle:

1. In waitlist.
2. Slot available or unavailable.
3. Contact customer.
4. Customer selects alternative.
5. Reservation created.
6. Mark notified or remove.

Recommendation:

- Use a Reservation Detail Drawer on web.
- Use a Reservation Sheet on mobile.
- Keep WhatsApp as communication after an operational decision or as "send options", not as the action that decides reservation state.

### AUDIT-07 - Aulas is now cleaner, but page responsibility must be stricter

Observed:

- Professor day agenda can show classes by hour.
- Chamada is now optional by copy, which matches the business decision.
- Students/classes still appear under a broad `Academia` module.
- Student detail modal had previous resize issues, revealing the need for a robust detail pattern.

Impact:

- The class system has enough depth for a serious module, but it still needs clear separation:
  - class operation;
  - class setup;
  - student records;
  - replacements;
  - payments.

Target:

- `Aulas` should be about class operation and academic service.
- `Pessoas > Alunos` should own student identity.
- `Receita` should own money.
- `Administracao > Regras de aulas` should own settings like attendance requirement.

Recommendation:

- Web Aulas:
  - Hoje;
  - Agenda;
  - Turmas;
  - Reposicoes;
  - Evolucao;
  - Config only by link to Admin.
- Mobile professor:
  - Hoje;
  - Agenda;
  - Turmas;
  - Alunos;
  - Perfil.

### AUDIT-08 - Pessoas domain is the biggest future unlock

Observed:

- `Clientes` currently mixes CRM contacts, booking customers, students, members and relationship queue.
- `Aulas` owns students.
- `Financeiro` owns payers.
- `Equipe` owns staff and teachers.

Impact:

- Users do not have one obvious place to search a person.
- Future CRM, memberships, contracts, support history and finance will become harder to evolve if person data remains split in the IA.

Target:

- `Pessoas` should be a domain, not just "Clientes".
- It can initially be a unified directory over existing entities without backend rewrite.

Recommended subdomains:

- Clientes/CRM;
- Alunos;
- Socios;
- Equipe;
- Leads;
- Historico de atendimento.

### AUDIT-09 - Finance is powerful, but needs SaaS density and ledger model

Observed:

- Finance desktop has many card-like receivable rows.
- It is visually consistent, but a finance user with 181 receivables needs scanning, filtering, batch actions and detail drawer.
- Contextual payment buttons exist across modules.

Impact:

- Finance looks good, but SaaS finance should be denser and more ledger-like on desktop.
- Mobile can keep card rows; web needs table density options.

Target:

- `Receita` domain:
  - Recebiveis;
  - Pagamentos;
  - Despesas;
  - Planos/Pacotes;
  - POS;
  - Relatorios financeiros.

Recommendation:

- Desktop finance: table/list hybrid with columns, row actions, filters, batch actions and right detail drawer.
- Mobile finance: compact due/today list with pay/reminder actions.
- Unified payment modal used everywhere payment is required.

### AUDIT-10 - POS/Cantina is a good mobile-first module, but web should be inventory-grade

Observed:

- Cashier desktop opens straight into sale.
- Products and stock are available.
- Cashier is isolated from broad finance.

Impact:

- This area is closer to the desired role-specific behavior.
- Future inventory, costs, suppliers and reconciliation need a web SaaS home.

Target:

- Mobile cashier:
  - Vender;
  - Hoje;
  - Estoque baixo;
  - Produtos only if authorized.
- Web POS:
  - Sale;
  - Sales ledger;
  - Products;
  - Stock;
  - Categories;
  - Cost/future suppliers;
  - report handoff to Receita.

### AUDIT-11 - Competition OS should become a Work domain, not a query-mode inside public events

Observed:

- Organizer work hub is strong and action-oriented.
- It still runs through `/eventos?modo=organizing` and `/eventos/torneios?view=organizing`.
- Player competition context still exposes the mode selector, which is okay for multi-role users, but the organizer operation needs a clearer SaaS destination.

Impact:

- The user can still mentally connect "organizing" with public event discovery.
- Future organizer features will strain player routes.

Target:

- Canonical Work routes:
  - `/trabalho/competicoes`;
  - `/trabalho/competicoes/torneios`;
  - `/trabalho/competicoes/ligas`;
  - `/trabalho/competicoes/:id`.
- Legacy routes remain wrappers/aliases.

Recommendation:

- Preserve current URLs.
- Render a true Competition OS shell for organizer routes.
- Keep player competition discovery and participation separate.

### AUDIT-12 - Page-level CTAs need a stricter contract

Observed:

- Some pages have many buttons of similar visual weight.
- Some screens start with module summary rather than primary action.
- Some labels still read as internal operation labels.

Target:

Each page must define:

- user primary;
- question answered;
- first fold;
- primary CTA;
- secondary CTAs;
- forbidden content;
- empty state;
- mobile subset;
- desktop density.

Recommendation:

- Before implementation, every domain page in the final blueprint must have a Page Responsibility Contract.

### AUDIT-13 - Route compatibility is good, but canonical route semantics need future cleanup

Observed current routes include:

- `/gestao`;
- `/gestao/:placeId/:module`;
- `/locais/:placeId/admin/:module`;
- `/eventos?modo=organizing`;
- `/eventos/torneios?view=organizing`;
- `/eventos/ligas?view=organizing`;
- `/eventos/:tournamentId/organizacao`;
- `/eventos/ligas/:leagueId`.

Target:

- Old routes remain.
- New canonical routes communicate SaaS concepts.
- Redirect/wrapper layer preserves query params and public links.

### AUDIT-14 - Console/network diagnostics found backend schema mismatch

Observed:

- Manager and player-owner captures produced 400 errors for:
  - `place_academy_settings?select=place_id,makeup_notice_hours,auto_create_makeup_credit_on_notice,require_attendance_call,...`
- Coach captures also produced the same 400 errors.
- Cashier, finance, frontdesk and organizer captures produced 0 events in this audit.
- Manager route also produced data timeout events:
  - `Workspace data timeout: payments`;
  - `Workspace data timeout: open matches`.

Impact:

- This is not a visual issue, but it affects reliability.
- It likely indicates local code expecting DB columns/migration not present in the current remote database.

Recommendation:

- Add a pre-implementation DB compatibility check before building more UI around academy settings.
- Treat `place_academy_settings` schema as required for the attendance/default-off decision.

## Target Architecture From Audit

The final architecture should have three different compositions:

### SaaS Web Work

Desktop-first, deep and professional:

- persistent sidebar;
- topbar context;
- organization/unit selector;
- global search;
- dense lists and tables;
- detail drawers;
- reports and admin separated;
- strong route compatibility.

### Mobile Work

Operational, not full SaaS:

- role-first Work Today;
- compact active unit;
- 3 to 5 bottom nav items;
- primary action near the top;
- sheets for details;
- web handoff for setup/report/admin.

### Player App

Simple and personal:

- Jogar;
- Competir;
- Rotina;
- Perfil;
- no local finance/admin;
- personal agenda and payments only.

## Required Design/IA Decisions Before Implementation

1. Official canonical route names for Work SaaS:
   - keep `/gestao` or introduce `/trabalho` as canonical?
2. Whether `Pessoas` becomes a real module label now or a behind-the-scenes IA used to reorganize `Clientes`, `Alunos`, `Socios`, `Equipe`.
3. Whether `Receita` replaces `Financeiro` in the UI or remains internally named `Financeiro` for MVP.
4. Whether `Calendario` is the first Work module after Hoje for all local roles.
5. What the official multiunit model is:
   - organization -> units -> modules;
   - independent organizer -> competitions.
6. Whether web reports are hidden from mobile entirely or shown as compact summaries to managers only.
7. Whether Competition OS gets new visible route labels now or only wrapper routes first.

## Implementation Implications

Do not start by moving individual buttons. Start by implementing the shell and information architecture.

Correct order:

1. Source-of-truth docs and route contract.
2. Work SaaS shell with org/unit context.
3. Canonical domain navigation and wrappers.
4. Page responsibility contracts in code.
5. Calendar as first-class module.
6. Reservation lifecycle detail.
7. Aulas/Pessoas split.
8. Revenue/Finance ledger.
9. Competition OS canonical work surface.
10. Mobile Work operational shell.
11. QA across all roles.

## Evidence-To-Queue Mapping

| Finding | Queue item |
|---|---|
| SaaS shell missing | `WSAAS2-01` |
| Multiunit confusion | `WSAAS2-02` |
| Painel/report mix | `WSAAS2-03` |
| Mobile overloaded | `WSAAS2-10` |
| Calendar first-class | `WSAAS2-04` |
| Reservation lifecycle | `WSAAS2-05` |
| Aulas/Pessoas split | `WSAAS2-06`, `WSAAS2-07` |
| Finance density/ledger | `WSAAS2-08` |
| POS split | `WSAAS2-09` |
| Competition OS canonical | `WSAAS2-11` |
| Reports/Admin separation | `WSAAS2-12` |
| DB schema mismatch | `WSAAS2-00C` |

## Acceptance Standard For Next Phase

The next implementation phase should only be considered successful if:

- web Work has a SaaS shell with stable organization/unit context;
- `/gestao` is a switchboard/command center, not a module dump;
- place workspace body starts with the actual domain task;
- reports are not in the daily first fold;
- mobile Work does not render the full SaaS composition;
- Calendar is a first-class Work domain;
- Reservations, Aulas, Pessoas and Receita have clear boundaries;
- Competition OS has a work identity separate from player discovery;
- all legacy routes still open;
- role permissions remain preserved;
- screenshots at 390, 430, 1366 and wide desktop show no overlapping primary UI;
- diagnostics are reviewed for backend schema issues before release.
