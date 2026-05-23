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
  showPosRevenue?: boolean;
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
  showPosRevenue = true,
  countLabel,
}: PlaceFinanceOverviewModuleProps) {
  const openReceivableCents = openReceivables.reduce((sum, item) => sum + item.amountCents, 0);
  const overdueReceivables = openReceivables.filter((item) => item.dueStatus === "overdue");
  const todayReceivables = openReceivables.filter((item) => item.dueStatus === "today");
  const receivablesByOrigin = [
    { label: "Aulas", value: openReceivables.filter((item) => item.origin === "academy" || item.origin === "lesson").reduce((sum, item) => sum + item.amountCents, 0) },
    { label: "Planos", value: openReceivables.filter((item) => item.origin === "membership").reduce((sum, item) => sum + item.amountCents, 0) },
    { label: "Reservas", value: openReceivables.filter((item) => item.origin === "booking").reduce((sum, item) => sum + item.amountCents, 0) },
    { label: "Outros", value: openReceivables.filter((item) => !item.origin || item.origin === "other").reduce((sum, item) => sum + item.amountCents, 0) },
  ].filter((item) => item.value > 0);
  const expensesByStatus = [
    { label: "Postadas", value: expenses.filter((expense) => expense.status === "posted").reduce((sum, expense) => sum + expense.amountCents, 0) },
    { label: "Canceladas", value: expenses.filter((expense) => expense.status === "cancelled").reduce((sum, expense) => sum + expense.amountCents, 0) },
  ].filter((item) => item.value > 0);
  const netProjectedCents = paidBookingAmountCents + posRevenueCents + recurringRevenueCents + packageRevenueCents + openReceivableCents - expenseCents;

  return (
    <div className="finance-overview-console">
      <WorkspaceGrid>
      <WorkspaceCard
        title="Saldo operacional"
        subtitle={showPosRevenue ? "Reservas, cantina e despesas lancadas" : "Reservas e despesas lancadas"}
        value={formatMoneyFromCents(paidBookingAmountCents + posRevenueCents - expenseCents)}
        metrics={[
          `${formatMoneyFromCents(paidBookingAmountCents)} reservas`,
          ...(showPosRevenue ? [`${formatMoneyFromCents(posRevenueCents)} cantina`] : []),
          `${formatMoneyFromCents(expenseCents)} despesas`,
        ]}
      />
      <WorkspaceCard
        title="Recebiveis em aberto"
        subtitle="Mensalidades e cobrancas pendentes"
        value={openReceivables.length}
        detail={`${formatMoneyFromCents(openReceivableCents)} em aberto | ${overdueReceivables.length} vencido(s) | ${todayReceivables.length} vence(m) hoje`}
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

      <section className="finance-overview-ledger" aria-label="Resumo financeiro por origem">
        <article>
          <header>
            <span>Recebiveis por origem</span>
            <strong>{formatMoneyFromCents(openReceivableCents)}</strong>
          </header>
          {receivablesByOrigin.length ? (
            receivablesByOrigin.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{formatMoneyFromCents(item.value)}</strong>
              </div>
            ))
          ) : (
            <p>Sem recebiveis em aberto.</p>
          )}
        </article>
        <article>
          <header>
            <span>Despesas e conciliacao</span>
            <strong>{formatMoneyFromCents(expenseCents)}</strong>
          </header>
          {expensesByStatus.length ? (
            expensesByStatus.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{formatMoneyFromCents(item.value)}</strong>
              </div>
            ))
          ) : (
            <p>Sem despesas lancadas no periodo.</p>
          )}
        </article>
        <article>
          <header>
            <span>Projecao operacional</span>
            <strong>{formatMoneyFromCents(netProjectedCents)}</strong>
          </header>
          <div>
            <span>Receita realizada</span>
            <strong>{formatMoneyFromCents(paidBookingAmountCents + posRevenueCents + recurringRevenueCents + packageRevenueCents)}</strong>
          </div>
          <div>
            <span>Receita pendente</span>
            <strong>{formatMoneyFromCents(openReceivableCents)}</strong>
          </div>
        </article>
      </section>
    </div>
  );
}
