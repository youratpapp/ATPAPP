import { useMemo, useState } from "react";
import type { AcademyClass, AcademyCoach, AcademySlot, PlaceCourt } from "../../lib/types";

export type PlaceAcademyCoachDraft = {
  email: string;
  name: string;
  phone: string;
};

export type PlaceAcademyClassDraftPatch = {
  capacity: string;
  coachId: string;
  coachName: string;
  courtId: string;
  endsAt: string;
  slotId: string;
  startsAt: string;
  weekday: number;
};

export type PlaceAcademySlotDraft = {
  capacity: string;
  coachId: string;
  courtId: string;
  endsAt: string;
  notes: string;
  startsAt: string;
  weekday: number;
};

type ResourceMode = "court" | "coach";

type ResourceEvent = {
  id: string;
  coachId: string | null;
  courtId: string | null;
  capacity: number;
  endsAt: string;
  status: AcademySlot["status"] | "class";
  startsAt: string;
  subtitle: string;
  title: string;
  type: "class" | "slot";
  source?: AcademySlot;
};

type Props = {
  activeCourts: PlaceCourt[];
  busy: boolean;
  classes: AcademyClass[];
  coaches: AcademyCoach[];
  onChangeAcademyDraftFromSlot: (patch: PlaceAcademyClassDraftPatch) => void;
  onCreateSlot: (draft: PlaceAcademySlotDraft, status: AcademySlot["status"]) => void;
  onUpdateSlotStatus: (slot: AcademySlot, status: AcademySlot["status"]) => void;
  slots: AcademySlot[];
  weekdayLabels: string[];
};

function todayInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function weekdayFromDate(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date().getDay();
  return new Date(year, month - 1, day).getDay();
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function timeRangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA);
}

function createDefaultSlotDraft(weekday: number, coaches: AcademyCoach[], courts: PlaceCourt[]): PlaceAcademySlotDraft {
  return {
    capacity: "8",
    coachId: coaches[0]?.id || "",
    courtId: courts[0]?.id || "",
    endsAt: "19:00",
    notes: "",
    startsAt: "18:00",
    weekday,
  };
}

function eventTime(event: ResourceEvent): string {
  return `${event.startsAt.slice(0, 5)}-${event.endsAt.slice(0, 5)}`;
}

export function PlaceAcademyResourcesModule({
  activeCourts,
  busy,
  classes,
  coaches,
  onChangeAcademyDraftFromSlot,
  onCreateSlot,
  onUpdateSlotStatus,
  slots,
  weekdayLabels,
}: Props) {
  const [selectedDate, setSelectedDate] = useState(todayInputValue());
  const selectedWeekday = weekdayFromDate(selectedDate);
  const [mode, setMode] = useState<ResourceMode>("court");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [slotDraft, setSlotDraft] = useState<PlaceAcademySlotDraft>(() => createDefaultSlotDraft(selectedWeekday, coaches, activeCourts));

  const resourceEvents = useMemo<ResourceEvent[]>(() => {
    const classEvents = classes
      .filter((item) => item.isActive && item.weekday === selectedWeekday)
      .map<ResourceEvent>((item) => ({
        id: item.id,
        coachId: item.coachId || null,
        courtId: item.courtId || null,
        capacity: item.capacity,
        endsAt: item.endsAt,
        status: "class",
        startsAt: item.startsAt,
        subtitle: [coaches.find((coach) => coach.id === item.coachId)?.name, activeCourts.find((court) => court.id === item.courtId)?.name, `${item.capacity} vagas`]
          .filter(Boolean)
          .join(" / "),
        title: item.title,
        type: "class",
      }));
    const slotEvents = slots
      .filter((item) => item.weekday === selectedWeekday)
      .map<ResourceEvent>((item) => ({
        id: item.id,
        coachId: item.coachId || null,
        courtId: item.courtId || null,
        capacity: item.capacity,
        endsAt: item.endsAt,
        status: item.status,
        startsAt: item.startsAt,
        subtitle: [coaches.find((coach) => coach.id === item.coachId)?.name, activeCourts.find((court) => court.id === item.courtId)?.name, `${item.capacity} vagas`]
          .filter(Boolean)
          .join(" / "),
        title: item.status === "blocked" ? "Bloqueio semanal" : item.status === "assigned" ? "Janela convertida" : "Janela semanal aberta",
        type: "slot",
        source: item,
      }));
    return [...classEvents, ...slotEvents].sort((a, b) => toMinutes(a.startsAt) - toMinutes(b.startsAt));
  }, [activeCourts, classes, coaches, selectedWeekday, slots]);

  const groups = mode === "court" ? activeCourts.map((court) => ({ id: court.id, label: court.name })) : coaches.map((coach) => ({ id: coach.id, label: coach.name }));
  const filteredGroups = resourceFilter === "all" ? groups : groups.filter((group) => group.id === resourceFilter);
  const openSlots = resourceEvents.filter((event) => event.type === "slot" && event.status === "open").length;
  const blockedSlots = resourceEvents.filter((event) => event.type === "slot" && event.status === "blocked").length;
  const classCount = resourceEvents.filter((event) => event.type === "class").length;

  const handleDateChange = (value: string) => {
    const weekday = weekdayFromDate(value);
    setSelectedDate(value);
    setSlotDraft((prev) => ({ ...prev, weekday }));
  };

  const handleModeChange = (nextMode: ResourceMode) => {
    setMode(nextMode);
    setResourceFilter("all");
  };

  const handleCreateSlot = (status: AcademySlot["status"]) => {
    onCreateSlot({ ...slotDraft, weekday: selectedWeekday }, status);
  };

  return (
    <section className="academy-resource-workspace">
      <div className="academy-resource-toolbar">
        <div>
          <span>Escala semanal</span>
          <strong>{weekdayLabels[selectedWeekday] || "Dia"}</strong>
          <small>Janelas recorrentes por dia da semana</small>
        </div>
        <label>
          <span>Data de referencia</span>
          <input type="date" value={selectedDate} onChange={(event) => handleDateChange(event.target.value)} />
        </label>
        <label>
          <span>Visao</span>
          <select value={mode} onChange={(event) => handleModeChange(event.target.value as ResourceMode)}>
            <option value="court">Por quadra</option>
            <option value="coach">Por professor</option>
          </select>
        </label>
        <label>
          <span>{mode === "court" ? "Quadra" : "Professor"}</span>
          <select value={resourceFilter} onChange={(event) => setResourceFilter(event.target.value)}>
            <option value="all">Todos</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </select>
        </label>
        <span>
          Semana: {classCount} turmas | {openSlots} janelas | {blockedSlots} bloqueios
        </span>
      </div>

      <div className="academy-resource-create">
        <header>
          <div>
            <strong>Criar janela semanal</strong>
            <span>Defina disponibilidade recorrente para professor ou quadra. Para reserva pontual, use Agenda.</span>
          </div>
        </header>
        <label>
          <span>Professor</span>
          <select value={slotDraft.coachId} onChange={(event) => setSlotDraft((prev) => ({ ...prev, coachId: event.target.value }))}>
            <option value="">Sem professor</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Quadra</span>
          <select value={slotDraft.courtId} onChange={(event) => setSlotDraft((prev) => ({ ...prev, courtId: event.target.value }))}>
            <option value="">Sem quadra</option>
            {activeCourts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Inicio</span>
          <input type="time" step="900" value={slotDraft.startsAt} onChange={(event) => setSlotDraft((prev) => ({ ...prev, startsAt: event.target.value }))} />
        </label>
        <label>
          <span>Fim</span>
          <input type="time" step="900" value={slotDraft.endsAt} onChange={(event) => setSlotDraft((prev) => ({ ...prev, endsAt: event.target.value }))} />
        </label>
        <label>
          <span>Vagas</span>
          <input inputMode="numeric" value={slotDraft.capacity} onChange={(event) => setSlotDraft((prev) => ({ ...prev, capacity: event.target.value }))} />
        </label>
        <label className="wide">
          <span>Nota</span>
          <input value={slotDraft.notes} onChange={(event) => setSlotDraft((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Ex.: janela para novas turmas" />
        </label>
        <button type="button" onClick={() => handleCreateSlot("open")} disabled={busy || (!slotDraft.coachId && !slotDraft.courtId)}>
          Criar janela semanal
        </button>
        <button type="button" className="secondary" onClick={() => handleCreateSlot("blocked")} disabled={busy || (!slotDraft.coachId && !slotDraft.courtId)}>
          Bloqueio semanal
        </button>
      </div>

      <div className="academy-resource-groups">
        {filteredGroups.length ? (
          filteredGroups.map((group) => {
            const groupEvents = resourceEvents.filter((event) => (mode === "court" ? event.courtId === group.id : event.coachId === group.id));
            const conflictIds = new Set<string>();
            for (let index = 0; index < groupEvents.length; index += 1) {
              for (let otherIndex = index + 1; otherIndex < groupEvents.length; otherIndex += 1) {
                if (timeRangesOverlap(groupEvents[index].startsAt, groupEvents[index].endsAt, groupEvents[otherIndex].startsAt, groupEvents[otherIndex].endsAt)) {
                  conflictIds.add(groupEvents[index].id);
                  conflictIds.add(groupEvents[otherIndex].id);
                }
              }
            }
            return (
              <article className="academy-resource-group" key={group.id}>
                <header>
                  <div>
                    <strong>{group.label}</strong>
                    <span>{groupEvents.length ? `${groupEvents.length} itens na escala semanal` : "Sem janela neste dia da semana"}</span>
                  </div>
                  {conflictIds.size ? <b>{conflictIds.size} conflitos</b> : <span>Sem conflito</span>}
                </header>
                {groupEvents.length ? (
                  groupEvents.map((event) => {
                    const slot = event.source;
                    return (
                      <div className={`academy-resource-event ${event.status} ${conflictIds.has(event.id) ? "conflict" : ""}`} key={event.id}>
                        <div>
                          <strong>
                            {eventTime(event)} - {event.title}
                          </strong>
                          <span>{event.subtitle || "Sem professor/quadra vinculados"}</span>
                          {conflictIds.has(event.id) ? <small>Conflito de horario neste recurso.</small> : null}
                        </div>
                        {slot && slot.status === "open" ? (
                          <div className="cluster">
                            <button
                              type="button"
                              onClick={() =>
                                onChangeAcademyDraftFromSlot({
                                  slotId: slot.id,
                                  coachId: slot.coachId || "",
                                  courtId: slot.courtId || "",
                                  coachName: coaches.find((coach) => coach.id === slot.coachId)?.name || "",
                                  weekday: slot.weekday,
                                  startsAt: slot.startsAt.slice(0, 5),
                                  endsAt: slot.endsAt.slice(0, 5),
                                  capacity: String(slot.capacity),
                                })
                              }
                              disabled={busy}
                            >
                              Criar turma
                            </button>
                            <button type="button" className="secondary" onClick={() => onUpdateSlotStatus(slot, "blocked")} disabled={busy}>
                              Bloquear
                            </button>
                          </div>
                        ) : null}
                        {slot && slot.status === "blocked" ? (
                          <button type="button" className="secondary" onClick={() => onUpdateSlotStatus(slot, "open")} disabled={busy}>
                            Reabrir
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="workspace-empty-state academy-workspace-card">
                    <strong>Nenhuma janela semanal neste dia.</strong>
                    <span>Crie uma janela recorrente ou um bloqueio semanal para deixar a disponibilidade visivel.</span>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="workspace-empty-state academy-workspace-card">
            <strong>{mode === "court" ? "Nenhuma quadra cadastrada." : "Nenhum professor cadastrado."}</strong>
            <span>{mode === "court" ? "Cadastre quadras antes de montar grade e bloqueios." : "Cadastre professores antes de criar disponibilidade."}</span>
          </div>
        )}
      </div>
    </section>
  );
}
