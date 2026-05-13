import type { PlaceClientReceivable } from "./PlaceClientRelationshipModule";
import { WorkspaceList, WorkspaceRow } from "./PlaceWorkspaceUi";

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
          <button type="button" onClick={() => onCreatePaymentReminderBatch(receivables)} disabled={busy}>
            Lembrar todos
          </button>
          <button type="button" onClick={() => onCreatePaymentReminderBatch(membershipReceivables)} disabled={busy || !membershipReceivables.length}>
            Socios
          </button>
          <button type="button" onClick={() => onCreatePaymentReminderBatch(academyReceivables)} disabled={busy || !academyReceivables.length}>
            Academia
          </button>
        </div>
      ) : null}
      {receivables.slice(0, 12).map((receivable) => (
        <WorkspaceRow
          key={`finance-open:${receivable.id}`}
          title={receivable.title}
          detail={`${receivable.subtitle} | ${formatMoneyFromCents(receivable.amountCents)}`}
          actions={
            <button
              type="button"
              onClick={() => onCreatePaymentReminder(receivable.targetType, receivable.targetId, receivable.billingPeriod, receivable.reminder)}
              disabled={busy}
            >
              Lembrar
            </button>
          }
        >
          <small>{receivable.status === "pending_approval" ? "Aguardando aprovacao" : "Pagamento em aberto"}</small>
        </WorkspaceRow>
      ))}
      {!receivables.length ? <p className="subtle">Sem recebiveis em aberto.</p> : null}
    </WorkspaceList>
  );
}
