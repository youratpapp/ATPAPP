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
  availabilityFeedback?: { kind: "info" | "error" | "success"; text: string } | null;
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

const TIME_OPTIONS = Array.from({ length: 35 }, (_, index) => {
  const minutes = 6 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

const DURATION_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "1h30", value: 90 },
  { label: "2h", value: 120 },
];

function isAvailableCourt(court: PlaceCourt | AvailableCourt): court is AvailableCourt {
  return "effectiveFeeCents" in court;
}

function datePart(value: string): string {
  return value ? value.slice(0, 10) : "";
}

function timePart(value: string): string {
  return value ? value.slice(11, 16) : "18:00";
}

function combineDateAndTime(date: string, time: string): string {
  if (!date || !time) return "";
  return `${date}T${time}`;
}

function addMinutes(value: string, minutes: number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() + minutes);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function durationFromDraft(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (!startsAt || !endsAt || Number.isNaN(start) || Number.isNaN(end) || end <= start) return 60;
  const minutes = Math.round((end - start) / 60000);
  return DURATION_OPTIONS.some((option) => option.value === minutes) ? minutes : 60;
}

export function PlaceBookingCreateModule({
  activeCourts,
  availabilityFeedback,
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
  const selectedCourtIsAvailable = availableCourts.some((court) => court.id === draft.courtId);
  const canReserve = hasRequiredFields && selectedCourtIsAvailable;
  const selectedDate = datePart(draft.startsAt);
  const selectedTime = timePart(draft.startsAt);
  const selectedDuration = durationFromDraft(draft.startsAt, draft.endsAt);

  const updateStart = (date: string, time: string, duration = selectedDuration) => {
    const nextStart = combineDateAndTime(date, time);
    onChangeDraft({ ...draft, startsAt: nextStart, endsAt: nextStart ? addMinutes(nextStart, duration) : "" });
  };

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
              Data
              <input type="date" value={selectedDate} onChange={(event) => updateStart(event.target.value, selectedTime)} />
            </label>
            <label>
              Horario
              <select value={selectedTime} onChange={(event) => updateStart(selectedDate, event.target.value)}>
                {TIME_OPTIONS.map((time) => (
                  <option key={`booking-time:${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Duracao
              <select
                value={selectedDuration}
                onChange={(event) => {
                  const duration = Number(event.target.value) || 60;
                  const nextStart = draft.startsAt || combineDateAndTime(selectedDate, selectedTime);
                  onChangeDraft({ ...draft, startsAt: nextStart, endsAt: nextStart ? addMinutes(nextStart, duration) : "" });
                }}
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={`booking-duration:${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            className={[
              "booking-availability-status",
              availabilityFeedback?.kind === "error" ? "error" : availableCourts.length || availabilityFeedback?.kind === "success" ? "success" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {availabilityFeedback ? (
              <span>{availabilityFeedback.text}</span>
            ) : availableCourts.length ? (
              <span>
                {availableCourts.length} quadra(s) livre(s) para o horario. Escolha uma delas e confirme a reserva.
              </span>
            ) : hasRequiredFields ? (
              <span>Busque disponibilidade antes de reservar. Se estiver cheio, use a espera ou ajuste horario/duracao.</span>
            ) : (
              <span>Escolha quadra, data, horario e duracao para buscar disponibilidade real.</span>
            )}
          </div>

          <div className="place-booking-main-actions">
            <button className="secondary" onClick={onSearch} disabled={busy || !draft.startsAt || !draft.endsAt}>
              Buscar
            </button>
            <button className="primary" onClick={onReserve} disabled={busy || !canReserve}>
              {canReserve ? `Reservar ${selectedCourtPrice ? formatMoneyFromCents(selectedCourtPrice) : ""}` : "Reservar apos buscar"}
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
              <button className="quiet" onClick={onJoinWaitlist} disabled={busy || !hasRequiredFields || Boolean(availableCourts.length)}>
                Entrar na espera
              </button>
            </div>
          </details>
        </div>
      ) : null}
      {availableCourts.length ? (
        <div className="available-court-choice-list">
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
