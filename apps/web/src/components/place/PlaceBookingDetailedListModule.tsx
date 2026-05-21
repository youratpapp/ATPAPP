import type { AppPayment, CourtBooking, CourtBookingWaitlistEntry } from "../../lib/types";
import { formatMoneyFromCents } from "../../lib/payments";

type Props = {
  bookings: CourtBooking[];
  busy: boolean;
  canManageBookings: boolean;
  currentUserId: string;
  getPaymentForBooking: (bookingId: string) => AppPayment | undefined;
  getBookingWhatsappHref: (booking: CourtBooking) => string;
  getWaitlistWhatsappHref: (entry: CourtBookingWaitlistEntry, promotable: boolean) => string;
  isWaitlistPromotable: (entry: CourtBookingWaitlistEntry) => boolean;
  onCancelSeries: (bookingId: string) => void;
  onMarkPaid: (booking: CourtBooking, payment: AppPayment) => void;
  onPromoteWaitlistEntry: (entryId: string) => void;
  onShareBookingChange?: (booking: CourtBooking) => void;
  onUpdateBooking: (bookingId: string, status: CourtBooking["status"]) => void;
  onUpdateWaitlistEntry: (entryId: string, status: CourtBookingWaitlistEntry["status"]) => void;
  showReservations: boolean;
  showWaitlist: boolean;
  statusLabel: (status: CourtBookingWaitlistEntry["status"]) => string;
  waitingSinceLabel: (createdAt: string) => string;
  waitlistEntries: CourtBookingWaitlistEntry[];
};

function shortTime(value: string): string {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function dateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR");
}

function bookingStatusLabel(status: CourtBooking["status"]): string {
  if (status === "blocked") return "Bloqueio";
  if (status === "confirmed") return "Confirmada";
  if (status === "pending") return "Aguardando pagamento";
  return "Cancelada";
}

export function PlaceBookingDetailedListModule({
  bookings,
  busy,
  canManageBookings,
  currentUserId,
  getPaymentForBooking,
  getBookingWhatsappHref,
  getWaitlistWhatsappHref,
  isWaitlistPromotable,
  onCancelSeries,
  onMarkPaid,
  onPromoteWaitlistEntry,
  onShareBookingChange,
  onUpdateBooking,
  onUpdateWaitlistEntry,
  showReservations,
  showWaitlist,
  statusLabel,
  waitingSinceLabel,
  waitlistEntries,
}: Props) {
  return (
    <>
      {showReservations ? (
        <div className="place-booking-list">
          {bookings.slice(0, 5).map((booking) => {
            const bookingPayment = getPaymentForBooking(booking.id);
            const whatsappHref = getBookingWhatsappHref(booking);
            return (
              <div key={booking.id} className={`place-booking-row ${booking.status}`}>
                <div>
                  <strong>{booking.courtName || "Quadra"}</strong>
                  <span>
                    {dateTime(booking.startsAt)} - {shortTime(booking.endsAt)}
                  </span>
                  <small>
                    {booking.playerName} | {bookingStatusLabel(booking.status)}
                  </small>
                  {booking.recurrenceTotal > 1 ? (
                    <small>
                      Serie {booking.recurrenceIndex}/{booking.recurrenceTotal}
                    </small>
                  ) : null}
                  {bookingPayment?.status === "paid" ? (
                    <small className="payment-paid-label">Pago</small>
                  ) : bookingPayment?.status === "pending" ? (
                    <small>Pagamento pendente: {formatMoneyFromCents(bookingPayment.amountCents)}</small>
                  ) : null}
                </div>
                {canManageBookings ? (
                  <span>
                    {booking.status !== "cancelled" ? (
                      <button className="danger" onClick={() => onUpdateBooking(booking.id, "cancelled")} disabled={busy}>
                        {booking.status === "blocked" ? "Liberar" : "Cancelar"}
                      </button>
                    ) : null}
                    {bookingPayment?.status === "pending" ? (
                      <button onClick={() => onMarkPaid(booking, bookingPayment)} disabled={busy}>
                        Marcar pago
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
                    {booking.status !== "cancelled" && booking.recurrenceGroupId ? (
                      <button className="danger" onClick={() => onCancelSeries(booking.id)} disabled={busy}>
                        Cancelar serie
                      </button>
                    ) : null}
                  </span>
                ) : booking.userId === currentUserId && booking.status !== "cancelled" ? (
                  <span>
                    {bookingPayment?.status === "paid" ? <small className="payment-paid-label">Pago</small> : <small>Pagamento sera confirmado pela plataforma</small>}
                    <button className="danger" onClick={() => onUpdateBooking(booking.id, "cancelled")} disabled={busy}>
                      Cancelar
                    </button>
                    {booking.recurrenceGroupId ? (
                      <button className="danger" onClick={() => onCancelSeries(booking.id)} disabled={busy}>
                        Cancelar serie
                      </button>
                    ) : null}
                  </span>
                ) : null}
              </div>
            );
          })}
          {!bookings.length ? <p className="subtle">Sem reservas recentes.</p> : null}
        </div>
      ) : null}
      {showWaitlist && waitlistEntries.length ? (
        <div className="place-booking-list">
          <strong>Lista de espera</strong>
          {waitlistEntries.slice(0, 5).map((entry) => {
            const promotable = isWaitlistPromotable(entry);
            const whatsappHref = getWaitlistWhatsappHref(entry, promotable);
            return (
              <div key={entry.id} className={`place-booking-row ${entry.status}`}>
                <div>
                  <strong>{entry.courtName || "Quadra"}</strong>
                  <span>
                    {dateTime(entry.startsAt)} - {shortTime(entry.endsAt)}
                  </span>
                  <small>
                    {entry.playerName} | {statusLabel(entry.status)} | {waitingSinceLabel(entry.createdAt)}
                  </small>
                  <small>{promotable ? "Horario livre para reserva" : "Horario ocupado"}</small>
                </div>
                {canManageBookings ? (
                  <span>
                    {entry.status === "waiting" || entry.status === "invited" ? (
                      <button
                        className={promotable ? "primary" : undefined}
                        onClick={() => onPromoteWaitlistEntry(entry.id)}
                        disabled={busy || !promotable}
                        title={promotable ? "Criar a reserva neste horario" : "Este horario ainda esta ocupado. Crie a reserva quando a quadra for liberada."}
                      >
                        {promotable ? "Criar reserva" : "Horario ocupado"}
                      </button>
                    ) : null}
                    {entry.status === "waiting" ? (
                      <button onClick={() => onUpdateWaitlistEntry(entry.id, "invited")} disabled={busy}>
                        Marcar avisado
                      </button>
                    ) : null}
                    {!promotable && whatsappHref ? (
                      <a className="button-like compact whatsapp-action" href={whatsappHref} target="_blank" rel="noreferrer">
                        WhatsApp opcoes
                      </a>
                    ) : null}
                    <button className="danger" onClick={() => onUpdateWaitlistEntry(entry.id, "cancelled")} disabled={busy}>
                      Remover
                    </button>
                  </span>
                ) : entry.userId === currentUserId && entry.status !== "cancelled" ? (
                  <button className="danger" onClick={() => onUpdateWaitlistEntry(entry.id, "cancelled")} disabled={busy}>
                    Sair da espera
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
