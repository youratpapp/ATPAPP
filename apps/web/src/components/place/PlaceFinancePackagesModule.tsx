import type { AcademyClass, AcademyLessonRequest, PlaceCreditPackage, PlaceCreditPurchase, PlaceMembershipPlan } from "../../lib/types";
import { WorkspaceCard, WorkspaceGrid, WorkspaceList } from "./PlaceWorkspaceUi";

export type PlaceCreditPackageDraft = {
  name: string;
  packageType: PlaceCreditPackage["packageType"];
  price: string;
  quantity: string;
  validityDays: string;
};

export type PlaceCreditPurchaseDraft = {
  buyerName: string;
  notes: string;
  packageId: string;
  phone: string;
};

type PlaceFinancePackagesModuleProps = {
  academyClasses: AcademyClass[];
  academyLessonRequests: AcademyLessonRequest[];
  activeCreditPackages: PlaceCreditPackage[];
  busy: boolean;
  countLabel: (count: number, singular: string, plural: string) => string;
  creditBalanceUnits: number;
  creditPackageDraft: PlaceCreditPackageDraft;
  creditPackageRevenueCents: number;
  creditPackages: PlaceCreditPackage[];
  creditPurchaseDraft: PlaceCreditPurchaseDraft;
  creditPurchases: PlaceCreditPurchase[];
  creditPurchasesExpired: PlaceCreditPurchase[];
  creditPurchasesExpiringSoon: PlaceCreditPurchase[];
  creditPurchasesLowBalance: PlaceCreditPurchase[];
  creditUsagePct: number;
  formatMoneyFromCents: (amountCents: number) => string;
  lessonPackageRevenueCents: number;
  membershipPlans: PlaceMembershipPlan[];
  recurringRevenueCents: number;
  onConsumeCreditPurchase: (purchase: PlaceCreditPurchase) => void;
  onCreateCreditPackage: () => void;
  onCreditPackageDraftChange: (draft: PlaceCreditPackageDraft) => void;
  onCreditPurchaseDraftChange: (draft: PlaceCreditPurchaseDraft) => void;
  onRecordCreditPurchase: () => void;
  onToggleCreditPackage: (creditPackage: PlaceCreditPackage) => void;
};

const CREDIT_PACKAGE_TYPE_LABELS: Record<PlaceCreditPackage["packageType"], string> = {
  court_credit: "Credito de quadra",
  day_pass: "Day pass",
  lesson_credit: "Credito de aula",
};

export function PlaceFinancePackagesModule({
  academyClasses,
  academyLessonRequests,
  activeCreditPackages,
  busy,
  countLabel,
  creditBalanceUnits,
  creditPackageDraft,
  creditPackageRevenueCents,
  creditPackages,
  creditPurchaseDraft,
  creditPurchases,
  creditPurchasesExpired,
  creditPurchasesExpiringSoon,
  creditPurchasesLowBalance,
  creditUsagePct,
  formatMoneyFromCents,
  lessonPackageRevenueCents,
  membershipPlans,
  recurringRevenueCents,
  onConsumeCreditPurchase,
  onCreateCreditPackage,
  onCreditPackageDraftChange,
  onCreditPurchaseDraftChange,
  onRecordCreditPurchase,
  onToggleCreditPackage,
}: PlaceFinancePackagesModuleProps) {
  const dropInRequests = academyLessonRequests.filter((request) => request.requestType === "drop_in");
  const activeCreditPurchases = creditPurchases.filter((purchase) => purchase.status === "active");

  return (
    <WorkspaceGrid>
      <WorkspaceCard title="Planos de socio" subtitle="Recorrencia mensal com beneficios" value={membershipPlans.length}>
        <WorkspaceList>
          {membershipPlans.slice(0, 6).map((plan) => (
            <span key={`finance-package-plan:${plan.id}`}>
              <strong>{plan.name}</strong>
              <small>{formatMoneyFromCents(plan.monthlyFeeCents)} / mes | quadras {plan.courtDiscountPercent}% | aulas {plan.academyDiscountPercent}%</small>
            </span>
          ))}
          {!membershipPlans.length ? <span>Crie planos de socio em Financeiro &gt; Planos.</span> : null}
        </WorkspaceList>
      </WorkspaceCard>
      <WorkspaceCard title="Turmas da academia" subtitle="Pacotes mensais por turma" value={academyClasses.length}>
        <WorkspaceList>
          {academyClasses.slice(0, 6).map((academyClass) => (
            <span key={`finance-package-class:${academyClass.id}`}>
              <strong>{academyClass.title}</strong>
              <small>{formatMoneyFromCents(academyClass.monthlyFeeCents)} / mes | {academyClass.capacity} vagas</small>
            </span>
          ))}
          {!academyClasses.length ? <span>Cadastre turmas para vender mensalidades.</span> : null}
        </WorkspaceList>
      </WorkspaceCard>
      <WorkspaceCard
        title="Aulas avulsas"
        subtitle="Drop-in e reposicoes cobradas"
        value={academyLessonRequests.length}
        metrics={[`${formatMoneyFromCents(lessonPackageRevenueCents)} ja pago`, countLabel(dropInRequests.length, "drop-in", "drop-ins")]}
      >
        <WorkspaceList>
          {academyLessonRequests.slice(0, 5).map((request) => (
            <span key={`finance-package-request:${request.id}`}>
              <strong>{request.playerName}</strong>
              <small>{request.requestType === "drop_in" ? "Aula avulsa" : "Reposicao"} | {formatMoneyFromCents(request.amountCents)} | {request.paymentStatus}</small>
            </span>
          ))}
          {!academyLessonRequests.length ? <span>Sem aulas avulsas ou reposicoes solicitadas.</span> : null}
        </WorkspaceList>
      </WorkspaceCard>
      <WorkspaceCard
        title="Mapa de ofertas"
        subtitle="Produtos que ja podem ser vendidos sem confundir operacao"
        value={membershipPlans.length + academyClasses.length + activeCreditPackages.length + dropInRequests.length}
        metrics={[
          membershipPlans.length ? "Socio recorrente pronto" : "Criar plano de socio",
          academyClasses.length ? "Turmas mensais prontas" : "Criar turmas mensais",
          activeCreditPackages.length ? "Credito com saldo pronto" : "Criar pacote de credito",
        ]}
      >
        <WorkspaceList>
          <span>
            <strong>Mensalidade recorrente</strong>
            <small>{formatMoneyFromCents(recurringRevenueCents)} previstos entre socios e turmas.</small>
          </span>
          <span>
            <strong>Aula avulsa</strong>
            <small>{countLabel(dropInRequests.length, "solicitacao", "solicitacoes")} registradas.</small>
          </span>
          <span>
            <strong>Pacote com saldo</strong>
            <small>{countLabel(activeCreditPackages.length, "pacote ativo", "pacotes ativos")} | {creditBalanceUnits} creditos disponiveis vendidos.</small>
          </span>
        </WorkspaceList>
      </WorkspaceCard>
      <WorkspaceCard
        title="Saude dos creditos"
        subtitle="Vencimento, saldo e consumo"
        value={`${creditUsagePct}%`}
        metrics={[`${creditPurchasesExpiringSoon.length} vencendo`, `${creditPurchasesLowBalance.length} saldo baixo`, `${creditPurchasesExpired.length} vencidos`]}
      >
        <WorkspaceList>
          {creditPurchasesExpiringSoon.slice(0, 3).map((purchase) => (
            <span key={`credit-expiring:${purchase.id}`}>
              <strong>{purchase.buyerName}</strong>
              <small>{purchase.packageName} | vence {purchase.expiresOn} | {purchase.remainingQuantity} restantes</small>
            </span>
          ))}
          {!creditPurchasesExpiringSoon.length ? <span>Nenhum credito vencendo nos proximos 7 dias.</span> : null}
          {creditPurchasesLowBalance.slice(0, 3).map((purchase) => (
            <span key={`credit-low:${purchase.id}`}>
              <strong>{purchase.buyerName}</strong>
              <small>{purchase.packageName} | saldo baixo: {purchase.remainingQuantity}/{purchase.initialQuantity}</small>
              <button type="button" onClick={() => onConsumeCreditPurchase(purchase)} disabled={busy}>
                Consumir 1
              </button>
            </span>
          ))}
        </WorkspaceList>
      </WorkspaceCard>
      <WorkspaceCard
        title="Creditos e passes"
        subtitle="Venda com saldo, validade e consumo manual"
        value={activeCreditPackages.length}
        metrics={[`${creditBalanceUnits} saldo ativo`, `${formatMoneyFromCents(creditPackageRevenueCents)} vendido`]}
      >
        <div className="credit-package-form">
          <input value={creditPackageDraft.name} onChange={(event) => onCreditPackageDraftChange({ ...creditPackageDraft, name: event.target.value })} placeholder="Nome do pacote" />
          <select value={creditPackageDraft.packageType} onChange={(event) => onCreditPackageDraftChange({ ...creditPackageDraft, packageType: event.target.value as PlaceCreditPackage["packageType"] })}>
            <option value="court_credit">Credito de quadra</option>
            <option value="lesson_credit">Credito de aula</option>
            <option value="day_pass">Day pass</option>
          </select>
          <input type="number" min="1" value={creditPackageDraft.quantity} onChange={(event) => onCreditPackageDraftChange({ ...creditPackageDraft, quantity: event.target.value })} placeholder="Qtd." />
          <input type="number" min="0" value={creditPackageDraft.price} onChange={(event) => onCreditPackageDraftChange({ ...creditPackageDraft, price: event.target.value })} placeholder="Valor R$" />
          <input
            type="number"
            min="1"
            value={creditPackageDraft.validityDays}
            onChange={(event) => onCreditPackageDraftChange({ ...creditPackageDraft, validityDays: event.target.value })}
            placeholder="Validade"
          />
          <button type="button" onClick={onCreateCreditPackage} disabled={busy || !creditPackageDraft.name.trim()}>
            Criar pacote
          </button>
        </div>
        <WorkspaceList>
          {creditPackages.slice(0, 6).map((item) => (
            <span key={`credit-package:${item.id}`}>
              <strong>{item.name}</strong>
              <small>{CREDIT_PACKAGE_TYPE_LABELS[item.packageType]} | {item.quantity} usos | {formatMoneyFromCents(item.priceCents)} | {item.validityDays} dias</small>
              <button type="button" onClick={() => onToggleCreditPackage(item)} disabled={busy}>
                {item.isActive ? "Pausar" : "Reativar"}
              </button>
            </span>
          ))}
          {!creditPackages.length ? <span>Crie o primeiro pacote com saldo para vender credito real.</span> : null}
        </WorkspaceList>
      </WorkspaceCard>
      <WorkspaceCard title="Vendas de credito" subtitle="Controle de saldo por comprador" value={activeCreditPurchases.length} metrics={[countLabel(creditPurchases.length, "venda", "vendas"), `${creditBalanceUnits} usos restantes`]}>
        <div className="credit-package-form">
          <select value={creditPurchaseDraft.packageId} onChange={(event) => onCreditPurchaseDraftChange({ ...creditPurchaseDraft, packageId: event.target.value })}>
            <option value="">Selecione o pacote</option>
            {activeCreditPackages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input value={creditPurchaseDraft.buyerName} onChange={(event) => onCreditPurchaseDraftChange({ ...creditPurchaseDraft, buyerName: event.target.value })} placeholder="Comprador" />
          <input value={creditPurchaseDraft.phone} onChange={(event) => onCreditPurchaseDraftChange({ ...creditPurchaseDraft, phone: event.target.value })} placeholder="Telefone" />
          <input value={creditPurchaseDraft.notes} onChange={(event) => onCreditPurchaseDraftChange({ ...creditPurchaseDraft, notes: event.target.value })} placeholder="Notas" />
          <button type="button" onClick={onRecordCreditPurchase} disabled={busy || !creditPurchaseDraft.packageId || !creditPurchaseDraft.buyerName.trim()}>
            Registrar venda
          </button>
        </div>
        <WorkspaceList>
          {creditPurchases.slice(0, 8).map((purchase) => (
            <span key={`credit-purchase:${purchase.id}`}>
              <strong>{purchase.buyerName}</strong>
              <small>{purchase.packageName} | {purchase.remainingQuantity}/{purchase.initialQuantity} restantes | vence {purchase.expiresOn || "sem data"} | {purchase.status}</small>
              {purchase.status === "active" ? (
                <button type="button" onClick={() => onConsumeCreditPurchase(purchase)} disabled={busy}>
                  Consumir 1
                </button>
              ) : null}
            </span>
          ))}
          {!creditPurchases.length ? <span>Sem vendas de credito registradas.</span> : null}
        </WorkspaceList>
      </WorkspaceCard>
    </WorkspaceGrid>
  );
}
