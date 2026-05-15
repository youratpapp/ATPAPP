import { useMemo, useState } from "react";
import type { PlaceClientReceivable } from "./PlaceClientRelationshipModule";
import { EntityActionRow, WorkspaceList } from "./PlaceWorkspaceUi";

type PlaceFinancePaidModuleProps = {
  formatMoneyFromCents: (amountCents: number) => string;
  receivables: PlaceClientReceivable[];
};

export function PlaceFinancePaidModule({ formatMoneyFromCents, receivables }: PlaceFinancePaidModuleProps) {
  const [showAll, setShowAll] = useState(false);
  const paidReceivables = useMemo(() => receivables.filter((receivable) => receivable.status === "paid"), [receivables]);
  const visibleReceivables = showAll ? paidReceivables : paidReceivables.slice(0, 16);
  const hiddenCount = Math.max(0, paidReceivables.length - visibleReceivables.length);

  return (
    <WorkspaceList>
      {visibleReceivables.map((receivable) => (
        <EntityActionRow
          key={`finance-paid:${receivable.id}`}
          className="finance-receivable-row paid"
          title={receivable.title}
          context={[receivable.originLabel, receivable.subtitle].filter(Boolean).join(" | ")}
          detail={formatMoneyFromCents(receivable.amountCents)}
          status="Pago"
        >
          <small>{[receivable.dueLabel, receivable.billingPeriod ? `Periodo ${receivable.billingPeriod}` : ""].filter(Boolean).join(" | ") || "Pagamento registrado"}</small>
        </EntityActionRow>
      ))}
      {hiddenCount ? (
        <button type="button" className="secondary" onClick={() => setShowAll(true)}>
          Ver {hiddenCount} pagamento{hiddenCount === 1 ? "" : "s"} restante{hiddenCount === 1 ? "" : "s"}
        </button>
      ) : null}
      {!paidReceivables.length ? <p className="subtle">Nenhum pagamento registrado neste recorte.</p> : null}
    </WorkspaceList>
  );
}
