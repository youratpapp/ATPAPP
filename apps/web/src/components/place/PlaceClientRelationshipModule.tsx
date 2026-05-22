import { useMemo, useState } from "react";
import type { PlaceCrmContact } from "../../lib/types";
import { EntityActionRow, WorkspaceEmptyState, WorkspaceMetrics } from "./PlaceWorkspaceUi";

export type PlaceClientReceivable = {
  amountCents: number;
  billingPeriod: string;
  dueDate?: string;
  dueLabel?: string;
  dueStatus?: "overdue" | "today" | "upcoming" | "none";
  id: string;
  origin?: "academy" | "booking" | "lesson" | "membership" | "other";
  originLabel?: string;
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
  busy: boolean;
  countLabel: (count: number, singular: string, plural: string) => string;
  followUpContacts: PlaceCrmContact[];
  leadContacts: PlaceCrmContact[];
  relationshipSegments: RelationshipSegment[];
  staleContacts: PlaceCrmContact[];
  onOpenContact: (contact: PlaceCrmContact) => void;
};

export function PlaceClientRelationshipModule({
  busy,
  countLabel,
  followUpContacts,
  leadContacts,
  relationshipSegments,
  staleContacts,
  onOpenContact,
}: PlaceClientRelationshipModuleProps) {
  const [segment, setSegment] = useState<"all" | "followups" | "leads" | "stale">("all");
  const [showAll, setShowAll] = useState(false);

  const relationshipRows = useMemo(() => {
    const rows = [
      ...followUpContacts.map((contact) => ({
        contact,
        detail: [contact.nextContactOn ? `Retorno ${contact.nextContactOn}` : "Retorno pendente", contact.ownerLabel || "sem responsavel"].join(" | "),
        priority: 0,
        status: "Follow-up",
        type: "followups" as const,
      })),
      ...leadContacts.map((contact) => ({
        contact,
        detail: [contact.source || "sem origem", contact.ownerLabel || "sem responsavel"].join(" | "),
        priority: 1,
        status: "Novo lead",
        type: "leads" as const,
      })),
      ...staleContacts.map((contact) => ({
        contact,
        detail: [contact.source || "sem origem", "sem proxima data"].join(" | "),
        priority: 2,
        status: "Parado",
        type: "stale" as const,
      })),
    ];
    const seen = new Set<string>();
    return rows
      .filter((row) => {
        if (seen.has(row.contact.id)) return false;
        seen.add(row.contact.id);
        return segment === "all" || row.type === segment;
      })
      .sort((a, b) => a.priority - b.priority || a.contact.name.localeCompare(b.contact.name));
  }, [followUpContacts, leadContacts, segment, staleContacts]);

  const visibleRows = showAll ? relationshipRows : relationshipRows.slice(0, 12);
  const hiddenCount = relationshipRows.length - visibleRows.length;
  const filters = [
    { key: "all" as const, label: "Todos" },
    { key: "followups" as const, label: "Follow-ups" },
    ...(leadContacts.length ? [{ key: "leads" as const, label: "Leads" }] : []),
    { key: "stale" as const, label: "Parados" },
  ];

  return (
    <div className="crm-relationship-workspace">
      <div className="place-booking-head">
        <strong>Fila de relacionamento</strong>
        <span>{countLabel(relationshipRows.length, "acao aberta", "acoes abertas")}</span>
      </div>
      <WorkspaceMetrics items={relationshipSegments.map((item) => `${item.value} ${item.label.toLowerCase()}`)} />
      <div className="billing-quick-actions secondary" aria-label="Filtros de relacionamento">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={segment === filter.key ? "primary" : ""}
            onClick={() => {
              setSegment(filter.key);
              setShowAll(false);
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="place-booking-list">
        {visibleRows.map(({ contact, detail, status, type }) => (
          <EntityActionRow
            key={`crm-relationship:${type}:${contact.id}`}
            className={`crm-contact-row ${type === "followups" ? "due" : contact.status}`}
            title={contact.name}
            context={[contact.interest || "Sem interesse", detail].filter(Boolean).join(" | ")}
            detail={contact.phone || contact.email || "Sem telefone/email"}
            status={status}
            primaryAction={
              <button type="button" className="primary" onClick={() => onOpenContact(contact)} disabled={busy}>
                {type === "followups" ? "Registrar retorno" : type === "stale" ? "Agendar contato" : "Registrar contato"}
              </button>
            }
            actions={
              contact.phone ? (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => window.open(`https://wa.me/${contact.phone.replace(/\D/g, "")}`, "_blank", "noopener,noreferrer")}
                  disabled={busy}
                >
                  WhatsApp
                </button>
              ) : null
            }
          />
        ))}
        {!relationshipRows.length ? (
          <WorkspaceEmptyState
            title="Nenhuma pendencia de relacionamento"
            detail={segment === "all" ? "A rotina de pessoas esta em dia agora." : "Este filtro nao tem contatos aguardando acao."}
            action={
              segment === "all" ? null : (
                <button type="button" onClick={() => setSegment("all")}>
                  Ver todos
                </button>
              )
            }
          />
        ) : null}
        {hiddenCount > 0 ? (
          <button type="button" className="secondary" onClick={() => setShowAll(true)}>
            Ver {hiddenCount} {hiddenCount === 1 ? "acao restante" : "acoes restantes"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
