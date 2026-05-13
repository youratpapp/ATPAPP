import type { AcademyClass, AcademyEnrollment, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { formatMoneyFromCents } from "../../lib/payments";
import { EntityActionRow, WorkspaceEmptyState, WorkspaceList, WorkspaceMetrics } from "./PlaceWorkspaceUi";

type Props = {
  activeCourts: PlaceCourt[];
  classes: AcademyClass[];
  enrollments: AcademyEnrollment[];
  weekdayLabels: string[];
};

export function PlaceAcademyClassesModule({ activeCourts, classes, enrollments, weekdayLabels }: Props) {
  return (
    <WorkspaceList>
      {classes.slice(0, 12).map((academyClass) => {
        const classEnrollments = enrollments.filter((item) => item.classId === academyClass.id);
        const activeCount = classEnrollments.filter((item) => item.status === "active").length;
        const pendingCount = classEnrollments.filter((item) => item.status === "pending").length;
        const classCourt = activeCourts.find((court) => court.id === academyClass.courtId);
        const classTime = `${weekdayLabels[academyClass.weekday] || "Dia"} ${academyClass.startsAt.slice(0, 5)}-${academyClass.endsAt.slice(0, 5)}`;
        const capacityLabel = `${activeCount}/${academyClass.capacity}`;
        return (
          <EntityActionRow
            key={`academy-class-dashboard:${academyClass.id}`}
            context={classTime}
            detail={[academyClass.coachName || "Professor", classCourt?.name, academyClass.level || "nivel livre"].filter(Boolean).join(" | ")}
            primaryAction={<span>{capacityLabel}</span>}
            status={pendingCount > 0 ? countLabel(pendingCount, "pendente", "pendentes") : "Em dia"}
            title={academyClass.title}
          >
            <WorkspaceMetrics
              items={[
                formatMoneyFromCents(academyClass.monthlyFeeCents),
                academyClass.allowMakeup ? "Reposicao permitida" : "Sem reposicao",
                countLabel(classEnrollments.length, "matricula", "matriculas"),
              ]}
            />
          </EntityActionRow>
        );
      })}
      {!classes.length ? (
        <WorkspaceEmptyState
          title="Nenhuma turma cadastrada"
          detail="Cadastre a primeira turma com professor, quadra, horario, capacidade e mensalidade para liberar matriculas."
        />
      ) : null}
    </WorkspaceList>
  );
}
