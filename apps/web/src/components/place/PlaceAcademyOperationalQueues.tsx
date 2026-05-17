import { useState } from "react";
import type { AcademyClass, AcademyEnrollment, AcademyLessonRequest } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { OperationalQueue } from "./PlaceWorkspaceUi";

type Props = {
  actionableLessonRequests: AcademyLessonRequest[];
  academyClasses: AcademyClass[];
  busy: boolean;
  canManageAcademy: boolean;
  onMarkLessonRequestPaid: (request: AcademyLessonRequest) => void;
  onOpenRequests?: () => void;
  onOpenToday?: () => void;
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
  onOpenRequests,
  onOpenToday,
  onOpenTodayClass,
  onUpdateEnrollment,
  onUpdateLessonRequest,
  pendingEnrollments,
  todayClasses,
}: Props) {
  const [showAllToday, setShowAllToday] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);
  const visibleTodayClasses = showAllToday ? todayClasses : todayClasses.slice(0, 3);
  const visiblePendingEnrollments = showAllPending ? pendingEnrollments : pendingEnrollments.slice(0, 3);
  const remainingPendingSlots = Math.max(0, 3 - visiblePendingEnrollments.length);
  const visibleLessonRequests = showAllPending ? actionableLessonRequests : actionableLessonRequests.slice(0, remainingPendingSlots);
  const hasPendingWork = pendingEnrollments.length > 0 || actionableLessonRequests.length > 0;
  const hiddenTodayCount = Math.max(0, todayClasses.length - visibleTodayClasses.length);
  const hiddenPendingCount = Math.max(
    0,
    pendingEnrollments.length + actionableLessonRequests.length - visiblePendingEnrollments.length - visibleLessonRequests.length
  );

  return (
    <>
      <OperationalQueue title="Aulas do dia" compact emptyLabel="Nenhuma turma programada para hoje.">
        {todayClasses.length
          ? visibleTodayClasses.map((academyClass) => (
              <span key={`today-class:${academyClass.id}`}>
                <strong>{academyClass.startsAt.slice(0, 5)}</strong>
                <em>{academyClass.title}</em>
                <small>
                  {academyClass.coachName || "Professor"} | {academyClass.level || "nivel livre"}
                </small>
                <button type="button" onClick={() => onOpenTodayClass(academyClass.id)} disabled={busy}>
                  Abrir chamada
                </button>
              </span>
            ))
          : null}
        {hiddenTodayCount > 0 ? (
          <button type="button" className="secondary queue-more-action" onClick={() => setShowAllToday(true)}>
            Ver {countLabel(hiddenTodayCount, "aula restante", "aulas restantes")}
          </button>
        ) : todayClasses.length > 3 && onOpenToday ? (
          <button type="button" className="secondary queue-more-action" onClick={onOpenToday}>
            Ver agenda de hoje
          </button>
        ) : null}
      </OperationalQueue>
      {canManageAcademy && hasPendingWork ? (
        <OperationalQueue title="Pendencias da academia" compact>
          {visiblePendingEnrollments.map((enrollment) => {
            const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
            return (
              <span key={`pending-enrollment:${enrollment.id}`}>
                <strong>{enrollment.playerName}</strong>
                <em>Matricula pendente</em>
                <small>{academyClass?.title || "Turma"} aguardando aprovacao</small>
                <button onClick={() => onUpdateEnrollment(enrollment.id, "active")} disabled={busy}>
                  Ativar
                </button>
                <button className="danger" onClick={() => onUpdateEnrollment(enrollment.id, "cancelled")} disabled={busy}>
                  Cancelar
                </button>
              </span>
            );
          })}
          {visibleLessonRequests.map((request) => (
            <span key={`pending-lesson:${request.id}`}>
              <strong>{request.playerName}</strong>
              <em>{request.requestType === "makeup" ? "Reposicao" : "Aula avulsa"}</em>
              <small>
                {request.requestedOn} | {request.status}
              </small>
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
          {hiddenPendingCount > 0 ? (
            <button type="button" className="secondary queue-more-action" onClick={() => setShowAllPending(true)}>
              Ver {countLabel(hiddenPendingCount, "pendencia restante", "pendencias restantes")}
            </button>
          ) : onOpenRequests ? (
            <button type="button" className="secondary queue-more-action" onClick={onOpenRequests}>
              Ver fila completa
            </button>
          ) : null}
        </OperationalQueue>
      ) : null}
    </>
  );
}
