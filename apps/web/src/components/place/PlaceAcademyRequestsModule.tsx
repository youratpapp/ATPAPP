import type { AcademyClass, AcademyEnrollment, AcademyLessonRequest, AcademyMakeupCredit } from "../../lib/types";
import { WorkspaceCard, WorkspaceEmptyState, WorkspaceGrid, WorkspaceList, WorkspaceRow } from "./PlaceWorkspaceUi";

type Props = {
  busy: boolean;
  classes: AcademyClass[];
  enrollments: AcademyEnrollment[];
  lessonRequests: AcademyLessonRequest[];
  makeups: AcademyMakeupCredit[];
  onMarkLessonRequestPaid: (request: AcademyLessonRequest) => void;
  onOpenFit?: () => void;
  onShareContact: (message: string) => void;
  onUpdateEnrollment: (enrollmentId: string, status: AcademyEnrollment["status"]) => void;
  onUpdateLessonRequest: (request: AcademyLessonRequest, status: AcademyLessonRequest["status"]) => void;
  onUseMakeup: (creditId: string) => void;
  pendingEnrollments: AcademyEnrollment[];
};

function dateInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function PlaceAcademyRequestsModule({
  busy,
  classes,
  enrollments,
  lessonRequests,
  makeups,
  onMarkLessonRequestPaid,
  onOpenFit,
  onShareContact,
  onUpdateEnrollment,
  onUpdateLessonRequest,
  onUseMakeup,
  pendingEnrollments,
}: Props) {
  return (
    <>
      <WorkspaceGrid>
        <WorkspaceCard title="Matriculas" subtitle="Aprove ou cancele novos interessados em turmas." value={pendingEnrollments.length} />
        <WorkspaceCard title="Aulas avulsas" subtitle="Pedidos de reposicao e drop-in que precisam de retorno." value={lessonRequests.length} />
        <WorkspaceCard title="Reposicoes" subtitle="Creditos abertos que precisam virar aula marcada." value={makeups.length} />
      </WorkspaceGrid>
      <WorkspaceList>
        {pendingEnrollments.slice(0, 8).map((enrollment) => {
          const academyClass = classes.find((item) => item.id === enrollment.classId);
          return (
            <WorkspaceRow
              key={`academy-request-enrollment:${enrollment.id}`}
              title={enrollment.playerName}
              detail={`Matricula em ${academyClass?.title || "turma"} aguardando aprovacao${enrollment.phone ? ` | ${enrollment.phone}` : ""}`}
              actions={
                <>
                  {enrollment.phone ? (
                    <button
                      onClick={() =>
                        onShareContact(`Ola ${enrollment.playerName}, recebemos seu interesse na turma ${academyClass?.title || "da academia"}. Podemos confirmar sua matricula?`)
                      }
                    >
                      WhatsApp
                    </button>
                  ) : null}
                  <button onClick={() => onUpdateEnrollment(enrollment.id, "active")} disabled={busy}>
                    Ativar
                  </button>
                  <button className="danger" onClick={() => onUpdateEnrollment(enrollment.id, "cancelled")} disabled={busy}>
                    Cancelar
                  </button>
                </>
              }
            />
          );
        })}
        {lessonRequests.slice(0, 8).map((request) => {
          const requestClass = classes.find((item) => item.id === request.classId);
          return (
            <WorkspaceRow
              key={`academy-request-lesson:${request.id}`}
              title={request.playerName}
              detail={`${request.requestType === "makeup" ? "Reposicao" : "Aula avulsa"} | ${requestClass?.title || "turma"} | ${request.requestedOn}${request.phone ? ` | ${request.phone}` : ""}`}
              actions={
                request.status === "pending" ? (
                  <>
                    {request.phone ? (
                      <button
                        onClick={() =>
                          onShareContact(
                            `Ola ${request.playerName}, vimos seu pedido de ${request.requestType === "makeup" ? "reposicao" : "aula avulsa"} na turma ${requestClass?.title || "da academia"}. Vamos confirmar?`
                          )
                        }
                      >
                        WhatsApp
                      </button>
                    ) : null}
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
                ) : null
              }
            />
          );
        })}
        {makeups.slice(0, 8).map((credit) => {
          const academyClass = classes.find((item) => item.id === credit.classId);
          const enrollment = enrollments.find((item) => item.id === credit.enrollmentId);
          return (
            <WorkspaceRow
              key={`academy-makeup:${credit.id}`}
              title={enrollment?.playerName || "Aluno"}
              detail={`Reposicao aberta | ${academyClass?.title || "turma"} | gerada em ${dateInputValue(credit.createdAt)}${enrollment?.phone ? ` | ${enrollment.phone}` : ""}`}
              actions={
                <>
                  {enrollment?.phone ? (
                    <button onClick={() => onShareContact(`Ola ${enrollment.playerName}, voce tem uma reposicao aberta na turma ${academyClass?.title || "da academia"}. Vamos agendar?`)}>
                      WhatsApp
                    </button>
                  ) : null}
                  <button onClick={() => onUseMakeup(credit.id)} disabled={busy}>
                    Usar reposicao
                  </button>
                </>
              }
            />
          );
        })}
        {!pendingEnrollments.length && !lessonRequests.length && !makeups.length ? (
          <WorkspaceEmptyState
            title="Sem pendencias abertas"
            detail="Quando houver matricula, reposicao ou aula avulsa para resolver, elas aparecem aqui como fila operacional."
            action={onOpenFit ? <button onClick={onOpenFit}>Buscar encaixes</button> : null}
          />
        ) : null}
      </WorkspaceList>
    </>
  );
}
