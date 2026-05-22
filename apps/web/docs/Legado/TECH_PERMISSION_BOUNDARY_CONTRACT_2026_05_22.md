# Work SaaS V5 Permission Contract

Date: 2026-05-22  
Status: V5 technical contract retained from the previous permission contract. The old V3 filename is archived in `Legado/2026-05-22_pre_v5_archived/`.

This document protects permission boundaries during the V5 SaaS restructure. It does not override the V5 UX, navigation or page-responsibility specs.

## Purpose

Freeze role visibility and permission boundaries before SaaS navigation and shell changes.

This document is not a new permission system. It records the current permission model and the rules that future UI refactors must preserve.

## Non-Negotiable Permission Rules

- Do not relax RLS.
- Do not show admin actions to player-only users.
- Do not show local revenue to player personal finance.
- Do not show finance/canteen/team/settings to coach-only users.
- Do not show full structural settings to frontdesk, finance or cashier unless they are also manager/owner.
- Do not show organizer tools to tournament/league participants unless they are staff/owner.
- Do not use hidden UI as the only protection; backend/RLS/RPC checks still matter.

## Place Roles

Current place roles:

- owner: inferred from `place.ownerId === user.id`.
- manager.
- coach.
- frontdesk.
- finance.
- cashier.

Current plan features:

| Plan | Bookings | Academy | Finance | CRM | Memberships | Canteen |
|---|---|---|---|---|---|---|
| `club_basic` | yes | no | no | no | no | no |
| `academy` | yes | yes | yes | no | no | no |
| `club_pro` | yes | yes | yes | yes | yes | yes |
| `multi_unit` | yes | yes | yes | yes | yes | yes |

## Current Access Helpers

Source: `placeResourceAccess(place, userId, staff)`.

| Capability | Current condition |
|---|---|
| `canManagePlace` | owner or manager |
| `canUseBookings` | plan has bookings |
| `canUseAcademy` | plan has academy |
| `canUseFinance` | plan has finance |
| `canUseCrm` | plan has CRM |
| `canUseMemberships` | plan has memberships |
| `canUseCanteen` | plan has canteen |
| `canManageBookings` | bookings feature and owner/manager/frontdesk |
| `canManageAcademy` | academy feature and owner/manager/coach |
| `canManageFinance` | finance feature and owner/manager/finance |
| `canManageCanteen` | canteen feature and owner/manager/cashier |

## Current Module Visibility

Source: `placeManagementModules(access)`.

| Role/access | Current modules |
|---|---|
| Owner/manager | `dashboard`, `bookings`, `academy`, `clients`, `finance`, `canteen`, `team`, `settings` depending on plan features |
| Coach-only | `academy` only when academy feature exists |
| Frontdesk-only | `bookings`, `academy`, `clients` depending on features |
| Finance-only | `finance` only |
| Cashier-only | `canteen` only |
| Player-only | no Work place modules |

## Target Work SaaS Domain Visibility

| Persona | Web SaaS domains | Mobile Work domains | Must never see as primary |
|---|---|---|---|
| Owner | All enabled domains, reports, administration | Today, Agenda, Aulas, Receita, Mais | none, except disabled plan features |
| Manager | Same as owner except owner-only destructive/account actions | Today, Agenda, Aulas, Receita, Mais | owner-only destructive/account controls |
| Coach-only | Aulas operation, own agenda, own turmas/alunos | Hoje, Agenda, Turmas, Alunos, Perfil | Receita, Cantina, Equipe, Ajustes, CRM broad |
| Frontdesk-only | Agenda/Reservas, Clientes operational, Aulas pending support | Hoje, Reservas/Agenda, Clientes, Aulas, Mais | Financeiro amplo, Cantina, Equipe, Ajustes estruturais |
| Finance-only | Receita: receber, pagos, despesas, resumo | Receber, Pagos, Despesas, Resumo, Perfil | Aulas operation, Cantina sale, Equipe, Ajustes |
| Cashier-only | POS/Cantina sale, today sales, stock/products if authorized | Vender, Hoje, Estoque, Produtos, Perfil | Financeiro amplo, Aulas, Equipe, Ajustes |
| Organizer independent | Competition OS work hub, owned tournaments/leagues | Hoje, Torneios, Ligas, Publicacao, Perfil | local management if no place access |
| Tournament scorekeeper | Assigned matches/results only | Event operation/results | setup, payments, participants approval unless authorized |
| Tournament checkin | Check-in/credentialing/inscribed players | Check-in/event operation | setup, results, finance unless authorized |
| Tournament media | communication/publication only | Publicacao/event operation | setup, finance, result authority unless authorized |
| League owner | league operation/configuration/results | league operation | player-only discovery as first fold |
| League participant | own round, opponent, result, ranking | player competition flow | owner configuration |
| Player-only | Player App only | Player App only | Work SaaS, local admin, local finance |

## Surface Boundary Contract

### Player App

Can show:

- personal reservations;
- personal classes;
- personal payments;
- personal matches;
- public places/events;
- player profile.

Must not show:

- local revenue;
- staff/team;
- local settings;
- Work reports;
- owner cockpit;
- organizer operation unless the route is intentionally in Work mode.

### SaaS Web Work

Can show:

- full enabled domains for authorized staff;
- dense tables;
- drawers;
- reports;
- settings;
- multiunit context;
- competition operation for organizers.

Must not show:

- player discovery as the organizing first fold;
- personal finance mixed with local revenue;
- disabled plan modules as if active.

### Mobile Work

Can show:

- daily action queues;
- simple approvals;
- day agenda;
- class/reservation/result operation;
- sale flow for cashier;
- notifications/actions.

Must not show:

- full admin tree;
- advanced reports;
- rare setup as first fold;
- long configuration forms unless wrapped as a focused task.

## Route Experience Mode Rules

Current source: `getRouteExperienceMode(pathname, search)`.

Work mode applies when:

- query param `mode=work`;
- pathname starts with `/gestao`;
- pathname matches `/locais/:placeId/admin`;
- pathname matches `/eventos/:id/organizacao`;
- `/eventos?modo=organizing`;
- `/eventos/torneios?view=organizing`;
- `/eventos/ligas?view=organizing`.

Player mode applies otherwise.

Future rule:

- The Jogador/Trabalho selector must remain consistent, but switching modes must not leak tools from one mode into the other first fold.

## Role Redirect/Forbidden Behavior

Preferred behavior:

- If user has no access: show a clear no-permission state or redirect to safe route.
- If feature disabled by plan: show setup/upgrade only to owner/manager.
- If staff role lacks module permission: hide nav item.
- If deep link hits forbidden module: show no-permission state without privileged data.

Do not:

- render disabled admin controls to unauthorized roles;
- show empty forbidden groups;
- expose finance values to non-finance/non-manager roles.

## Permission QA Matrix

| Persona | First route | Must see | Must not see |
|---|---|---|---|
| Player-only | `/inicio` | Player next action, Jogar, Competir, Agenda, Perfil | Work modules, local finance |
| Student | `/inicio` or `/agenda` | next class, teacher/court/time, personal payments | Work academy admin |
| Member | `/inicio` or `/agenda` | personal plan/reservations | local finance |
| Competitive player | `/eventos` | own events, matches, results | organizer cockpit unless authorized |
| Coach-only | `/gestao` | classes today, own agenda, students | finance, canteen, team, settings |
| Frontdesk-only | `/gestao` | reservations/check-in/clients | finance broad, settings structural |
| Finance-only | `/gestao` | receivables, paid, expenses | classes operation, canteen sale |
| Cashier-only | `/gestao` | sale, stock, products | finance broad, academy admin |
| Manager/owner | `/gestao` | operation blockers, domains, settings | disabled features as active |
| Organizer | `/eventos?modo=organizing` or Work hub | owned competitions by phase | public discovery as primary cockpit |
| Multi-role | `/inicio` or last mode | clear Jogador/Trabalho boundary | mixed personal/professional first fold |

## Acceptance

Future navigation/shell changes are acceptable only when:

- the table above remains true;
- route deep links still respect permissions;
- hidden nav groups do not remove valid deep-link protection;
- work/mobile/player boundaries stay visually and functionally clear.
