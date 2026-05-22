# Work SaaS Restructure Roadmap

Date: 2026-05-21  
Status: proposal, no implementation yet.  
Goal: move Work/Gestao from adapted app screens to a professional SaaS web plus a focused mobile operational layer.

## Guiding Constraints

- Do not remove existing routes.
- Do not break public links, joins or registrations.
- Do not duplicate backend/loaders.
- Do not relax permissions.
- Do not turn mobile into a mini ERP.
- Keep premium dark visual DNA.
- Separate Player App, SaaS Work Web, Mobile Work and Competition OS.
- Preserve existing functions while moving them to clearer places.

## Phase 0 - Source Of Truth And Route Safety

Objective: freeze compatibility rules before UI restructure.

Work:

- Document current route aliases.
- Confirm `buildPlaceAdminPath` and `resolvePlaceAdminView` remain compatibility layer.
- Preserve `/gestao`, `/trabalho`, `/locais/:placeId/admin`, `/eventos`, `/eventos?modo=organizing`, `/eventos/:id/organizacao`, `/eventos/ligas/:id`, `/join`, `/inscricao/:tournamentId`, `/t/:tournamentId`.
- Add route tests/manual checklist.

Dependencies:

- None.

Risk:

- Breaking old links from WhatsApp, public pages or saved browser URLs.

Acceptance:

- Every legacy route opens a valid page or alias with context preserved.

## Phase 1 - SaaS Shell And Context Model

Objective: make Trabalho feel like a real SaaS workspace.

Work:

- Create/adjust web Work shell.
- Stable logo/header/mode selector.
- Organization and unit context.
- Sidebar grouped by domain and permission.
- Topbar search slot, notification slot and user menu.
- Empty group hiding.

Dependencies:

- Phase 0.

Risk:

- Visual regression against approved premium dark DNA.

Acceptance:

- Owner/manager, coach, frontdesk, finance, cashier and organizer see only relevant groups.
- Player and Work remain visually connected but clearly separated.

## Phase 2 - Command Center: Hoje

Objective: turn Work start into role-based operational queue.

Work:

- Owner/manager: critical blockers by unit/domain.
- Coach: today classes, next class, students/replacements.
- Frontdesk: today reservations, waitlist, check-in, quick reservation.
- Finance: overdue/today receivables, reminder/mark paid.
- Cashier: sell, today sales, low stock.
- Organizer: competition blockers by phase.

Dependencies:

- Phase 1 shell.

Risk:

- Dashboard becomes list of numbers instead of action queue.

Acceptance:

- First fold answers "what do I solve now?" for every role.

## Phase 3 - Unified Calendar

Objective: promote Calendar to a first-class Work web module.

Work:

- Show courts, bookings, blocks, classes, teacher schedules and event allocations as layers.
- Day default by full hour.
- Week/resource filters.
- Create reservation from free slot.
- Open class/reservation from occupied slot.
- Keep `/gestao/:placeId/agenda?visao=calendario` as alias.

Dependencies:

- Phase 1 shell and route safety.

Risk:

- Overloading the calendar with too many layers at once.

Acceptance:

- Frontdesk, coach and manager can understand day schedule without switching between Reservation and Aulas modules.

## Phase 4 - Reservations Domain Cleanup

Objective: make reservations a lifecycle module, not calendar/config catch-all.

Work:

- Reservations list with filters.
- Detail drawer/page for edit, cancel, reschedule, mark paid, WhatsApp.
- New reservation wizard as primary CTA.
- Waitlist as contextual queue.
- Move court/rule setup to Admin.
- Clarify "contact/reagendar" versus "confirmacao" semantics.

Dependencies:

- Phase 3 calendar.

Risk:

- Losing quick frontdesk actions during cleanup.

Acceptance:

- Reception can create, edit, cancel, reschedule and contact without hunting submenus.

## Phase 5 - Aulas Domain Cleanup

Objective: make Academy/Aulas focused on classes, students and daily teaching.

Work:

- Keep teacher day agenda and class detail prominent.
- Hide attendance/chamada unless company setting requires it.
- Move coaches/login/permissions to People/Team.
- Move academy rules/resources to Admin.
- Make replacements/lesson requests a clear queue.
- Student detail adaptive drawer/page.

Dependencies:

- Phase 3 calendar and current `requireAttendanceCall` setting.

Risk:

- Removing teacher-needed student info while moving admin setup away.

Acceptance:

- Coach can see day, class, students and replacements on mobile.
- Manager can manage classes/students on web.

## Phase 6 - People Domain

Objective: resolve confusion between contacts, clients, students, members, coaches and staff.

Work:

- Create People landing/search.
- Explicit sections: CRM Contacts, Students, Members, Team/Staff.
- Decide master-person model or unified search over existing entities.
- Move membership operation into People with finance ledger link.
- Move coach login/staff role to Team/Admin.

Dependencies:

- Product decision on person model can be incremental.

Risk:

- Data model may not yet unify people; do not force backend change too early.

Acceptance:

- User can find a person and understand if they are lead, student, member, staff or booking client.

## Phase 7 - Revenue Domain

Objective: centralize business money without mixing personal player payments.

Work:

- Receivables as primary finance start.
- Payments ledger for paid/history.
- Expenses.
- Plans/packages/memberships/credits as products.
- POS revenue shown as source, with POS still operational.
- Keep contextual payment buttons but route all states to ledger.

Dependencies:

- Existing payment stub modal and `AppPayment`.

Risk:

- Duplicated payment states between modules.

Acceptance:

- Finance role can collect money without seeing classes/cantina operations.
- Personal payments stay outside local finance.

## Phase 8 - Cantina/POS

Objective: keep cashier flow fast while keeping product/stock manageable.

Work:

- Mobile cashier starts at Vender.
- Web POS has Sell, Today, Stock, Products.
- Product setup is secondary.
- Low stock can become alert/action.

Dependencies:

- Revenue separation.

Risk:

- Product setup crowding quick sale.

Acceptance:

- Cashier can sell in under a few taps on mobile.

## Phase 9 - Competition OS Web

Objective: make organizer work a proper SaaS surface separate from player discovery.

Work:

- Work competition hub grouped by phase/blocker.
- Tournament cockpit by phase and role.
- League owner cockpit by phase.
- Staff roles: owner, organizer, checkin, scorekeeper, media.
- Publishing and chat contextual.
- Advanced/danger actions isolated.
- Keep all public routes and player tabs.

Dependencies:

- Route safety and work shell.

Risk:

- Organizer-independent flow may be hidden if IA assumes place/unit.

Acceptance:

- Organizer without a place can create/operate competitions.
- Player never sees admin tools without role.

## Phase 10 - Reports And Admin

Objective: move analysis/setup out of routine.

Work:

- Reports home with operation, finance, students, CRM and competitions.
- Admin home with public profile, resources, rules, permissions, integrations, advanced.
- Owner-only dangerous actions.
- Future audit log slot.

Dependencies:

- Domain pages stabilized.

Risk:

- Admin becoming a second cluttered menu.

Acceptance:

- Daily workflows do not show setup rare actions unless blocking operation.

## Phase 11 - Mobile Work Operational Layer

Objective: create a focused mobile experience per role.

Work:

- Role-based Work Today.
- Role-based bottom nav.
- Action sheets: payment stub, WhatsApp, reservation edit, class detail, result entry.
- Redirect complex setup to web with clear message.

Dependencies:

- Web IA and page responsibilities.

Risk:

- Trying to implement every web module on mobile.

Acceptance:

- Mobile supports daily action, communication and simple approvals, not full SaaS administration.

## Phase 12 - QA And Migration

Objective: validate that no persona improved by breaking another.

Personas:

- owner/manager;
- frontdesk;
- coach;
- finance;
- cashier;
- tournament organizer;
- tournament scorekeeper;
- tournament checkin;
- tournament media;
- league owner;
- player/participant;
- multi-role user.

Viewports:

- mobile 390px;
- mobile 430px;
- desktop 1366px;
- desktop wide.

Tests:

- first screen;
- primary CTA;
- nav/permissions;
- empty state;
- old route compatibility;
- console errors;
- key flows end to end.

Acceptance:

- No daily task is hidden under setup/third tier.
- No rare setup competes with routine.
- No forbidden action appears for role.
- No old public/legacy link breaks.

## Recommended First Implementation Batch

Only after validating these docs, the safest first batch is:

1. Route compatibility tests and wrappers.
2. SaaS shell grouped sidebar behind existing loaders.
3. Work Command Center page contract cleanup.
4. Calendar first-class route/wrapper.
5. Reservations cleanup: remove calendar/resources/waitlist as competing submenu concepts while preserving URLs.

Why:

- It addresses the user's biggest current confusion: menu tree, duplicate submenus and calendar/reservation overlap.
- It has high UX impact without backend rewrite.
- It creates the structure needed for later People/Revenue/Competition cleanup.

## Decision Log Needed Before Implementation

| Decision | Options | Recommendation |
|---|---|---|
| People model | Master person record vs unified search over existing entities | Start with unified search; avoid backend rewrite now. |
| Calendar ownership | Calendar module vs reservation subpage | Promote Calendar to Work first-class web module. |
| Mobile setup | Allow setup on mobile or redirect to web | Redirect complex setup to web. |
| Coach attendance | Always, optional, company setting | Company setting, default off. |
| Competition work route | Keep `/eventos?modo=organizing` or add work route | Add work route wrapper, keep old route. |
| Product setup in cashier mobile | Allow or web only | Web first; mobile only low-stock and selling now. |

## Global Risks

| Risk | Mitigation |
|---|---|
| Too much IA change at once | Implement in batches with wrappers and route compatibility. |
| Visual inconsistency | Reuse approved premium dark shell/tokens; QA web/mobile. |
| Permission leaks | Use existing `placeResourceAccess` and tournament/league roles; do not relax. |
| Backend churn | Start with frontend composition and routing; avoid schema changes unless needed. |
| Old docs conflicting | Treat `WORK_*` docs as current proposal after validation; older MDs are context only. |
| Mobile overload | Keep mobile role-based and action-driven. |

## Success Metrics

- Frontdesk can create/reschedule/cancel/contact around reservations from one clear path.
- Coach sees today's day agenda and class details without finance/admin noise.
- Finance lands directly on receivables and can mark paid/send reminders.
- Cashier can sell quickly without product setup blocking the flow.
- Owner sees cross-domain blockers without module clutter.
- Organizer opens Competition OS and sees next phase blocker.
- Old links still work.
- Mobile and web feel like two purposeful layers, not the same menu squeezed differently.
