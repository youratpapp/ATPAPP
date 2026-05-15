import { useMemo, useState } from "react";
import type { AppPayment, CourtBooking } from "../../lib/types";
import { WorkspaceList, WorkspaceMetrics, WorkspaceRow } from "./PlaceWorkspaceUi";

type Props = {
  bookings: CourtBooking[];
  busy: boolean;
  canManageBookings: boolean;
  getPaymentForBooking: (bookingId: string) => AppPayment | undefined;
  onUpdateBooking: (bookingId: string, status: CourtBooking["status"]) => void;
};

function bookingStatusLabel(status: CourtBooking["status"]): string {
  if (status === "blocked") return "Bloqueio";
  if (status === "confirmed") return "Confirmada";
  if (status === "pending") return "Pendente";
  return "Cancelada";
}

function paymentStatusLabel(payment?: AppPayment): string {
  if (payment?.status === "paid") return "Pago";
  if (payment?.status === "pending") return "Pagamento pendente";
  if (payment?.status === "failed") return "Pagamento falhou";
  if (payment?.status === "refunded") return "Estornado";
  return "Sem pagamento";
}

function dateInputValue(value: string): string {
  return value ? value.slice(0, 10) : "";
}

export function PlaceBookingReservationsModule({ bookings, busy, canManageBookings, getPaymentForBooking, onUpdateBooking }: Props) {
  const [statusFilter, setStatusFilter] = useState<CourtBooking["status"] | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const hasFilters = statusFilter !== "all" || Boolean(dateFilter) || Boolean(normalizedQuery);
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (statusFilter !== "all" && booking.status !== statusFilter) return false;
      if (dateFilter && dateInputValue(booking.startsAt) !== dateFilter) return false;
      if (
        normalizedQuery &&
        ![booking.playerName, booking.courtName, booking.phone, booking.notes].some((value) => value?.toLowerCase().includes(normalizedQuery))
      ) {
        return false;
      }
      return true;
    });
  }, [bookings, dateFilter, normalizedQuery, statusFilter]);

  return (
    <WorkspaceList>
      <div className="booking-list-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por jogador, telefone ou quadra" />
        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filtrar por data" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CourtBooking["status"] | "all")}>
          <option value="all">Todos os status</option>
          <option value="pending">Pendentes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="blocked">Bloqueios</option>
          <option value="cancelled">Canceladas</option>
        </select>
        {hasFilters ? (
          <button
            className="quiet"
            type="button"
            onClick={() => {
              setQuery("");
              setDateFilter("");
              setStatusFilter("all");
            }}
          >
            Limpar filtros
          </button>
        ) : null}
      </div>
      {filteredBookings.map((booking) => {
        const payment = getPaymentForBooking(booking.id);
        return (
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
          >
            <WorkspaceMetrics
              items={[
                paymentStatusLabel(payment),
                booking.recurrenceTotal > 1 ? `Serie ${booking.recurrenceIndex}/${booking.recurrenceTotal}` : "",
                booking.phone ? `Contato ${booking.phone}` : "Sem telefone",
                booking.notes || "",
              ].filter(Boolean)}
            />
          </WorkspaceRow>
        );
      })}
      {!bookings.length ? <p className="subtle">Sem reservas cadastradas ainda.</p> : null}
      {bookings.length && !filteredBookings.length ? (
        <p className="subtle">{hasFilters ? "Nenhuma reserva encontrada para estes filtros. Limpe filtros ou ajuste a busca." : "Sem reservas recentes."}</p>
      ) : null}
    </WorkspaceList>
  );
}
