import { useMemo, useState, type ReactNode } from "react";
import { EntityDrawer } from "../EntityDrawer";
import type { AcademyClass, AcademyEnrollment, AcademyLessonRequest, AcademyMakeupCredit } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { EntityActionRow, WorkspaceEmptyState, WorkspaceList, WorkspaceMetrics } from "./PlaceWorkspaceUi";

type PendingKind = "" | "enrollment" | "lesson" | "makeup";
type PendingStatus = "" | "pending" | "approved_unpaid" | "open_credit";

type Props = {
  busy: boolean;
  classes: AcademyClass[];
  enrollments: AcademyEnrollment[];
  fitTool?: ReactNode;
  lessonRequests: AcademyLessonRequest[];
  makeups: AcademyMakeupCredit[];
  onMarkLessonRequestPaid: (request: AcademyLessonRequest) => void;
  onOpenFit?: (creditId?: string) => void;
  onShareContact: (message: string) => void;
  onUpdateEnrollment: (enrollmentId: string, status: AcademyEnrollment["status"]) => void;
  onUpdateLessonRequest: (request: AcademyLessonRequest, status: AcademyLessonRequest["status"]) => void;
  onUseMakeup: (creditId: string) => void;
  pendingEnrollments: AcademyEnrollment[];
};

type PendingRow =
  | {
      academyClass: AcademyClass | undefined;
      enrollment: AcademyEnrollment;
      id: string;
      kind: "enrollment";
      searchText: string;
    }
  | {
      academyClass: AcademyClass | undefined;
      id: string;
      kind: "lesson";
      request: AcademyLessonRequest;
      searchText: string;
    }
  | {
      academyClass: AcademyClass | undefined;
      credit: AcademyMakeupCredit;
      enrollment: AcademyEnrollment | undefined;
      id: string;
      kind: "makeup";
      searchText: string;
    };

const DEFAULT_VISIBLE_LIMIT = 20;

function dateInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function kindLabel(kind: PendingRow["kind"]): string {
  if (kind === "enrollment") return "Matricula";
  if (kind === "lesson") return "Aula avulsa/reposicao";
  return "Reposicao aberta";
}

export function PlaceAcademyRequestsModule({
  busy,
  classes,
  enrollments,
  fitTool,
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
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<PendingKind>("");
  const [statusFilter, setStatusFilter] = useState<PendingStatus>("");
  const [visibleLimit, setVisibleLimit] = useState(DEFAULT_VISIBLE_LIMIT);
  const [fitDrawerOpen, setFitDrawerOpen] = useState(false);

  const pendingRows = useMemo<PendingRow[]>(() => {
    const enrollmentRows: PendingRow[] = pendingEnrollments.map((enrollment) => {
      const academyClass = classes.find((item) => item.id === enrollment.classId);
      return {
        academyClass,
        enrollment,
        id: `enrollment:${enrollment.id}`,
        kind: "enrollment",
        searchText: [enrollment.playerName, enrollment.phone, academyClass?.title, academyClass?.coachName, academyClass?.level].filter(Boolean).join(" ").toLowerCase(),
      };
    });

    const lessonRows: PendingRow[] = lessonRequests.map((request) => {
      const academyClass = classes.find((item) => item.id === request.classId);
      return {
        academyClass,
        id: `lesson:${request.id}`,
        kind: "lesson",
        request,
        searchText: [request.playerName, request.phone, request.email, request.levelLabel, request.notes, academyClass?.title, academyClass?.coachName].filter(Boolean).join(" ").toLowerCase(),
      };
    });

    const makeupRows: PendingRow[] = makeups.map((credit) => {
      const academyClass = classes.find((item) => item.id === credit.classId);
      const enrollment = enrollments.find((item) => item.id === credit.enrollmentId);
      return {
        academyClass,
        credit,
        enrollment,
        id: `makeup:${credit.id}`,
        kind: "makeup",
        searchText: [enrollment?.playerName, enrollment?.phone, credit.notes, academyClass?.title, academyClass?.coachName].filter(Boolean).join(" ").toLowerCase(),
      };
    });

    return [...enrollmentRows, ...lessonRows, ...makeupRows];
  }, [classes, enrollments, lessonRequests, makeups, pendingEnrollments]);

  const filteredRows = pendingRows.filter((row) => {
    const queryText = query.trim().toLowerCase();
    const rowStatus =
      row.kind === "enrollment"
        ? "pending"
        : row.kind === "makeup"
        ? "open_credit"
        : row.request.status === "approved" && row.request.paymentStatus !== "paid"
        ? "approved_unpaid"
        : "pending";
    return (!queryText || row.searchText.includes(queryText)) && (!kindFilter || row.kind === kindFilter) && (!statusFilter || rowStatus === statusFilter);
  });

  const openFitDrawer = (creditId?: string) => {
    setFitDrawerOpen(true);
    onOpenFit?.(creditId);
  };

  const clearFilters = () => {
    setQuery("");
    setKindFilter("");
    setStatusFilter("");
  };

  const hasActiveFilter = Boolean(query || kindFilter || statusFilter);

  return (
    <>
      <WorkspaceList>
        <div className="academy-requests-toolbar">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleLimit(DEFAULT_VISIBLE_LIMIT);
            }}
            placeholder="Buscar aluno, telefone, turma, professor ou observacao"
          />
          <select
            value={kindFilter}
            onChange={(event) => {
              setKindFilter(event.target.value as PendingKind);
              setVisibleLimit(DEFAULT_VISIBLE_LIMIT);
            }}
          >
            <option value="">Todos os tipos</option>
            <option value="enrollment">Matriculas</option>
            <option value="lesson">Aula avulsa/reposicao</option>
            <option value="makeup">Reposicoes abertas</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as PendingStatus);
              setVisibleLimit(DEFAULT_VISIBLE_LIMIT);
            }}
          >
            <option value="">Todos os status</option>
            <option value="pending">Aguardando decisao</option>
            <option value="approved_unpaid">Aprovado sem pagamento</option>
            <option value="open_credit">Credito aberto</option>
          </select>
          <button type="button" onClick={() => openFitDrawer()}>
            Buscar encaixe
          </button>
          <span>
            Exibindo {Math.min(visibleLimit, filteredRows.length)} de {filteredRows.length}
          </span>
        </div>

        <WorkspaceMetrics
          items={[
            countLabel(pendingEnrollments.length, "matricula pendente", "matriculas pendentes"),
            countLabel(lessonRequests.length, "pedido de aula", "pedidos de aula"),
            countLabel(makeups.length, "reposicao aberta", "reposicoes abertas"),
          ]}
        />

        {filteredRows.slice(0, visibleLimit).map((row) => {
          if (row.kind === "enrollment") {
            const enrollment = row.enrollment;
            return (
              <EntityActionRow
                key={row.id}
                context={kindLabel(row.kind)}
                detail={`${row.academyClass?.title || "Turma"} aguardando aprovacao${enrollment.phone ? ` | ${enrollment.phone}` : ""}`}
                primaryAction={
                  <button type="button" onClick={() => onUpdateEnrollment(enrollment.id, "active")} disabled={busy}>
                    Ativar
                  </button>
                }
                status="Aguardando decisao"
                title={enrollment.playerName}
                actions={
                  <details className="academy-pending-actions">
                    <summary>Mais</summary>
                    {enrollment.phone ? (
                      <button
                        type="button"
                        onClick={() =>
                          onShareContact(`Ola ${enrollment.playerName}, recebemos seu interesse na turma ${row.academyClass?.title || "da academia"}. Podemos confirmar sua matricula?`)
                        }
                      >
                        WhatsApp
                      </button>
                    ) : null}
                    <button type="button" className="danger" onClick={() => onUpdateEnrollment(enrollment.id, "cancelled")} disabled={busy}>
                      Cancelar
                    </button>
                  </details>
                }
              />
            );
          }

          if (row.kind === "lesson") {
            const request = row.request;
            const pending = request.status === "pending";
            const unpaid = request.status === "approved" && request.paymentStatus !== "paid";
            return (
              <EntityActionRow
                key={row.id}
                context={request.requestType === "makeup" ? "Solicitacao de reposicao" : "Aula avulsa"}
                detail={`${row.academyClass?.title || "Turma"} | ${request.requestedOn}${request.phone ? ` | ${request.phone}` : ""}`}
                primaryAction={
                  pending ? (
                    <button type="button" onClick={() => onUpdateLessonRequest(request, "approved")} disabled={busy}>
                      Aprovar
                    </button>
                  ) : unpaid ? (
                    <button type="button" onClick={() => onMarkLessonRequestPaid(request)} disabled={busy}>
                      Marcar pago
                    </button>
                  ) : (
                    <span>Resolvido</span>
                  )
                }
                status={pending ? "Aguardando decisao" : unpaid ? "Aprovado sem pagamento" : request.status}
                title={request.playerName}
                actions={
                  <details className="academy-pending-actions">
                    <summary>Mais</summary>
                    {request.phone ? (
                      <button
                        type="button"
                        onClick={() =>
                          onShareContact(
                            `Ola ${request.playerName}, vimos seu pedido de ${request.requestType === "makeup" ? "reposicao" : "aula avulsa"} na turma ${
                              row.academyClass?.title || "da academia"
                            }. Vamos confirmar?`
                          )
                        }
                      >
                        WhatsApp
                      </button>
                    ) : null}
                    {pending ? (
                      <button type="button" className="danger" onClick={() => onUpdateLessonRequest(request, "rejected")} disabled={busy}>
                        Recusar
                      </button>
                    ) : null}
                  </details>
                }
              />
            );
          }

          const enrollment = row.enrollment;
          return (
            <EntityActionRow
              key={row.id}
              context="Credito de reposicao"
              detail={`${row.academyClass?.title || "Turma"} | gerada em ${dateInputValue(row.credit.createdAt)}${enrollment?.phone ? ` | ${enrollment.phone}` : ""}`}
              primaryAction={
                <button type="button" onClick={() => openFitDrawer(row.credit.id)}>
                  Agendar reposicao
                </button>
              }
              status="Credito aberto"
              title={enrollment?.playerName || "Aluno"}
              actions={
                <details className="academy-pending-actions">
                  <summary>Mais</summary>
                  {enrollment?.phone ? (
                    <button type="button" onClick={() => onShareContact(`Ola ${enrollment.playerName}, voce tem uma reposicao aberta na turma ${row.academyClass?.title || "da academia"}. Vamos agendar?`)}>
                      WhatsApp
                    </button>
                  ) : null}
                  <button type="button" onClick={() => onUseMakeup(row.credit.id)} disabled={busy}>
                    Marcar como usada
                  </button>
                </details>
              }
            />
          );
        })}

        {filteredRows.length > visibleLimit ? (
          <button type="button" className="secondary" onClick={() => setVisibleLimit((current) => current + DEFAULT_VISIBLE_LIMIT)}>
            Ver mais pendencias
          </button>
        ) : null}

        {!pendingRows.length ? (
          <WorkspaceEmptyState
            title="Sem pendencias abertas"
            detail="Quando houver matricula, aula avulsa, solicitacao de reposicao ou credito para resolver, a fila aparece aqui."
            action={fitTool ? <button onClick={() => openFitDrawer()}>Buscar encaixes</button> : null}
          />
        ) : null}

        {pendingRows.length && !filteredRows.length ? (
          <WorkspaceEmptyState
            title="Nenhuma pendencia encontrada"
            detail={hasActiveFilter ? "Os filtros atuais esconderam todas as pendencias. Limpe filtros ou ajuste a busca." : "Nao ha pendencias neste recorte."}
            action={hasActiveFilter ? <button type="button" onClick={clearFilters}>Limpar filtros</button> : null}
          />
        ) : null}
      </WorkspaceList>

      <EntityDrawer
        open={fitDrawerOpen && Boolean(fitTool)}
        eyebrow="Pendencias"
        title="Buscar encaixe"
        subtitle="Encontre horario real para aula avulsa ou reposicao."
        onClose={() => setFitDrawerOpen(false)}
        actions={
          <button type="button" className="secondary" onClick={() => setFitDrawerOpen(false)}>
            Fechar
          </button>
        }
      >
        <div className="academy-fit-drawer">{fitTool}</div>
      </EntityDrawer>
    </>
  );
}
