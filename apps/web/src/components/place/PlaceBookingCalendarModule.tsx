import type { CourtBooking, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";

type Props = {
  activeCourts: PlaceCourt[];
  blockedMinutes: number;
  bookings: CourtBooking[];
  canManageBookings: boolean;
  day: string;
  occupancyPct: number;
  onChangeDay: (day: string) => void;
  reservedMinutes: number;
};

function shortTime(value: string): string {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function bookingLabel(booking: CourtBooking): string {
  return booking.status === "blocked" ? "Bloqueio" : booking.playerName;
}

export function PlaceBookingCalendarModule({
  activeCourts,
  blockedMinutes,
  bookings,
  canManageBookings,
  day,
  occupancyPct,
  onChangeDay,
  reservedMinutes,
}: Props) {
  return (
    <div className="court-calendar-panel">
      <div className="place-booking-head">
        <strong>Calendario das quadras</strong>
        <input type="date" value={day} onChange={(event) => onChangeDay(event.target.value)} />
      </div>
      <div className="court-calendar-grid">
        {activeCourts.map((court) => {
          const courtBookings = bookings.filter((booking) => booking.courtId === court.id);
          return (
            <div key={`calendar:${court.id}`} className="court-calendar-column">
              <strong>{court.name}</strong>
              {courtBookings.length ? (
                courtBookings.map((booking) => (
                  <span key={`calendar-booking:${booking.id}`} className={booking.status}>
                    {shortTime(booking.startsAt)}-{shortTime(booking.endsAt)} - {bookingLabel(booking)}
                  </span>
                ))
              ) : (
                <small>Livre no dia.</small>
              )}
            </div>
          );
        })}
      </div>
      {canManageBookings ? (
        <div className="place-analytics-grid court-occupancy-grid">
          <div>
            <strong>{bookings.filter((booking) => booking.status !== "blocked").length}</strong>
            <span>{countLabel(bookings.filter((booking) => booking.status !== "blocked").length, "reserva no dia", "reservas no dia")}</span>
          </div>
          <div>
            <strong>{(reservedMinutes / 60).toFixed(1)}h</strong>
            <span>Horas reservadas</span>
          </div>
          <div>
            <strong>{(blockedMinutes / 60).toFixed(1)}h</strong>
            <span>Horas bloqueadas</span>
          </div>
          <div>
            <strong>{occupancyPct}%</strong>
            <span>Ocupacao estimada</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
