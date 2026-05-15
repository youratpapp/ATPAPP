import { useMemo, useState } from "react";
import type { CourtBookingWaitlistEntry } from "../../lib/types";
import { WorkspaceList, WorkspaceMetrics, WorkspaceRow } from "./PlaceWorkspaceUi";

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

  return (
    <WorkspaceList>
      <div className="booking-list-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por jogador, telefone ou quadra" />
        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filtrar por data" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CourtBookingWaitlistEntry["status"] | "all")}>
          <option value="all">Todos os status</option>
          <option value="waiting">Aguardando</option>
          <option value="invited">Convidados</option>
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
            }}
          >
            Limpar filtros
          </button>
        ) : null}
      </div>
      {filteredEntries.map((entry) => {
        const promotable = isPromotable(entry);
        return (
          <WorkspaceRow
            key={`booking-waitlist-summary:${entry.id}`}
            title={entry.playerName}
            detail={`${entry.courtName || "Quadra"} | ${new Date(entry.startsAt).toLocaleString("pt-BR")} | ${statusLabel(entry.status)}`}
            actions={
              <>
                {canManageBookings && (entry.status === "waiting" || entry.status === "invited") ? (
                  <button className="primary" onClick={() => onPromoteEntry(entry.id)} disabled={busy || !promotable}>
                    Criar reserva
                  </button>
                ) : null}
                {canManageBookings && entry.status === "waiting" ? (
                  <button onClick={() => onUpdateEntry(entry.id, "invited")} disabled={busy}>
                    Marcar convidado
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
                promotable ? "Horario livre para promover" : "Aguardando vaga",
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
