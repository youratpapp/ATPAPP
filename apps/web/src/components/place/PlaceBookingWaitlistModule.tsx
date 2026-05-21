import { useMemo, useState } from "react";
import type { CourtBookingWaitlistEntry } from "../../lib/types";
import { WorkspaceList, WorkspaceMetrics, WorkspaceRow } from "./PlaceWorkspaceUi";

const DEFAULT_VISIBLE_ROWS = 24;

type Props = {
  busy: boolean;
  canManageBookings: boolean;
  entries: CourtBookingWaitlistEntry[];
  isPromotable: (entry: CourtBookingWaitlistEntry) => boolean;
  onPromoteEntry: (entryId: string) => void;
  onUpdateEntry: (entryId: string, status: CourtBookingWaitlistEntry["status"]) => void;
  statusLabel: (status: CourtBookingWaitlistEntry["status"]) => string;
  waitingSinceLabel: (createdAt: string) => string;
};

function dateInputValue(value: string): string {
  return value ? value.slice(0, 10) : "";
}

export function PlaceBookingWaitlistModule({
  busy,
  canManageBookings,
  entries,
  isPromotable,
  onPromoteEntry,
  onUpdateEntry,
  statusLabel,
  waitingSinceLabel,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<CourtBookingWaitlistEntry["status"] | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const hasFilters = statusFilter !== "all" || Boolean(dateFilter) || Boolean(normalizedQuery);
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (statusFilter !== "all" && entry.status !== statusFilter) return false;
      if (dateFilter && dateInputValue(entry.startsAt) !== dateFilter) return false;
      if (
        normalizedQuery &&
        ![entry.playerName, entry.courtName, entry.phone, entry.notes].some((value) => value?.toLowerCase().includes(normalizedQuery))
      ) {
        return false;
      }
      return true;
    });
  }, [dateFilter, entries, normalizedQuery, statusFilter]);
  const shouldLimitRows = !hasFilters && !showAll && filteredEntries.length > DEFAULT_VISIBLE_ROWS;
  const visibleEntries = shouldLimitRows ? filteredEntries.slice(0, DEFAULT_VISIBLE_ROWS) : filteredEntries;

  return (
    <WorkspaceList>
      <div className="booking-list-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por jogador, telefone ou quadra" />
        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filtrar por data" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CourtBookingWaitlistEntry["status"] | "all")}>
          <option value="all">Todos os status</option>
          <option value="waiting">Aguardando</option>
          <option value="invited">Avisados</option>
          <option value="booked">Convertidos</option>
          <option value="cancelled">Cancelados</option>
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
      {filteredEntries.length ? (
        <div className="booking-results-summary">
          <span>
            Mostrando {visibleEntries.length} de {filteredEntries.length} item(ns) da espera. {hasFilters ? "Filtros aplicados." : "Use filtros para reduzir a lista."}
          </span>
          {shouldLimitRows ? (
            <button className="quiet" type="button" onClick={() => setShowAll(true)}>
              Ver lista completa
            </button>
          ) : null}
        </div>
      ) : null}
      {visibleEntries.map((entry) => {
        const promotable = isPromotable(entry);
        return (
          <WorkspaceRow
            key={`booking-waitlist-summary:${entry.id}`}
            title={entry.playerName}
            detail={`${entry.courtName || "Quadra"} | ${new Date(entry.startsAt).toLocaleString("pt-BR")} | ${statusLabel(entry.status)}`}
            actions={
              <>
                {canManageBookings && (entry.status === "waiting" || entry.status === "invited") ? (
                  <button
                    className={promotable ? "primary" : undefined}
                    onClick={() => onPromoteEntry(entry.id)}
                    disabled={busy || !promotable}
                    title={promotable ? "Criar a reserva neste horario" : "Este horario ainda esta ocupado. Crie a reserva quando a quadra for liberada."}
                  >
                    {promotable ? "Criar reserva" : "Horario ocupado"}
                  </button>
                ) : null}
                {canManageBookings && entry.status === "waiting" ? (
                  <button onClick={() => onUpdateEntry(entry.id, "invited")} disabled={busy}>
                    Marcar avisado
                  </button>
                ) : null}
                {canManageBookings && entry.status !== "cancelled" && entry.status !== "booked" ? (
                  <button className="danger" onClick={() => onUpdateEntry(entry.id, "cancelled")} disabled={busy}>
                    Remover
                  </button>
                ) : null}
              </>
            }
          >
            <WorkspaceMetrics
              items={[
                promotable ? "Horario livre para reserva" : "Horario ocupado",
                waitingSinceLabel(entry.createdAt),
                entry.phone ? `Contato ${entry.phone}` : "Sem telefone",
                entry.notes || "Sem observacao",
              ]}
            />
          </WorkspaceRow>
        );
      })}
      {!entries.length ? <p className="subtle">Ninguem aguardando horario.</p> : null}
      {entries.length && !filteredEntries.length ? (
        <p className="subtle">{hasFilters ? "Nenhum item de espera encontrado para estes filtros. Limpe filtros ou ajuste a busca." : "Ninguem aguardando horario."}</p>
      ) : null}
    </WorkspaceList>
  );
}
