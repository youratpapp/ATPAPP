import type { CourtBooking } from "../../lib/types";
import { WorkspaceList, WorkspaceRow } from "./PlaceWorkspaceUi";

type Props = {
  bookings: CourtBooking[];
  busy: boolean;
  canManageBookings: boolean;
  onUpdateBooking: (bookingId: string, status: CourtBooking["status"]) => void;
};

function bookingStatusLabel(status: CourtBooking["status"]): string {
  if (status === "blocked") return "Bloqueio";
  if (status === "confirmed") return "Confirmada";
  if (status === "pending") return "Pendente";
  return "Cancelada";
}

export function PlaceBookingReservationsModule({ bookings, busy, canManageBookings, onUpdateBooking }: Props) {
  return (
    <WorkspaceList>
      {bookings.slice(0, 10).map((booking) => (
        <WorkspaceRow
          key={`booking-summary:${booking.id}`}
          title={booking.courtName || "Quadra"}
          detail={`${booking.playerName} | ${new Date(booking.startsAt).toLocaleString("pt-BR")} | ${bookingStatusLabel(booking.status)}`}
          actions={
            <>
              {canManageBookings && booking.status === "pending" ? (
                <button onClick={() => onUpdateBooking(booking.id, "confirmed")} disabled={busy}>
                  Confirmar
                </button>
              ) : null}
              {canManageBookings && booking.status !== "cancelled" ? (
                <button className="danger" onClick={() => onUpdateBooking(booking.id, "cancelled")} disabled={busy}>
                  {booking.status === "blocked" ? "Liberar" : "Cancelar"}
                </button>
              ) : null}
            </>
          }
        />
      ))}
      {!bookings.length ? <p className="subtle">Sem reservas recentes.</p> : null}
    </WorkspaceList>
  );
}
