import type { AcademyClass, AcademyCoach, AcademyEnrollment, AcademySlot, PlaceCourt } from "../../lib/types";
import { formatMoneyFromCents } from "../../lib/payments";

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
  activeClasses: AcademyClass[];
  activeCourts: PlaceCourt[];
  busy: boolean;
  canManageFinance: boolean;
  canManagePlace: boolean;
  coachCommissionDraftByCoach: Record<string, string>;
  coachDraft: PlaceAcademyCoachDraft;
  coachLinkDraftByCoach: Record<string, string>;
  coaches: AcademyCoach[];
  enrollments: AcademyEnrollment[];
  onChangeAcademyDraftFromSlot: (patch: PlaceAcademyClassDraftPatch) => void;
  onChangeCoachCommissionDraft: (coachId: string, value: string) => void;
  onChangeCoachDraft: (draft: PlaceAcademyCoachDraft) => void;
  onChangeCoachLinkDraft: (coachId: string, value: string) => void;
  onCreateCoach: () => void;
  onLinkCoachLogin: (coach: AcademyCoach) => void;
  onSaveCoachCommission: (coach: AcademyCoach) => void;
  resourceDayClasses: AcademyClass[];
  resourceDaySlots: AcademySlot[];
};

export function PlaceAcademyResourcesModule({
  activeClasses,
  activeCourts,
  busy,
  canManageFinance,
  canManagePlace,
  coachCommissionDraftByCoach,
  coachDraft,
  coachLinkDraftByCoach,
  coaches,
  enrollments,
  onChangeAcademyDraftFromSlot,
  onChangeCoachCommissionDraft,
  onChangeCoachDraft,
  onChangeCoachLinkDraft,
  onCreateCoach,
  onLinkCoachLogin,
  onSaveCoachCommission,
  resourceDayClasses,
  resourceDaySlots,
}: Props) {
  return (
    <>
      {canManagePlace ? (
        <div className="place-staff-form">
          <input value={coachDraft.name} onChange={(event) => onChangeCoachDraft({ ...coachDraft, name: event.target.value })} placeholder="Novo professor" />
          <input value={coachDraft.phone} onChange={(event) => onChangeCoachDraft({ ...coachDraft, phone: event.target.value })} placeholder="Telefone" />
          <input value={coachDraft.email} onChange={(event) => onChangeCoachDraft({ ...coachDraft, email: event.target.value })} placeholder="Email" />
          <button onClick={onCreateCoach} disabled={busy || !coachDraft.name.trim()}>
            Cadastrar professor
          </button>
        </div>
      ) : null}
      <div className="academy-resource-grid">
        <div className="academy-resource-card">
          <strong>Professores</strong>
          {coaches.length ? (
            coaches.map((coach) => {
              const busyClasses = resourceDayClasses.filter((item) => item.coachId === coach.id);
              const coachClasses = activeClasses.filter((item) => item.coachId === coach.id);
              const coachMonthlyRevenue = coachClasses.reduce((sum, item) => {
                const activeCountForClass = enrollments.filter((enrollment) => enrollment.classId === item.id && enrollment.status === "active").length;
                return sum + activeCountForClass * item.monthlyFeeCents;
              }, 0);
              const estimatedCommission = Math.round((coachMonthlyRevenue * coach.commissionPercent) / 100);
              return (
                <span key={coach.id}>
                  {coach.name}: {busyClasses.length ? busyClasses.map((item) => `${item.startsAt.slice(0, 5)}-${item.endsAt.slice(0, 5)}`).join(", ") : "livre"} - comissao{" "}
                  {coach.commissionPercent}% - estimada {formatMoneyFromCents(estimatedCommission)}
                  {canManageFinance ? (
                    <>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={coachCommissionDraftByCoach[coach.id] ?? String(coach.commissionPercent)}
                        onChange={(event) => onChangeCoachCommissionDraft(coach.id, event.target.value)}
                        aria-label={`Comissao de ${coach.name}`}
                      />
                      <button onClick={() => onSaveCoachCommission(coach)} disabled={busy}>
                        Salvar comissao
                      </button>
                    </>
                  ) : null}
                  {canManagePlace && !coach.userId ? (
                    <span className="cluster" style={{ marginTop: 6 }}>
                      <input value={coachLinkDraftByCoach[coach.id] ?? coach.email} onChange={(event) => onChangeCoachLinkDraft(coach.id, event.target.value)} placeholder="Email do login" />
                      <button onClick={() => onLinkCoachLogin(coach)} disabled={busy}>
                        Vincular login
                      </button>
                    </span>
                  ) : coach.userId ? (
                    <small>Login vinculado</small>
                  ) : null}
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
                    Usar
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
