import type { AcademyClass, AcademyCoach, AcademyEnrollment, AcademySlot } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { formatMoneyFromCents } from "../../lib/payments";
import { WorkspaceList, WorkspaceMetrics, WorkspaceRow } from "./PlaceWorkspaceUi";

type Props = {
  classes: AcademyClass[];
  coaches: AcademyCoach[];
  enrollments: AcademyEnrollment[];
  onAdjustAgenda: () => void;
  slots: AcademySlot[];
  todayClasses: AcademyClass[];
  weekdayLabels: string[];
};

function openWhatsApp(message: string): void {
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

export function PlaceAcademyCoachesModule({ classes, coaches, enrollments, onAdjustAgenda, slots, todayClasses, weekdayLabels }: Props) {
  return (
    <WorkspaceList>
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
      {!coaches.length ? <p className="subtle">Cadastre professores para montar a agenda da academia.</p> : null}
    </WorkspaceList>
  );
}
