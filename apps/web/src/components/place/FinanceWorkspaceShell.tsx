import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type FinanceManagementView = "receivables" | "paid" | "expenses" | "packages" | "overview";

const FINANCE_VIEW_LABELS: Record<FinanceManagementView, string> = {
  receivables: "Recebiveis",
  paid: "Pagos",
  expenses: "Despesas",
  packages: "Planos",
  overview: "Resumo",
};

const FINANCE_VIEW_DESCRIPTIONS: Record<FinanceManagementView, string> = {
  receivables: "Quem cobrar agora, vencidos, lembretes e baixas manuais.",
  paid: "Pagamentos registrados no periodo e comprovacao operacional.",
  expenses: "Lancamentos, despesas recentes e cancelamentos.",
  packages: "Planos, pacotes recorrentes e ofertas vendaveis.",
  overview: "Resumo e relatorio secundario da receita do periodo.",
};

const FINANCE_VIEW_TITLES: Record<FinanceManagementView, string> = {
  receivables: "Receber",
  paid: "Pagos",
  expenses: "Despesas",
  packages: "Planos",
  overview: "Resumo financeiro",
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
      ariaLabel="Visoes de receita"
      className="finance-workspace"
      descriptions={FINANCE_VIEW_DESCRIPTIONS}
      labels={FINANCE_VIEW_LABELS}
      onViewChange={onViewChange}
      title={FINANCE_VIEW_TITLES[activeView]}
      views={[activeView]}
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
