import type { PlaceBookingRule, PlaceCourt, PlaceMembership, PlaceMembershipPlan } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { formatMoneyFromCents } from "../../lib/payments";

export type PlaceBookingRuleDraft = {
  advanceDays: string;
  endsAt: string;
  maxMinutes: string;
  memberPrice: string;
  minMinutes: string;
  name: string;
  price: string;
  profileScope: PlaceBookingRule["profileScope"];
  requiresApproval: boolean;
  startsAt: string;
  weekdays: string;
};

type CourtPriceDraft = {
  memberPrice: string;
  publicPrice: string;
};

type Props = {
  activeCourts: PlaceCourt[];
  bookingRuleDraft: PlaceBookingRuleDraft;
  bookingRules: PlaceBookingRule[];
  busy: boolean;
  canManageBookings: boolean;
  canManageFinance: boolean;
  courtDraft: string;
  courtPriceDraftByCourt: Record<string, CourtPriceDraft>;
  membershipPlans: PlaceMembershipPlan[];
  myMembership?: PlaceMembership;
  onChangeCourtDraft: (value: string) => void;
  onChangeCourtPriceDraft: (courtId: string, draft: CourtPriceDraft) => void;
  onChangeRuleDraft: (draft: PlaceBookingRuleDraft) => void;
  onCreateCourt: () => void;
  onCreateRule: () => void;
  onSaveCourtPrice: (court: PlaceCourt) => void;
  onToggleRule: (rule: PlaceBookingRule) => void;
  ruleProfileScopeLabels: Record<PlaceBookingRule["profileScope"], string>;
  ruleWeekdaysLabel: (weekdays: number[]) => string;
};

function defaultPriceDraft(court: PlaceCourt): CourtPriceDraft {
  return {
    publicPrice: String(Math.round(court.bookingFeeCents / 100)),
    memberPrice: court.memberBookingFeeCents === null ? "" : String(Math.round(court.memberBookingFeeCents / 100)),
  };
}

export function PlaceBookingResourcesModule({
  activeCourts,
  bookingRuleDraft,
  bookingRules,
  busy,
  canManageBookings,
  canManageFinance,
  courtDraft,
  courtPriceDraftByCourt,
  membershipPlans,
  myMembership,
  onChangeCourtDraft,
  onChangeCourtPriceDraft,
  onChangeRuleDraft,
  onCreateCourt,
  onCreateRule,
  onSaveCourtPrice,
  onToggleRule,
  ruleProfileScopeLabels,
  ruleWeekdaysLabel,
}: Props) {
  return (
    <>
      <div className="place-booking-head">
        <strong>Quadras e reservas</strong>
        <span>{countLabel(activeCourts.length, "quadra", "quadras")}</span>
      </div>
      {canManageBookings ? (
        <div className="place-court-create">
          <input value={courtDraft} onChange={(event) => onChangeCourtDraft(event.target.value)} placeholder="Nova quadra" />
          <button onClick={onCreateCourt} disabled={busy || !courtDraft.trim()}>
            Adicionar
          </button>
        </div>
      ) : null}
      {activeCourts.length ? (
        <div className="place-court-list">
          {activeCourts.map((court) => {
            const priceDraft = courtPriceDraftByCourt[court.id] || defaultPriceDraft(court);
            const plan = myMembership?.status === "active" ? membershipPlans.find((item) => item.id === myMembership.planId) : undefined;
            const memberPrice =
              myMembership?.status === "active"
                ? court.memberBookingFeeCents ?? (plan ? Math.round((court.bookingFeeCents * (100 - plan.courtDiscountPercent)) / 100) : court.bookingFeeCents)
                : null;
            return (
              <span key={court.id}>
                {court.name} - {formatMoneyFromCents(court.bookingFeeCents)}
                {court.memberBookingFeeCents !== null ? ` | mensalista ${formatMoneyFromCents(court.memberBookingFeeCents)}` : ""}
                {memberPrice !== null ? ` | seu valor ${formatMoneyFromCents(memberPrice)}` : ""}
                {canManageFinance ? (
                  <>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={priceDraft.publicPrice}
                      onChange={(event) => onChangeCourtPriceDraft(court.id, { ...priceDraft, publicPrice: event.target.value })}
                      aria-label={`Valor publico da ${court.name}`}
                      placeholder="Publico R$"
                    />
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={priceDraft.memberPrice}
                      onChange={(event) => onChangeCourtPriceDraft(court.id, { ...priceDraft, memberPrice: event.target.value })}
                      aria-label={`Valor mensalista da ${court.name}`}
                      placeholder="Mensalista R$"
                    />
                    <button onClick={() => onSaveCourtPrice(court)} disabled={busy}>
                      Salvar
                    </button>
                  </>
                ) : null}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="subtle">Sem quadras cadastradas para reserva.</p>
      )}
      {canManageBookings ? (
        <div className="place-booking-rules-panel">
          <div className="place-booking-head">
            <strong>Regras por perfil e horario</strong>
            <span>{countLabel(bookingRules.filter((rule) => rule.isActive).length, "regra ativa", "regras ativas")}</span>
          </div>
          <div className="booking-rule-form">
            <input value={bookingRuleDraft.name} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, name: event.target.value })} placeholder="Nome da regra" />
            <select
              value={bookingRuleDraft.profileScope}
              onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, profileScope: event.target.value as PlaceBookingRule["profileScope"] })}
            >
              <option value="all">Todos</option>
              <option value="public">Avulso</option>
              <option value="member">Socio</option>
            </select>
            <input value={bookingRuleDraft.weekdays} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, weekdays: event.target.value })} placeholder="Dias 1,2,3,4,5" />
            <input type="time" value={bookingRuleDraft.startsAt} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, startsAt: event.target.value })} />
            <input type="time" value={bookingRuleDraft.endsAt} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, endsAt: event.target.value })} />
            <input type="number" min={0} value={bookingRuleDraft.price} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, price: event.target.value })} placeholder="Avulso R$" />
            <input
              type="number"
              min={0}
              value={bookingRuleDraft.memberPrice}
              onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, memberPrice: event.target.value })}
              placeholder="Socio R$"
            />
            <input type="number" min={1} value={bookingRuleDraft.minMinutes} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, minMinutes: event.target.value })} placeholder="Min min" />
            <input type="number" min={1} value={bookingRuleDraft.maxMinutes} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, maxMinutes: event.target.value })} placeholder="Max min" />
            <input
              type="number"
              min={0}
              value={bookingRuleDraft.advanceDays}
              onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, advanceDays: event.target.value })}
              placeholder="Antecedencia"
            />
            <label className="inline-check">
              <input
                type="checkbox"
                checked={bookingRuleDraft.requiresApproval}
                onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, requiresApproval: event.target.checked })}
              />
              Exigir aprovacao
            </label>
            <button className="primary" onClick={onCreateRule} disabled={busy || !bookingRuleDraft.name.trim()}>
              Criar regra
            </button>
          </div>
          {bookingRules.length ? (
            <div className="booking-rule-list">
              {bookingRules.map((rule) => (
                <article key={rule.id} className={rule.isActive ? "" : "muted"}>
                  <div>
                    <strong>{rule.name}</strong>
                    <small>
                      {ruleProfileScopeLabels[rule.profileScope]} - {ruleWeekdaysLabel(rule.weekdays)} - {rule.startsAt}-{rule.endsAt}
                    </small>
                  </div>
                  <span>{rule.priceCents === null ? "preco da quadra" : formatMoneyFromCents(rule.priceCents)}</span>
                  <span>{rule.memberPriceCents === null ? "socio padrao" : formatMoneyFromCents(rule.memberPriceCents)}</span>
                  <span>
                    {rule.minMinutes}-{rule.maxMinutes} min
                  </span>
                  <span>{rule.advanceDays}d</span>
                  <span>{rule.requiresApproval ? "aprovar" : "auto"}</span>
                  <button onClick={() => onToggleRule(rule)} disabled={busy}>
                    {rule.isActive ? "Pausar" : "Ativar"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="subtle">Sem regras: o sistema usa os valores padrao da quadra.</p>
          )}
        </div>
      ) : null}
    </>
  );
}
