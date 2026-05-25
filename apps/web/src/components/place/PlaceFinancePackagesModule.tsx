import type { AcademyClass, AcademyLessonRequest, PlaceCreditPackage, PlaceCreditPurchase, PlaceMembershipPlan } from "../../lib/types";
import { useMemo, useState } from "react";

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
  const [selectedCreditPurchaseId, setSelectedCreditPurchaseId] = useState("");
  const cleanDraftNumber = (value: string) => (value === "0" ? "" : value);
  const selectedCreditPurchase = useMemo(
    () => creditPurchases.find((purchase) => purchase.id === selectedCreditPurchaseId) || activeCreditPurchases[0] || creditPurchases[0],
    [activeCreditPurchases, creditPurchases, selectedCreditPurchaseId]
  );
  const offerRows = [
    ...membershipPlans.map((plan) => ({
      id: `plan:${plan.id}`,
      name: plan.name,
      type: "Plano de socio",
      value: formatMoneyFromCents(plan.monthlyFeeCents),
      detail: `Quadras ${plan.courtDiscountPercent}% | aulas ${plan.academyDiscountPercent}%`,
      status: plan.isActive ? "Ativo" : "Pausado",
    })),
    ...academyClasses.map((academyClass) => ({
      id: `class:${academyClass.id}`,
      name: academyClass.title,
      type: "Turma mensal",
      value: formatMoneyFromCents(academyClass.monthlyFeeCents),
      detail: `${academyClass.capacity} vagas | ${academyClass.coachName || "Sem professor"}`,
      status: "Ativa",
    })),
    ...activeCreditPackages.map((item) => ({
      id: `package:${item.id}`,
      name: item.name,
      type: CREDIT_PACKAGE_TYPE_LABELS[item.packageType],
      value: formatMoneyFromCents(item.priceCents),
      detail: `${item.quantity} usos | ${item.validityDays} dias`,
      status: "Ativo",
    })),
    ...dropInRequests.map((request) => ({
      id: `dropin:${request.id}`,
      name: request.playerName,
      type: request.requestType === "drop_in" ? "Aula avulsa" : "Reposicao",
      value: formatMoneyFromCents(request.amountCents),
      detail: request.notes || "Solicitacao avulsa",
      status: request.paymentStatus,
    })),
  ];

  return (
    <section className="finance-packages-console">
      <div className="finance-package-summary" aria-label="Resumo de planos e creditos">
        <span>
          <strong>{membershipPlans.length}</strong>
          planos de socio
        </span>
        <span>
          <strong>{academyClasses.length}</strong>
          turmas mensais
        </span>
        <span>
          <strong>{creditBalanceUnits}</strong>
          creditos ativos
        </span>
        <span>
          <strong>{formatMoneyFromCents(recurringRevenueCents + creditPackageRevenueCents + lessonPackageRevenueCents)}</strong>
          receita vinculada
        </span>
        <span>
          <strong>{creditUsagePct}%</strong>
          uso dos creditos
        </span>
        <span>
          <strong>{creditPurchasesExpiringSoon.length + creditPurchasesLowBalance.length + creditPurchasesExpired.length}</strong>
          alertas de credito
        </span>
      </div>

      <div className="finance-packages-layout">
        <div className="finance-packages-main">
          <section className="finance-package-panel">
            <header>
              <div>
                <strong>Catalogo vendavel</strong>
                <span>Planos, turmas, creditos e aulas avulsas em uma lista unica.</span>
              </div>
            </header>
            <div className="finance-package-table" role="table" aria-label="Catalogo de planos e pacotes">
              <div className="finance-package-row finance-package-row--head" role="row">
                <span>Oferta</span>
                <span>Tipo</span>
                <span>Valor</span>
                <span>Status</span>
              </div>
              {offerRows.slice(0, 16).map((row) => (
                <div className="finance-package-row" role="row" key={row.id}>
                  <span>
                    <strong>{row.name}</strong>
                    <small>{row.detail}</small>
                  </span>
                  <span>{row.type}</span>
                  <span>{row.value}</span>
                  <span className="status-pill">{row.status}</span>
                </div>
              ))}
              {!offerRows.length ? <p className="empty-hint">Nenhuma oferta cadastrada ainda.</p> : null}
            </div>
          </section>

          <section className="finance-package-panel">
            <header>
              <div>
                <strong>Vendas de credito</strong>
                <span>Selecione uma venda para consumir saldo ou acompanhar vencimento.</span>
              </div>
              <span className="status-pill">{countLabel(activeCreditPurchases.length, "ativo", "ativos")}</span>
            </header>
            <div className="credit-package-form finance-package-sale-form">
              <select value={creditPurchaseDraft.packageId} onChange={(event) => onCreditPurchaseDraftChange({ ...creditPurchaseDraft, packageId: event.target.value })}>
                <option value="">Pacote</option>
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
            <div className="finance-package-table finance-package-table--credits" role="table" aria-label="Vendas de credito">
              <div className="finance-package-row finance-package-row--head" role="row">
                <span>Cliente</span>
                <span>Pacote</span>
                <span>Saldo</span>
                <span>Vence</span>
              </div>
              {creditPurchases.slice(0, 18).map((purchase) => (
                <button
                  type="button"
                  className={`finance-package-row finance-package-row--button${selectedCreditPurchase?.id === purchase.id ? " active" : ""}`}
                  key={`credit-purchase:${purchase.id}`}
                  onClick={() => setSelectedCreditPurchaseId(purchase.id)}
                >
                  <span>{purchase.buyerName}</span>
                  <span>{purchase.packageName}</span>
                  <span>{purchase.remainingQuantity}/{purchase.initialQuantity}</span>
                  <span>{purchase.expiresOn || "Sem data"}</span>
                </button>
              ))}
              {!creditPurchases.length ? <p className="empty-hint">Sem vendas de credito registradas.</p> : null}
            </div>
          </section>
        </div>

        <aside className="finance-package-side-drawer" aria-label="Detalhe de planos e creditos">
          <section>
            <span className="eyebrow">Credito selecionado</span>
            {selectedCreditPurchase ? (
              <>
                <strong>{selectedCreditPurchase.buyerName}</strong>
                <dl>
                  <div>
                    <dt>Pacote</dt>
                    <dd>{selectedCreditPurchase.packageName}</dd>
                  </div>
                  <div>
                    <dt>Saldo</dt>
                    <dd>{selectedCreditPurchase.remainingQuantity}/{selectedCreditPurchase.initialQuantity}</dd>
                  </div>
                  <div>
                    <dt>Vencimento</dt>
                    <dd>{selectedCreditPurchase.expiresOn || "Sem data"}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{selectedCreditPurchase.status}</dd>
                  </div>
                </dl>
                {selectedCreditPurchase.status === "active" ? (
                  <button type="button" onClick={() => onConsumeCreditPurchase(selectedCreditPurchase)} disabled={busy}>
                    Consumir 1 credito
                  </button>
                ) : null}
              </>
            ) : (
              <p className="empty-hint">Selecione uma venda para ver o saldo e as acoes.</p>
            )}
          </section>

          <section>
            <span className="eyebrow">Novo pacote</span>
            <div className="credit-package-form finance-package-drawer-form">
              <input value={creditPackageDraft.name} onChange={(event) => onCreditPackageDraftChange({ ...creditPackageDraft, name: event.target.value })} placeholder="Nome do pacote" />
              <select value={creditPackageDraft.packageType} onChange={(event) => onCreditPackageDraftChange({ ...creditPackageDraft, packageType: event.target.value as PlaceCreditPackage["packageType"] })}>
                <option value="court_credit">Credito de quadra</option>
                <option value="lesson_credit">Credito de aula</option>
                <option value="day_pass">Day pass</option>
              </select>
              <input type="number" min="1" value={creditPackageDraft.quantity} onChange={(event) => onCreditPackageDraftChange({ ...creditPackageDraft, quantity: event.target.value })} placeholder="Qtd." />
              <input type="number" min="0" value={cleanDraftNumber(creditPackageDraft.price)} onChange={(event) => onCreditPackageDraftChange({ ...creditPackageDraft, price: event.target.value })} placeholder="Valor R$" />
              <input type="number" min="1" value={creditPackageDraft.validityDays} onChange={(event) => onCreditPackageDraftChange({ ...creditPackageDraft, validityDays: event.target.value })} placeholder="Validade" />
              <button type="button" onClick={onCreateCreditPackage} disabled={busy || !creditPackageDraft.name.trim()}>
                Criar pacote
              </button>
            </div>
          </section>

          <section>
            <span className="eyebrow">Pacotes cadastrados</span>
            <div className="finance-package-mini-list">
              {creditPackages.slice(0, 8).map((item) => (
                <button type="button" key={`credit-package:${item.id}`} onClick={() => onToggleCreditPackage(item)} disabled={busy}>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{CREDIT_PACKAGE_TYPE_LABELS[item.packageType]} | {item.quantity} usos</small>
                  </span>
                  <em>{item.isActive ? "Pausar" : "Reativar"}</em>
                </button>
              ))}
              {!creditPackages.length ? <p className="empty-hint">Crie o primeiro pacote para vender creditos.</p> : null}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
