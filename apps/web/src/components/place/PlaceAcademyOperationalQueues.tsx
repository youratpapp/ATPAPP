import type { AcademyClass, AcademyEnrollment, AcademyLessonRequest } from "../../lib/types";
import { OperationalQueue } from "./PlaceWorkspaceUi";

type Props = {
  actionableLessonRequests: AcademyLessonRequest[];
  academyClasses: AcademyClass[];
  busy: boolean;
  canManageAcademy: boolean;
  onMarkLessonRequestPaid: (request: AcademyLessonRequest) => void;
  onOpenTodayClass: (academyClassId: string) => void;
  onUpdateEnrollment: (enrollmentId: string, status: AcademyEnrollment["status"]) => void;
  onUpdateLessonRequest: (request: AcademyLessonRequest, status: AcademyLessonRequest["status"]) => void;
  pendingEnrollments: AcademyEnrollment[];
  todayClasses: AcademyClass[];
};

export function PlaceAcademyOperationalQueues({
  actionableLessonRequests,
  academyClasses,
  busy,
  canManageAcademy,
  onMarkLessonRequestPaid,
  onOpenTodayClass,
  onUpdateEnrollment,
  onUpdateLessonRequest,
  pendingEnrollments,
  todayClasses,
}: Props) {
  const hasPendingWork = pendingEnrollments.length > 0 || actionableLessonRequests.length > 0;

  return (
    <>
      <OperationalQueue title="Aulas do dia" compact emptyLabel="Nenhuma turma programada para hoje.">
        {todayClasses.length
          ? todayClasses.slice(0, 6).map((academyClass) => (
              <span key={`today-class:${academyClass.id}`}>
                <strong>{academyClass.startsAt.slice(0, 5)}</strong>
                {academyClass.title} - {academyClass.coachName || "Professor"} - {academyClass.level || "nivel livre"}
                <button type="button" onClick={() => onOpenTodayClass(academyClass.id)} disabled={busy}>
                  Abrir chamada
                </button>
              </span>
            ))
          : null}
      </OperationalQueue>
      {canManageAcademy && hasPendingWork ? (
        <OperationalQueue title="Pendencias da academia" compact>
          {pendingEnrollments.slice(0, 4).map((enrollment) => {
            const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
            return (
              <span key={`pending-enrollment:${enrollment.id}`}>
                <strong>{enrollment.playerName}</strong>
                Matricula em {academyClass?.title || "turma"} aguardando aprovacao
                <button onClick={() => onUpdateEnrollment(enrollment.id, "active")} disabled={busy}>
                  Ativar
                </button>
                <button className="danger" onClick={() => onUpdateEnrollment(enrollment.id, "cancelled")} disabled={busy}>
                  Cancelar
                </button>
              </span>
            );
          })}
          {actionableLessonRequests.slice(0, 4).map((request) => (
            <span key={`pending-lesson:${request.id}`}>
              <strong>{request.playerName}</strong>
              {request.requestType === "makeup" ? "Reposicao" : "Aula avulsa"} - {request.requestedOn} - {request.status}
              {request.status === "pending" ? (
                <>
                  <button onClick={() => onUpdateLessonRequest(request, "approved")} disabled={busy}>
                    Aprovar
                  </button>
                  <button className="danger" onClick={() => onUpdateLessonRequest(request, "rejected")} disabled={busy}>
                    Recusar
                  </button>
                </>
              ) : request.paymentStatus !== "paid" ? (
                <button onClick={() => onMarkLessonRequestPaid(request)} disabled={busy}>
                  Marcar pago
                </button>
              ) : null}
            </span>
          ))}
        </OperationalQueue>
      ) : null}
    </>
  );
}
