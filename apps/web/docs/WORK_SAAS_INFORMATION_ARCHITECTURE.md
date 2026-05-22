# Work SaaS Information Architecture

Date: 2026-05-21  
Status: proposal, no implementation yet.  
Scope: web Trabalho/Gestao as a professional SaaS, preserving the current premium dark visual language and all existing routes through wrappers/aliases.

## Diagnosis

The current work area already has strong functional depth, but the information architecture is still shaped like an adapted app menu:

- `Agenda` means reservations in the sidebar, but also calendar for courts and classes.
- `Academia` contains daily class operation, class setup, students, requests, coaches and settings.
- `Clientes` mixes CRM contacts, leads, members, pending enrollments and relationship queues.
- `Financeiro` is partly central ledger and partly plans/packages/product setup.
- `Cantina` contains quick selling, daily sales, products and stock.
- `Equipe` contains staff access and also coaches, which overlaps with Academy.
- `Ajustes` contains setup checklist, public data, rules, plans, permissions and publication.
- Competitions are operationally part of Work, but still use public `/eventos` semantics.

The target is not to hide complexity. The target is to organize it by SaaS domain, job-to-be-done and permission.

## Structural Principle

The work area should have three layers:

1. `Command layer`: what needs attention now.
2. `Domain layer`: where daily/weekly work happens.
3. `Admin/report layer`: setup, permissions, advanced configuration, reports and audit.

The current route map should remain compatible, but the user-facing IA can become more mature.

## Proposed Web Shell

### Global Topbar

| Element | Purpose |
|---|---|
| ATP identity | Same logo/proportion as Player App, but applied to SaaS shell. |
| Mode selector | `Jogador / Trabalho`, stable position, never embedded in module content. |
| Organization selector | Select organization or independent organizer context. Required for multi-unit clarity. |
| Unit selector | Select active academy/club/place when inside local management. |
| Global search | Search people, reservations, classes, payments, competitions and settings. Future-ready. |
| Notifications | Operational alerts, invites, payment/action reminders. |
| User menu | Profile, account, support, sign out. |

### Desktop Sidebar Groups

Do not show empty groups. Do not show items without permission.

```text
Trabalho
  Hoje
  Calendario

Operacao
  Reservas
  Aulas
  Competicoes operacionais

Pessoas
  Clientes
  Alunos
  Socios
  Equipe

Receita
  Recebiveis
  Pagamentos
  Planos e pacotes
  Despesas
  Cantina / POS

Competicoes
  Torneios
  Ligas
  Publicacao
  Resultados

Relatorios
  Operacao
  Financeiro
  Alunos
  Competicoes

Administracao
  Local e unidades
  Quadras e recursos
  Regras
  Permissoes
  Integracoes
  Avancado
```

Note: labels in product can stay in Portuguese with accents. ASCII is used in this doc only for portability.

## Proposed Primary Modules

### 1. Hoje

Purpose: action command center. It answers: "What needs to be resolved now?"

Primary users:

- owner/manager: critical cross-domain blockers.
- professor: today's classes and student actions.
- frontdesk: reservations, check-ins, waitlist, quick client lookup.
- finance: overdue/today receivables.
- cashier: quick sale and low stock.
- organizer: competition phase blockers.

Rules:

- No setup cards unless setup blocks operation.
- No raw module list.
- CTA points to the next operational step.
- Mobile Trabalho should start here for most roles.

### 2. Calendario

Purpose: unified schedule surface for the work organization.

Layers:

- court reservations;
- blocked slots;
- academy classes;
- teacher day agenda;
- lesson requests/drop-ins;
- tournament/league court allocations;
- future: maintenance/equipment.

Views:

- Day by hour, default hour grid;
- Week;
- Resource view by court;
- Teacher view by day;
- Filter by court, coach, class, booking status, competition.

Why first-class:

Calendar is not only reservation. It is the operational map of the local business.

### 3. Reservas

Purpose: manage booking lifecycle, not own all calendar logic.

Pages:

- Reservations list;
- Reservation detail drawer/page;
- New reservation wizard;
- Waitlist;
- Change/cancel flow;
- Payment state;
- Communication log.

Actions:

- create reservation;
- edit reservation manually;
- mark paid;
- cancel;
- reschedule;
- send WhatsApp message;
- promote waitlist entry.

Not here:

- court setup;
- booking rules;
- advanced pricing;
- class schedule.

### 4. Aulas

Purpose: academy/class operation.

Pages:

- Today/Day classes;
- Classes;
- Class detail;
- Students in classes;
- Requests and replacements;
- Teacher schedule;
- Student progress.

Actions:

- open class;
- see students;
- register planned absence;
- handle replacement;
- create/update class;
- enroll student;
- add progress note;
- optional attendance if enabled.

Not here:

- staff permissions;
- coach login linking;
- court creation;
- global finance ledger.

### 5. Pessoas

Purpose: one predictable place for humans connected to the business.

Submodules:

- `Clientes/CRM`: leads, contacts, follow-ups, interactions.
- `Alunos`: enrolled students and learning records.
- `Socios`: membership plans and active/cancelled members.
- `Equipe`: staff, teachers, invitations and roles.

Key IA decision:

The product can either unify all person-like entities into a master People index, or keep entities separate but expose one unified search. The next implementation should at least provide a unified search/directory page.

### 6. Receita

Purpose: central financial operation.

Submodules:

- Receivables;
- Payments;
- Expenses;
- Plans and packages;
- Membership billing;
- Academy billing;
- Court booking payments;
- POS/canteen revenue;
- Future: commissions, split, recurrence, invoices.

Rules:

- Personal payments stay in Player App agenda/payments.
- Local receivables stay here.
- Contextual "Pagar/Marcar pago" buttons remain where useful, but every payment must appear in central ledger.

### 7. Cantina / POS

Purpose: point-of-sale and inventory.

Pages:

- Quick sale;
- Today sales;
- Stock;
- Products;
- Future: suppliers and cost.

Mobile principle:

Cashier mobile starts at sell. Product setup is secondary and permissioned.

### 8. Competicoes OS

Purpose: separate playing/discovery from organizing/operation.

Submodules:

- Work competition hub;
- Tournaments;
- Leagues;
- Court allocation requests;
- Results and scorekeeping;
- Publishing/communications;
- Staff and permissions;
- Advanced configuration.

Rules:

- `/eventos` remains player/discovery.
- `/eventos?modo=organizing` remains compatible but renders Competition OS.
- Independent organizers without a place must still have a clear work context.

### 9. Relatorios

Purpose: analysis and history, not daily operation.

Reports:

- Occupancy by court/time;
- Reservation revenue;
- Academy enrollment and attendance/replacement if enabled;
- Receivables aging;
- POS sales;
- CRM conversion;
- Competition performance;
- Staff activity/audit future.

### 10. Administracao

Purpose: setup, permissions, advanced and dangerous operations.

Submodules:

- Organization and units;
- Public profile;
- Courts and resources;
- Booking rules;
- Academy rules;
- Plans/features;
- Staff permissions;
- Publication;
- Integrations;
- Backup/reset/delete advanced actions.

## Target Routing Model

The implementation should keep current public and legacy routes, while introducing a clearer IA. Suggested future route layer:

| Future route | Purpose | Current route compatibility |
|---|---|---|
| `/trabalho` | Work command center | Alias already exists to `/gestao`. |
| `/trabalho/hoje` | Command center | Could wrap `/gestao`. |
| `/trabalho/calendario` | Global work calendar | Existing `/gestao/:placeId/agenda?visao=calendario` can redirect/wrap. |
| `/trabalho/locais/:placeId/reservas` | Reservations domain | Wrap `/gestao/:placeId/agenda?visao=reservas`. |
| `/trabalho/locais/:placeId/aulas` | Classes domain | Wrap `/gestao/:placeId/academia`. |
| `/trabalho/locais/:placeId/pessoas` | People domain | Wrap clients/students/team as needed. |
| `/trabalho/locais/:placeId/receita` | Revenue domain | Wrap finance/canteen. |
| `/trabalho/competicoes` | Competition OS hub | Existing alias to `/eventos?modo=organizing`. |
| `/trabalho/competicoes/torneios/:id` | Tournament cockpit | Wrap `/eventos/:id/organizacao`. |
| `/trabalho/competicoes/ligas/:id` | League owner cockpit | Wrap `/eventos/ligas/:id?mode=work`. |
| `/trabalho/admin` | Admin/config entry | Wrap settings/team/resources. |

Do not break:

- `/join`;
- `/inscricao/:tournamentId`;
- `/t/:tournamentId`;
- `/eventos/:tournamentId`;
- `/eventos/:tournamentId/organizacao`;
- `/eventos/ligas/:leagueId`;
- `/locais/:placeId/admin`;
- `/gestao/:placeId/:module`.

## Module Responsibilities

| Module | Responsibility | Not responsible for |
|---|---|---|
| Hoje | operational priority and next task | configuration, full reports, raw module list |
| Calendario | time/resource map across reservations/classes/events | price rules, person records |
| Reservas | lifecycle of bookings and waitlist | class operation, court setup |
| Aulas | class/student operation | CRM pipeline, staff permissions |
| Pessoas | people directory, CRM, students, members, staff | finance ledger, calendar grid |
| Receita | receivables/payments/expenses/plans/POS revenue | personal player payments |
| Cantina/POS | quick sale, sales day, stock, products | complete financial accounting |
| Competicoes | tournament/league operation | public discovery as primary job |
| Relatorios | analysis, exports, history | daily execution |
| Administracao | setup, permissions, advanced actions | daily work queue |

## Permission Model In The New IA

| Permission/profile | Web default start | Sidebar scope | Mobile default start |
|---|---|---|---|
| owner | Hoje, with org/unit selector | all modules enabled by plan | Hoje with critical blockers |
| manager | Hoje, selected unit | all local modules enabled by plan except owner-only billing/destructive actions | Hoje with manager blockers |
| frontdesk | Hoje or Calendario | Calendario, Reservas, Pessoas/CRM, limited Aulas | Hoje with reservations/check-ins |
| coach | Aulas Hoje or Calendar | Aulas, own students/classes | Today agenda/class list |
| finance | Recebiveis | Receita only | Receber |
| cashier | Vender | Cantina/POS only | Vender |
| tournament organizer | Competition OS Hoje | Competicoes allowed by role | Event operation queue |
| tournament scorekeeper | Results queue | Matches/results only | Launch result |
| tournament checkin | Registrations/check-in | Participants/check-in only | Check-in queue |
| tournament media | Publishing | Communications/publication only | Post/publish |

## Entity Relationships

```text
Organization
  Places/Units
    Courts
    Booking Rules
    Bookings
    Booking Waitlist
    Academy Classes
      Enrollments
      Planned Absences
      Attendance (optional)
      Makeup Credits
      Progress Notes
    Coaches
    Staff Members
    CRM Contacts
    Membership Plans
      Memberships
    Payments
    Payment Reminders
    Expenses
    POS Products
      POS Sales

Competition Workspace
  Tournaments
    Staff
    Registrations
    Classes/Categories
    Matches
    Result Submissions
    Messages/Announcements
    Court Requests
  Leagues
    Seasons
    Classes
    Registrations
    Rounds
    Matches
    Standings
    Messages/Announcements
```

## SaaS Page Pattern

Every SaaS page should follow this pattern:

1. Context header: organization, unit, module, role.
2. Primary question: what this page answers.
3. Primary CTA: one dominant action.
4. Work area: table, calendar, board or detail.
5. Secondary actions: filters, exports, history.
6. Detail drawer/page: edit, communication, payment, notes.
7. Empty state: explains next step.
8. Permission state: hides forbidden actions or explains missing access without exposing private data.

## Navigation Rules

- Main sidebar groups by work domain, not database module.
- Calendar is first-class in web work.
- Mobile only shows operational destinations, not the full SaaS tree.
- Setup and advanced actions live under Administracao.
- Reports never compete with daily execution.
- Contextual actions can duplicate central actions if the central ledger remains authoritative.
- Legacy routes should keep working through wrappers and redirects.
- If a route label changes, update breadcrumb, empty state, CTA and help copy together.

## Future-Ready Slots

| Future capability | Module slot | Web/mobile |
|---|---|---|
| Recurring billing | Receita > Recorrencia | Web, mobile finance alerts |
| Split payment | Receita > Configuracoes/Pagamentos | Web |
| Teacher commissions | Receita > Comissoes and Pessoas > Professores | Web, mobile read-only |
| Contracts | Pessoas > Students/Members and Receita | Web |
| CRM campaigns | Pessoas > CRM/Campanhas | Web, mobile follow-up alerts |
| Notifications automations | Administracao > Automacoes | Web |
| Audit log | Relatorios > Auditoria | Web |
| Multiunit dashboards | Hoje/Relatorios with org scope | Web, mobile critical alerts |
| Marketplace | Player + Admin publication | Future |
| Equipment/fleet | Administracao > Recursos | Web, mobile issue report |

## Recommended First Implementation Order After Approval

1. Add compatibility route contracts and route wrappers, without changing loaders.
2. Create SaaS shell with stable org/unit context and grouped sidebar.
3. Turn `Hoje` into command center by role.
4. Promote `Calendario` to first-class web module with layers.
5. Split People IA into CRM, Students, Members and Team while preserving old routes.
6. Split Revenue IA into Receivables, Payments, Expenses, Plans/Packages and POS.
7. Reframe Competition OS web routes as work routes while preserving `/eventos`.
8. Replace mobile work tree with per-role operational home and action sheets.
9. Move setup/advanced actions under Admin.
10. Run QA by persona and route compatibility.
