import type { AcademyAttendance, AcademyClass, AcademyEnrollment, AcademyMakeupCredit, AcademyPlannedAbsence, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { WorkspaceCard, WorkspaceEmptyState, WorkspaceGrid } from "./PlaceWorkspaceUi";

type Props = {
  activeCourts: PlaceCourt[];
  absences: AcademyPlannedAbsence[];
  attendanceToday: AcademyAttendance[];
  classes: AcademyClass[];
  enrollments: AcademyEnrollment[];
  makeups: AcademyMakeupCredit[];
  onOpenClasses?: () => void;
  onOpenSetup?: () => void;
};

export function PlaceAcademyTodayModule({ activeCourts, absences, attendanceToday, classes, enrollments, makeups, onOpenClasses, onOpenSetup }: Props) {
  return (
    <WorkspaceGrid>
      {classes.slice(0, 8).map((academyClass) => {
        const classEnrollments = enrollments.filter((item) => item.classId === academyClass.id);
        const activeCount = classEnrollments.filter((item) => item.status === "active").length;
        const classAttendanceToday = attendanceToday.filter((item) => item.classId === academyClass.id);
        const presentCount = classAttendanceToday.filter((item) => item.status === "present").length;
        const classMakeups = makeups.filter((item) => item.classId === academyClass.id);
        const plannedAbsences = absences.filter((item) => item.classId === academyClass.id && item.status === "open");
        const classCourt = activeCourts.find((court) => court.id === academyClass.courtId);
        return (
          <WorkspaceCard
            key={`academy-today:${academyClass.id}`}
            title={`${academyClass.startsAt.slice(0, 5)} - ${academyClass.title}`}
            subtitle={[academyClass.coachName || "Professor", classCourt?.name, academyClass.level].filter(Boolean).join(" | ")}
            value={`${activeCount}/${academyClass.capacity}`}
            metrics={[
              countLabel(presentCount, "presente", "presentes"),
              countLabel(plannedAbsences.length, "falta avisada", "faltas avisadas"),
              countLabel(classMakeups.length, "reposicao", "reposicoes"),
            ]}
            detail={classEnrollments.filter((item) => item.status === "active").map((item) => item.playerName).join(", ") || "Sem alunos ativos"}
          />
        );
      })}
      {!classes.length ? (
        <WorkspaceEmptyState
          title="Nenhuma aula programada para hoje"
          detail="A rotina do dia fica mais rapida quando a grade semanal ja esta cadastrada e filtrada por turma."
          action={
            <>
              {onOpenClasses ? <button onClick={onOpenClasses}>Ver turmas</button> : null}
              {onOpenSetup ? <button onClick={onOpenSetup}>Criar turma</button> : null}
            </>
          }
        />
      ) : null}
    </WorkspaceGrid>
  );
}
