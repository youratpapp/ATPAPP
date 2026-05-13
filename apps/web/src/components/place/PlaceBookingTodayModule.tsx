import type { AppPayment, CourtBooking } from "../../lib/types";
import { WorkspaceCard, WorkspaceGrid } from "./PlaceWorkspaceUi";

type Props = {
  bookings: CourtBooking[];
  getPaymentForBooking: (bookingId: string) => AppPayment | undefined;
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

export function PlaceBookingTodayModule({ bookings, getPaymentForBooking }: Props) {
  return (
    <WorkspaceGrid>
      {bookings.slice(0, 8).map((booking) => {
        const bookingPayment = getPaymentForBooking(booking.id);
        return (
          <WorkspaceCard
            key={`booking-today:${booking.id}`}
            title={`${shortTime(booking.startsAt)} - ${booking.courtName || "Quadra"}`}
            subtitle={booking.status === "blocked" ? "Bloqueio operacional" : booking.playerName}
            value={bookingStatusLabel(booking.status)}
            metrics={[
              shortTime(booking.endsAt),
              paymentStatusLabel(bookingPayment),
              booking.recurrenceTotal > 1 ? `Serie ${booking.recurrenceIndex}/${booking.recurrenceTotal}` : "",
            ].filter(Boolean)}
          />
        );
      })}
      {!bookings.length ? <p className="subtle">Nenhuma reserva para hoje.</p> : null}
    </WorkspaceGrid>
  );
}
