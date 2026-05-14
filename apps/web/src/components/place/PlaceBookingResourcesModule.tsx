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

const WEEKDAY_OPTIONS = [
  { label: "Dom", value: 0 },
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sab", value: 6 },
];

const TIME_OPTIONS = Array.from({ length: 35 }, (_, index) => {
  const minutes = 6 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

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
  const selectedWeekdays = bookingRuleDraft.weekdays
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);
  const updateWeekday = (weekday: number, checked: boolean) => {
    const next = new Set(selectedWeekdays);
    if (checked) next.add(weekday);
    else next.delete(weekday);
    onChangeRuleDraft({
      ...bookingRuleDraft,
      weekdays: Array.from(next)
        .sort((a, b) => a - b)
        .join(","),
    });
  };

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
        <div className="place-court-price-list">
          {activeCourts.map((court) => {
            const priceDraft = courtPriceDraftByCourt[court.id] || defaultPriceDraft(court);
            const plan = myMembership?.status === "active" ? membershipPlans.find((item) => item.id === myMembership.planId) : undefined;
            const memberPrice =
              myMembership?.status === "active"
                ? court.memberBookingFeeCents ?? (plan ? Math.round((court.bookingFeeCents * (100 - plan.courtDiscountPercent)) / 100) : court.bookingFeeCents)
                : null;
            return (
              <article key={court.id} className="place-court-price-row">
                <div>
                  <strong>{court.name}</strong>
                  <small>
                    Publico {formatMoneyFromCents(court.bookingFeeCents)}
                    {court.memberBookingFeeCents !== null ? ` | mensalista ${formatMoneyFromCents(court.memberBookingFeeCents)}` : ""}
                    {memberPrice !== null ? ` | seu valor ${formatMoneyFromCents(memberPrice)}` : ""}
                  </small>
                </div>
                {canManageFinance ? (
                  <div className="place-court-price-fields">
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
                  </div>
                ) : null}
              </article>
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
            <label>
              Nome
              <input value={bookingRuleDraft.name} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, name: event.target.value })} placeholder="Ex.: Horario comercial" />
            </label>
            <label>
              Publico
              <select
                value={bookingRuleDraft.profileScope}
                onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, profileScope: event.target.value as PlaceBookingRule["profileScope"] })}
              >
                <option value="all">Todos</option>
                <option value="public">Avulso</option>
                <option value="member">Socio</option>
              </select>
            </label>
            <div className="booking-rule-weekdays" aria-label="Dias da semana">
              {WEEKDAY_OPTIONS.map((weekday) => (
                <label key={`booking-rule-weekday:${weekday.value}`} className={selectedWeekdays.includes(weekday.value) ? "active" : ""}>
                  <input type="checkbox" checked={selectedWeekdays.includes(weekday.value)} onChange={(event) => updateWeekday(weekday.value, event.target.checked)} />
                  {weekday.label}
                </label>
              ))}
            </div>
            <label>
              Inicio
              <select value={bookingRuleDraft.startsAt} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, startsAt: event.target.value })}>
                {TIME_OPTIONS.map((time) => (
                  <option key={`rule-start:${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fim
              <select value={bookingRuleDraft.endsAt} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, endsAt: event.target.value })}>
                {TIME_OPTIONS.map((time) => (
                  <option key={`rule-end:${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Avulso R$
              <input type="number" min={0} value={bookingRuleDraft.price} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, price: event.target.value })} placeholder="90" />
            </label>
            <label>
              Socio R$
              <input
                type="number"
                min={0}
                value={bookingRuleDraft.memberPrice}
                onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, memberPrice: event.target.value })}
                placeholder="65"
              />
            </label>
            <label>
              Duracao minima
              <select value={bookingRuleDraft.minMinutes} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, minMinutes: event.target.value })}>
                <option value="30">30 min</option>
                <option value="60">1h</option>
                <option value="90">1h30</option>
              </select>
            </label>
            <label>
              Duracao maxima
              <select value={bookingRuleDraft.maxMinutes} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, maxMinutes: event.target.value })}>
                <option value="60">1h</option>
                <option value="90">1h30</option>
                <option value="120">2h</option>
                <option value="180">3h</option>
              </select>
            </label>
            <label>
              Antecedencia
              <select value={bookingRuleDraft.advanceDays} onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, advanceDays: event.target.value })}>
                <option value="0">Mesmo dia</option>
                <option value="7">7 dias</option>
                <option value="14">14 dias</option>
                <option value="30">30 dias</option>
              </select>
            </label>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={bookingRuleDraft.requiresApproval}
                onChange={(event) => onChangeRuleDraft({ ...bookingRuleDraft, requiresApproval: event.target.checked })}
              />
              Exigir aprovacao
            </label>
            <button className="primary" onClick={onCreateRule} disabled={busy || !bookingRuleDraft.name.trim() || !selectedWeekdays.length}>
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
