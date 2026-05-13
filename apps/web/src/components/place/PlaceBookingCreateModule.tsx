import type { AvailableCourt, PlaceCourt } from "../../lib/types";
import { formatMoneyFromCents } from "../../lib/payments";

export type PlaceBookingDraft = {
  courtId: string;
  endsAt: string;
  notes: string;
  repeatWeeks: string;
  startsAt: string;
};

type Props = {
  activeCourts: PlaceCourt[];
  availableCourts: AvailableCourt[];
  busy: boolean;
  canManageBookings: boolean;
  draft: PlaceBookingDraft;
  onBlock: () => void;
  onChangeDraft: (draft: PlaceBookingDraft) => void;
  onJoinWaitlist: () => void;
  onReserve: () => void;
  onSearch: () => void;
  selectedCourtPrice: number | null;
};

function isAvailableCourt(court: PlaceCourt | AvailableCourt): court is AvailableCourt {
  return "effectiveFeeCents" in court;
}

export function PlaceBookingCreateModule({
  activeCourts,
  availableCourts,
  busy,
  canManageBookings,
  draft,
  onBlock,
  onChangeDraft,
  onJoinWaitlist,
  onReserve,
  onSearch,
  selectedCourtPrice,
}: Props) {
  const hasRequiredFields = Boolean(draft.courtId && draft.startsAt && draft.endsAt);
  const courts = availableCourts.length ? availableCourts : activeCourts;

  return (
    <>
      {activeCourts.length ? (
        <div className="place-booking-form place-booking-flow">
          <div className="place-booking-primary-fields">
            <label>
              Quadra
              <select value={draft.courtId || activeCourts[0]?.id || ""} onChange={(event) => onChangeDraft({ ...draft, courtId: event.target.value })}>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                    {isAvailableCourt(court) ? ` - ${formatMoneyFromCents(court.effectiveFeeCents)}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Inicio
              <input type="datetime-local" value={draft.startsAt} onChange={(event) => onChangeDraft({ ...draft, startsAt: event.target.value })} />
            </label>
            <label>
              Fim
              <input type="datetime-local" value={draft.endsAt} onChange={(event) => onChangeDraft({ ...draft, endsAt: event.target.value })} />
            </label>
          </div>

          <div className="place-booking-main-actions">
            <button className="secondary" onClick={onSearch} disabled={busy || !draft.startsAt || !draft.endsAt}>
              Buscar
            </button>
            <button className="primary" onClick={onReserve} disabled={busy || !hasRequiredFields}>
              Reservar {selectedCourtPrice ? formatMoneyFromCents(selectedCourtPrice) : ""}
            </button>
          </div>

          <details className="place-booking-advanced">
            <summary>Opcoes avancadas</summary>
            <div className="place-booking-advanced-grid">
              <label>
                Observacao
                <input value={draft.notes} onChange={(event) => onChangeDraft({ ...draft, notes: event.target.value })} placeholder="Ex.: 4 jogadores, aula avulsa" />
              </label>
              <label>
                Repetir por semanas
                <input
                  type="number"
                  min={1}
                  max={26}
                  value={draft.repeatWeeks}
                  onChange={(event) => onChangeDraft({ ...draft, repeatWeeks: event.target.value })}
                  title="Repetir por semanas"
                  aria-label="Repetir por semanas"
                />
              </label>
            </div>
            <div className="place-booking-secondary-actions">
              {canManageBookings ? (
                <button className="quiet" onClick={onBlock} disabled={busy || !hasRequiredFields}>
                  Bloquear horario
                </button>
              ) : null}
              <button className="quiet" onClick={onJoinWaitlist} disabled={busy || !hasRequiredFields}>
                Entrar na espera
              </button>
            </div>
          </details>
        </div>
      ) : null}
      {availableCourts.length ? (
        <div className="place-court-list">
          {availableCourts.map((court) => (
            <button
              key={`available-court:${court.id}`}
              className={draft.courtId === court.id ? "secondary" : "quiet"}
              onClick={() => onChangeDraft({ ...draft, courtId: court.id })}
              disabled={busy}
            >
              {court.name} | {formatMoneyFromCents(court.effectiveFeeCents)}
              {court.isMemberPrice ? " mensalista" : ""}
              {court.ruleName ? ` | ${court.ruleName}` : ""}
              {court.requiresApproval ? " | aprovar" : " | auto"}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
