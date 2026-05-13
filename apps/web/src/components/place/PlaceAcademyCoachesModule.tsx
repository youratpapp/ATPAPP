import type { AcademyClass, AcademyCoach, AcademyEnrollment, AcademySlot } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { formatMoneyFromCents } from "../../lib/payments";
import { WorkspaceEmptyState, WorkspaceList, WorkspaceMetrics, WorkspaceRow } from "./PlaceWorkspaceUi";
import type { PlaceAcademyCoachDraft } from "./PlaceAcademyResourcesModule";

type Props = {
  busy: boolean;
  canManageFinance: boolean;
  canManagePlace: boolean;
  coachCommissionDraftByCoach: Record<string, string>;
  classes: AcademyClass[];
  coachDraft: PlaceAcademyCoachDraft;
  coachLinkDraftByCoach: Record<string, string>;
  coaches: AcademyCoach[];
  enrollments: AcademyEnrollment[];
  onChangeCoachCommissionDraft: (coachId: string, value: string) => void;
  onChangeCoachDraft: (draft: PlaceAcademyCoachDraft) => void;
  onChangeCoachLinkDraft: (coachId: string, value: string) => void;
  onAdjustAgenda: () => void;
  onCreateCoach: () => void;
  onLinkCoachLogin: (coach: AcademyCoach) => void;
  onSaveCoachCommission: (coach: AcademyCoach) => void;
  slots: AcademySlot[];
  todayClasses: AcademyClass[];
  weekdayLabels: string[];
};

function openWhatsApp(message: string): void {
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

export function PlaceAcademyCoachesModule({
  busy,
  canManageFinance,
  canManagePlace,
  coachCommissionDraftByCoach,
  classes,
  coachDraft,
  coachLinkDraftByCoach,
  coaches,
  enrollments,
  onChangeCoachCommissionDraft,
  onChangeCoachDraft,
  onChangeCoachLinkDraft,
  onAdjustAgenda,
  onCreateCoach,
  onLinkCoachLogin,
  onSaveCoachCommission,
  slots,
  todayClasses,
  weekdayLabels,
}: Props) {
  return (
    <WorkspaceList>
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
      {coaches.map((coach) => {
        const coachClasses = classes.filter((academyClass) => academyClass.coachId === coach.id);
        const coachClassIds = new Set(coachClasses.map((academyClass) => academyClass.id));
        const coachEnrollments = enrollments.filter((enrollment) => coachClassIds.has(enrollment.classId) && enrollment.status === "active");
        const coachTodayClasses = todayClasses.filter((academyClass) => academyClass.coachId === coach.id);
        const coachOpenSlots = slots.filter((slot) => slot.coachId === coach.id && slot.status === "open");
        const coachMonthlyRevenue = coachClasses.reduce((sum, academyClass) => {
          const activeCount = enrollments.filter((enrollment) => enrollment.classId === academyClass.id && enrollment.status === "active").length;
          return sum + activeCount * academyClass.monthlyFeeCents;
        }, 0);
        const estimatedCommission = Math.round((coachMonthlyRevenue * coach.commissionPercent) / 100);
        const nextCoachClass = [...coachClasses].sort((a, b) => `${a.weekday}:${a.startsAt}`.localeCompare(`${b.weekday}:${b.startsAt}`))[0];
        return (
          <WorkspaceRow
            key={`academy-coach:${coach.id}`}
            title={coach.name}
            detail={[coach.email, coach.phone, coach.userId ? "Login vinculado" : "Sem login"].filter(Boolean).join(" | ")}
            actions={
              <>
                {coach.phone ? (
                  <button onClick={() => openWhatsApp(`Ola ${coach.name}, vamos alinhar sua agenda de aulas?`)}>
                    WhatsApp
                  </button>
                ) : null}
                <button onClick={onAdjustAgenda}>Ajustar agenda</button>
              </>
            }
          >
            {canManageFinance ? (
              <span className="cluster">
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
              </span>
            ) : null}
            {canManagePlace && !coach.userId ? (
              <span className="cluster">
                <input value={coachLinkDraftByCoach[coach.id] ?? coach.email} onChange={(event) => onChangeCoachLinkDraft(coach.id, event.target.value)} placeholder="Email do login" />
                <button onClick={() => onLinkCoachLogin(coach)} disabled={busy}>
                  Vincular login
                </button>
              </span>
            ) : coach.userId ? (
              <small>Login vinculado</small>
            ) : null}
            <small>
              {nextCoachClass
                ? `Proxima turma na grade: ${weekdayLabels[nextCoachClass.weekday] || "Dia"} ${nextCoachClass.startsAt.slice(0, 5)} - ${nextCoachClass.title}`
                : "Sem turma ativa na grade"}
            </small>
            <WorkspaceMetrics
              items={[
                countLabel(coachClasses.length, "turma", "turmas"),
                countLabel(coachEnrollments.length, "aluno ativo", "alunos ativos"),
                countLabel(coachTodayClasses.length, "aula hoje", "aulas hoje"),
                countLabel(coachOpenSlots.length, "janela aberta", "janelas abertas"),
                `Receita ${formatMoneyFromCents(coachMonthlyRevenue)}`,
                `Comissao ${formatMoneyFromCents(estimatedCommission)}`,
              ]}
            />
          </WorkspaceRow>
        );
      })}
      {!coaches.length ? (
        <WorkspaceEmptyState
          title="Nenhum professor cadastrado"
          detail="Cadastre o primeiro professor aqui para liberar turmas, chamada e agenda."
          action={
            canManagePlace ? (
              <button className="primary" onClick={onCreateCoach} disabled={busy || !coachDraft.name.trim()}>
                Cadastrar professor
              </button>
            ) : null
          }
        />
      ) : null}
    </WorkspaceList>
  );
}
