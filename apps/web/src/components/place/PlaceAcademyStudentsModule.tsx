import type {
  AcademyAttendance,
  AcademyClass,
  AcademyEnrollment,
  AcademyMakeupCredit,
  AcademyPlannedAbsence,
  AcademyProgressNote,
} from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { EntityActionRow, WorkspaceList, WorkspaceMetrics } from "./PlaceWorkspaceUi";

export type PlaceAcademyStudentFilter = {
  classId: string;
  query: string;
  status: "" | AcademyEnrollment["status"];
};

type Props = {
  absences: AcademyPlannedAbsence[];
  attendance: AcademyAttendance[];
  billingPeriod: string;
  busy: boolean;
  canManageFinance: boolean;
  classes: AcademyClass[];
  enrollments: AcademyEnrollment[];
  filter: PlaceAcademyStudentFilter;
  isEnrollmentPaid: (enrollmentId: string) => boolean;
  makeups: AcademyMakeupCredit[];
  onChangeFilter: (filter: PlaceAcademyStudentFilter) => void;
  onCreatePaymentReminder: (enrollment: AcademyEnrollment, academyClass: AcademyClass) => void;
  onMarkAttendance: (enrollmentId: string, status: AcademyAttendance["status"]) => void;
  onMarkPaid: (academyClass: AcademyClass, enrollment: AcademyEnrollment) => void;
  onReportAbsence: (enrollmentId: string) => void;
  onUpdateEnrollment: (enrollmentId: string, status: AcademyEnrollment["status"]) => void;
  progress: AcademyProgressNote[];
  todayAttendance: AcademyAttendance[];
  visibleClasses: AcademyClass[];
  visibleEnrollments: AcademyEnrollment[];
};

export function PlaceAcademyStudentsModule({
  absences,
  attendance,
  billingPeriod,
  busy,
  canManageFinance,
  classes,
  enrollments,
  filter,
  isEnrollmentPaid,
  makeups,
  onChangeFilter,
  onCreatePaymentReminder,
  onMarkAttendance,
  onMarkPaid,
  onReportAbsence,
  onUpdateEnrollment,
  progress,
  todayAttendance,
  visibleClasses,
  visibleEnrollments,
}: Props) {
  return (
    <WorkspaceList>
      <div className="academy-student-toolbar">
        <input value={filter.query} onChange={(event) => onChangeFilter({ ...filter, query: event.target.value })} placeholder="Buscar aluno, telefone, turma ou professor" />
        <select value={filter.classId} onChange={(event) => onChangeFilter({ ...filter, classId: event.target.value })}>
          <option value="">Todas as turmas</option>
          {visibleClasses.map((academyClass) => (
            <option key={`student-filter-class:${academyClass.id}`} value={academyClass.id}>
              {academyClass.title}
            </option>
          ))}
        </select>
        <select value={filter.status} onChange={(event) => onChangeFilter({ ...filter, status: event.target.value as PlaceAcademyStudentFilter["status"] })}>
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="pending">Pendentes</option>
          <option value="cancelled">Cancelados</option>
        </select>
        <span>{countLabel(visibleEnrollments.length, "aluno encontrado", "alunos encontrados")}</span>
      </div>
      {visibleEnrollments.slice(0, 24).map((enrollment) => {
        const academyClass = classes.find((item) => item.id === enrollment.classId);
        const latestProgress = progress.find((item) => item.enrollmentId === enrollment.id);
        const paid = isEnrollmentPaid(enrollment.id);
        const openMakeupCount = makeups.filter((item) => item.enrollmentId === enrollment.id).length;
        const openAbsenceCount = absences.filter((item) => item.enrollmentId === enrollment.id && item.status === "open").length;
        const attendedCount = attendance.filter((item) => item.enrollmentId === enrollment.id && item.status === "present").length;
        const missedCount = attendance.filter((item) => item.enrollmentId === enrollment.id && item.status === "absent").length;
        const todayEnrollmentAttendance = todayAttendance.find((item) => item.enrollmentId === enrollment.id);
        const attendanceLabel = todayEnrollmentAttendance
          ? todayEnrollmentAttendance.status === "present"
            ? "Presente hoje"
            : "Falta hoje"
          : "Chamada pendente";
        const paymentLabel = paid ? "Mensalidade paga" : "Mensalidade pendente";
        const primaryAction =
          enrollment.status === "pending" ? (
            <button onClick={() => onUpdateEnrollment(enrollment.id, "active")} disabled={busy}>
              Ativar
            </button>
          ) : enrollment.status === "active" && !todayEnrollmentAttendance ? (
            <button onClick={() => onMarkAttendance(enrollment.id, "present")} disabled={busy}>
              Check-in
            </button>
          ) : enrollment.status === "active" && canManageFinance && !paid && academyClass ? (
            <button onClick={() => onMarkPaid(academyClass, enrollment)} disabled={busy}>
              Marcar pago
            </button>
          ) : (
            <span>{enrollment.status === "active" ? "Em dia" : enrollment.status}</span>
          );
        return (
          <EntityActionRow
            key={`academy-student:${enrollment.id}`}
            className={!paid && enrollment.status === "active" ? "due academy-student-row" : "academy-student-row"}
            context={academyClass?.title || "Turma"}
            detail={[enrollment.phone, paymentLabel, attendanceLabel].filter(Boolean).join(" | ")}
            primaryAction={primaryAction}
            status={enrollment.status === "active" ? "Ativo" : enrollment.status === "pending" ? "Pendente" : "Cancelado"}
            title={enrollment.playerName}
            actions={
              <details className="academy-student-actions">
                <summary>
                  <span>Acoes</span>
                </summary>
                {enrollment.status === "pending" ? (
                  <>
                    <button className="danger" onClick={() => onUpdateEnrollment(enrollment.id, "cancelled")} disabled={busy}>
                      Cancelar
                    </button>
                  </>
                ) : null}
                {canManageFinance && enrollment.status === "active" && !paid && academyClass ? (
                  <button onClick={() => onMarkPaid(academyClass, enrollment)} disabled={busy}>
                    Marcar pago
                  </button>
                ) : null}
                {canManageFinance && enrollment.status === "active" && !paid && academyClass ? (
                  <button onClick={() => onCreatePaymentReminder(enrollment, academyClass)} disabled={busy}>
                    Lembrar
                  </button>
                ) : null}
                {enrollment.status === "active" ? (
                  <>
                    <button onClick={() => onReportAbsence(enrollment.id)} disabled={busy}>
                      Avisou falta
                    </button>
                    <button onClick={() => onMarkAttendance(enrollment.id, "present")} disabled={busy || todayEnrollmentAttendance?.status === "present"}>
                      Check-in
                    </button>
                    <button onClick={() => onMarkAttendance(enrollment.id, "absent")} disabled={busy || todayEnrollmentAttendance?.status === "absent"}>
                      Falta
                    </button>
                  </>
                ) : null}
              </details>
            }
          >
            <small>{latestProgress ? `Evolucao: ${latestProgress.levelLabel || latestProgress.focus || latestProgress.notes}` : "Sem evolucao registrada"}</small>
            <WorkspaceMetrics
              items={[
                countLabel(attendedCount, "presenca", "presencas"),
                countLabel(missedCount, "falta", "faltas"),
                countLabel(openAbsenceCount, "falta avisada", "faltas avisadas"),
                countLabel(openMakeupCount, "reposicao aberta", "reposicoes abertas"),
                `Competencia ${billingPeriod}`,
                countLabel(enrollments.filter((item) => item.classId === enrollment.classId && item.status === "active").length, "colega ativo", "colegas ativos"),
              ]}
            />
          </EntityActionRow>
        );
      })}
      {!visibleEnrollments.length ? <p className="subtle">Nenhum aluno encontrado para estes filtros.</p> : null}
    </WorkspaceList>
  );
}
