import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type { PlaceClientReceivable } from "./PlaceClientRelationshipModule";

type PlaceFinanceReceivablesModuleProps = {
  academyReceivables: PlaceClientReceivable[];
  busy: boolean;
  formatMoneyFromCents: (amountCents: number) => string;
  membershipReceivables: PlaceClientReceivable[];
  receivables: PlaceClientReceivable[];
  onCreatePaymentReminder: (targetType: string, targetId: string, billingPeriod: string, message: string) => void;
  onCreatePaymentReminderBatch: (receivables: PlaceClientReceivable[]) => void;
  onMarkReceivablePaid: (receivable: PlaceClientReceivable) => void;
};

type FinanceReceivableSegment = "all" | "overdue" | "today" | "academy" | "membership";

const PAYMENT_REMINDER_SUPPORTED_TARGETS = new Set(["academy_enrollment", "academy_student_contract", "court_booking", "place_membership"]);

function canCreatePaymentReminderForTarget(targetType: string): boolean {
  return PAYMENT_REMINDER_SUPPORTED_TARGETS.has(targetType);
}

function receivableStatusLabel(receivable: PlaceClientReceivable): string {
  if (receivable.status === "pending_approval") return "Aguardando aprovacao";
  if (receivable.dueStatus === "overdue") return "Vencido";
  if (receivable.dueStatus === "today") return "Vence hoje";
  return "Em aberto";
}

export function PlaceFinanceReceivablesModule({
  academyReceivables,
  busy,
  formatMoneyFromCents,
  membershipReceivables,
  receivables,
  onCreatePaymentReminder,
  onCreatePaymentReminderBatch,
  onMarkReceivablePaid,
}: PlaceFinanceReceivablesModuleProps) {
  const { search } = useLocation();
  const [segment, setSegment] = useState<FinanceReceivableSegment>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const requestedSegment = useMemo(() => {
    const value = new URLSearchParams(search).get("filtro");
    return value === "vencidos" ? "overdue" : value === "hoje" ? "today" : value === "aulas" ? "academy" : value === "planos" ? "membership" : "";
  }, [search]);
  const overdueReceivables = useMemo(() => receivables.filter((receivable) => receivable.dueStatus === "overdue"), [receivables]);
  const todayReceivables = useMemo(() => receivables.filter((receivable) => receivable.dueStatus === "today"), [receivables]);

  useEffect(() => {
    if (requestedSegment) setSegment(requestedSegment);
  }, [requestedSegment]);

  const segmentReceivables = useMemo(() => {
    if (segment === "overdue") return overdueReceivables;
    if (segment === "today") return todayReceivables;
    if (segment === "academy") return academyReceivables;
    if (segment === "membership") return membershipReceivables;
    return receivables;
  }, [academyReceivables, membershipReceivables, overdueReceivables, receivables, segment, todayReceivables]);
  const filteredReceivables = segmentReceivables.filter((receivable) => {
    const haystack = [receivable.title, receivable.originLabel, receivable.subtitle, receivable.billingPeriod, receivable.dueLabel].join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const selectedReceivable = filteredReceivables.find((receivable) => receivable.id === selectedId) || filteredReceivables[0] || null;
  const totalOpenCents = filteredReceivables.reduce((sum, receivable) => sum + receivable.amountCents, 0);
  const totalOverdueCents = overdueReceivables.reduce((sum, receivable) => sum + receivable.amountCents, 0);
  const supportedFilteredReceivables = filteredReceivables.filter((receivable) => canCreatePaymentReminderForTarget(receivable.targetType));
  const supportedMembershipReceivables = membershipReceivables.filter((receivable) => canCreatePaymentReminderForTarget(receivable.targetType));
  const supportedAcademyReceivables = academyReceivables.filter((receivable) => canCreatePaymentReminderForTarget(receivable.targetType));
  const selectedCanCreateReminder = selectedReceivable ? canCreatePaymentReminderForTarget(selectedReceivable.targetType) : false;

  const tabs: Array<{ id: FinanceReceivableSegment; label: string; count: number }> = [
    { id: "all", label: "Todos", count: receivables.length },
    { id: "overdue", label: "Vencidos", count: overdueReceivables.length },
    { id: "today", label: "Hoje", count: todayReceivables.length },
    { id: "academy", label: "Aulas", count: academyReceivables.length },
    { id: "membership", label: "Planos", count: membershipReceivables.length },
  ];

  return (
    <div className="finance-receivables-console">
      <header className="finance-console-head">
        <div>
          <span>Receita</span>
          <h2>Receber</h2>
          <p>Vencidos, recebiveis de hoje, lembretes e baixa manual em uma fila financeira clara.</p>
        </div>
        <button type="button" className="primary" onClick={() => onCreatePaymentReminderBatch(supportedFilteredReceivables)} disabled={busy || !supportedFilteredReceivables.length}>
          Lembrar lista atual
        </button>
      </header>

      <div className="finance-console-kpis">
        <article>
          <span>Em aberto</span>
          <strong>{formatMoneyFromCents(totalOpenCents)}</strong>
          <small>{filteredReceivables.length} recebivel(is) no filtro</small>
        </article>
        <article>
          <span>Vencidos</span>
          <strong>{formatMoneyFromCents(totalOverdueCents)}</strong>
          <small>{overdueReceivables.length} cobranca(s)</small>
        </article>
        <article>
          <span>Vence hoje</span>
          <strong>{todayReceivables.length}</strong>
          <small>acao recomendada hoje</small>
        </article>
      </div>

      <div className="finance-console-tabs">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" className={segment === tab.id ? "active" : ""} onClick={() => setSegment(tab.id)}>
            {tab.label}
            <span>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="finance-console-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente, origem, periodo..." />
        <button type="button" onClick={() => onCreatePaymentReminderBatch(supportedMembershipReceivables)} disabled={busy || !supportedMembershipReceivables.length}>
          Cobrar planos
        </button>
        <button type="button" onClick={() => onCreatePaymentReminderBatch(supportedAcademyReceivables)} disabled={busy || !supportedAcademyReceivables.length}>
          Cobrar alunos
        </button>
      </div>

      <div className="finance-console-layout">
        <div className="finance-receivables-table" role="table" aria-label="Recebiveis">
          <div className="finance-receivables-row head" role="row">
            <span>Cliente</span>
            <span>Origem</span>
            <span>Vencimento</span>
            <span>Status</span>
            <span>Valor</span>
          </div>
          {filteredReceivables.slice(0, 120).map((receivable) => (
            <button
              key={`finance-open:${receivable.id}`}
              type="button"
              className={selectedReceivable?.id === receivable.id ? "finance-receivables-row selected" : "finance-receivables-row"}
              onClick={() => setSelectedId(receivable.id)}
              role="row"
            >
              <span>
                <strong>{receivable.title}</strong>
                <small>{receivable.subtitle || receivable.billingPeriod || "Sem subtitulo"}</small>
              </span>
              <span>{receivable.originLabel}</span>
              <span>{receivable.dueLabel || "Sem vencimento"}</span>
              <span className={`finance-status-pill ${receivable.dueStatus || "open"}`}>{receivableStatusLabel(receivable)}</span>
              <span>{formatMoneyFromCents(receivable.amountCents)}</span>
            </button>
          ))}
          {!filteredReceivables.length ? <p className="subtle">Nenhum recebivel neste filtro.</p> : null}
        </div>

        <aside className="finance-receivable-drawer" aria-label="Detalhe do recebivel">
          {selectedReceivable ? (
            <>
              <header>
                <span>Recebivel</span>
                <h3>{selectedReceivable.title}</h3>
                <p>{selectedReceivable.originLabel}</p>
              </header>
              <strong className="finance-receivable-amount">{formatMoneyFromCents(selectedReceivable.amountCents)}</strong>
              <dl>
                <dt>Status</dt>
                <dd>{receivableStatusLabel(selectedReceivable)}</dd>
                <dt>Vencimento</dt>
                <dd>{selectedReceivable.dueLabel || "Sem vencimento"}</dd>
                <dt>Periodo</dt>
                <dd>{selectedReceivable.billingPeriod || "Nao informado"}</dd>
                <dt>Descricao</dt>
                <dd>{selectedReceivable.subtitle || "Sem descricao adicional"}</dd>
              </dl>
              <div className="finance-receivable-actions">
                <button type="button" className="primary" onClick={() => onMarkReceivablePaid(selectedReceivable)} disabled={busy}>
                  Pagar
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onCreatePaymentReminder(selectedReceivable.targetType, selectedReceivable.targetId, selectedReceivable.billingPeriod, selectedReceivable.reminder)}
                  disabled={busy || !selectedCanCreateReminder}
                >
                  Enviar lembrete
                </button>
              </div>
              {!selectedCanCreateReminder ? <p className="subtle">Lembrete automatico ainda nao cobre este tipo. Use WhatsApp/Cliente 360 e registre a baixa manual quando receber.</p> : null}
              <section>
                <h4>Proximo passo</h4>
                <p>{selectedReceivable.dueStatus === "overdue" ? "Cobrar agora ou marcar como pago se o pagamento ja foi recebido." : "Acompanhar vencimento e enviar lembrete quando necessario."}</p>
              </section>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
