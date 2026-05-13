import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type FinanceManagementView = "overview" | "receivables" | "expenses";

const FINANCE_VIEW_LABELS: Record<FinanceManagementView, string> = {
  overview: "Resumo",
  receivables: "Recebiveis",
  expenses: "Despesas",
};

const FINANCE_VIEW_DESCRIPTIONS: Record<FinanceManagementView, string> = {
  overview: "Saldo operacional, receitas e alertas do periodo.",
  receivables: "Mensalidades, pagamentos pendentes e lembretes de cobranca.",
  expenses: "Lancamentos, despesas recentes e cancelamentos.",
};

type FinanceWorkspaceShellProps = {
  activeView: FinanceManagementView;
  children: ReactNode;
  onViewChange: (view: FinanceManagementView) => void;
};

export function FinanceWorkspaceShell({ activeView, children, onViewChange }: FinanceWorkspaceShellProps) {
  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes financeiras"
      className="finance-workspace"
      descriptions={FINANCE_VIEW_DESCRIPTIONS}
      labels={FINANCE_VIEW_LABELS}
      onViewChange={onViewChange}
      title="Central financeira"
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
