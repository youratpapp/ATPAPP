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
  return (
    <WorkspaceList>
      {entries.slice(0, 10).map((entry) => {
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
                    Convidar
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
    </WorkspaceList>
  );
}
