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
  return (
    <>
      <div className="place-booking-head">
        <strong>Planos e socios</strong>
        <span>{countLabel(activePlans.length, "plano", "planos")}</span>
      </div>
      {canManageFinance ? (
        <div className="place-staff-form">
          <input value={draft.name} onChange={(event) => onDraftChange({ ...draft, name: event.target.value })} placeholder="Plano" />
          <input type="number" min={0} value={draft.monthlyFee} onChange={(event) => onDraftChange({ ...draft, monthlyFee: event.target.value })} placeholder="Mensalidade R$" />
          <input type="number" min={0} max={100} value={draft.courtDiscount} onChange={(event) => onDraftChange({ ...draft, courtDiscount: event.target.value })} placeholder="% quadra" />
          <input type="number" min={0} max={100} value={draft.academyDiscount} onChange={(event) => onDraftChange({ ...draft, academyDiscount: event.target.value })} placeholder="% aulas" />
          <button type="button" onClick={onCreatePlan} disabled={busy || !draft.name.trim()}>
            Criar plano
          </button>
        </div>
      ) : null}
      {activePlans.length ? (
        <div className="place-court-list">
          {activePlans.map((plan) => {
            const alreadyMember = Boolean(myMembership);
            return (
              <span key={plan.id}>
                {plan.name} | {formatMoneyFromCents(plan.monthlyFeeCents)} / mes | quadras {plan.courtDiscountPercent}% | aulas {plan.academyDiscountPercent}%
                {!staffRole && !alreadyMember ? (
                  <>
                    <input value={membershipNotesByPlan[plan.id] || ""} onChange={(event) => onMembershipNoteChange(plan.id, event.target.value)} placeholder="Mensagem opcional" />
                    <button type="button" className="primary" onClick={() => onRequestMembership(plan)} disabled={busy}>
                      Quero ser socio
                    </button>
                  </>
                ) : null}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="subtle">Sem planos de socio cadastrados.</p>
      )}
      {myMembership && !staffRole ? (
        <div className="place-booking-list">
          <div className={`place-booking-row ${myMembership.status}`}>
            <div>
              <strong>{allPlans.find((plan) => plan.id === myMembership.planId)?.name || "Plano de socio"}</strong>
              <small>
                {myMembership.status === "active" ? "Ativo" : "Aguardando aprovacao"} |{" "}
                {paymentsByTarget[paymentMapKey("place_membership", myMembership.id, billingPeriod)]?.status === "paid"
                  ? "mensalidade paga"
                  : "pagamento sera confirmado pela plataforma"}
              </small>
            </div>
          </div>
        </div>
      ) : null}
      {canManageFinance && memberships.length ? (
        <div className="place-booking-list">
          <strong>Socios e solicitacoes</strong>
          {memberships.slice(0, 8).map((membership) => {
            const plan = allPlans.find((item) => item.id === membership.planId);
            const paid = paymentsByTarget[paymentMapKey("place_membership", membership.id, billingPeriod)]?.status === "paid";
            return (
              <div key={membership.id} className={`place-booking-row ${membership.status}`}>
                <div>
                  <strong>{membership.memberName}</strong>
                  <span>{plan?.name || "Plano"} | {membership.status}</span>
                  <small>{paid ? "Mensalidade paga no mes" : "Mensalidade pendente"}{membership.phone ? ` | ${membership.phone}` : ""}</small>
                </div>
                <span>
                  {membership.status === "pending" ? (
                    <button type="button" onClick={() => onUpdateMembership(membership.id, "active")} disabled={busy}>
                      Ativar
                    </button>
                  ) : null}
                  {membership.status === "active" && plan && !paid ? (
                    <button type="button" onClick={() => onMarkPaid(plan, membership)} disabled={busy}>
                      Marcar pago
                    </button>
                  ) : null}
                  {!paid ? (
                    <button
                      type="button"
                      onClick={() =>
                        onCreatePaymentReminder("place_membership", membership.id, billingPeriod, `${membership.memberName}, sua mensalidade de socio esta pendente.`)
                      }
                      disabled={busy}
                    >
                      Lembrar
                    </button>
                  ) : null}
                  {membership.status !== "cancelled" ? (
                    <button type="button" className="danger" onClick={() => onUpdateMembership(membership.id, "cancelled")} disabled={busy}>
                      Cancelar
                    </button>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
