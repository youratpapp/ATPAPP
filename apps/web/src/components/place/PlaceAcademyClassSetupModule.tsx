import type { AcademyClass, AcademyCoach, PlaceCourt } from "../../lib/types";
import { ACADEMY_LEVEL_OPTIONS } from "../../lib/academy-levels";
import { SetupWizard } from "../SetupWizard";
import { WorkspaceCard } from "./PlaceWorkspaceUi";

export type PlaceAcademyClassSetupDraft = {
  ageGroup: AcademyClass["ageGroup"];
  allowMakeup: boolean;
  capacity: string;
  coachId: string;
  coachName: string;
  courtId: string;
  endsAt: string;
  genderScope: AcademyClass["genderScope"];
  level: string;
  maxAge: string;
  minAge: string;
  monthlyFee?: string;
  slotId: string;
  startsAt: string;
  title: string;
  weekday: number;
  weekdays: number[];
};

type Props = {
  activeCourts: PlaceCourt[];
  busy: boolean;
  coachConflict: boolean;
  coaches: AcademyCoach[];
  courtConflict: boolean;
  draft: PlaceAcademyClassSetupDraft;
  onChangeDraft: (draft: PlaceAcademyClassSetupDraft) => void;
  onCreateClass: () => void;
  onCreateSlot: () => void;
  weekdayLabels: string[];
};

export function PlaceAcademyClassSetupModule({
  activeCourts,
  busy,
  coachConflict,
  coaches,
  courtConflict,
  draft,
  onChangeDraft,
  onCreateClass,
  onCreateSlot,
  weekdayLabels,
}: Props) {
  const canCreateClass = Boolean(draft.title.trim() && draft.coachId && draft.startsAt && draft.endsAt && !coachConflict && !courtConflict);
  const canCreateSlot = Boolean(draft.coachId && draft.startsAt && draft.endsAt && !coachConflict && !courtConflict);
  const selectedWeekdays = draft.weekdays?.length ? draft.weekdays : [draft.weekday];
  const toggleWeekday = (weekday: number) => {
    const next = selectedWeekdays.includes(weekday)
      ? selectedWeekdays.filter((item) => item !== weekday)
      : [...selectedWeekdays, weekday].sort((a, b) => a - b);
    onChangeDraft({ ...draft, weekday: next[0] ?? weekday, weekdays: next });
  };

  return (
    <WorkspaceCard
      title="Montagem de turma"
      subtitle="Crie a turma completa ou abra um horario para preencher depois."
      detail="Defina professor, quadra, dia, horario, perfil dos alunos e mensalidade em um unico fluxo."
    >
      <SetupWizard
        title="Criar turma"
        subtitle="Configure a turma em etapas para evitar conflito de agenda e dados incompletos."
        busy={busy}
        finishLabel="Criar turma"
        cancelLabel="Limpar"
        onCancel={() => onChangeDraft({ ...draft, title: "", coachName: "", level: "" })}
        onFinish={onCreateClass}
        secondaryAction={
          <button onClick={onCreateSlot} disabled={busy || !canCreateSlot} type="button">
            Abrir horario
          </button>
        }
        steps={[
          {
            id: "identity",
            label: "Identidade",
            detail: "Nome e professor",
            canContinue: Boolean(draft.title.trim() && draft.coachId),
            content: (
              <div className="place-academy-form">
                <input value={draft.title} onChange={(event) => onChangeDraft({ ...draft, title: event.target.value })} placeholder="Nome da turma" aria-label="Nome da turma" />
                <select
                  aria-label="Professor da turma"
                  value={draft.coachId}
                  onChange={(event) => {
                    const coach = coaches.find((item) => item.id === event.target.value);
                    onChangeDraft({ ...draft, coachId: event.target.value, coachName: coach?.name || draft.coachName });
                  }}
                >
                  <option value="">Professor</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name}
                    </option>
                  ))}
                </select>
                <input
                  value={draft.coachName}
                  onChange={(event) => onChangeDraft({ ...draft, coachName: event.target.value })}
                  placeholder="Nome exibido do professor"
                  aria-label="Nome exibido do professor"
                />
              </div>
            ),
          },
          {
            id: "schedule",
            label: "Agenda",
            detail: "Dias, quadra e horario",
            canContinue: Boolean(draft.coachId && draft.startsAt && draft.endsAt && !coachConflict && !courtConflict),
            content: (
              <div className="place-academy-form">
                <select value={draft.courtId} onChange={(event) => onChangeDraft({ ...draft, courtId: event.target.value })} aria-label="Quadra da turma">
                  <option value="">Quadra</option>
                  {activeCourts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name}
                    </option>
                  ))}
                </select>
                <div className="academy-weekday-picker" aria-label="Dias da semana da turma">
                  {weekdayLabels.map((label, index) => {
                    const active = selectedWeekdays.includes(index);
                    return (
                      <button key={`academy-day:${index}`} type="button" className={active ? "active" : ""} onClick={() => toggleWeekday(index)} aria-pressed={active}>
                        {label.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <input type="time" value={draft.startsAt} onChange={(event) => onChangeDraft({ ...draft, startsAt: event.target.value })} aria-label="Horario de inicio da turma" />
                <input type="time" value={draft.endsAt} onChange={(event) => onChangeDraft({ ...draft, endsAt: event.target.value })} aria-label="Horario de fim da turma" />
                {coachConflict || courtConflict ? (
                  <p className="feedback error academy-conflict-note">
                    {coachConflict ? "Professor ocupado neste horario. " : ""}
                    {courtConflict ? "Quadra ocupada neste horario." : ""}
                  </p>
                ) : null}
              </div>
            ),
          },
          {
            id: "rules",
            label: "Perfil e preco",
            detail: "Vagas, nivel e mensalidade",
            canContinue: canCreateClass,
            content: (
              <div className="place-academy-form">
                <select value={draft.level} onChange={(event) => onChangeDraft({ ...draft, level: event.target.value })} aria-label="Nivel da turma">
                  <option value="">Nivel</option>
                  {ACADEMY_LEVEL_OPTIONS.map((level) => (
                    <option key={`academy-class-level:${level.value}`} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <select value={draft.genderScope} onChange={(event) => onChangeDraft({ ...draft, genderScope: event.target.value as AcademyClass["genderScope"] })} aria-label="Genero da turma">
                  <option value="mixed">Mista</option>
                  <option value="male">Masculina</option>
                  <option value="female">Feminina</option>
                </select>
                <select value={draft.ageGroup} onChange={(event) => onChangeDraft({ ...draft, ageGroup: event.target.value as AcademyClass["ageGroup"] })} aria-label="Faixa etaria da turma">
                  <option value="adult">Adulto</option>
                  <option value="kids">Infantil</option>
                </select>
                <input type="number" min="0" value={draft.minAge} onChange={(event) => onChangeDraft({ ...draft, minAge: event.target.value })} placeholder="Idade min." aria-label="Idade minima" />
                <input type="number" min="0" value={draft.maxAge} onChange={(event) => onChangeDraft({ ...draft, maxAge: event.target.value })} placeholder="Idade max." aria-label="Idade maxima" />
                <input type="number" min="1" value={draft.capacity} onChange={(event) => onChangeDraft({ ...draft, capacity: event.target.value })} placeholder="Vagas" aria-label="Capacidade de alunos" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={draft.monthlyFee || "0"}
                  onChange={(event) => onChangeDraft({ ...draft, monthlyFee: event.target.value })}
                  placeholder="Mensalidade R$"
                  aria-label="Mensalidade da turma em reais"
                />
              </div>
            ),
          },
        ]}
      />
    </WorkspaceCard>
  );
}
