import { useMemo, useState } from "react";
import type { PlaceClientReceivable } from "./PlaceClientRelationshipModule";
import { EntityActionRow, WorkspaceList } from "./PlaceWorkspaceUi";

type PlaceFinanceReceivablesModuleProps = {
  academyReceivables: PlaceClientReceivable[];
  busy: boolean;
  formatMoneyFromCents: (amountCents: number) => string;
  membershipReceivables: PlaceClientReceivable[];
  receivables: PlaceClientReceivable[];
  onCreatePaymentReminder: (targetType: string, targetId: string, billingPeriod: string, message: string) => void;
  onCreatePaymentReminderBatch: (receivables: PlaceClientReceivable[]) => void;
  onMarkReceivablePaid: (receivable: PlaceClientReceivable) => void;
};

type FinanceReceivableSegment = "all" | "overdue" | "today" | "academy" | "membership";

function receivableStatusLabel(receivable: PlaceClientReceivable): string {
  if (receivable.status === "pending_approval") return "Aguardando aprovacao";
  if (receivable.dueStatus === "overdue") return "Vencido";
  if (receivable.dueStatus === "today") return "Vence hoje";
  return "Em aberto";
}

export function PlaceFinanceReceivablesModule({
  academyReceivables,
  busy,
  formatMoneyFromCents,
  membershipReceivables,
  receivables,
  onCreatePaymentReminder,
  onCreatePaymentReminderBatch,
  onMarkReceivablePaid,
}: PlaceFinanceReceivablesModuleProps) {
  const [segment, setSegment] = useState<FinanceReceivableSegment>("all");
  const [showAll, setShowAll] = useState(false);
  const overdueReceivables = useMemo(() => receivables.filter((receivable) => receivable.dueStatus === "overdue"), [receivables]);
  const todayReceivables = useMemo(() => receivables.filter((receivable) => receivable.dueStatus === "today"), [receivables]);
  const segmentReceivables = useMemo(() => {
    if (segment === "overdue") return overdueReceivables;
    if (segment === "today") return todayReceivables;
    if (segment === "academy") return academyReceivables;
    if (segment === "membership") return membershipReceivables;
    return receivables;
  }, [academyReceivables, membershipReceivables, overdueReceivables, receivables, segment, todayReceivables]);
  const visibleReceivables = showAll ? segmentReceivables : segmentReceivables.slice(0, 16);
  const hiddenCount = Math.max(0, segmentReceivables.length - visibleReceivables.length);
  const receivableLabel = `${receivables.length} ${receivables.length === 1 ? "pendencia aberta" : "pendencias abertas"}`;

  return (
    <WorkspaceList>
      {receivables.length ? (
        <div className="billing-quick-actions">
          <div>
            <strong>Cobranca recorrente</strong>
            <span>{receivableLabel} | {overdueReceivables.length} vencidas | {todayReceivables.length} vencem hoje</span>
          </div>
          <button className={segment === "overdue" ? "primary" : "quiet"} type="button" onClick={() => { setSegment("overdue"); setShowAll(false); }} disabled={!overdueReceivables.length}>
            Vencidos
          </button>
          <button className={segment === "today" ? "primary" : "quiet"} type="button" onClick={() => { setSegment("today"); setShowAll(false); }} disabled={!todayReceivables.length}>
            Vence hoje
          </button>
          <button className={segment === "all" ? "primary" : "quiet"} type="button" onClick={() => { setSegment("all"); setShowAll(false); }}>
            Todos
          </button>
        </div>
      ) : null}
      {receivables.length ? (
        <div className="billing-quick-actions secondary">
          <div>
            <strong>Acoes de lote</strong>
            <span>Lembretes ficam registrados no historico financeiro.</span>
          </div>
          <button className="primary" type="button" onClick={() => onCreatePaymentReminderBatch(segmentReceivables)} disabled={busy || !segmentReceivables.length}>
            Lembrar lista atual
          </button>
          <button className="quiet" type="button" onClick={() => onCreatePaymentReminderBatch(membershipReceivables)} disabled={busy || !membershipReceivables.length}>
            Cobrar socios
          </button>
          <button className="quiet" type="button" onClick={() => onCreatePaymentReminderBatch(academyReceivables)} disabled={busy || !academyReceivables.length}>
            Cobrar alunos
          </button>
        </div>
      ) : null}
      {visibleReceivables.map((receivable) => (
        <EntityActionRow
          key={`finance-open:${receivable.id}`}
          className={`finance-receivable-row ${receivable.status} ${receivable.dueStatus === "overdue" || receivable.dueStatus === "today" ? "due" : ""}`.trim()}
          title={receivable.title}
          context={[receivable.originLabel, receivable.subtitle].filter(Boolean).join(" | ")}
          detail={formatMoneyFromCents(receivable.amountCents)}
          status={receivableStatusLabel(receivable)}
          primaryAction={
            <button
              className="primary"
              type="button"
              onClick={() => onMarkReceivablePaid(receivable)}
              disabled={busy}
            >
              Pagar
            </button>
          }
          actions={
            <button
              className="quiet"
              type="button"
              onClick={() => onCreatePaymentReminder(receivable.targetType, receivable.targetId, receivable.billingPeriod, receivable.reminder)}
              disabled={busy}
            >
              Enviar lembrete
            </button>
          }
        >
          <small>{[receivable.dueLabel, receivable.billingPeriod ? `Periodo ${receivable.billingPeriod}` : ""].filter(Boolean).join(" | ") || "Pagamento em aberto"}</small>
        </EntityActionRow>
      ))}
      {hiddenCount ? (
        <button type="button" className="secondary" onClick={() => setShowAll(true)}>
          Ver {hiddenCount} recebivel{hiddenCount === 1 ? "" : "s"} restante{hiddenCount === 1 ? "" : "s"}
        </button>
      ) : null}
      {receivables.length && !segmentReceivables.length ? <p className="subtle">Nenhum recebivel neste filtro. Volte para Todos ou selecione outra origem.</p> : null}
      {!receivables.length ? <p className="subtle">Sem recebiveis em aberto.</p> : null}
    </WorkspaceList>
  );
}
