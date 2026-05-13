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

type Props = {
  activeCourts: PlaceCourt[];
  busy: boolean;
  coaches: AcademyCoach[];
  onChangeAcademyDraftFromSlot: (patch: PlaceAcademyClassDraftPatch) => void;
  resourceDayClasses: AcademyClass[];
  resourceDaySlots: AcademySlot[];
};

export function PlaceAcademyResourcesModule({
  activeCourts,
  busy,
  coaches,
  onChangeAcademyDraftFromSlot,
  resourceDayClasses,
  resourceDaySlots,
}: Props) {
  return (
    <>
      <div className="academy-resource-grid">
        <div className="academy-resource-card">
          <strong>Professores</strong>
          {coaches.length ? (
            coaches.map((coach) => {
              const busyClasses = resourceDayClasses.filter((item) => item.coachId === coach.id);
              return (
                <span key={coach.id}>
                  {coach.name}: {busyClasses.length ? busyClasses.map((item) => `${item.startsAt.slice(0, 5)}-${item.endsAt.slice(0, 5)}`).join(", ") : "livre"}
                </span>
              );
            })
          ) : (
            <span>Nenhum professor cadastrado.</span>
          )}
        </div>
        <div className="academy-resource-card">
          <strong>Quadras</strong>
          {activeCourts.length ? (
            activeCourts.map((court) => {
              const busyClasses = resourceDayClasses.filter((item) => item.courtId === court.id);
              return (
                <span key={court.id}>
                  {court.name}: {busyClasses.length ? busyClasses.map((item) => `${item.startsAt.slice(0, 5)}-${item.endsAt.slice(0, 5)}`).join(", ") : "livre"}
                </span>
              );
            })
          ) : (
            <span>Nenhuma quadra cadastrada.</span>
          )}
        </div>
        <div className="academy-resource-card">
          <strong>Horarios abertos</strong>
          {resourceDaySlots.length ? (
            resourceDaySlots.map((slot) => {
              const coach = coaches.find((item) => item.id === slot.coachId);
              const court = activeCourts.find((item) => item.id === slot.courtId);
              return (
                <span key={slot.id}>
                  {slot.startsAt.slice(0, 5)}-{slot.endsAt.slice(0, 5)} - {[coach?.name, court?.name].filter(Boolean).join(" / ") || "flexivel"} - {slot.capacity} vagas
                  <button
                    onClick={() =>
                      onChangeAcademyDraftFromSlot({
                        slotId: slot.id,
                        coachId: slot.coachId || "",
                        courtId: slot.courtId || "",
                        coachName: coach?.name || "",
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
                </span>
              );
            })
          ) : (
            <span>Nenhum horario aberto neste dia.</span>
          )}
        </div>
      </div>
    </>
  );
}
