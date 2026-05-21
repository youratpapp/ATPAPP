import { useMemo, useState } from "react";
import type { AppPayment, CourtBooking, PlaceCourt } from "../../lib/types";
import { WorkspaceList, WorkspaceMetrics, WorkspaceRow } from "./PlaceWorkspaceUi";

const DEFAULT_VISIBLE_ROWS = 24;

type Props = {
  activeCourts: PlaceCourt[];
  bookings: CourtBooking[];
  busy: boolean;
  canManageBookings: boolean;
  getPaymentForBooking: (bookingId: string) => AppPayment | undefined;
  getWhatsappHref: (booking: CourtBooking) => string;
  onMarkPaid?: (booking: CourtBooking, payment: AppPayment) => void;
  onShareBookingChange?: (booking: CourtBooking) => void;
  onUpdateBooking: (bookingId: string, status: CourtBooking["status"]) => void;
  onUpdateBookingDetails?: (
    booking: CourtBooking,
    patch: { courtId: string; endsAt: string; notes?: string; startsAt: string }
  ) => void;
};

function bookingStatusLabel(status: CourtBooking["status"]): string {
  if (status === "blocked") return "Bloqueio";
  if (status === "confirmed") return "Confirmada";
  if (status === "pending") return "Aguardando pagamento";
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

function dateTimeLocalValue(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

type EditDraft = {
  courtId: string;
  endsAt: string;
  notes: string;
  startsAt: string;
};

export function PlaceBookingReservationsModule({
  activeCourts,
  bookings,
  busy,
  canManageBookings,
  getPaymentForBooking,
  getWhatsappHref,
  onMarkPaid,
  onShareBookingChange,
  onUpdateBooking,
  onUpdateBookingDetails,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<CourtBooking["status"] | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState("");
  const [editDraft, setEditDraft] = useState<EditDraft>({ courtId: "", endsAt: "", notes: "", startsAt: "" });
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
  const shouldLimitRows = !hasFilters && !showAll && filteredBookings.length > DEFAULT_VISIBLE_ROWS;
  const visibleBookings = shouldLimitRows ? filteredBookings.slice(0, DEFAULT_VISIBLE_ROWS) : filteredBookings;
  const startEditing = (booking: CourtBooking) => {
    setEditingBookingId(booking.id);
    setEditDraft({
      courtId: booking.courtId,
      startsAt: dateTimeLocalValue(booking.startsAt),
      endsAt: dateTimeLocalValue(booking.endsAt),
      notes: booking.notes || "",
    });
  };
  const submitEdit = (booking: CourtBooking) => {
    if (!editDraft.courtId || !editDraft.startsAt || !editDraft.endsAt) return;
    const startsAt = new Date(editDraft.startsAt).toISOString();
    const endsAt = new Date(editDraft.endsAt).toISOString();
    onUpdateBookingDetails?.(booking, {
      courtId: editDraft.courtId,
      startsAt,
      endsAt,
      notes: editDraft.notes,
    });
    setEditingBookingId("");
  };

  return (
    <WorkspaceList>
      <div className="booking-list-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por jogador, telefone ou quadra" />
        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filtrar por data" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CourtBooking["status"] | "all")}>
          <option value="all">Todos os status</option>
          <option value="pending">Aguardando pagamento</option>
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
              setShowAll(false);
            }}
          >
            Limpar filtros
          </button>
        ) : null}
      </div>
      {filteredBookings.length ? (
        <div className="booking-results-summary">
          <span>
            Mostrando {visibleBookings.length} de {filteredBookings.length} reserva(s). {hasFilters ? "Filtros aplicados." : "Use filtros para reduzir a lista."}
          </span>
          {shouldLimitRows ? (
            <button className="quiet" type="button" onClick={() => setShowAll(true)}>
              Ver todas
            </button>
          ) : null}
        </div>
      ) : null}
      {visibleBookings.map((booking) => {
        const payment = getPaymentForBooking(booking.id);
        const whatsappHref = getWhatsappHref(booking);
        const isEditing = editingBookingId === booking.id;
        return (
          <WorkspaceRow
            key={`booking-summary:${booking.id}`}
            title={booking.courtName || "Quadra"}
            detail={`${booking.playerName} | ${new Date(booking.startsAt).toLocaleString("pt-BR")} | ${bookingStatusLabel(booking.status)}`}
            actions={
              <>
                {canManageBookings && booking.status !== "cancelled" ? (
                  <button className="danger" onClick={() => onUpdateBooking(booking.id, "cancelled")} disabled={busy}>
                    {booking.status === "blocked" ? "Liberar" : "Cancelar"}
                  </button>
                ) : null}
                {canManageBookings && booking.status !== "cancelled" && onUpdateBookingDetails ? (
                  <button type="button" onClick={() => (isEditing ? setEditingBookingId("") : startEditing(booking))} disabled={busy}>
                    {isEditing ? "Fechar edicao" : "Editar"}
                  </button>
                ) : null}
                {canManageBookings && payment?.status === "pending" && onMarkPaid ? (
                  <button type="button" onClick={() => onMarkPaid(booking, payment)} disabled={busy}>
                    Pagar
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
                paymentStatusLabel(payment),
                booking.recurrenceTotal > 1 ? `Serie ${booking.recurrenceIndex}/${booking.recurrenceTotal}` : "",
                booking.phone ? `Contato ${booking.phone}` : "Sem telefone",
                booking.notes || "",
              ].filter(Boolean)}
            />
            {isEditing ? (
              <div className="booking-edit-panel">
                <label>
                  Quadra
                  <select value={editDraft.courtId} onChange={(event) => setEditDraft((prev) => ({ ...prev, courtId: event.target.value }))}>
                    {activeCourts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Inicio
                  <input type="datetime-local" value={editDraft.startsAt} onChange={(event) => setEditDraft((prev) => ({ ...prev, startsAt: event.target.value }))} />
                </label>
                <label>
                  Fim
                  <input type="datetime-local" value={editDraft.endsAt} onChange={(event) => setEditDraft((prev) => ({ ...prev, endsAt: event.target.value }))} />
                </label>
                <label className="booking-edit-panel-wide">
                  Observacao
                  <input value={editDraft.notes} onChange={(event) => setEditDraft((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Ex.: reagendada por contato da secretaria" />
                </label>
                <div className="booking-edit-actions">
                  <button type="button" onClick={() => setEditingBookingId("")} disabled={busy}>
                    Cancelar edicao
                  </button>
                  <button className="primary" type="button" onClick={() => submitEdit(booking)} disabled={busy || !editDraft.courtId || !editDraft.startsAt || !editDraft.endsAt}>
                    Salvar alteracao
                  </button>
                </div>
              </div>
            ) : null}
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
