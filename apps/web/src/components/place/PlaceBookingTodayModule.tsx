import { useState } from "react";
import type { AppPayment, CourtBooking } from "../../lib/types";
import { WorkspaceList, WorkspaceMetrics, WorkspaceRow } from "./PlaceWorkspaceUi";

const DEFAULT_VISIBLE_TODAY_ROWS = 12;

type Props = {
  bookings: CourtBooking[];
  busy: boolean;
  canManageBookings: boolean;
  getPaymentForBooking: (bookingId: string) => AppPayment | undefined;
  getWhatsappHref: (booking: CourtBooking) => string;
  onShareBookingChange?: (booking: CourtBooking) => void;
  onUpdateBooking: (bookingId: string, status: CourtBooking["status"]) => void;
};

function shortTime(value: string): string {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function bookingStatusLabel(status: CourtBooking["status"]): string {
  if (status === "blocked") return "Bloqueio";
  if (status === "confirmed") return "Confirmada";
  if (status === "pending") return "Aguardando pagamento";
  return "Cancelada";
}

function paymentStatusLabel(payment?: AppPayment): string {
  if (payment?.status === "paid") return "Pago";
  if (payment?.status === "pending") return "Pagamento pendente";
  return "Sem pagamento";
}

export function PlaceBookingTodayModule({ bookings, busy, canManageBookings, getPaymentForBooking, getWhatsappHref, onShareBookingChange, onUpdateBooking }: Props) {
  const [showAllTodayBookings, setShowAllTodayBookings] = useState(false);
  const orderedBookings = [...bookings].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });
  const pendingCount = orderedBookings.filter((booking) => booking.status === "pending").length;
  const shouldLimitTodayRows = !showAllTodayBookings && orderedBookings.length > DEFAULT_VISIBLE_TODAY_ROWS;
  const visibleBookings = shouldLimitTodayRows ? orderedBookings.slice(0, DEFAULT_VISIBLE_TODAY_ROWS) : orderedBookings;

  return (
    <WorkspaceList>
      {pendingCount ? (
        <div className="booking-results-summary urgent">
          <strong>{pendingCount} reserva(s) aguardando pagamento hoje.</strong>
          <span>Sem confirmacao manual: cancele apenas se precisar liberar o horario.</span>
        </div>
      ) : null}
      {orderedBookings.length ? (
        <div className="booking-results-summary">
          <span>
            Mostrando {visibleBookings.length} de {orderedBookings.length} reserva(s) de hoje. Pendencias aparecem primeiro.
          </span>
          {shouldLimitTodayRows ? (
            <button className="quiet" type="button" onClick={() => setShowAllTodayBookings(true)}>
              Ver todas
            </button>
          ) : null}
        </div>
      ) : null}
      {visibleBookings.map((booking) => {
        const bookingPayment = getPaymentForBooking(booking.id);
        const whatsappHref = getWhatsappHref(booking);
        return (
          <WorkspaceRow
            key={`booking-today:${booking.id}`}
            title={`${shortTime(booking.startsAt)} - ${booking.courtName || "Quadra"}`}
            detail={`${booking.status === "blocked" ? "Bloqueio operacional" : booking.playerName} | ${bookingStatusLabel(booking.status)}`}
            actions={
              <>
                {canManageBookings && booking.status !== "cancelled" ? (
                  <button className="danger" onClick={() => onUpdateBooking(booking.id, "cancelled")} disabled={busy}>
                    {booking.status === "blocked" ? "Liberar" : "Cancelar"}
                  </button>
                ) : null}
                {booking.status !== "cancelled" && onShareBookingChange ? (
                  <button className="button-like compact whatsapp-action" type="button" onClick={() => onShareBookingChange(booking)} disabled={busy}>
                    Avisar troca
                  </button>
                ) : whatsappHref ? (
                  <a className="button-like compact whatsapp-action" href={whatsappHref} target="_blank" rel="noreferrer">
                    {booking.status === "cancelled" ? "Avisar cancelamento" : "Avisar troca"}
                  </a>
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
      {!bookings.length ? <p className="subtle">Nenhuma reserva hoje. Use Nova reserva ou o Mapa do dia para operar o proximo horario.</p> : null}
    </WorkspaceList>
  );
}
