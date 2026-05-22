# Work SaaS QA Acceptance Matrix

Date: 2026-05-21  
Status: QA specification for future implementation.  
Scope: final acceptance matrix for Work SaaS restructure.

## Viewports

Every implemented phase must be checked in:

- mobile 390px;
- mobile 430px;
- desktop 1366px;
- desktop wide.

## Global Acceptance

| Area | Must pass |
|---|---|
| Routes | Legacy and public routes still open. |
| Permissions | User does not see forbidden modules/actions. |
| Mode | `Jogador / Trabalho` is clear and consistent. |
| Context | Active organization/unit/competition is visible. |
| CTA | Each page has one primary CTA or clear read-only purpose. |
| Empty state | Every empty state explains next step. |
| Mobile | Mobile shows operational tasks, not full SaaS tree. |
| Web | Web can hold full SaaS depth without cluttering first fold. |
| Visual DNA | Premium dark identity remains consistent. |
| Console | No blocking console errors on main routes. |

## Persona QA

### 1. Owner / Manager

Context:

- owns one or more places.

Test:

1. Open `/trabalho`.
2. Confirm `Hoje` shows critical blockers.
3. Switch unit if multiple.
4. Open Calendar.
5. Open Reservations.
6. Open Aulas.
7. Open Pessoas.
8. Open Receita.
9. Open Admin.
10. Confirm setup/danger actions are not in daily first fold.

Expected:

- Can administer full SaaS web.
- Mobile shows critical actions, not all admin.
- No personal payment is mixed with local finance.

Fail if:

- menu is a long flat module list;
- setup appears as primary daily task;
- old place admin route breaks.

### 2. Frontdesk / Recepcao

Context:

- staff role `frontdesk`.

Test:

1. Open Work.
2. First screen shows reservations/waitlist/client actions.
3. Create reservation.
4. Edit reservation.
5. Cancel/reschedule and generate WhatsApp.
6. Open client/CRM quick lookup.
7. Confirm settings/team/finance broad are hidden.

Expected:

- Can complete daily reservation flow.
- Cannot see role/permission setup.
- Calendar and Reservations are easy to distinguish.

Fail if:

- must search under Ajustes for daily action;
- `Criar reserva` appears enabled for occupied slot;
- confusing labels like `Marcar convidado` remain for waitlist/reschedule.

### 3. Professor

Context:

- staff role `coach`.

Test:

1. Open mobile Work.
2. See day agenda by hour.
3. Open next class.
4. See students, court and replacements.
5. Attendance UI appears only if setting enabled.
6. Add progress note.
7. Open own students.

Expected:

- No finance, cantina, team, settings.
- Day schedule is readable on mobile.
- Class detail does not use broken desktop modal.

Fail if:

- coach lands in ERP-like admin;
- full chamada is forced when disabled;
- student modal overflows/hidden footer.

### 4. Financeiro

Context:

- staff role `finance`.

Test:

1. Open Work.
2. Land on Receber/Receivables.
3. Filter overdue/today/all.
4. Send reminder.
5. Mark item paid with payment stub.
6. Open paid list.
7. Register expense.

Expected:

- Finance sees Revenue only.
- Does not see classes, staff, POS operation unless explicitly permitted.

Fail if:

- local finance mixes with personal player payments;
- payment action does not update central ledger.

### 5. Cashier / Caixa

Context:

- staff role `cashier`.

Test:

1. Open mobile Work.
2. Land on Vender.
3. Select product.
4. Confirm sale.
5. See today sale.
6. See low-stock alert.

Expected:

- Quick sale is first.
- No broad finance/CRM/admin.

Fail if:

- product setup blocks selling;
- cashier sees receivables broad.

### 6. Organizer Independent

Context:

- organizes tournament/league without a place.

Test:

1. Open `/trabalho/competicoes` or `/eventos?modo=organizing`.
2. See organized competitions by phase.
3. Create tournament/league.
4. Open cockpit.
5. Operate registrations/results.

Expected:

- Does not need local place if product permits independent organizer.
- Does not land in player discovery as primary view.

Fail if:

- Competition OS is hidden under a place-only menu.

### 7. Tournament Staff

Roles:

- owner;
- organizer;
- checkin;
- scorekeeper;
- media.

Test:

1. Open tournament cockpit.
2. Verify first fold by phase.
3. Check role-specific actions.

Expected:

- checkin sees registrations/check-in;
- scorekeeper sees matches/results;
- media sees communication/publication;
- owner sees all;
- player does not see staff tools.

Fail if:

- role tools are duplicated in multiple menus;
- advanced reset/delete appears near daily result entry.

### 8. League Owner And Participant

Owner test:

1. Open league as owner.
2. See phase: setup, active round, between rounds, finished.
3. Generate/validate round as allowed.
4. Validate standings/result conflicts.

Participant test:

1. Open league as participant.
2. See current round, opponent, place, chat, result.
3. Submit result.
4. See standings.

Expected:

- owner and participant first folds differ.
- participant never sees owner config.

Fail if:

- owner lands in discovery;
- participant sees admin settings.

### 9. Multi-Role User

Context:

- player + staff + organizer.

Test:

1. Open Player App.
2. See personal agenda/payments.
3. Switch to Work.
4. See professional context.
5. Switch between unit and competition.
6. Return to Player.

Expected:

- no mode confusion;
- player tasks and work tasks remain separate.

Fail if:

- work finance appears in player profile;
- personal agenda appears as local work finance.

## Route QA

| Route | Expected |
|---|---|
| `/gestao` | Work command center opens. |
| `/trabalho` | Alias to Work command center. |
| `/gestao/:placeId` | Unit work context opens. |
| `/gestao/:placeId/agenda` | Calendar/Reservations compatibility opens. |
| `/gestao/:placeId/agenda?visao=calendario` | Calendar opens. |
| `/gestao/:placeId/agenda?visao=reservas` | Reservations opens. |
| `/gestao/:placeId/agenda?visao=nova-reserva` | New reservation opens. |
| `/gestao/:placeId/academia` | Aulas opens. |
| `/gestao/:placeId/clientes` | Pessoas/Clients compatibility opens. |
| `/gestao/:placeId/financeiro` | Revenue opens. |
| `/gestao/:placeId/cantina` | POS opens. |
| `/gestao/:placeId/equipe` | Team/admin opens. |
| `/gestao/:placeId/ajustes` | Admin/settings opens. |
| `/locais/:placeId/admin` | Legacy admin opens. |
| `/eventos?modo=organizing` | Competition OS work hub opens. |
| `/trabalho/competicoes` | Competition OS work hub opens. |
| `/eventos/:id/organizacao` | Tournament cockpit opens for authorized role. |
| `/eventos/ligas/:id` | League detail opens with role-specific first fold. |
| `/join` links | Still work. |
| `/inscricao/:tournamentId` | Still works. |
| `/t/:tournamentId` | Still works. |

## Domain QA

### Calendar

Pass:

- shows full-hour grid by default;
- layers reservations/classes/blocks/event allocations;
- create reservation from free slot;
- open detail from occupied slot.

Fail:

- hidden under reservation-only semantics;
- half-hour grid default remains when full hour requested.

### Reservations

Pass:

- create, edit, cancel, reschedule, mark paid, WhatsApp.
- waitlist is contextual.
- setup moved to Admin.

Fail:

- waitlist and resources remain primary submenu confusion.

### Aulas

Pass:

- professor agenda, class detail, students, replacements.
- attendance hidden when disabled.
- setup/resources/coaches moved out or secondary.

Fail:

- coach sees ERP/admin.
- attendance forced by default.

### Pessoas

Pass:

- CRM, students, members, team are separate.
- search helps find people.

Fail:

- "cliente" still mixes every person type without labels.

### Receita

Pass:

- local money centralized.
- payment stub consistent.
- personal payments separate.

Fail:

- same receivable has divergent state across modules.

### Competition OS

Pass:

- organizer sees work by phase.
- player discovery separate.
- roles get correct actions.

Fail:

- organizer tools leak into player view.

## Visual QA

Check on every major route:

- logo size/proportion;
- header height;
- mode selector position;
- active mode clarity;
- hero/card proportions;
- no white hover breaking dark text;
- no overlapping cards/buttons;
- no double menus with same labels;
- no mobile horizontal overflow;
- no desktop wasted huge blank region unless intentional.

## Console And Data QA

For each route:

- open DevTools console;
- refresh;
- perform primary CTA;
- check no blocking error;
- check no ambiguous SQL/query error;
- check loading and empty states.

## Final Acceptance Statement

The restructure is accepted only when:

1. every persona can complete daily work with a clear first screen;
2. web work behaves like a SaaS platform;
3. mobile work behaves like an operational app;
4. Player App remains simple and personal;
5. Competition OS is separate from discovery;
6. all legacy/public routes still work;
7. permissions are preserved;
8. docs and screenshots are updated for each phase.
