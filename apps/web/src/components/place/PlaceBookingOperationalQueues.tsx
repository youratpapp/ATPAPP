import type { CourtBooking, CourtBookingWaitlistEntry } from "../../lib/types";
import { OperationalQueue } from "./PlaceWorkspaceUi";

type Props = {
  busy: boolean;
  canManageBookings: boolean;
  isWaitlistPromotable: (entry: CourtBookingWaitlistEntry) => boolean;
  onPromoteWaitlistEntry: (entryId: string) => void;
  onOpenReservations?: () => void;
  onOpenWaitlist?: () => void;
  onUpdateBooking: (bookingId: string, status: CourtBooking["status"]) => void;
  onUpdateWaitlistEntry: (entryId: string, status: CourtBookingWaitlistEntry["status"]) => void;
  pendingBookings: CourtBooking[];
  waitingSinceLabel: (createdAt: string) => string;
  waitlistEntries: CourtBookingWaitlistEntry[];
};

function dateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR");
}

export function PlaceBookingOperationalQueues({
  busy,
  canManageBookings,
  isWaitlistPromotable,
  onPromoteWaitlistEntry,
  onOpenReservations,
  onOpenWaitlist,
  onUpdateBooking,
  onUpdateWaitlistEntry,
  pendingBookings,
  waitingSinceLabel,
  waitlistEntries,
}: Props) {
  return (
    <>
      {canManageBookings && pendingBookings.length ? (
        <OperationalQueue title="Reservas aguardando confirmacao" compact>
          {pendingBookings.slice(0, 6).map((booking) => (
            <span key={`pending-booking:${booking.id}`}>
              <strong>{booking.courtName || "Quadra"}</strong>
              {booking.playerName} - {dateTime(booking.startsAt)}
              <button onClick={() => onUpdateBooking(booking.id, "confirmed")} disabled={busy}>
                Confirmar
              </button>
              <button className="danger" onClick={() => onUpdateBooking(booking.id, "cancelled")} disabled={busy}>
                Cancelar
              </button>
            </span>
          ))}
          {pendingBookings.length > 6 ? (
            <button type="button" onClick={onOpenReservations} disabled={!onOpenReservations}>
              <strong>Ver todas as pendentes</strong>
              <small>Mais {pendingBookings.length - 6} reserva(s) aguardando decisao.</small>
            </button>
          ) : null}
        </OperationalQueue>
      ) : null}
      {canManageBookings && waitlistEntries.length ? (
        <OperationalQueue title="Lista de espera" compact>
          {waitlistEntries.slice(0, 6).map((entry) => {
            const promotable = isWaitlistPromotable(entry);
            return (
              <span key={`waiting-entry:${entry.id}`}>
                <strong>{entry.playerName}</strong>
                {entry.courtName || "Quadra"} - {dateTime(entry.startsAt)} - {waitingSinceLabel(entry.createdAt)} -{" "}
                {promotable ? "horario livre" : "aguardando vaga"}
                <button className="primary" onClick={() => onPromoteWaitlistEntry(entry.id)} disabled={busy || !promotable}>
                  Criar reserva
                </button>
                <button onClick={() => onUpdateWaitlistEntry(entry.id, "invited")} disabled={busy}>
                  Marcar convidado
                </button>
                <button className="danger" onClick={() => onUpdateWaitlistEntry(entry.id, "cancelled")} disabled={busy}>
                  Remover
                </button>
              </span>
            );
          })}
          {waitlistEntries.length > 6 ? (
            <button type="button" onClick={onOpenWaitlist} disabled={!onOpenWaitlist}>
              <strong>Ver lista completa</strong>
              <small>Mais {waitlistEntries.length - 6} jogador(es) na espera.</small>
            </button>
          ) : null}
        </OperationalQueue>
      ) : null}
    </>
  );
}
