# Work SaaS Phase 4 Status

Date: 2026-05-21  
Queue phase: Phase 4 - Calendar And Reservations  
Status: reviewed and mostly implemented from prior sprint; pending browser QA and DB-backed E2E.

## Completed / Confirmed

### `WSAAS3-13 - Calendar First-Class Web Module`

Files reviewed:

- `src/components/BottomNav.tsx`
- `src/components/place/PlaceBookingCalendarModule.tsx`
- `src/pages/PlacesPage.tsx`

Result:

- `Calendario` is now a first-level Work navigation item on desktop.
- Calendar is no longer only an internal reservation tab.
- The calendar combines:
  - reservations;
  - blocks;
  - academy classes;
  - drop-in/lesson requests.
- The visible grid uses full-hour slots by default.
- Empty slots can start the reservation flow through `onCreateFromSlot`.

### `WSAAS3-14 - Calendar Mobile Role Views`

Confirmed:

- Coach mobile has a direct `Agenda` path to the academy calendar/day view.
- Frontdesk/manager still get role-focused mobile nav instead of the full SaaS tree.

Pending:

- Visual QA at 390px and 430px to verify density and tap targets.

### `WSAAS3-15 - Reservation Lifecycle Detail`

Files reviewed:

- `src/components/place/PlaceBookingReservationsModule.tsx`
- `src/components/place/PlaceBookingDetailedListModule.tsx`
- `src/components/place/PlaceBookingWaitlistModule.tsx`
- `src/components/place/PlaceBookingOperationalQueues.tsx`
- `src/lib/places.ts`

Result:

- Reservation lifecycle is clearer:
  - pending means aguardando pagamento;
  - confirmed means confirmed/paid flow;
  - cancelled is explicit;
  - blocked is operational block.
- Admin can manually edit court, start/end time and notes through `PlaceBookingReservationsModule`.
- Waitlist promotion now checks availability before creating a booking.
- When the original slot is still occupied, the button reads `Horario ocupado` and is disabled instead of looking available.

### `WSAAS3-16 - Reservation Payment Stub Integration`

Confirmed:

- Reservation payment actions route through the existing payment stub pattern via `PaymentStubDialog` in `PlacesPage`.
- `Pagar` remains a stub action preparing the future payment provider surface.

### `WSAAS3-17 - WhatsApp Reservation Communication`

Files reviewed:

- `src/lib/bookingWhatsapp.ts`
- `src/pages/PlacesPage.tsx`

Result:

- WhatsApp is communication support, not an extra confirmation step.
- Existing message includes:
  - player/customer name;
  - place name;
  - sender/staff name;
  - reservation details;
  - cancellation or reschedule context;
  - booking change link when available.
- `onShareBookingChange` creates a booking change request and opens WhatsApp with a unique agenda-selection link.
- Waitlist WhatsApp distinguishes:
  - slot available;
  - slot occupied with alternatives.

### `WSAAS3-18 - Reservation QA`

Static validation:

- `npx.cmd tsc -b --pretty false` passed after adjacent changes.

Pending E2E:

- create reservation;
- mark paid;
- edit manually;
- cancel;
- waitlist contact;
- reschedule through player link;
- console/network capture.

## Files Changed In This Phase

- No new code change was needed in this specific pass beyond the Phase 2 navigation promotion of `Calendario` and `Reservas`.

## Risks

- DB/RPC behavior still needs live E2E once migrations and remote credentials are settled.
- Payment provider is still a stub by product decision.
- Visual QA is still needed for mobile reservation density.

## Next Safe Step

Proceed to Phase 5:

- clean Aulas domain;
- keep professor mobile focused on day agenda;
- keep attendance optional/off by default;
- improve student detail responsive behavior.
