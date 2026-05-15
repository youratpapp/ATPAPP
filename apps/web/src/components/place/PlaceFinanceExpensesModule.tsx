import type { PlaceExpense } from "../../lib/types";
import { useState } from "react";
import { WorkspaceList, WorkspaceRow } from "./PlaceWorkspaceUi";

export type PlaceExpenseDraft = {
  amount: string;
  category: string;
  description: string;
  spentOn: string;
};

type PlaceFinanceExpensesModuleProps = {
  busy: boolean;
  draft?: PlaceExpenseDraft;
  expenses: PlaceExpense[];
  formatMoneyFromCents: (amountCents: number) => string;
  limit?: number;
  onCancelExpense: (expense: PlaceExpense) => void;
  onCreateExpense?: () => void;
  onDraftChange?: (draft: PlaceExpenseDraft) => void;
};

export function PlaceFinanceExpensesModule({
  busy,
  draft,
  expenses,
  formatMoneyFromCents,
  limit = 10,
  onCancelExpense,
  onCreateExpense,
  onDraftChange,
}: PlaceFinanceExpensesModuleProps) {
  const [showAll, setShowAll] = useState(false);
  const canCreate = Boolean(draft && onDraftChange && onCreateExpense);
  const visibleExpenses = showAll ? expenses : expenses.slice(0, limit);
  const hiddenCount = Math.max(0, expenses.length - visibleExpenses.length);

  return (
    <>
      {canCreate && draft && onDraftChange && onCreateExpense ? (
        <div className="place-staff-form">
          <input value={draft.category} onChange={(event) => onDraftChange({ ...draft, category: event.target.value })} placeholder="Categoria" />
          <input value={draft.description} onChange={(event) => onDraftChange({ ...draft, description: event.target.value })} placeholder="Despesa" />
          <input type="number" min={0} value={draft.amount} onChange={(event) => onDraftChange({ ...draft, amount: event.target.value })} placeholder="Valor R$" />
          <input type="date" value={draft.spentOn} onChange={(event) => onDraftChange({ ...draft, spentOn: event.target.value })} />
          <button type="button" onClick={onCreateExpense} disabled={busy || !draft.description.trim()}>
            Registrar despesa
          </button>
        </div>
      ) : null}
      <WorkspaceList>
        {visibleExpenses.map((expense) => (
          <WorkspaceRow
            key={`finance-expense:${expense.id}`}
            className={expense.status}
            title={expense.description}
            detail={`${formatMoneyFromCents(expense.amountCents)} | ${expense.category || "Despesa"} | ${expense.spentOn}`}
            actions={
              expense.status === "posted" ? (
                <button type="button" className="danger" onClick={() => onCancelExpense(expense)} disabled={busy}>
                  Cancelar
                </button>
              ) : null
            }
          >
            <small>{expense.status}</small>
          </WorkspaceRow>
        ))}
        {hiddenCount ? (
          <button type="button" className="secondary" onClick={() => setShowAll(true)}>
            Ver {hiddenCount} despesa{hiddenCount === 1 ? "" : "s"} restante{hiddenCount === 1 ? "" : "s"}
          </button>
        ) : null}
        {!expenses.length ? <p className="subtle">Sem despesas recentes.</p> : null}
      </WorkspaceList>
    </>
  );
}
