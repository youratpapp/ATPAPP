import { useMemo, useState, type FormEvent } from "react";
import type { AppPayment, PlaceMembership, PlaceMembershipPlan } from "../../lib/types";

export type PlaceMembershipPlanDraft = {
  academyDiscount: string;
  courtDiscount: string;
  monthlyFee: string;
  name: string;
};

type PlaceMembershipModuleProps = {
  activePlans: PlaceMembershipPlan[];
  allPlans: PlaceMembershipPlan[];
  billingPeriod: string;
  busy: boolean;
  canManageFinance: boolean;
  countLabel: (count: number, singular: string, plural: string) => string;
  draft: PlaceMembershipPlanDraft;
  formatMoneyFromCents: (amountCents: number) => string;
  memberships: PlaceMembership[];
  membershipNotesByPlan: Record<string, string>;
  myMembership: PlaceMembership | undefined;
  paymentsByTarget: Record<string, AppPayment>;
  staffRole: boolean;
  onCreatePaymentReminder: (targetType: string, targetId: string, billingPeriod: string, message: string) => void;
  onCreatePlan: () => void;
  onDraftChange: (draft: PlaceMembershipPlanDraft) => void;
  onMarkPaid: (plan: PlaceMembershipPlan, membership: PlaceMembership) => void;
  onMembershipNoteChange: (planId: string, value: string) => void;
  onRequestMembership: (plan: PlaceMembershipPlan) => void;
  onUpdateMembership: (membershipId: string, status: PlaceMembership["status"]) => void;
  paymentMapKey: (targetType: string, targetId: string, billingPeriod?: string) => string;
};

export function PlaceMembershipModule({
  activePlans,
  allPlans,
  billingPeriod,
  busy,
  canManageFinance,
  countLabel,
  draft,
  formatMoneyFromCents,
  memberships,
  membershipNotesByPlan,
  myMembership,
  paymentsByTarget,
  staffRole,
  onCreatePaymentReminder,
  onCreatePlan,
  onDraftChange,
  onMarkPaid,
  onMembershipNoteChange,
  onRequestMembership,
  onUpdateMembership,
  paymentMapKey,
}: PlaceMembershipModuleProps) {
  const [selectedMembershipId, setSelectedMembershipId] = useState("");
  const selectedMembership = useMemo(
    () => memberships.find((membership) => membership.id === selectedMembershipId) || memberships[0],
    [memberships, selectedMembershipId]
  );
  const selectedPlan = selectedMembership ? allPlans.find((plan) => plan.id === selectedMembership.planId) : undefined;
  const selectedPaid = selectedMembership
    ? paymentsByTarget[paymentMapKey("place_membership", selectedMembership.id, billingPeriod)]?.status === "paid"
    : false;
  const cleanDraftNumber = (value: string) => (value === "0" ? "" : value);

  const submitPlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreatePlan();
  };

  return (
    <section className="membership-console">
      <header className="membership-console-head">
        <div>
          <strong>Planos e socios</strong>
          <span>Planos recorrentes, solicitacoes e mensalidades do periodo.</span>
        </div>
        <b>{countLabel(activePlans.length, "plano", "planos")}</b>
      </header>

      {myMembership && !staffRole ? (
        <div className="membership-self-card">
          <strong>{allPlans.find((plan) => plan.id === myMembership.planId)?.name || "Plano de socio"}</strong>
          <span>{myMembership.status === "active" ? "Ativo" : "Aguardando aprovacao"}</span>
          <small>
            {paymentsByTarget[paymentMapKey("place_membership", myMembership.id, billingPeriod)]?.status === "paid"
              ? "Mensalidade paga"
              : "Pagamento sera confirmado pela plataforma"}
          </small>
        </div>
      ) : null}

      {canManageFinance ? (
        <div className="membership-console-layout">
          <div className="membership-console-main">
            <div className="membership-plans-strip" aria-label="Planos ativos">
              {activePlans.length ? (
                activePlans.map((plan) => (
                  <article key={plan.id}>
                    <strong>{plan.name}</strong>
                    <span>{formatMoneyFromCents(plan.monthlyFeeCents)} / mes</span>
                    <small>Quadras {plan.courtDiscountPercent}% | aulas {plan.academyDiscountPercent}%</small>
                  </article>
                ))
              ) : (
                <p className="subtle">Sem planos de socio cadastrados.</p>
              )}
            </div>

            <div className="membership-table" role="table" aria-label="Socios e solicitacoes">
              <div className="membership-table-head" role="row">
                <span>Socio</span>
                <span>Plano</span>
                <span>Status</span>
                <span>Mensalidade</span>
              </div>
              {memberships.length ? (
                memberships.map((membership) => {
                  const plan = allPlans.find((item) => item.id === membership.planId);
                  const paid = paymentsByTarget[paymentMapKey("place_membership", membership.id, billingPeriod)]?.status === "paid";
                  return (
                    <button
                      key={membership.id}
                      type="button"
                      className={`membership-row ${selectedMembership?.id === membership.id ? "active" : ""} ${membership.status}`}
                      onClick={() => setSelectedMembershipId(membership.id)}
                    >
                      <strong>{membership.memberName}</strong>
                      <span>{plan?.name || "Plano"}</span>
                      <em>{membership.status}</em>
                      <small>{paid ? "Paga" : "Pendente"}</small>
                    </button>
                  );
                })
              ) : (
                <div className="membership-empty-row">Nenhum socio ou solicitacao neste periodo.</div>
              )}
            </div>
          </div>

          <aside className="membership-side-drawer" aria-label="Detalhe do socio">
            {selectedMembership ? (
              <>
                <span>Socio selecionado</span>
                <strong>{selectedMembership.memberName}</strong>
                <dl>
                  <div>
                    <dt>Plano</dt>
                    <dd>{selectedPlan?.name || "Plano"}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{selectedMembership.status}</dd>
                  </div>
                  <div>
                    <dt>Telefone</dt>
                    <dd>{selectedMembership.phone || "Sem telefone"}</dd>
                  </div>
                  <div>
                    <dt>Mensalidade</dt>
                    <dd>{selectedPaid ? "Paga no mes" : "Pendente"}</dd>
                  </div>
                </dl>
                <div className="membership-actions">
                  {selectedMembership.status === "pending" ? (
                    <button type="button" onClick={() => onUpdateMembership(selectedMembership.id, "active")} disabled={busy}>
                      Ativar
                    </button>
                  ) : null}
                  {selectedMembership.status === "active" && selectedPlan && !selectedPaid ? (
                    <button type="button" className="primary" onClick={() => onMarkPaid(selectedPlan, selectedMembership)} disabled={busy}>
                      Pagar
                    </button>
                  ) : null}
                  {!selectedPaid ? (
                    <button
                      type="button"
                      onClick={() =>
                        onCreatePaymentReminder("place_membership", selectedMembership.id, billingPeriod, `${selectedMembership.memberName}, sua mensalidade de socio esta pendente.`)
                      }
                      disabled={busy}
                    >
                      Lembrar
                    </button>
                  ) : null}
                  {selectedMembership.status !== "cancelled" ? (
                    <button type="button" className="danger" onClick={() => onUpdateMembership(selectedMembership.id, "cancelled")} disabled={busy}>
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="subtle">Selecione um socio para ver plano, pagamento e acoes.</p>
            )}

            <form className="membership-plan-form" onSubmit={submitPlan}>
              <span>Novo plano</span>
              <input value={draft.name} onChange={(event) => onDraftChange({ ...draft, name: event.target.value })} placeholder="Plano" />
              <input type="number" min={0} value={cleanDraftNumber(draft.monthlyFee)} onChange={(event) => onDraftChange({ ...draft, monthlyFee: event.target.value })} placeholder="Mensalidade R$" />
              <div>
                <input type="number" min={0} max={100} value={cleanDraftNumber(draft.courtDiscount)} onChange={(event) => onDraftChange({ ...draft, courtDiscount: event.target.value })} placeholder="% quadra" />
                <input type="number" min={0} max={100} value={cleanDraftNumber(draft.academyDiscount)} onChange={(event) => onDraftChange({ ...draft, academyDiscount: event.target.value })} placeholder="% aulas" />
              </div>
              <button type="submit" disabled={busy || !draft.name.trim()}>
                Criar plano
              </button>
            </form>
          </aside>
        </div>
      ) : activePlans.length ? (
        <div className="membership-plans-strip" aria-label="Planos ativos">
          {activePlans.map((plan) => {
            const alreadyMember = Boolean(myMembership);
            return (
              <article key={plan.id}>
                <strong>{plan.name}</strong>
                <span>{formatMoneyFromCents(plan.monthlyFeeCents)} / mes</span>
                <small>Quadras {plan.courtDiscountPercent}% | aulas {plan.academyDiscountPercent}%</small>
                {!staffRole && !alreadyMember ? (
                  <>
                    <input value={membershipNotesByPlan[plan.id] || ""} onChange={(event) => onMembershipNoteChange(plan.id, event.target.value)} placeholder="Mensagem opcional" />
                    <button type="button" className="primary" onClick={() => onRequestMembership(plan)} disabled={busy}>
                      Quero ser socio
                    </button>
                  </>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="subtle">Sem planos de socio cadastrados.</p>
      )}
    </section>
  );
}
