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
};

export function PlaceFinanceReceivablesModule({
  academyReceivables,
  busy,
  formatMoneyFromCents,
  membershipReceivables,
  receivables,
  onCreatePaymentReminder,
  onCreatePaymentReminderBatch,
}: PlaceFinanceReceivablesModuleProps) {
  const receivableLabel = `${receivables.length} ${receivables.length === 1 ? "pendencia aberta" : "pendencias abertas"}`;

  return (
    <WorkspaceList>
      {receivables.length ? (
        <div className="billing-quick-actions">
          <div>
            <strong>Cobranca recorrente</strong>
            <span>{receivableLabel}</span>
          </div>
          <button className="primary" type="button" onClick={() => onCreatePaymentReminderBatch(receivables)} disabled={busy}>
            Enviar lembrete geral
          </button>
          <button className="quiet" type="button" onClick={() => onCreatePaymentReminderBatch(membershipReceivables)} disabled={busy || !membershipReceivables.length}>
            Cobrar socios
          </button>
          <button className="quiet" type="button" onClick={() => onCreatePaymentReminderBatch(academyReceivables)} disabled={busy || !academyReceivables.length}>
            Cobrar alunos
          </button>
        </div>
      ) : null}
      {receivables.slice(0, 12).map((receivable) => (
        <EntityActionRow
          key={`finance-open:${receivable.id}`}
          className={`finance-receivable-row ${receivable.status}`}
          title={receivable.title}
          context={receivable.subtitle}
          detail={formatMoneyFromCents(receivable.amountCents)}
          status={receivable.status === "pending_approval" ? "Aguardando aprovacao" : "Em aberto"}
          primaryAction={
            <button
              className="primary"
              type="button"
              onClick={() => onCreatePaymentReminder(receivable.targetType, receivable.targetId, receivable.billingPeriod, receivable.reminder)}
              disabled={busy}
            >
              Enviar lembrete
            </button>
          }
        >
          <small>{receivable.billingPeriod ? `Periodo ${receivable.billingPeriod}` : "Pagamento em aberto"}</small>
        </EntityActionRow>
      ))}
      {!receivables.length ? <p className="subtle">Sem recebiveis em aberto.</p> : null}
    </WorkspaceList>
  );
}
