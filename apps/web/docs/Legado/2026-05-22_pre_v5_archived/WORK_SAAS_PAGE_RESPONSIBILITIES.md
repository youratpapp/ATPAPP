# Work SaaS Page Responsibilities

Date: 2026-05-21  
Status: proposal, no implementation yet.  
Purpose: page contracts for the future Work SaaS architecture. Each page must have one clear responsibility.

## Contract Format

Each page should answer:

- Who uses it?
- What question does it answer?
- What is the primary action?
- What belongs here?
- What must not be here?
- Does mobile need this page or only a reduced action?

## Page Contracts

| Page | Module | Primary user | Main question | Primary CTA | Data shown | Must not contain | Mobile behavior |
|---|---|---|---|---|---|---|---|
| Work Command Center | Hoje | all staff by role | What needs action now? | Role-specific next action | blockers, queues, today summary | setup trees, full reports, raw module cards | default mobile work home |
| Organization Overview | Hoje/Admin | owner multiunit | Which units need attention? | Open critical unit | unit status, blockers, cross-unit totals | every module of every unit | compact unit switcher/alerts |
| Unit Command Center | Hoje | manager/owner | What is blocking this unit today? | Resolve top blocker | reservations, classes, finance, clients, stock, team alerts | rare setup unless blocking | manager mobile summary |
| Unified Calendar | Calendario | manager/frontdesk/coach | What is scheduled today/week? | Create reservation or open item | courts, bookings, classes, blocks, lesson requests, events | price/rule setup | role-filtered day calendar |
| Resource Calendar By Court | Calendario | frontdesk/manager | What is each court doing? | Create/open slot | court columns, hour grid, conflicts | student CRM details | mobile limited day view |
| Teacher Day Calendar | Calendario/Aulas | coach | What classes do I teach today? | Open next class | hour slots, class, court, students, absences | finance, team, settings | mobile primary professor view |
| Reservations List | Reservas | frontdesk/manager | Which bookings need attention? | New reservation | active/upcoming/past reservations, status, payment | court/rule setup | mobile reservations tab |
| Reservation Detail | Reservas | frontdesk/manager/player link | What is happening with this booking? | Edit/reschedule/cancel based on state | client, court, time, payment, history, WhatsApp | unrelated reservations | mobile sheet |
| New Reservation | Reservas | frontdesk | How do I book a valid slot? | Reserve | client, court, time, availability, price | full court setup | mobile short wizard |
| Waitlist | Reservas | frontdesk | Who can be placed in an available slot? | Promote/contact | waitlist entries, alternatives, phone | setup | mobile queue card |
| Booking Rules | Administracao | manager | What rules define booking availability? | Save rule | rule form, weekdays, advance, prices, approval | daily booking list | web only |
| Courts And Resources | Administracao | manager | Which courts/resources exist? | Add/update court | courts, surface, active state, pricing hooks | daily calendar operation | web only |
| Classes Today | Aulas | coach/manager | Which classes happen today? | Open class | class cards, students, notices, replacements | class setup unless empty | mobile class list |
| Class Detail | Aulas | coach/manager | What needs to be done for this class? | Record absence/replacement/progress | students, court, time, notices, optional attendance | global finance, staff setup | mobile sheet/page |
| Classes List | Aulas | manager/coach | Which classes exist and how full are they? | Create/edit class | class list, filters, capacity, coach, court | full CRM pipeline | web; mobile read for coach |
| Class Setup | Aulas/Admin | manager | How do I create or modify a class? | Save class | time, coach, court, capacity, level, monthly fee | daily class operation | web only except quick draft future |
| Academy Requests | Aulas | frontdesk/manager | Which lessons/replacements need scheduling? | Resolve request | drop-ins, makeups, pending enrollments | full student directory | mobile queue cards |
| Replacement Fit | Aulas | frontdesk/manager | What slots fit this request? | Schedule | matching slots, class/court/coach | unrelated requests | mobile simplified |
| Students Directory | Pessoas/Aulas | manager/coach | Which students need attention? | Open student | enrollments, status, filters, payments summary, progress | CRM leads unrelated to enrolled students | mobile coach own students |
| Student Detail | Pessoas/Aulas | manager/coach | What is this student's academy relationship? | Save/update relevant section | enrollment, classes, plan, payments, absences, progress | broad place finance | mobile sheet summary |
| Planned Absence | Aulas | coach/frontdesk | Did the student warn before class? | Register notice | date, class, reason, replacement credit | general attendance if disabled | mobile action |
| Attendance | Aulas | coach | Who attended class? | Mark attendance | per-student status and notes | visible when disabled | mobile only if company requires |
| Coaches | Pessoas/Equipe | manager | Who teaches and what is linked? | Add/link coach | coach profile, login, classes, commission draft | daily class operation | web; mobile read-only |
| People Directory | Pessoas | manager/frontdesk | Who is this person in the business? | Open person | search across contacts, students, members, staff | financial ledger details | mobile quick search |
| CRM Pipeline | Pessoas | frontdesk/manager | Which contacts need follow-up? | Add/contact lead | leads, status, owner, next contact, interactions | enrolled student operations unless linked | mobile due follow-ups |
| CRM Contact Detail | Pessoas | frontdesk/manager | What happened with this contact? | Register interaction | history, WhatsApp, status, owner, follow-up | payment ledger | mobile sheet |
| Members | Pessoas/Receita | frontdesk/manager/finance | Which memberships are pending/active? | Activate/request/cancel | plans, members, billing state | class attendance | mobile pending member actions |
| Team | Administracao/Pessoas | owner/manager | Who can access work tools? | Invite staff | staff list, status, role | daily operation | web only except own invite |
| Roles And Permissions | Administracao | owner | What can each role do? | Save role/permission | role guide, access matrix | daily queues | web only |
| Receivables | Receita | finance/manager | What money must be collected? | Send reminder/mark paid | overdue, today, all receivables | personal player payment page | mobile finance primary |
| Payment Detail | Receita | finance/contextual | What is this payment for and state? | Mark paid/refund future | target, amount, status, reminders, history | unrelated module content | mobile payment stub |
| Payments Ledger | Receita | finance | What has been paid? | Open receipt/export future | paid payments, filters | receivable action queue as primary | mobile paid list |
| Expenses | Receita | finance/manager | What money left the business? | Add expense | expenses, category, amount, date | POS product setup | mobile simple entry |
| Plans And Packages | Receita | manager/finance | What recurring/credit products are sold? | Create/update plan/package | memberships, class fees, credit packages | daily collection queue | web only or limited mobile |
| Finance Overview | Receita/Relatorios | manager/finance | How is revenue performing? | Open report/export future | recurring revenue, booking revenue, POS, expenses | day-to-day booking/class actions | mobile summary only |
| POS Sell | Cantina/POS | cashier | What item am I selling now? | Finalize sale | product search/grid, manual item, quantity, total | full finance reports | mobile primary cashier |
| POS Today | Cantina/POS | cashier/manager | What sold today? | Open/cancel sale | sales, revenue, low stock | product setup as primary | mobile today tab |
| Stock | Cantina/POS | cashier/manager | Which products need replenishment? | Open product/list | low/empty stock, product status | financial receivables | mobile low-stock list |
| Products | Cantina/POS/Admin | manager/cashier if allowed | What products exist? | Create product | catalog, price, stock | quick sale as secondary | web first; mobile optional |
| Reports Home | Relatorios | owner/manager | What should I analyze? | Open report | report categories | daily actions | web only |
| Operations Report | Relatorios | manager | How are courts/classes used? | Filter/export | occupancy, class load, cancellation | setup forms | web |
| Finance Report | Relatorios | manager/finance | How is money performing? | Filter/export | revenue, expenses, aging, POS | payment action as primary | web |
| CRM Report | Relatorios | manager | How are leads converting? | Filter/export | pipeline conversion, follow-up | contact execution | web |
| Competition Work Hub | Competicoes | organizer/manager | Which competitions need action now? | Resolve blocker/create | grouped tournaments/leagues by phase | public discovery as focus | mobile event queue |
| Tournament Cockpit | Competicoes | owner/organizer/staff | What does this tournament phase need now? | Phase CTA | phase summary, queue, tabs by role | advanced/danger actions in first fold | mobile event cockpit |
| Tournament Setup | Competicoes/Admin | owner/organizer | What is required before opening/playing? | Complete setup | basics, categories/classes, agenda, staff | result entry as primary | web |
| Tournament Registrations | Competicoes | owner/checkin | Who needs approval/payment/check-in? | Approve/check-in | registrations, statuses, payments | draw configuration | mobile check-in queue |
| Tournament Matches | Competicoes | owner/scorekeeper/player role | Which matches need scores? | Launch result | matches, scores, WO, submissions | backup/reset/delete | mobile scorekeeper page |
| Tournament Publishing | Competicoes | media/owner | What should participants receive? | Publish/share | summary, images, links, pinned messages | setup forms | mobile media actions |
| League Cockpit | Competicoes | owner | What does the league phase need now? | Generate/validate round | round status, pending results, standings, participants | player discovery | mobile owner summary |
| League Participant View | Player/Competicoes | participant | What is my current round? | Submit/open match | opponent, place, chat, result, standings | owner-only config | mobile player/app |
| League Settings | Competicoes/Admin | owner | What rules define the league? | Save settings | classes, scoring, schedule, join rules | current round as primary | web |
| League Results | Competicoes | owner/participant | Which results need submission/validation? | Submit/confirm | match results, conflicts, pending validation | full setup | mobile core |
| Publication/Public Profile Settings | Administracao | manager/owner | What does the public see? | Save/publish | place profile, public links, preview | daily work queue | web |
| Advanced Admin | Administracao | owner | What dangerous actions exist? | Confirm destructive action | backup, reset, delete, advanced config | routine actions | web only |

## Page Responsibility Rules

1. If a page cannot state one primary question, split it.
2. If a card is setup, it does not belong above routine actions.
3. If a button changes money, it must create/update a payment ledger item.
4. If a button contacts a person, it should be recorded as communication/interaction where possible.
5. If a function is both contextual and central, central is source of truth and contextual is shortcut.
6. If a user lacks permission, do not show a dead CTA.
7. Mobile pages should be action pages, not configuration pages.
8. Legacy routes can render the new page contract but must not disappear.

## Current Pages That Need Contract Correction First

| Current area | Contract issue | Recommended correction |
|---|---|---|
| `/gestao` | Multi-place, invites, competition and setup mixed | Split visible sections into Command Center, Context Switcher, Invites and Competition OS cards. |
| `/gestao/:placeId/agenda` | Calendar/reservations/new/waitlist/resources under same label | Promote calendar/reservations and move resources to admin. |
| `/gestao/:placeId/academia` | Operation, students, coaches, resources, settings and optional attendance mixed | Keep Aulas as operation; move coaches/team and resources/settings. |
| `/gestao/:placeId/clientes` | CRM, members, students and pending actions collapsed | Create People IA with explicit subdomains. |
| `/gestao/:placeId/financeiro` | Receivables, reports, packages, memberships | Keep Revenue domain, but separate execution from product setup/report. |
| `/gestao/:placeId/cantina` | Good role separation but product setup can crowd quick sale | Prioritize Vender for mobile; product/admin secondary. |
| `/eventos?modo=organizing` | Work hub inside public route semantics | Render as Competition OS; preserve URL. |
| `/eventos/:id/organizacao` | Powerful but too deep/crowded | Split by phase and role while retaining tabs as secondary. |
| `/eventos/ligas/:id` | Owner and participant share too much structure | Different first fold by role and phase. |

## Acceptance Criteria For Future Implementation

- Every page has a primary CTA or a clear read-only purpose.
- No page starts with a raw tree of internal modules.
- Mobile and web contracts are different when the job is different.
- Configuration, reports and daily operation do not compete in the same fold.
- Financial information is centralized but remains reachable contextually.
- People-related pages use a consistent person model and labels.
- All old routes render a valid destination or redirect with query/tab preservation.
