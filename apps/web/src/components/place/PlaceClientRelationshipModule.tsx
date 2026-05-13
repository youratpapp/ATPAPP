import type { PlaceCrmContact } from "../../lib/types";
import { WorkspaceCard, WorkspaceGrid, WorkspaceList } from "./PlaceWorkspaceUi";

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
      <WorkspaceCard title="Inadimplentes" subtitle="Recebiveis abertos ligados ao cliente" value={openOnlyReceivables.length}>
        <WorkspaceList>
          {openOnlyReceivables.slice(0, 5).map((receivable) => (
            <span key={`crm-receivable:${receivable.id}`}>
              <strong>{receivable.title}</strong>
              <small>{receivable.subtitle} | {formatMoneyFromCents(receivable.amountCents)}</small>
              <button type="button" onClick={() => onCreatePaymentReminder(receivable.targetType, receivable.targetId, receivable.billingPeriod, receivable.reminder)} disabled={busy}>
                Lembrar
              </button>
            </span>
          ))}
          {!openOnlyReceivables.length ? <span>Sem inadimplencia aberta.</span> : null}
        </WorkspaceList>
      </WorkspaceCard>
      <WorkspaceCard title="Lembretes segmentados" subtitle="Acione grupos sem misturar operacoes" value={openReceivables.length}>
        <WorkspaceList>
          <span>
            <strong>Mensalidades de socio</strong>
            <small>{countLabel(membershipReceivables.length, "pendencia", "pendencias")}</small>
            <button type="button" onClick={() => onCreatePaymentReminderBatch(membershipReceivables)} disabled={busy || !membershipReceivables.length}>
              Lembrar socios
            </button>
          </span>
          <span>
            <strong>Mensalidades da academia</strong>
            <small>{countLabel(academyReceivables.length, "pendencia", "pendencias")}</small>
            <button type="button" onClick={() => onCreatePaymentReminderBatch(academyReceivables)} disabled={busy || !academyReceivables.length}>
              Lembrar alunos
            </button>
          </span>
          <span>
            <strong>Todos em aberto</strong>
            <small>{formatMoneyFromCents(openReceivablesAmountCents)}</small>
            <button type="button" onClick={() => onCreatePaymentReminderBatch(openReceivables)} disabled={busy || !openReceivables.length}>
              Lembrar todos
            </button>
          </span>
        </WorkspaceList>
      </WorkspaceCard>
    </WorkspaceGrid>
  );
}
