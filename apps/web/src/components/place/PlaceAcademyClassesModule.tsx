import type { AcademyClass, AcademyEnrollment, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { formatMoneyFromCents } from "../../lib/payments";
import { WorkspaceCard, WorkspaceEmptyState, WorkspaceGrid } from "./PlaceWorkspaceUi";

type Props = {
  activeCourts: PlaceCourt[];
  classes: AcademyClass[];
  enrollments: AcademyEnrollment[];
  onOpenSetup?: () => void;
  weekdayLabels: string[];
};

export function PlaceAcademyClassesModule({ activeCourts, classes, enrollments, onOpenSetup, weekdayLabels }: Props) {
  return (
    <WorkspaceGrid>
      {classes.slice(0, 12).map((academyClass) => {
        const classEnrollments = enrollments.filter((item) => item.classId === academyClass.id);
        const activeCount = classEnrollments.filter((item) => item.status === "active").length;
        const pendingCount = classEnrollments.filter((item) => item.status === "pending").length;
        const classCourt = activeCourts.find((court) => court.id === academyClass.courtId);
        return (
          <WorkspaceCard
            key={`academy-class-dashboard:${academyClass.id}`}
            title={academyClass.title}
            subtitle={`${weekdayLabels[academyClass.weekday] || "Dia"} ${academyClass.startsAt.slice(0, 5)} - ${academyClass.endsAt.slice(0, 5)}`}
            value={`${activeCount}/${academyClass.capacity}`}
            detail={[academyClass.coachName || "Professor", classCourt?.name, academyClass.level || "nivel livre"].filter(Boolean).join(" | ")}
            metrics={[
              formatMoneyFromCents(academyClass.monthlyFeeCents),
              countLabel(pendingCount, "pendente", "pendentes"),
              academyClass.allowMakeup ? "Reposicao permitida" : "Sem reposicao",
            ]}
          />
        );
      })}
      {!classes.length ? (
        <WorkspaceEmptyState
          title="Nenhuma turma cadastrada"
          detail="Cadastre a primeira turma com professor, quadra, horario, capacidade e mensalidade para liberar matriculas."
          action={onOpenSetup ? <button onClick={onOpenSetup}>Criar turma</button> : null}
        />
      ) : null}
    </WorkspaceGrid>
  );
}
