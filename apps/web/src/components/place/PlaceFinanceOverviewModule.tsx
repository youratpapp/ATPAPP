import type { PlaceExpense } from "../../lib/types";
import type { PlaceClientReceivable } from "./PlaceClientRelationshipModule";
import { WorkspaceCard, WorkspaceGrid } from "./PlaceWorkspaceUi";

type PlaceFinanceOverviewModuleProps = {
  activeAcademyClassCount: number;
  activeMembershipPlanCount: number;
  creditBalanceUnits: number;
  expenseCents: number;
  expenses: PlaceExpense[];
  formatMoneyFromCents: (amountCents: number) => string;
  openReceivables: PlaceClientReceivable[];
  paidBookingAmountCents: number;
  packageRevenueCents: number;
  posRevenueCents: number;
  recurringRevenueCents: number;
  countLabel: (count: number, singular: string, plural: string) => string;
};

export function PlaceFinanceOverviewModule({
  activeAcademyClassCount,
  activeMembershipPlanCount,
  creditBalanceUnits,
  expenseCents,
  expenses,
  formatMoneyFromCents,
  openReceivables,
  paidBookingAmountCents,
  packageRevenueCents,
  posRevenueCents,
  recurringRevenueCents,
  countLabel,
}: PlaceFinanceOverviewModuleProps) {
  return (
    <WorkspaceGrid>
      <WorkspaceCard
        title="Saldo operacional"
        subtitle="Reservas, cantina e despesas lancadas"
        value={formatMoneyFromCents(paidBookingAmountCents + posRevenueCents - expenseCents)}
        metrics={[`${formatMoneyFromCents(paidBookingAmountCents)} reservas`, `${formatMoneyFromCents(posRevenueCents)} cantina`, `${formatMoneyFromCents(expenseCents)} despesas`]}
      />
      <WorkspaceCard
        title="Recebiveis em aberto"
        subtitle="Mensalidades e cobrancas pendentes"
        value={openReceivables.length}
        detail={openReceivables.slice(0, 4).map((item) => item.title).join(", ") || "Sem pendencias financeiras"}
      />
      <WorkspaceCard
        title="Despesas recentes"
        subtitle="Lancamentos postados"
        value={expenses.filter((expense) => expense.status === "posted").length}
        detail={expenses.slice(0, 3).map((expense) => expense.description).join(", ") || "Sem despesas recentes"}
      />
      <WorkspaceCard
        title="Planos e pacotes"
        subtitle="Receita recorrente e ofertas vendaveis"
        value={formatMoneyFromCents(recurringRevenueCents + packageRevenueCents)}
        metrics={[countLabel(activeMembershipPlanCount, "plano", "planos"), countLabel(activeAcademyClassCount, "turma", "turmas"), `${creditBalanceUnits} creditos ativos`]}
      />
    </WorkspaceGrid>
  );
}
