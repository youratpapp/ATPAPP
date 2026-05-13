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
  return (
    <WorkspaceList>
      {receivables.length ? (
        <div className="cluster">
          <button className="primary" type="button" onClick={() => onCreatePaymentReminderBatch(receivables)} disabled={busy}>
            Lembrar todos
          </button>
          <button className="quiet" type="button" onClick={() => onCreatePaymentReminderBatch(membershipReceivables)} disabled={busy || !membershipReceivables.length}>
            Socios
          </button>
          <button className="quiet" type="button" onClick={() => onCreatePaymentReminderBatch(academyReceivables)} disabled={busy || !academyReceivables.length}>
            Academia
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
              Lembrar
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
