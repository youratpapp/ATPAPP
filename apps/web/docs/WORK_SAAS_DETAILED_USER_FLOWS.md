# Work SaaS Detailed User Flows

Date: 2026-05-21  
Status: execution detail draft.  
Purpose: define real end-to-end flows before implementation.

## Flow Rules

Every flow must have:

- start context;
- first screen;
- first useful information;
- primary CTA;
- steps;
- success state;
- next natural step;
- error/block state;
- web/mobile boundary;
- permission boundary.

## Global Context Flow: Multi-Role User

Persona: user who is player, staff and organizer.  
Goal: understand where they are and switch without mixing personal and work tasks.

Web flow:

1. User opens app.
2. Topbar shows `Jogador / Trabalho`.
3. If in Trabalho, shell shows active organization/unit/competition.
4. Sidebar shows only modules for current work role/context.
5. User can switch mode without losing current page route if possible.
6. Personal agenda/payments stay in Player App.
7. Local receivables/staff/admin stay in Work.

Mobile flow:

1. User opens app.
2. Mode selector stays visible.
3. Work home shows role and context.
4. If multiple places/competitions exist, a compact switcher appears.
5. Switching role/context changes actions and nav.

Success:

- User can answer: "I am acting as player or staff?"
- No professional finance/admin appears in Player App first fold.
- No personal agenda/payment appears as local finance.

## Flow 1 - Owner/Manager Starts The Work Day

Persona: owner or manager of one or more places.  
Frequency: daily.  
Platform: web first, mobile summary.

Start:

1. Open `/trabalho` or `/gestao`.
2. Land on `Hoje`.

First fold:

- active organization/unit selector;
- top 3 critical blockers;
- grouped totals: reservations, classes, finance, clients, stock, competitions;
- primary CTA: resolve highest priority blocker.

Steps:

1. Select unit if more than one.
2. Review critical blockers.
3. Open blocker.
4. Complete action in its domain.
5. Return to Hoje.
6. Next blocker becomes visible.

Examples of blockers:

- reservations waiting payment;
- class replacement pending;
- overdue receivables;
- low stock;
- tournament registration pending;
- setup blocking public page.

Success:

- Today's operation is clear in under 10 seconds.
- Manager does not scan a long module list.

Mobile:

- show only critical blockers and approval actions;
- complex reports/admin open web.

## Flow 2 - Frontdesk Creates A Reservation

Persona: reception/secretary.  
Frequency: daily.  
Platform: web and mobile.

Start:

1. Open Trabalho.
2. Land on Hoje or Reservas depending role preference.
3. Primary CTA: `Nova reserva`.

Steps:

1. Tap `Nova reserva`.
2. Search client or enter name/phone.
3. Select date.
4. Select time and duration.
5. System shows available courts and price.
6. Choose court.
7. Confirm reservation.
8. Payment stub appears if payment is required.
9. Success state shows reservation details.
10. Next CTA: `Ver na agenda`, `Enviar WhatsApp`, `Nova reserva`.

States:

- no courts: explain setup needed and link web Admin > Courts.
- no availability: show nearest alternatives.
- payment pending: reservation exists with pending payment state.
- paid: reservation is confirmed.

Mobile:

- short wizard;
- no booking rules/court setup;
- use sheet for client search and confirmation.

## Flow 3 - Frontdesk Reschedules Or Cancels A Reservation

Persona: reception/secretary.  
Frequency: daily/eventual.  
Platform: web and mobile.

Start:

1. Open reservation detail from Calendar or Reservations.
2. See client, phone, court, time, payment status.

Steps for reschedule:

1. Tap `Alterar horario`.
2. Open agenda selector with available alternatives.
3. Show same time other court first, then nearby times same court, then nearby times other courts.
4. Select new slot.
5. Confirm change.
6. Preserve payment if already paid.
7. Show WhatsApp message with old time, new time, academy name and staff sender.
8. User can send WhatsApp and mark communication sent.

Steps for cancel:

1. Tap `Cancelar reserva`.
2. Confirm reason.
3. Show payment consequence.
4. Cancel.
5. Show WhatsApp message.
6. Return to Reservations.

Success:

- No "confirm invite" confusion.
- Slot state and action state match.

Mobile:

- use action sheet;
- complex recurring cancellation can redirect to web.

## Flow 4 - Waitlist To Reservation

Persona: frontdesk.  
Frequency: daily/eventual.  
Platform: web and mobile.

Start:

1. Waitlist entry appears in Hoje/Reservations.
2. Entry shows desired date/time, contact, waiting time and alternatives.

Steps:

1. System checks if slot is available.
2. If available, CTA `Criar reserva`.
3. If unavailable, CTA `Enviar alternativas`.
4. If user accepts alternative, frontdesk opens agenda selector.
5. Confirm reservation.
6. Send WhatsApp.

State rules:

- If slot occupied, do not show enabled `Criar reserva`.
- Use labels like `Sugerir horarios` or `Contactar`, not `Marcar convidado`.

Mobile:

- queue card with phone/WhatsApp and best alternatives.

## Flow 5 - Professor Opens Day Agenda

Persona: coach-only professor.  
Frequency: daily.  
Platform: mobile first, web available.

Start:

1. Open Trabalho.
2. Land on `Hoje` or `Agenda`.

First fold:

- next class;
- hour-by-hour day timeline;
- class name;
- court;
- students count;
- replacements/notices.

Steps:

1. Open next class.
2. See students, planned absences and replacements.
3. If company requires attendance, mark attendance.
4. If not, attendance UI does not appear.
5. Add progress note if needed.
6. Register planned absence if student warned.
7. Return to day agenda.

Success:

- Professor does not see finance, staff, settings or full CRM.
- Professor knows where and when every class happens.

Web:

- can show weekly class list and student detail.

## Flow 6 - Manager Creates Class And Enrolls Student

Persona: academy manager/frontdesk.  
Frequency: weekly/eventual.  
Platform: web first.

Start:

1. Open Aulas.
2. Primary CTA: `Criar turma` or `Matricular aluno`.

Create class steps:

1. Choose coach.
2. Choose court.
3. Choose weekday/time.
4. Set capacity, level, age/gender scope.
5. Set monthly fee.
6. Save.
7. Success CTA: `Adicionar aluno` or `Ver no calendario`.

Enroll student steps:

1. Search person or create quick person.
2. Select class/classes according to weekly lessons.
3. Set plan/fee/start date.
4. Confirm enrollment.
5. Create payment stub/receivable.
6. Success CTA: `Abrir aluno`, `Ver turma`, `Enviar WhatsApp`.

Mobile:

- frontdesk can quick enroll only if simplified.
- full class setup stays web.

## Flow 7 - Student Replacement

Persona: frontdesk or coach.  
Frequency: daily/eventual.  
Platform: both.

Start:

1. Student warns absence before required notice window.
2. Staff opens student/class detail.

Steps:

1. Register planned absence.
2. System creates or marks replacement credit if academy setting allows.
3. Open fit search.
4. Show compatible classes/slots.
5. Select replacement slot.
6. Confirm.
7. Send WhatsApp confirmation.

If student did not warn before:

- no automatic replacement by default;
- staff may manually create exception if permission allows.

Attendance note:

- this flow does not require full class attendance.

## Flow 8 - CRM Lead Follow-Up

Persona: frontdesk/manager.  
Frequency: daily.  
Platform: web plus mobile due queue.

Start:

1. Open Pessoas > Clientes/CRM or Hoje due card.
2. See leads due today.

Steps:

1. Open contact.
2. Send WhatsApp.
3. Register interaction.
4. Mark contacted/converted/archived.
5. Schedule next follow-up.
6. If converted to student/member, start enrollment/membership flow.

Success:

- History stays linked to contact.
- Contact does not disappear into student/member without trace.

## Flow 9 - Finance Collects Receivables

Persona: finance.  
Frequency: daily.  
Platform: web and mobile.

Start:

1. Open Trabalho.
2. Finance role lands on Receber/Receivables.

First fold:

- overdue;
- due today;
- total open amount;
- primary CTA: `Cobrar vencidos`.

Steps:

1. Filter overdue/today/all.
2. Open receivable.
3. Send reminder or mark paid.
4. Payment stub marks paid.
5. Item moves to paid ledger.

Rules:

- Do not show class management, staff, cantina operations.
- Do not mix personal player payments.

Mobile:

- compact list with reminder/paid buttons.

## Flow 10 - Cashier Sells Item

Persona: cashier.  
Frequency: daily.  
Platform: mobile first, web available.

Start:

1. Open Trabalho.
2. Land on Vender.

Steps:

1. Search/select product.
2. Adjust quantity.
3. Confirm sale.
4. Stock updates.
5. Sale appears in Today.
6. Low stock alert appears if needed.

Mobile:

- product setup is secondary.
- no broad finance.

## Flow 11 - Tournament Created And Operated

Persona: independent organizer or local manager.  
Frequency: event-based.  
Platform: web for setup, mobile for operation.

Start:

1. Open Trabalho > Competicoes.
2. CTA `Criar torneio`.

Setup:

1. Basic data: name, dates, location, visibility, fee.
2. Categories/classes.
3. Registration rules.
4. Court/time agenda.
5. Staff roles.
6. Publish registration link.

Registration open:

1. Review registrations.
2. Approve/waitlist/reject.
3. Mark/pay registration.
4. Communicate participants.

Registration closed:

1. Resolve pending approvals/payments.
2. Generate games.
3. Review conflicts.
4. Publish table.

In progress:

1. Scorekeeper opens matches.
2. Launch result/WO.
3. Owner validates pending result submissions.
4. Media posts announcements.

Finished:

1. Publish final result.
2. Show podium.
3. Archive report/history.

Mobile:

- check-in, results, communication, phase blockers.
- no backup/reset/delete.

## Flow 12 - League Created And Operated

Persona: league owner.  
Frequency: season/weekly.  
Platform: web for setup, mobile for rounds/results.

Setup:

1. Create league.
2. Define classes.
3. Define scoring and WO/tiebreak rules.
4. Define round interval.
5. Enable public join or invite-only.
6. Publish/collect participants.

Active round:

1. Participants see opponent/time/place/chat.
2. Participants submit result.
3. Owner validates conflict or pending results.
4. Standings update.

Between rounds:

1. Owner reviews pending results.
2. Generate next round.
3. Communicate next round.

End:

1. Validate final standings.
2. Apply movements if product uses promotion/relegation.
3. Create snapshot/report.
4. Archive season.

Participant mobile:

- current round, opponent, chat, submit result, standings.

Owner mobile:

- pending results, generate/communicate next round if safe.

## Flow 13 - Admin Configures The Local SaaS

Persona: owner/manager.  
Frequency: rare/setup.  
Platform: web only.

Start:

1. Open Administracao.
2. See setup checklist.

Sections:

- public profile;
- organization/unit;
- courts/resources;
- booking rules;
- academy rules;
- plan/features;
- permissions/staff;
- publication;
- integrations future;
- advanced.

Success:

- daily operation does not show these actions unless incomplete setup blocks work.

Mobile:

- show blocking alert only, with `Abrir no web`.

## Flow 14 - Reports

Persona: owner/manager/finance.  
Frequency: weekly/monthly.  
Platform: web only, mobile summary.

Start:

1. Open Relatorios.
2. Choose report category.

Reports:

- court occupancy;
- class occupancy;
- receivables aging;
- payment history;
- POS sales;
- CRM conversion;
- competition performance;
- staff activity future.

Success:

- reports do not compete with daily actions.

## Flow 15 - Player Crosses Into Work Context

Persona: player who also works/organizes.  
Frequency: daily/eventual.

Player side:

1. Reserve court.
2. See personal agenda.
3. Pay personal item.
4. Join tournament/league.

Work side:

1. Operate local booking if staff.
2. Operate competition if authorized.
3. Access finance only if business role.

Rules:

- Player entry to competition remains participant context.
- Organizer operation requires Work context.
- If user is both participant and organizer, show clear role mode and safe CTA.

## Flow Validation Checklist

Before implementing any flow:

1. Is this daily, weekly, eventual or rare?
2. Is web or mobile the correct primary platform?
3. What is the first screen?
4. What is the first useful information?
5. What is the CTA?
6. What is the success state?
7. What is the next natural step?
8. What is the empty state?
9. What is forbidden by permission?
10. Which old route must still open this flow?
