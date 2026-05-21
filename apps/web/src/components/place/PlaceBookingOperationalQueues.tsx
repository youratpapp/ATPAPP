import type { CourtBooking, CourtBookingWaitlistEntry, TournamentCourtUsageRequest } from "../../lib/types";
import { OperationalQueue } from "./PlaceWorkspaceUi";

type Props = {
  busy: boolean;
  canManageBookings: boolean;
  isWaitlistPromotable: (entry: CourtBookingWaitlistEntry) => boolean;
  onPromoteWaitlistEntry: (entryId: string) => void;
  onOpenReservations?: () => void;
  onOpenWaitlist?: () => void;
  onReviewTournamentCourtRequest: (requestId: string, status: "approved" | "rejected") => void;
  onUpdateBooking: (bookingId: string, status: CourtBooking["status"]) => void;
  onUpdateWaitlistEntry: (entryId: string, status: CourtBookingWaitlistEntry["status"]) => void;
  pendingBookings: CourtBooking[];
  tournamentCourtRequests: TournamentCourtUsageRequest[];
  waitingSinceLabel: (createdAt: string) => string;
  waitlistEntries: CourtBookingWaitlistEntry[];
};

function dateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR");
}

function shortDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  });
}

export function PlaceBookingOperationalQueues({
  busy,
  canManageBookings,
  isWaitlistPromotable,
  onPromoteWaitlistEntry,
  onOpenReservations,
  onOpenWaitlist,
  onReviewTournamentCourtRequest,
  onUpdateBooking,
  onUpdateWaitlistEntry,
  pendingBookings,
  tournamentCourtRequests,
  waitingSinceLabel,
  waitlistEntries,
}: Props) {
  const pendingTournamentCourtRequests = tournamentCourtRequests.filter((request) => request.status === "pending");
  const firstFoldLimit = 3;
  return (
    <>
      {canManageBookings && pendingTournamentCourtRequests.length ? (
        <OperationalQueue title="Quadras solicitadas por torneios" compact>
          {pendingTournamentCourtRequests.slice(0, firstFoldLimit).map((request) => (
            <span key={`tournament-court-request:${request.id}`}>
              <strong>{request.tournamentName}</strong>
              <small>{request.summary || "Uso de quadras solicitado"}</small>
              <em>{request.placeName || "Local"}</em>
              <button className="primary" onClick={() => onReviewTournamentCourtRequest(request.id, "approved")} disabled={busy}>
                Autorizar e bloquear
              </button>
              <button className="danger" onClick={() => onReviewTournamentCourtRequest(request.id, "rejected")} disabled={busy}>
                Recusar
              </button>
            </span>
          ))}
          {pendingTournamentCourtRequests.length > firstFoldLimit ? (
            <span>
              <strong>Mais solicitacoes pendentes</strong>
              <small>{pendingTournamentCourtRequests.length - firstFoldLimit} pedido(s) aguardando decisao.</small>
            </span>
          ) : null}
        </OperationalQueue>
      ) : null}
      {canManageBookings && pendingBookings.length ? (
        <OperationalQueue title="Reservas aguardando confirmacao" compact>
          {pendingBookings.slice(0, firstFoldLimit).map((booking) => (
            <span key={`pending-booking:${booking.id}`}>
              <strong>{booking.courtName || "Quadra"}</strong>
              <small>
                {booking.playerName} - {shortDateTime(booking.startsAt)}
              </small>
              <button onClick={() => onUpdateBooking(booking.id, "confirmed")} disabled={busy}>
                Confirmar
              </button>
              <button className="danger" onClick={() => onUpdateBooking(booking.id, "cancelled")} disabled={busy}>
                Cancelar
              </button>
            </span>
          ))}
          {pendingBookings.length > firstFoldLimit ? (
            <button type="button" onClick={onOpenReservations} disabled={!onOpenReservations}>
              <strong>Ver todas as pendentes</strong>
              <small>Mais {pendingBookings.length - firstFoldLimit} reserva(s) aguardando decisao.</small>
            </button>
          ) : null}
        </OperationalQueue>
      ) : null}
      {canManageBookings && waitlistEntries.length ? (
        <OperationalQueue title="Lista de espera" compact>
          {waitlistEntries.slice(0, firstFoldLimit).map((entry) => {
            const promotable = isWaitlistPromotable(entry);
            return (
              <span key={`waiting-entry:${entry.id}`}>
                <strong>{entry.playerName}</strong>
                <small>
                  {entry.courtName || "Quadra"} - {dateTime(entry.startsAt)}
                </small>
                <em>
                  {waitingSinceLabel(entry.createdAt)} - {promotable ? "horario livre" : "horario ocupado"}
                </em>
                <button
                  className={promotable ? "primary" : undefined}
                  onClick={() => onPromoteWaitlistEntry(entry.id)}
                  disabled={busy || !promotable}
                  title={promotable ? "Criar a reserva neste horario" : "Este horario ainda esta ocupado. Crie a reserva quando a quadra for liberada."}
                >
                  {promotable ? "Criar reserva" : "Horario ocupado"}
                </button>
                <button onClick={() => onUpdateWaitlistEntry(entry.id, "invited")} disabled={busy}>
                  Marcar avisado
                </button>
                <button className="danger" onClick={() => onUpdateWaitlistEntry(entry.id, "cancelled")} disabled={busy}>
                  Remover
                </button>
              </span>
            );
          })}
          {waitlistEntries.length > firstFoldLimit ? (
            <button type="button" onClick={onOpenWaitlist} disabled={!onOpenWaitlist}>
              <strong>Ver lista completa</strong>
              <small>Mais {waitlistEntries.length - firstFoldLimit} jogador(es) na espera.</small>
            </button>
          ) : null}
        </OperationalQueue>
      ) : null}
    </>
  );
}
