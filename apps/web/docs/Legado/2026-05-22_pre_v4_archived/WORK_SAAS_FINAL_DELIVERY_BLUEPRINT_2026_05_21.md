# Work SaaS Final Delivery Blueprint - 2026-05-21

Status: final product architecture blueprint before implementation.  
Scope: complete Work SaaS web, Mobile Work and their boundary with Player App.  
Source: code inspection, existing WORK docs, E2E reports, screenshots from `WORK_SAAS_FINAL_SCREEN_AUDIT_2026_05_21.md`.

## North Star

The Work area must become a professional SaaS, not a longer version of the player app.

The product has three official surfaces:

| Surface | Purpose | Device strategy | Main risk |
|---|---|---|---|
| Player App | Personal experience to play, learn, compete, reserve and pay. | Mobile-first, simple web. | Accidentally exposing work/admin complexity. |
| SaaS Web Work | Full management platform for clubs, academies, competitions and revenue. | Desktop-first, responsive. | Remaining an adapted module menu instead of an organized SaaS. |
| Mobile Work | Operational tool for work in motion. | Mobile-first, selective. | Trying to copy the complete web SaaS on a phone. |

## Product Layer Contract

### Player App

Owns:

- personal home;
- play/discovery;
- personal competition participation;
- personal routine;
- personal reservations;
- personal classes;
- personal payments;
- profile.

Never owns:

- local finance;
- staff tools;
- local setup;
- admin reports;
- POS;
- permissions;
- competition owner tools unless the user intentionally enters Work.

### SaaS Web Work

Owns:

- organization and unit management;
- local operation;
- calendar;
- reservations;
- academy/classes;
- people;
- revenue;
- POS/inventory;
- team/permissions;
- competition operation;
- reports;
- settings;
- audit/admin.

### Mobile Work

Owns:

- work today;
- role-specific quick actions;
- day agenda;
- reservation handling;
- class operation;
- payment reminder/mark paid;
- quick POS sale;
- competition result/check-in/communication;
- simple approvals.

Never owns by default:

- advanced configuration;
- destructive actions;
- full reports;
- complex CRM administration;
- product plan change;
- permission matrix;
- full finance analysis.

## SaaS Web Shell

The SaaS web shell is the foundation. It should be implemented before page-level reshuffles.

### Required Shell Regions

| Region | Responsibility |
|---|---|
| Left sidebar | Domain navigation grouped by responsibility and permission. |
| Topbar | ATP identity, mode, organization, unit/competition context, search, notifications, user. |
| Breadcrumb | Shows where the user is: Work > Unit > Domain > Detail. |
| Page header | One title, one short purpose, one primary CTA, optional secondary actions. |
| Main content | Domain-specific workspace. |
| Right drawer | Detail/edit/history without losing list context. |
| Footer/status strip future | Sync, last updated, support, audit state if needed. |

### Topbar Contract

Desktop:

```text
[ATP] [Org/Unit selector] [Breadcrumb/context]       [Search] [Jogador|Trabalho] [Notifications] [User]
```

Mobile:

```text
[ATP] [Active context] [Jogador|Trabalho]
[Role/Unit compact selector if needed]
```

Rules:

- `Jogador / Trabalho` is a global mode selector, not page content.
- The active unit should not be repeated inside every module card.
- If a role has only one unit, the selector can be compact but still clear.
- If a user has many units, `/gestao` must first help choose or prioritize.

### Sidebar Contract

Do not render empty groups. Do not render forbidden items.

Target web sidebar:

```text
Trabalho
  Hoje
  Calendario

Operacao
  Reservas
  Aulas

Pessoas
  Clientes
  Alunos
  Socios
  Equipe

Receita
  Recebiveis
  Pagamentos
  Despesas
  Planos e pacotes
  Cantina / POS

Competicoes
  Torneios
  Ligas
  Resultados
  Publicacao

Relatorios
  Operacao
  Receita
  Pessoas
  Competicoes

Administracao
  Local e unidades
  Quadras e recursos
  Regras
  Permissoes
  Integracoes
  Avancado
```

MVP can keep current visible labels if product wants less disruption, but internally the architecture must follow these domains.

## Organization And Unit Model

### Entity Levels

```text
Account/User
  Personal player identity
  Work memberships

Organization
  One owner business context
  Can contain multiple places/units
  Can contain independent competition operation

Unit/Place
  Club, academy, court location, branch

Domain
  Calendar, Reservations, Classes, People, Revenue, POS, Competitions, Reports, Admin

Record
  Reservation, student, receivable, sale, tournament, league, staff member
```

### `/gestao` Target

`/gestao` should become the Work Switchboard and Command Center.

It should answer:

- Which work context am I in?
- What needs attention across my work today?
- Which unit or competition do I enter now?
- Which invitations/onboarding steps are pending?

It should not become:

- a wall of all modules;
- a full report dashboard;
- a long list of every item across all units.

### Unit Workspace Target

`/gestao/:placeId` should mean:

```text
I am inside this unit.
All numbers, modules and actions are scoped to this unit unless explicitly marked global.
```

Page body should not re-teach the user which unit they are in on every scroll. The shell should own that.

## Domain Architecture

### Domain 1 - Hoje

Question:

```text
What needs to be resolved now?
```

Primary users:

- owner;
- manager;
- frontdesk;
- finance;
- cashier;
- coach;
- organizer.

Content:

- critical blockers;
- next scheduled work;
- queues requiring action;
- one CTA per role/context;
- contextual handoff to domain pages.

Do not show:

- full reports;
- setup checklist unless blocking;
- every module summary;
- historical data.

Desktop:

- command center with prioritized columns;
- filters by unit/context;
- open detail in right drawer.

Mobile:

- role card + primary CTA + few critical queues.

### Domain 2 - Calendario

Question:

```text
What is happening in time?
```

Owns:

- court bookings;
- blocks;
- classes;
- teacher day schedules;
- lesson requests;
- tournament/league court allocations;
- waitlist context;
- resource occupancy.

Views:

- day by hour;
- week;
- resource by court;
- teacher day;
- compact mobile day.

Primary CTAs:

- Nova reserva;
- Bloquear horario;
- Abrir aula;
- Resolver conflito;
- Criar solicitacao de agenda for competition, if needed.

Does not own:

- court setup;
- class setup;
- pricing rules;
- finance ledger.

### Domain 3 - Reservas

Question:

```text
What is the lifecycle of this booking?
```

Owns:

- reservation list;
- reservation detail;
- new reservation wizard;
- waitlist;
- payment state;
- cancel/reschedule;
- communication log;
- admin manual edit;
- player reschedule link/agenda selector.

Canonical lifecycle:

```text
Search availability -> reserve -> payment state -> confirm/use -> edit/reschedule/cancel -> history
```

Waitlist lifecycle:

```text
Waitlisted -> options available -> contact sent -> customer chooses -> reservation created -> history
```

Web:

- list/table with filters;
- drawer detail;
- batch/status filters;
- communication history.

Mobile:

- today list;
- new reservation flow;
- waitlist action cards;
- cancel/reschedule sheet.

### Domain 4 - Aulas

Question:

```text
What classes, students and replacements need attention?
```

Owns:

- class day operation;
- class schedules;
- class detail;
- students inside class context;
- planned absence;
- replacement credits;
- progress notes;
- optional attendance if company enables it.

Does not own:

- staff permissions;
- broad finance;
- global people directory;
- court setup.

Attendance/chamada rule:

- Default: off.
- Company setting can require it.
- If off, professor sees agenda, class info, students, notices and replacements, not a mandatory attendance flow.

Web:

- full class management;
- class detail pages;
- student relation;
- replacement queues.

Mobile professor:

- day agenda;
- next class;
- students;
- planned absences;
- progress notes;
- replacements.

### Domain 5 - Pessoas

Question:

```text
Who is this person and what relationship do they have with the business?
```

Owns:

- unified people search;
- clients/CRM;
- leads;
- students;
- members;
- staff/coaches;
- relationship history;
- contact preferences;
- communication log.

MVP approach:

- Do not require backend unification immediately.
- Build a unified directory/read layer over existing entities.
- Person detail can show linked records from current tables.

Subdomains:

- Clientes/CRM;
- Alunos;
- Socios;
- Equipe;
- Leads;
- Atendimento.

Mobile:

- quick search;
- due follow-ups;
- contact card;
- student summary;
- no full CRM administration.

### Domain 6 - Receita

Question:

```text
What money is due, paid, spent or forecast?
```

Owns:

- receivables;
- paid payments;
- expenses;
- membership billing;
- academy billing;
- reservation payments;
- packages/plans;
- POS revenue;
- future commissions/splits/recurrence.

Rules:

- Player personal payments stay in Player App.
- Work revenue stays in SaaS Work.
- Contextual payment buttons are allowed, but ledger is central.

Unified payment modal:

- value;
- source entity;
- payer;
- due date;
- status;
- notes;
- "Pagar" or "Marcar como pago" stub now;
- future provider integration slot.

Desktop:

- dense table/list hybrid;
- filters;
- batch reminders;
- right drawer;
- export/report.

Mobile finance:

- overdue;
- today;
- mark paid;
- reminder;
- simple expense if allowed.

### Domain 7 - Cantina / POS

Question:

```text
How do I sell now and keep stock controlled?
```

Owns:

- quick sale;
- sale ledger;
- products;
- stock;
- low stock;
- cancellation/refund future;
- POS revenue handoff to Receita.

Web:

- sale and inventory.

Mobile cashier:

- sell first;
- sales today;
- stock low;
- product view if authorized.

### Domain 8 - Competition OS

Question:

```text
Which competition needs action now?
```

Owns:

- work competition hub;
- tournaments;
- leagues;
- phase cockpit;
- registration review;
- payments;
- court allocation;
- match/result operation;
- standings;
- publishing;
- communication;
- staff roles;
- advanced setup.

Player discovery remains:

- `/eventos`;
- `/eventos/torneios`;
- `/eventos/ligas`.

Work canonical future routes:

- `/trabalho/competicoes`;
- `/trabalho/competicoes/torneios`;
- `/trabalho/competicoes/ligas`;
- `/trabalho/competicoes/:type/:id`.

Legacy routes remain wrappers:

- `/eventos?modo=organizing`;
- `/eventos/torneios?view=organizing`;
- `/eventos/ligas?view=organizing`;
- `/eventos/:id/organizacao`.

### Domain 9 - Relatorios

Question:

```text
What happened and what trend should I understand?
```

Owns:

- occupancy;
- revenue summary;
- receivable aging;
- class health;
- student retention;
- CRM conversion;
- POS sales;
- competition reports;
- staff activity/audit future.

Do not show:

- as default mobile content;
- above the daily command center;
- mixed into setup pages.

### Domain 10 - Administracao

Question:

```text
How is this business configured?
```

Owns:

- local public profile;
- units;
- resources/courts;
- booking rules;
- academy rules;
- payment rules;
- plans/products;
- permissions;
- integrations;
- advanced/danger.

Rules:

- Rare setup never competes with daily work.
- Dangerous actions are separated, confirmed and owner-only.

## Canonical Page Responsibility Contracts

### Work Switchboard `/gestao`

Primary user:

- any staff or organizer.

Question:

- What should I work on now, and which context should I enter?

First fold:

- active role;
- critical blockers;
- active unit/competition cards;
- invitations.

Primary CTA:

- Enter highest priority context.

Never appears:

- full reports;
- full setup forms;
- all historical records.

### Unit Workspace `/gestao/:placeId`

Primary user:

- owner/manager/staff for a specific unit.

Question:

- What is happening in this unit?

First fold:

- scoped unit context from shell;
- domain page title;
- primary CTA.

Never appears:

- global all-unit noise unless explicitly selected.

### Calendario

Primary user:

- manager/frontdesk/coach.

Question:

- What is happening by time/resource today?

Primary CTA:

- Nova reserva or open next class, depending role.

Mobile:

- day agenda only.

Desktop:

- day/week/resource filters.

### Reservas

Primary user:

- frontdesk/manager.

Question:

- What is the booking state and what needs action?

Primary CTA:

- Nova reserva.

Details:

- open reservation drawer.

### Aulas

Primary user:

- coach/academy manager.

Question:

- What classes/students/replacements need attention?

Primary CTA:

- Abrir proxima aula or resolver reposicao.

### Pessoas

Primary user:

- frontdesk/manager.

Question:

- Who is this person and what relationship/next action exists?

Primary CTA:

- Novo contato, novo aluno, novo socio or abrir pessoa, depending tab.

### Receita

Primary user:

- finance/manager.

Question:

- Who needs to pay and what has been paid/spent?

Primary CTA:

- Cobrar, marcar pago, registrar despesa.

### POS

Primary user:

- cashier.

Question:

- What am I selling now?

Primary CTA:

- Registrar venda.

### Competition OS

Primary user:

- organizer/scorekeeper/checkin/media.

Question:

- What phase blocker needs action?

Primary CTA:

- Resolve next phase blocker.

### Relatorios

Primary user:

- manager/owner/finance.

Question:

- What do trends and history show?

Primary CTA:

- Filter/export/drill down.

### Administracao

Primary user:

- owner/manager.

Question:

- What setup/configuration controls this operation?

Primary CTA:

- Save configuration or complete setup section.

## Role Flows

### Owner / Manager

Daily:

1. Open Work.
2. See organization/unit switchboard.
3. Enter most important unit.
4. Resolve blockers from Hoje.
5. Drill into Calendar, Reservations, Classes, Revenue or People.

Weekly:

1. Review reports.
2. Adjust capacity/pricing/classes.
3. Review staff and revenue.

Rare:

1. Configure unit.
2. Set permissions.
3. Change rules.

### Frontdesk

Daily:

1. Open Work.
2. See reservations/check-ins/waitlist.
3. Create reservation from primary CTA.
4. Search customer/time.
5. Confirm reservation/payment state.
6. Handle cancellation/reschedule with WhatsApp.
7. Open People for customer context.

### Coach

Daily:

1. Open Work.
2. See today agenda.
3. Open next class.
4. See court, group and students.
5. Register planned absence/replacement/progress.
6. Attendance only if enabled by company.

### Finance

Daily:

1. Open Work.
2. Land in receivables.
3. Filter overdue/today.
4. Send reminders.
5. Mark paid.
6. Register expense.

### Cashier

Daily:

1. Open Work.
2. Land in quick sale.
3. Select product/manual item.
4. Register sale.
5. Check low stock.

### Organizer

Daily during event:

1. Open Work.
2. See competitions with phase blockers.
3. Open cockpit.
4. Approve registrations, publish table, launch/validate results, communicate.

Setup:

1. Create competition on web.
2. Configure rules/classes.
3. Open registration.

### Multi-role User

Rule:

- Mode is explicit.
- Player tasks stay in Player.
- Work tasks stay in Work.
- Switching mode returns to last sensible context.

## Route And Compatibility Strategy

Current routes stay valid.

| Current route | Canonical meaning | Future wrapper strategy |
|---|---|---|
| `/gestao` | Work Switchboard | Keep. |
| `/trabalho` | Work Switchboard alias | Redirect/wrapper to `/gestao` until canonical rename. |
| `/gestao/:placeId` | Unit workspace | Keep. |
| `/gestao/:placeId/agenda` | Calendar/Reservations depending `visao` | Preserve `visao`; gradually map to domain pages. |
| `/gestao/:placeId/academia` | Aulas domain | Preserve. |
| `/gestao/:placeId/clientes` | Pessoas domain | Preserve. |
| `/gestao/:placeId/financeiro` | Receita domain | Preserve. |
| `/gestao/:placeId/cantina` | POS domain | Preserve. |
| `/gestao/:placeId/equipe` | Pessoas/Admin staff | Preserve. |
| `/gestao/:placeId/ajustes` | Administracao | Preserve. |
| `/locais/:placeId/admin` | Legacy place admin | Wrapper to Unit Workspace. |
| `/eventos?modo=organizing` | Competition OS hub | Wrapper to work competitions. |
| `/eventos/torneios?view=organizing` | Work tournaments | Wrapper to Competition OS. |
| `/eventos/ligas?view=organizing` | Work leagues | Wrapper to Competition OS. |
| `/eventos/:id/organizacao` | Tournament cockpit | Keep and present Work shell when authorized. |
| `/eventos/ligas/:leagueId` | League player/owner detail | Preserve; split composition by role. |

Public routes never break:

- `/join/:tournamentId`;
- `/inscricao/:tournamentId`;
- `/t/:tournamentId`;
- league join tokens;
- booking change tokens.

## Future Growth Slots

| Future feature | Domain | Web/mobile |
|---|---|---|
| Payment provider integration | Receita + contextual modal | Web + mobile actions. |
| Recurring billing | Receita | Web first. |
| Split payments | Receita/Admin | Web. |
| Coach commissions | Receita + Pessoas/Equipe | Web, mobile summary. |
| Contracts | Pessoas + Receita | Web. |
| CRM campaigns | Pessoas/CRM | Web, mobile follow-ups. |
| Notification center | Shell + Communication | Both. |
| Audit log | Administracao/Relatorios | Web. |
| Multiunit executive dashboard | Relatorios | Web. |
| Marketplace | Player + Admin setup | Future split. |
| Automation rules | Administracao | Web. |
| Equipment/resources | Administracao + Calendario | Web + mobile view. |

## Implementation Rules

1. Do not implement page redesign before shell/context foundation.
2. Do not remove legacy routes.
3. Do not relax permissions.
4. Do not duplicate backend loaders.
5. Do not copy full web SaaS to mobile.
6. Do not hide daily work in Admin or Mais.
7. Do not show setup in first fold unless setup blocks operation.
8. Do not mix personal payments with local revenue.
9. Do not mix player discovery with organizer operation.
10. Use detail drawer/sheet before creating separate route if it preserves context.

## Final Acceptance Definition

The Work SaaS restructure is successful when:

- staff understands active mode and active unit within 5 seconds;
- owner can choose a unit/competition without scanning a long feed;
- frontdesk can create reservation in a short path;
- coach can see day agenda and class details without ERP noise;
- finance can process receivables in dense desktop workflow;
- cashier can sell immediately;
- organizer can resolve competition phase blockers;
- reports are available but not competing with daily work;
- mobile work has only operational actions;
- all existing functions remain reachable;
- public and legacy routes still work;
- screenshots at 390, 430, 1366 and wide desktop validate layout and hierarchy.

