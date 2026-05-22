# Work Area Function Inventory

Date: 2026-05-21  
Scope: area Trabalho/Gestao, including local management, competition workspaces and operational mobile implications.  
Source of truth inspected: `src/App.tsx`, `src/pages/PlacesPage.tsx`, `src/pages/ManagementHubPage.tsx`, `src/pages/EventsHubPage.tsx`, `src/pages/TournamentPage.tsx`, `src/pages/LeaguesPage.tsx`, `src/pages/LeagueDetailsPage.tsx`, `src/components/BottomNav.tsx`, `src/components/place/*`, `src/components/competition/*`, `src/lib/place-management.ts`, `src/lib/place-admin-navigation.ts`, `src/lib/types.ts`.

This document inventories what exists today before structural changes. It is not a redesign spec by itself. It classifies each function by real work use, destination and mobile/web fit.

## Existing Work Surfaces

| Surface | Current route/access | What it is today | Main issue |
|---|---|---|---|
| Work entry | `/gestao`, alias `/trabalho` | Operational hub for places, invitations and organized competitions | It mixes multi-place summary, role-specific work, setup gaps and competition operation in one feed. |
| Place admin | `/gestao/:placeId`, `/gestao/:placeId/:module` | Full local management shell | It still behaves as a set of adapted modules, not a mature SaaS IA. |
| Legacy place admin | `/locais/:placeId/admin`, `/locais/:placeId/admin/:module` | Compatibility entry to same admin page | Must remain working as wrapper/alias. |
| Work competitions | `/eventos?modo=organizing`, `/trabalho/competicoes` | Organizer view for tournaments/leagues | Better than before, but still lives inside public competition route semantics. |
| Tournament operation | `/eventos/:tournamentId/organizacao` | Phase cockpit plus old tabs/actions | Deep, powerful and crowded; needs SaaS-style operation model. |
| League operation | `/eventos/ligas/:leagueId?mode=work` | Owner/participant mixed league detail | Owner and participant experiences still share too much surface. |

## Role And Permission Model Found In Code

| Role/profile | Current permission source | Current modules/actions |
|---|---|---|
| owner | `place.ownerId === userId` | Full place management: dashboard, bookings, academy, clients, finance, canteen, team, settings. |
| manager | `PlaceStaffMember.role === "manager"` | Full local management except ownership-specific constraints. |
| frontdesk | staff role | Bookings, academy access where plan allows, clients when CRM/membership features allow. |
| coach | staff role | Academy only; no bookings module in `placeManagementModules`, although class calendar may depend on courts. |
| finance | staff role | Finance only when not manager/owner. |
| cashier | staff role | Canteen only when not manager/owner. |
| tournament owner | `TournamentRole.owner` | Full tournament operation/configuration/staff/actions. |
| tournament organizer | `TournamentRole.organizer` | Broad tournament operation per current role logic. |
| tournament checkin | `TournamentRole.checkin` | Registration/check-in/player-oriented operation. |
| tournament scorekeeper | `TournamentRole.scorekeeper` | Matches/results operation. |
| tournament media | `TournamentRole.media` | Publishing/chat/communication operation. |
| league owner | `LeagueSummary.role === "owner"` or owner id | League setup, participants, rounds, results, standings, chat, payment. |
| league participant | role participant | Own round, opponent, result, standings, chat. |

## Product Plan Feature Gates

| Plan | Current features |
|---|---|
| `club_basic` | Bookings only. |
| `academy` | Bookings, academy, finance. |
| `club_pro` | Bookings, academy, finance, CRM, memberships, canteen. |
| `multi_unit` | Same as club pro, intended to support organization/unit scale. |

## Inventory By Function

Legend for destination:

- `Web`: complete SaaS web work area.
- `Mobile`: mobile Trabalho only.
- `Both`: web plus mobile operational version.
- `Player`: player app.
- `Config`: setup/admin/configuration layer.
- `Report`: reporting/analytics layer.
- `Contextual`: action should live inside another entity/detail.
- `Future`: prepare IA slot, do not implement now.
- `Merge/Hide`: merge with another function or hide from primary navigation.

| Function | Current location/access | Main user | Entity | Type/frequency | Problem today | Recommended destination |
|---|---|---|---|---|---|---|
| Work mode entry | Top selector, `/gestao` | all staff/multi-role | user/workspace | daily | Mode exists, but web/mobile purpose is not explicit enough. | Both: official Work shell entry. |
| Player/Work selector | topbar/shell | multi-role | session/context | daily | Needs same position/meaning across web/mobile. | Both: global shell control. |
| Multi-place operational summary | `/gestao` | owner/manager multiunit | place/org | daily/strategic | Places appear as repeated blocks; unit context is not strong enough. | Web: organization command center; Mobile: compact place switcher. |
| Professional invite accept/decline | `/gestao` | invited staff | staff invite | eventual | Correct as first entry, but should be a dedicated onboarding card/state. | Both: onboarding/pending access. |
| Place setup checklist | `/gestao`, settings overview | owner/manager | place | rare/setup | Appears near daily work and competes with routine. | Web Config; Mobile only as blocking alert. |
| Create/manage place | `/locais`, create wizard | owner | place/org | rare/setup | Discovery and management are conceptually mixed. | Web Config/organization setup; Player discovery remains separate. |
| Place public preview | settings/public, public place route | manager/owner | place public profile | eventual | Useful, but should be a publication/admin action, not operational work. | Web Config + contextual preview. |
| Work dashboard/cockpit | `/gestao/:placeId/painel` | owner/manager | place | daily | Currently dashboard mixes metrics and shortcuts; should be command center. | Web: Today/Command Center; Mobile: Work Today. |
| Operational metrics | Place dashboard, analytics | manager | multiple | daily/weekly | Metrics appear next to actions; not all are actionable. | Web dashboard + Report; Mobile only critical counters. |
| Balance/saldo operational | dashboard/finance/canteen | manager/finance | payments/expenses/POS | weekly/daily | Finance appears in several modules. | Web Revenue dashboard; Mobile finance role summary. |
| Court calendar | bookings calendar | frontdesk/manager/coach view | court booking/class | daily | Calendar is under Reservas although it supports classes too. | Web Operations > Calendar; Mobile role calendar. |
| Day court occupancy | booking calendar | frontdesk/manager | court/time slot | daily | Useful but tied to booking module. | Both: calendar/operations. |
| Create reservation | bookings new, quick CTA | frontdesk/manager | booking | daily | Should be CTA, not a tab destination competing with calendar. | Both: contextual primary action from Calendar/Reservations. |
| Search available courts | booking create | frontdesk/player | court slot | daily | Important flow; should be linear. | Both: reservation wizard. |
| Block slot | booking create/resources | frontdesk/manager | court slot | daily/eventual | Admin block is operational but dangerous if mixed with player booking. | Web + Mobile frontdesk, contextual in calendar. |
| Join waitlist | booking create/waitlist | frontdesk/player | waitlist | daily/eventual | Waitlist is part of reservation flow, not a standalone menu. | Both: contextual in reservation flow. |
| Reservations list | bookings reservations | frontdesk/manager | booking | daily | Correct domain, but contains waitlist and detailed edits. | Web Operations > Reservations; Mobile frontdesk daily list. |
| Today reservations | booking today/old view | frontdesk | booking | daily | `today` now aliases to reservations, making label/history confusing. | Merge into Reservations with filters. |
| Booking detail/edit | reservations list modal/inline | frontdesk/manager | booking | daily | Needs stable detail page/drawer, not row crowding. | Web detail drawer; Mobile sheet with limited fields. |
| Cancel reservation | reservation row | frontdesk/manager/player own rules | booking | daily/eventual | Needs communication step and clear payment consequence. | Both contextual; player only own reservation rules. |
| Mark booking paid | reservation row/payment stub | frontdesk/finance | payment/booking | daily | Correct stub exists, but should use unified payment modal. | Both contextual payment action; Finance sees all. |
| WhatsApp booking change | reservation row | frontdesk/manager | booking/client | daily/eventual | Good function; should be after cancel/reschedule decision, not before primary action. | Both contextual communication action. |
| Reschedule booking | booking change confirmation, admin edit | frontdesk/manager/player link | booking/time slot | daily/eventual | Should use agenda selector link for player and admin edit area. | Web admin edit; Mobile player change flow limited. |
| Booking waitlist promote | reservations/waitlist | frontdesk | waitlist/booking | daily | Good operational queue; should live in reservation context. | Both, contextual queue. |
| Booking waitlist invite/contact | waitlist | frontdesk | waitlist/client | daily | Needs clear wording: contact/reagendar, not confirmation if slot occupied. | Both contextual. |
| Tournament court request approve/reject | booking operational queue | frontdesk/manager | tournament court request | event-based | Belongs to events/court allocation and calendar, not hidden in bookings only. | Web Operations + Competition context; Mobile approval card. |
| Court CRUD | booking resources | owner/manager | court | rare/setup | Setup, not daily reservation. | Web Config > Resources/Courts. |
| Court prices | booking resources | manager/finance | court price | rare/eventual | Finance/config boundary unclear. | Web Config with finance-controlled pricing. |
| Booking rules | booking resources | manager | booking rule | rare/setup | Must be outside routine. | Web Config > Rules. |
| Academy day agenda | academy calendar | professor/manager | class/day | daily | Correct for professor, but currently inside academy module. | Both: Professor Calendar, Web Operations Calendar. |
| Academy class today | academy today | professor | class/enrollment | daily | Chamada can now be optional, but page still reads like attendance flow in parts. | Both: Class detail; attendance optional config. |
| Attendance/chamada | academy today/students | professor | attendance | optional/daily if enabled | Product default should be off; only show if company requires it. | Config-gated contextual function. |
| Planned absence | academy today/students | professor/frontdesk | absence/makeup | daily/eventual | Important for tennis logic: notice before class creates replacement. | Both contextual in student/class. |
| Makeup credit | academy today/requests/fit | frontdesk/coach/manager | makeup credit | daily/eventual | Spread across requests, fit and class. | Web Academy > Requests; Mobile quick resolution. |
| Academy class CRUD | academy classes/class setup | manager | class | weekly/setup | Correct but should be SaaS page with detail drawer. | Web Classes; Mobile read-only/limited for coach. |
| Open class slot | academy resources/classes | manager | academy slot | weekly/setup | It is scheduling capacity, not daily operation. | Web Calendar/Capacity; Mobile only view. |
| Student enrollment | academy classes/students | frontdesk/manager | enrollment/student | daily/eventual | Students and clients overlap; needs People model. | Web People > Students/Members; contextual from class. |
| Activate/cancel enrollment | academy queues/students/classes | manager/frontdesk | enrollment | daily/eventual | Good action, but appears in multiple queues. | Web/Mobile action queue, one source. |
| Student detail edit | academy students modal | manager/coach limited | enrollment/student | daily/weekly | Modal sizing issues show need for robust detail page/drawer. | Web student detail; Mobile sheet summary. |
| Student progress notes | academy students | coach | progress note | weekly | Good coach function; should be in student detail. | Both contextual student detail. |
| Academy payments | academy classes/students/finance | finance/manager | payment | daily | Payment action duplicated across academy/finance. | Contextual plus central Finance. |
| Payment reminders | academy/classes/finance/membership | finance/frontdesk | payment reminder | daily | Correct as comms action, but central queue should exist. | Web Revenue/Communication; Mobile finance/frontdesk. |
| Academy lesson request/drop-in | academy requests/fit | frontdesk/manager | lesson request | daily/eventual | Good but label should separate drop-in, replacement, trial. | Web Academy > Requests; Mobile action cards. |
| Fit search for lesson slots | academy requests/fit | frontdesk/manager | class/slot | daily/eventual | Important but too nested; should be flow from request. | Both contextual wizard. |
| Academy settings | academy resources | manager | academy settings | rare/setup | Correctly config; keep out of daily. | Web Config > Academy Rules. |
| Require attendance setting | academy resources | manager | academy settings | rare/setup | New setting; default off. | Web Config; affects professor mobile. |
| Coach CRUD | academy coaches/team coaches | manager | coach | rare/weekly | Appears in Academy and Team; duplication risk. | Web People > Staff/Coaches, with academy relation. |
| Link coach login | coach module | manager | coach/user | rare/setup | Correct but belongs to team/person detail. | Web People/Team. |
| Coach commission | coach module | manager/finance | coach commission | monthly/future | Exists partially; should be prepared in Revenue/Payroll future. | Web Future Revenue > Commissions. |
| Client relationship queue | clients relationship | frontdesk/manager | CRM contact/member/enrollment | daily | Good daily layer, but "Clientes" mixes contacts, members, students. | Web People > Relationship; Mobile frontdesk queue. |
| CRM contact create | clients leads/CRM | frontdesk/manager | CRM contact | daily | Useful; should be People > Leads/CRM. | Both, mobile simplified. |
| CRM filters | clients/CRM | frontdesk/manager | CRM contact | daily | Good. | Web CRM; Mobile only priority/due. |
| CRM history drawer | clients/CRM | frontdesk/manager | interaction | daily | Correct as detail drawer, needs predictable People detail. | Web detail drawer; Mobile sheet. |
| Contact WhatsApp | CRM row/history | frontdesk | CRM contact | daily | Good contextual communication. | Both. |
| Mark contacted/converted/archive | CRM history | frontdesk/manager | CRM status | daily | Good but should be in CRM pipeline. | Both contextual. |
| Follow-up owner/date | CRM history | frontdesk/manager | CRM interaction | daily/weekly | Important CRM capability. | Web CRM; Mobile due today update. |
| Membership plan CRUD | clients members/finance packages | manager/finance | plan | rare/setup | Appears in Clients and Finance packages. | Web Revenue > Plans; Config pricing. |
| Membership request/activate/cancel | clients/membership/action queue | frontdesk/manager | membership | daily/eventual | Belongs to People/Clients, with payment in Finance. | Both action queue. |
| Membership payment | membership/finance/payment stub | finance/frontdesk | payment | monthly | Needs central payment modal and Finance ledger. | Both contextual + Finance. |
| Finance receivables | finance receivables | finance/manager | receivable/payment | daily | Strong module; should be primary for finance role. | Web Revenue > Receivables; Mobile finance home. |
| Receivable segment overdue/today/all | finance receivables | finance | receivable | daily | Correct. | Both finance, mobile simplified. |
| Bulk reminders | finance receivables | finance | reminders | daily | Good but needs communication log. | Web + Mobile finance. |
| Mark receivable paid | finance receivables | finance | payment | daily | Correct with payment stub. | Both finance. |
| Paid list | finance paid | finance | payment | daily/weekly | Correct but report/ledger flavor. | Web Revenue > Payments; Mobile finance quick. |
| Expense create/cancel | finance expenses | finance/manager | expense | daily/weekly | Correct for finance. | Web Revenue > Expenses; Mobile finance if simple. |
| Finance overview | finance overview/dashboard | manager/finance | revenue/expense | weekly | Report/dashboard, not routine execution. | Web Revenue dashboard/report; Mobile summary only. |
| Credit packages CRUD | finance packages | manager/finance | credit package | rare/setup | Product/plan setup, not daily finance. | Web Revenue > Products/Plans. |
| Credit purchase/consume | finance packages | finance/frontdesk | credit purchase | daily/eventual | Operational sale/usage. | Web Revenue; Mobile if quick purchase/check. |
| Lesson package/drop-in revenue | finance packages | finance | lesson request/payment | weekly | Report/finance aggregation. | Web Revenue. |
| POS sale | canteen sell | cashier | POS sale/product | daily | Good as first mobile cashier function. | Both: cashier mobile primary + Web POS. |
| POS today summary | canteen today | cashier/manager | POS sale | daily | Correct. | Both. |
| Cancel POS sale | canteen summary | cashier/manager | POS sale | daily/eventual | Contextual and permissioned. | Both contextual. |
| Product CRUD | canteen products/product form | cashier/manager | product | occasional/setup | Should not block quick sale. | Web Inventory/Products; Mobile cashier only if authorized. |
| Stock low/query | canteen stock | cashier/manager | product stock | daily | Good operational alert. | Both. |
| Team overview | team overview | owner/manager | staff | weekly | Correct but should be People/Admin. | Web Admin/People. |
| Staff search/invite | team staff | owner | staff invite/user | rare/eventual | Admin function. | Web Admin > Team. Mobile only accept/decline own invite. |
| Staff remove/cancel invite | team staff/invites | owner | staff | rare/eventual | Admin/danger. | Web Admin, not daily. |
| Role guide | team roles | owner/manager | permission model | rare | Useful but not a work page. | Web Admin help/settings. |
| Settings public data | settings public | manager | place profile | rare/eventual | Config/publication. | Web Config. |
| Settings resources/rules/plans/permissions/publication | settings routes | owner/manager | config | rare | Some views are placeholders/aliases; need explicit responsibility. | Web Config/Admin. |
| Product plan switch | settings details | owner | place plan | rare/admin | Admin-level action, should be guarded. | Web Admin billing/config. |
| Analytics panel | dashboard/operations | manager | analytics | weekly/monthly | Should be reports, not routine. | Web Report. |
| Competition work hub | `/eventos?modo=organizing` and `/gestao` cards | organizer/manager | tournament/league | daily/event-based | Work competition is still route-coupled to public `/eventos`. | Web Competition OS; Mobile event operation. |
| Create tournament | events/tournaments | organizer | tournament | eventual/setup | Should be in Competition OS work, not public discovery. | Web Competition setup; Mobile only draft minimal? |
| Tournament phase cockpit | tournament organization | owner/staff | tournament | daily/event-based | Correct direction but too much coexists. | Web Competition OS; Mobile stage operation. |
| Tournament setup basics | organization tab | owner/organizer | tournament config | rare/setup | Should be Draft phase/config. | Web Config within tournament. |
| Tournament categories/classes | organization/jogadores/config | owner/organizer | category/class | setup | Deep and powerful; should be structured wizard/detail. | Web tournament setup. |
| Tournament players manual add/import | organization players | owner/checkin | participant | event setup | Correct but not primary once event is running. | Web setup/checkin; Mobile check-in limited. |
| Tournament registration review | organization players | owner/checkin | registration | daily during registration | Good action queue. | Both during registration. |
| Tournament registration payment | tournament org/payment modal | owner/finance | registration/payment | daily during registration | Needs central payment stub/policy. | Both contextual + Finance. |
| Generate tournament games | organization | owner/organizer | matches/draw | phase action | Should be primary CTA in closed-registration phase. | Web; Mobile only if explicitly allowed. |
| Publish tournament games/table | organization/publication | owner/media | publication | phase action | Should be primary once generated. | Web + Mobile media action. |
| Tournament result entry | matches tab | scorekeeper/owner/player own | match result | event/day | Critical mobile field action. | Both; Mobile scorekeeper first. |
| Tournament result submissions | organization/matches | owner/scorekeeper | result submission | event/day | Needs queue, not buried in matches. | Both action queue. |
| Tournament WO/clear result | matches tab | scorekeeper/owner | match | event/day | Dangerous contextual action. | Web + authorized mobile with confirmation. |
| Tournament chat/announcement/pin/delete | chat tab | media/owner/participant | message | event/day | Communication should be contextual and role aware. | Both; Web full, Mobile fast. |
| Tournament staff invite/remove | organization setup | owner | tournament staff | rare/eventual | Admin. | Web Competition Admin. |
| Tournament backup/reset/delete | organization advanced | owner | tournament data | rare/danger | Must be far from operation. | Web Advanced only. |
| Tournament public/player tabs | `/t`, `/eventos/:id` | player/viewer | tournament public | player/event | Player surface; not Work nav. | Player. |
| Create league | leagues page modal | organizer | league | setup | Work creation, not player discovery. | Web Competition setup. |
| League setup classes/rules/calendar/scoring | create modal/config | owner | league config | setup | Good wizard but should be Competition OS setup page. | Web. |
| League join/public registration | league detail/join | player | registration | player/eventual | Player. | Player. |
| League participant current round | league detail | participant | league match | weekly | Good participant focus. | Player + mobile participant. |
| League owner generate round | league detail owner | owner | round/matches | weekly/phase | Primary phase CTA. | Web; Mobile owner if simple. |
| League result submission/confirmation | league detail | participant/owner | result | weekly | Critical mobile participant/owner flow. | Both. |
| League admin resolve result | league detail owner | owner | result conflict | weekly | Needs owner queue. | Both action queue. |
| League standings/snapshot/movements | league detail owner | owner | standings | phase/end | Report/finalization. | Web + mobile read/confirm. |
| League chat/announcement | league detail | owner/participant | message | weekly | Contextual communication. | Both. |
| League payment | league registration/payment stub | owner/player | payment | event | Needs central payment modal. | Both contextual + Finance. |

## Main Duplications And Misplacements

| Pattern | Examples | Why it hurts | Recommended correction |
|---|---|---|---|
| Same domain appears in multiple modules | Calendar under Bookings, Academy calendar, professor calendar | User does not know if calendar is by court, class or personal day. | Create Web Operations > Calendar with filters/layers; keep mobile calendars role-specific. |
| People split inconsistently | Clients, CRM contacts, students, memberships, coaches, staff | "Cliente" means contact, lead, student, member or staff depending on page. | Create People domain with clear subtypes: Clients/CRM, Students, Members, Staff/Coaches. |
| Finance actions duplicated contextually and centrally | Academy payments, membership payments, reservation payments, finance receivables | Good for convenience but confusing if not ledger-based. | Keep contextual payment buttons; centralize ledger in Revenue/Finance. |
| Config mixed with operation | Court rules, academy settings, product setup, staff roles, tournament reset | Rare setup competes with daily tasks. | Move to Config/Admin/Advanced layers. |
| Work competition still nested in player routes | `/eventos?modo=organizing` | Organizer can feel like public discovery mode. | Keep route compatibility, but present as Competition OS workspace. |
| Mobile trying to mirror web modules | Work nav exposes many module names by role | Some mobile actions need to be fast cards, not module trees. | Mobile Work Today by role + action sheets. |

## Functions That Must Stay Reachable But Move Deeper

- Court creation, court pricing, booking rules.
- Academy resource slots, attendance requirement, makeup rules.
- Product plan changes and enabled features.
- Staff roles, permissions, invite management.
- Product creation/stock setup outside cashier quick sell.
- Tournament backup, reset, delete and raw configuration.
- League scoring/calendar advanced settings.
- Reports, analytics, historical ledgers and audit-style views.

## Functions That Need Stronger First-Class Destinations

- Organization/unit switcher for multi-academy work.
- Global operational calendar across courts, bookings and classes.
- People directory with clear person type: lead, client, student, member, staff.
- Revenue/Finance ledger separating receivables, payments, expenses, plans/packages and POS.
- Competition OS work hub separate from player discovery.
- Mobile Work Today per role with only actionable items.

## Open Product Decisions

1. Should a "client" become the master person record for student, member, lead and booking customer, or should the current entities stay separate with a unified search?
2. Should calendar be the primary Work web module, with reservations/classes as filtered layers, or should Reservations and Classes remain top modules that share a calendar component?
3. Should organizer-independent competitions live under a separate "Competitions" organization context when no place exists?
4. Should cashier mobile allow product creation, or only sale and low-stock flagging?
5. Which payment states are canonical before real payment provider: pending, paid, refunded, failed, cancelled?
6. What is the official owner-only boundary for destructive tournament/league actions?
