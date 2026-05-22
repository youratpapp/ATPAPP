# Work SaaS Complete Delivery Spec

Date: 2026-05-21  
Status: final architecture draft for validation before implementation.  
Scope: complete Work/Gestao delivery target, including SaaS web, mobile work layer and boundaries with Player App.

Update 2026-05-21:

This document remains a base delivery target. The current implementation source for the Work SaaS restructure is now:

- `WORK_SAAS_FINAL_HANDOFF_2026_05_21.md`
- `WORK_SAAS_MASTER_EXECUTION_QUEUE_V3_COMPLETE.md`
- `WORK_SAAS_QUEUE_V3_EXECUTION_CONTRACTS.md`
- `WORK_SAAS_DATABASE_MIGRATION_QUEUE.md`
- `WORK_SAAS_FINAL_SCREEN_AUDIT_2026_05_21.md`
- `WORK_SAAS_FINAL_DELIVERY_BLUEPRINT_2026_05_21.md`

`WORK_SAAS_IMPLEMENTATION_QUEUE_V2_FINAL.md` is retained as historical/base planning, but V3 is the governing execution queue.

## Why This Spec Exists

The app has reached a point where visual polish is close, but the work area still carries too much app-like navigation. The target is a professional SaaS structure for clubs, academies, independent organizers and operational staff.

This spec is the master delivery target. It connects:

- function inventory;
- information architecture;
- mobile operational scope;
- page responsibilities;
- roadmap;
- detailed user flows;
- implementation queue;
- QA acceptance.

## Product Layers

| Layer | Purpose | Main user | Complexity level | Device strategy |
|---|---|---|---|---|
| Player App | Simple player experience: play, reserve, learn, compete, pay, profile | player, student, member, competitor | low to medium | mobile-first and web-friendly |
| SaaS Web Work | Complete management platform | owner, manager, frontdesk, finance, coach admin, organizer | high | desktop-first, responsive |
| Mobile Work | Daily operation and fast actions | professor, frontdesk, finance, cashier, organizer, manager on the move | medium but selective | mobile-first |
| Competition OS | Operational layer for tournaments and leagues | organizer, scorekeeper, checkin, media, league owner | medium to high | web for setup, mobile for event operation |

## North Star

Every user should know:

1. Which mode they are in.
2. Which organization/unit/competition they are operating.
3. What needs attention now.
4. What the primary action is.
5. Where setup/reporting/admin lives.
6. How to return to the previous context.

## Target Work Web Navigation

The web work area should not be a flat sidebar of all features. It should be grouped by operational domain.

```text
Trabalho
  Hoje
  Calendario

Operacao
  Reservas
  Aulas

Pessoas
  Clientes e CRM
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
  Financeiro
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

Rules:

- Hide empty groups.
- Hide forbidden groups.
- Do not show setup as daily work.
- Do not show reports as execution pages.
- Keep legacy routes alive.

## Target Mobile Work Navigation

Mobile is not the SaaS squeezed into a phone.

| Role | Mobile nav |
|---|---|
| Professor | Hoje, Agenda, Turmas, Alunos, Perfil |
| Recepcao | Hoje, Reservas, Clientes, Aulas, Mais |
| Financeiro | Receber, Pagos, Despesas, Resumo, Perfil |
| Caixa | Vender, Hoje, Estoque, Produtos, Perfil |
| Gestor | Hoje, Agenda, Aulas, Financeiro, Mais |
| Organizador | Hoje, Torneios, Ligas, Publicacao, Perfil |
| Scorekeeper | Hoje, Resultados, Jogos, Chat, Perfil |
| Check-in | Hoje, Inscritos, Check-in, Chat, Perfil |
| Media | Hoje, Publicar, Chat, Resumo, Perfil |

Rules:

- `Mais` cannot become a hidden ERP.
- Complex setup opens web with a clear message.
- Daily tasks appear before summaries.
- One CTA dominates each screen.

## Domain Ownership

| Domain | Owns | Does not own |
|---|---|---|
| Hoje | current operational priorities and action queues | full setup, full reports, all module links |
| Calendario | reservations, classes, blocks, event allocations by time/resource | pricing rules, person records |
| Reservas | reservation lifecycle and waitlist | court setup, class schedule setup |
| Aulas | class operation, students, replacements, progress | staff permissions, global finance ledger |
| Pessoas | people directory, CRM, students, members, staff | payment ledger and time grid |
| Receita | receivables, payments, expenses, plans/packages, POS revenue | personal player payments |
| Cantina/POS | sales, stock, products | broad finance |
| Competicoes | tournament and league operation | public discovery as primary job |
| Relatorios | analysis and history | daily execution |
| Administracao | setup, permissions, resources, advanced | daily routine |

## Boundary Decisions

### Player App Vs Work

Player App shows personal commitments and payments:

- own reservations;
- own classes;
- own matches;
- own tournament/league participation;
- own payments;
- profile.

Work shows business operations:

- local reservations;
- local classes;
- local clients/students/members;
- local receivables;
- staff;
- operational competition management.

Never mix local finance with personal player payments.

### Calendar Vs Reservations

Calendar is first-class because it answers "what is happening in time".

Reservations is a lifecycle module because it answers "what is the state of this booking".

### Clients Vs People

The future IA should use `Pessoas` as umbrella. It can start as unified search over existing entities without backend rewrite.

Subtypes:

- lead/contact;
- booking customer;
- student;
- member;
- coach;
- staff;
- competition participant.

### Finance Vs Contextual Payments

Payment actions can stay contextual, but Finance/Revenue is the source of truth.

Examples:

- reservation row can show `Pagar`;
- student detail can show `Pagar`;
- membership can show `Pagar`;
- finance ledger must also show the same item.

### Setup Vs Operation

Setup includes:

- court creation;
- booking rules;
- academy rules;
- plan/product setup;
- staff permissions;
- tournament reset/delete;
- league scoring rules.

Operation includes:

- create/edit/cancel reservation;
- open class;
- handle replacement;
- mark paid;
- send reminder;
- sell product;
- approve registration;
- launch result.

Setup cannot compete with operation in the first fold.

## Route Strategy

Current routes remain stable. New work routes can wrap them.

| Current route | Future user-facing meaning |
|---|---|
| `/gestao` | Work command center |
| `/trabalho` | Alias to work command center |
| `/gestao/:placeId` | Unit command center |
| `/gestao/:placeId/agenda` | Compatibility wrapper for Calendar/Reservations |
| `/gestao/:placeId/academia` | Compatibility wrapper for Aulas |
| `/gestao/:placeId/clientes` | Compatibility wrapper for Pessoas |
| `/gestao/:placeId/financeiro` | Compatibility wrapper for Receita |
| `/gestao/:placeId/cantina` | Compatibility wrapper for POS |
| `/gestao/:placeId/equipe` | Compatibility wrapper for Admin/People Team |
| `/gestao/:placeId/ajustes` | Compatibility wrapper for Admin |
| `/locais/:placeId/admin` | Legacy alias |
| `/eventos?modo=organizing` | Competition OS work hub |
| `/trabalho/competicoes` | Competition OS work hub alias |
| `/eventos/:id/organizacao` | Tournament work cockpit alias |
| `/eventos/ligas/:id?mode=work` | League owner cockpit alias |

Do not break:

- public place pages;
- public tournament pages;
- public league pages;
- registration links;
- join links;
- booking change links;
- old admin links.

## Permission Strategy

| Role | Sees on web | Sees on mobile |
|---|---|---|
| owner | all enabled modules, admin, reports | critical blockers and approvals |
| manager | all enabled local operations, most admin | daily unit operation |
| frontdesk | calendar, reservations, clients, limited aulas | reservations, clients, waitlist |
| coach | own aulas, own students, own agenda | day agenda, class details, students |
| finance | revenue only | receivables, paid, expenses, summary |
| cashier | POS/canteen only | sell, today, stock, products if allowed |
| organizer | Competition OS | competition blockers and event actions |
| scorekeeper | matches/results | result entry |
| checkin | registrations/check-in | check-in list |
| media | communication/publication | publish/chat |

## Delivery Definition

The delivery is complete when:

1. Web work navigation is grouped by domain.
2. Mobile work navigation is role-based and operational.
3. Calendar is first-class in work.
4. Reservations no longer owns all calendar/setup concepts.
5. Aulas no longer owns staff/config/finance concepts.
6. Pessoas makes contacts, students, members and staff easier to understand.
7. Receita centralizes money without mixing player personal payments.
8. Competition OS is separate from player discovery.
9. Admin/setup is outside daily routine.
10. Legacy routes still work.
11. Permissions are preserved.
12. Every major page has one primary responsibility and CTA.

## Documentation Set

| Document | Purpose |
|---|---|
| `WORK_AREA_FUNCTION_INVENTORY.md` | What exists today and where it should go. |
| `WORK_SAAS_INFORMATION_ARCHITECTURE.md` | Target SaaS web architecture. |
| `WORK_MOBILE_OPERATIONAL_SCOPE.md` | Target mobile work scope. |
| `WORK_SAAS_PAGE_RESPONSIBILITIES.md` | Page contracts. |
| `WORK_SAAS_RESTRUCTURE_ROADMAP.md` | Phase roadmap. |
| `WORK_SAAS_DETAILED_USER_FLOWS.md` | End-to-end persona and domain flows. |
| `WORK_SAAS_IMPLEMENTATION_QUEUE_V1.md` | Engineering execution queue. |
| `WORK_SAAS_QA_ACCEPTANCE_MATRIX.md` | Final QA by persona, route and viewport. |

## Implementation Philosophy

- Start with shells, routes and navigation, not isolated cards.
- Prefer wrappers and composition before new backend.
- Move one domain at a time.
- Keep contextual actions where they help, but centralize ownership.
- Treat mobile as a separate operational product.
- Test role by role, not page by page only.

## Final Product Shape

The final product should feel like:

- Player App: simple, personal, fast.
- SaaS Work Web: complete, organized, deep.
- Mobile Work: quick, role-driven, action-oriented.
- Competition OS: phase-driven operation for events.

Same brand. Different structures for different jobs.
