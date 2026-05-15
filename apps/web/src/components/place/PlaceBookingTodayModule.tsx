import type { AppPayment, CourtBooking } from "../../lib/types";
import { WorkspaceList, WorkspaceMetrics, WorkspaceRow } from "./PlaceWorkspaceUi";

type Props = {
  bookings: CourtBooking[];
  busy: boolean;
  canManageBookings: boolean;
  getPaymentForBooking: (bookingId: string) => AppPayment | undefined;
  onUpdateBooking: (bookingId: string, status: CourtBooking["status"]) => void;
};

function shortTime(value: string): string {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function bookingStatusLabel(status: CourtBooking["status"]): string {
  if (status === "blocked") return "Bloqueio";
  if (status === "confirmed") return "Confirmada";
  if (status === "pending") return "Pendente";
  return "Cancelada";
}

function paymentStatusLabel(payment?: AppPayment): string {
  if (payment?.status === "paid") return "Pago";
  if (payment?.status === "pending") return "Pagamento pendente";
  return "Sem pagamento";
}

export function PlaceBookingTodayModule({ bookings, busy, canManageBookings, getPaymentForBooking, onUpdateBooking }: Props) {
  return (
    <WorkspaceList>
      {bookings.map((booking) => {
        const bookingPayment = getPaymentForBooking(booking.id);
        return (
          <WorkspaceRow
            key={`booking-today:${booking.id}`}
            title={`${shortTime(booking.startsAt)} - ${booking.courtName || "Quadra"}`}
            detail={`${booking.status === "blocked" ? "Bloqueio operacional" : booking.playerName} | ${bookingStatusLabel(booking.status)}`}
            actions={
              <>
                {canManageBookings && booking.status === "pending" ? (
                  <button className="primary" onClick={() => onUpdateBooking(booking.id, "confirmed")} disabled={busy}>
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
          >
            <WorkspaceMetrics
              items={[
                `Fim ${shortTime(booking.endsAt)}`,
                paymentStatusLabel(bookingPayment),
                booking.phone ? `Contato ${booking.phone}` : "Sem telefone",
                booking.recurrenceTotal > 1 ? `Serie ${booking.recurrenceIndex}/${booking.recurrenceTotal}` : "",
                booking.notes || "",
              ].filter(Boolean)}
            />
          </WorkspaceRow>
        );
      })}
      {!bookings.length ? <p className="subtle">Nenhuma reserva hoje. Use Nova reserva ou Calendario para operar o proximo horario.</p> : null}
    </WorkspaceList>
  );
}
