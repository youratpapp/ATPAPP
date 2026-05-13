import type { PlaceCrmContact } from "../../lib/types";
import { EntityActionRow, WorkspaceCard, WorkspaceGrid, WorkspaceList } from "./PlaceWorkspaceUi";

export type PlaceClientReceivable = {
  amountCents: number;
  billingPeriod: string;
  id: string;
  reminder: string;
  status: "open" | "paid" | "pending_approval";
  subtitle: string;
  targetId: string;
  targetType: string;
  title: string;
};

type RelationshipSegment = {
  detail: string;
  label: string;
  value: number;
};

type PlaceClientRelationshipModuleProps = {
  academyReceivables: PlaceClientReceivable[];
  busy: boolean;
  countLabel: (count: number, singular: string, plural: string) => string;
  followUpContacts: PlaceCrmContact[];
  formatMoneyFromCents: (amountCents: number) => string;
  membershipReceivables: PlaceClientReceivable[];
  openReceivables: PlaceClientReceivable[];
  openReceivablesAmountCents: number;
  relationshipSegments: RelationshipSegment[];
  staleContacts: PlaceCrmContact[];
  onCreatePaymentReminder: (targetType: string, targetId: string, billingPeriod: string, message: string) => void;
  onCreatePaymentReminderBatch: (receivables: PlaceClientReceivable[]) => void;
  onMarkContacted: (contact: PlaceCrmContact) => void;
  onScheduleContact: (contact: PlaceCrmContact) => void;
};

export function PlaceClientRelationshipModule({
  academyReceivables,
  busy,
  countLabel,
  followUpContacts,
  formatMoneyFromCents,
  membershipReceivables,
  openReceivables,
  openReceivablesAmountCents,
  relationshipSegments,
  staleContacts,
  onCreatePaymentReminder,
  onCreatePaymentReminderBatch,
  onMarkContacted,
  onScheduleContact,
}: PlaceClientRelationshipModuleProps) {
  const openOnlyReceivables = openReceivables.filter((receivable) => receivable.status === "open");

  return (
    <WorkspaceGrid>
      <WorkspaceCard
        title="Rotina de relacionamento"
        subtitle="Fila diaria para vender e reter"
        value={followUpContacts.length + staleContacts.length + openReceivables.length}
        metrics={relationshipSegments.map((segment) => `${segment.value} ${segment.label.toLowerCase()}`)}
      >
        <WorkspaceList>
          {relationshipSegments.map((segment) => (
            <span key={`crm-segment:${segment.label}`}>
              <strong>{segment.label}</strong>
              <small>{segment.detail}</small>
            </span>
          ))}
        </WorkspaceList>
      </WorkspaceCard>
      <WorkspaceCard title="Follow-ups de hoje" subtitle="Contatos que precisam de retorno" value={followUpContacts.length}>
        <WorkspaceList>
          {followUpContacts.slice(0, 5).map((contact) => (
            <span key={`crm-followup:${contact.id}`}>
              <strong>{contact.name}</strong>
              <small>{[contact.interest, contact.ownerLabel || "sem responsavel", contact.phone].filter(Boolean).join(" | ")}</small>
              <button type="button" onClick={() => onMarkContacted(contact)} disabled={busy}>
                Marcar contatado
              </button>
            </span>
          ))}
          {!followUpContacts.length ? <span>Sem follow-up vencido.</span> : null}
        </WorkspaceList>
      </WorkspaceCard>
      <WorkspaceCard title="Leads parados" subtitle="Sem historico e sem proxima data" value={staleContacts.length}>
        <WorkspaceList>
          {staleContacts.slice(0, 5).map((contact) => (
            <span key={`crm-stale:${contact.id}`}>
              <strong>{contact.name}</strong>
              <small>{[contact.interest, contact.source, contact.phone].filter(Boolean).join(" | ") || "Sem detalhes cadastrados"}</small>
              <button type="button" onClick={() => onScheduleContact(contact)} disabled={busy}>
                Agendar contato
              </button>
            </span>
          ))}
          {!staleContacts.length ? <span>Sem lead parado.</span> : null}
        </WorkspaceList>
      </WorkspaceCard>
      <WorkspaceCard title="Cobrancas pendentes" subtitle="Clientes que precisam de lembrete" value={openOnlyReceivables.length}>
        <WorkspaceList>
          {openOnlyReceivables.slice(0, 5).map((receivable) => (
            <EntityActionRow
              key={`crm-receivable:${receivable.id}`}
              className="finance-receivable-row open"
              title={receivable.title}
              context={receivable.subtitle}
              detail={formatMoneyFromCents(receivable.amountCents)}
              status="Em aberto"
              primaryAction={
                <button
                  className="primary"
                  type="button"
                  onClick={() => onCreatePaymentReminder(receivable.targetType, receivable.targetId, receivable.billingPeriod, receivable.reminder)}
                  disabled={busy}
                >
                  Enviar lembrete
                </button>
              }
            >
              <small>{receivable.billingPeriod ? `Periodo ${receivable.billingPeriod}` : "Pagamento em aberto"}</small>
            </EntityActionRow>
          ))}
          {!openOnlyReceivables.length ? <span>Sem cobranca pendente.</span> : null}
        </WorkspaceList>
      </WorkspaceCard>
      {openReceivables.length ? (
        <WorkspaceCard title="Acoes de cobranca" subtitle="Atalhos por intencao real" value={openReceivables.length}>
          <WorkspaceList>
            {membershipReceivables.length ? (
              <EntityActionRow
                className="billing-segment-row"
                title="Cobrar socios"
                context={countLabel(membershipReceivables.length, "pendencia", "pendencias")}
                detail="Mensalidades de socio"
                status="Pendente"
                primaryAction={
                  <button className="primary" type="button" onClick={() => onCreatePaymentReminderBatch(membershipReceivables)} disabled={busy}>
                    Enviar lembrete
                  </button>
                }
              />
            ) : null}
            {academyReceivables.length ? (
              <EntityActionRow
                className="billing-segment-row"
                title="Cobrar alunos"
                context={countLabel(academyReceivables.length, "pendencia", "pendencias")}
                detail="Mensalidades da academia"
                status="Pendente"
                primaryAction={
                  <button className="primary" type="button" onClick={() => onCreatePaymentReminderBatch(academyReceivables)} disabled={busy}>
                    Enviar lembrete
                  </button>
                }
              />
            ) : null}
            <EntityActionRow
              className="billing-segment-row"
              title="Cobrar todos em aberto"
              context={countLabel(openReceivables.length, "pendencia", "pendencias")}
              detail={formatMoneyFromCents(openReceivablesAmountCents)}
              status="Pendente"
              primaryAction={
                <button className="primary" type="button" onClick={() => onCreatePaymentReminderBatch(openReceivables)} disabled={busy}>
                  Enviar lembrete
                </button>
              }
            />
          </WorkspaceList>
        </WorkspaceCard>
      ) : null}
    </WorkspaceGrid>
  );
}
