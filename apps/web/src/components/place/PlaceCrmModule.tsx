import { useMemo, useState } from "react";
import type { PlaceCrmContact, PlaceCrmInteraction } from "../../lib/types";
import { PlaceCrmContactForm, type PlaceCrmContactDraft } from "./PlaceCrmContactForm";
import { PlaceCrmContactRow } from "./PlaceCrmContactRow";
import { WorkspaceEmptyState, WorkspaceMetrics } from "./PlaceWorkspaceUi";

type PlaceCrmStageCounts = {
  contacted: number;
  converted: number;
  lead: number;
};

type PlaceCrmModuleProps = {
  busy: boolean;
  contactCountLabel: string;
  contacts: PlaceCrmContact[];
  conversionRate: number;
  draft: PlaceCrmContactDraft;
  embedded?: boolean;
  followUpsDue: number;
  interactionsByContact: Record<string, PlaceCrmInteraction[]>;
  ownerListId: string;
  ownerOptions: string[];
  stageCounts: PlaceCrmStageCounts;
  todayDate: string;
  onChangeDraft: (draft: PlaceCrmContactDraft) => void;
  onCreateContact: () => void;
  onOpenHistory: (contact: PlaceCrmContact) => void;
};

type CrmFilter = "priority" | "all" | "lead" | "contacted" | "converted" | "archived";

const CRM_FILTERS: Array<{ key: CrmFilter; label: string }> = [
  { key: "priority", label: "Prioridade" },
  { key: "all", label: "Todos" },
  { key: "lead", label: "Leads" },
  { key: "contacted", label: "Em contato" },
  { key: "converted", label: "Convertidos" },
  { key: "archived", label: "Arquivados" },
];

function isCrmFollowUpDue(contact: PlaceCrmContact, todayDate: string): boolean {
  return contact.status !== "converted" && contact.status !== "archived" && Boolean(contact.nextContactOn) && contact.nextContactOn <= todayDate;
}

function isCrmStale(contact: PlaceCrmContact, interactionsByContact: Record<string, PlaceCrmInteraction[]>): boolean {
  if (contact.status === "converted" || contact.status === "archived") return false;
  return !contact.nextContactOn && (interactionsByContact[contact.id] || []).length === 0;
}

function crmPriority(contact: PlaceCrmContact, todayDate: string, interactionsByContact: Record<string, PlaceCrmInteraction[]>): number {
  if (isCrmFollowUpDue(contact, todayDate)) return 0;
  if (contact.status === "lead") return 1;
  if (isCrmStale(contact, interactionsByContact)) return 2;
  if (contact.status === "contacted") return 3;
  if (contact.status === "converted") return 4;
  return 5;
}

export function PlaceCrmModule({
  busy,
  contactCountLabel,
  contacts,
  conversionRate,
  draft,
  embedded = false,
  followUpsDue,
  interactionsByContact,
  ownerListId,
  ownerOptions,
  stageCounts,
  todayDate,
  onChangeDraft,
  onCreateContact,
  onOpenHistory,
}: PlaceCrmModuleProps) {
  const [filter, setFilter] = useState<CrmFilter>("priority");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [newContactOpen, setNewContactOpen] = useState(!contacts.length);

  const filteredContacts = useMemo(() => {
    const text = query.trim().toLowerCase();
    return contacts
      .filter((contact) => {
        if (filter === "priority") {
          const isPriority =
            contact.status === "lead" ||
            contact.status === "contacted" ||
            isCrmFollowUpDue(contact, todayDate) ||
            isCrmStale(contact, interactionsByContact);
          if (!isPriority) return false;
        } else if (filter !== "all" && contact.status !== filter) {
          return false;
        }
        if (!text) return true;
        return [contact.name, contact.phone, contact.email, contact.interest, contact.source, contact.ownerLabel]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(text));
      })
      .sort((a, b) => {
        const priorityDiff = crmPriority(a, todayDate, interactionsByContact) - crmPriority(b, todayDate, interactionsByContact);
        if (priorityDiff) return priorityDiff;
        return (a.nextContactOn || a.name).localeCompare(b.nextContactOn || b.name);
      });
  }, [contacts, filter, interactionsByContact, query, todayDate]);

  const visibleContacts = showAll ? filteredContacts : filteredContacts.slice(0, 18);
  const hiddenCount = filteredContacts.length - visibleContacts.length;
  const activeWorkCount = contacts.filter(
    (contact) => contact.status === "lead" || contact.status === "contacted" || isCrmFollowUpDue(contact, todayDate) || isCrmStale(contact, interactionsByContact)
  ).length;
  const priorityContacts = contacts
    .filter((contact) => contact.status === "lead" || isCrmFollowUpDue(contact, todayDate) || isCrmStale(contact, interactionsByContact))
    .sort((a, b) => crmPriority(a, todayDate, interactionsByContact) - crmPriority(b, todayDate, interactionsByContact))
    .slice(0, 3);

  return (
    <div className={embedded ? "crm-module-workspace" : "place-booking-panel"}>
      <div className="place-booking-head">
        <strong>Contatos e leads</strong>
        <span>{contactCountLabel} | {conversionRate}% conversao | {activeWorkCount} em rotina</span>
      </div>
      <div className="crm-first-fold">
        <section className="crm-priority-panel" aria-label="Prioridades de relacionamento">
          <div>
            <span>Hoje</span>
            <strong>{followUpsDue ? `${followUpsDue} retornos para fazer` : "Relacionamento em dia"}</strong>
            <small>{activeWorkCount ? `${activeWorkCount} contatos em rotina` : "Sem lead ou follow-up pendente"}</small>
          </div>
          {priorityContacts.length ? (
            <div className="crm-priority-list">
              {priorityContacts.map((contact) => (
                <button key={`crm-priority:${contact.id}`} type="button" onClick={() => onOpenHistory(contact)} disabled={busy}>
                  <strong>{contact.name}</strong>
                  <small>
                    {isCrmFollowUpDue(contact, todayDate)
                      ? `Retorno ${contact.nextContactOn}`
                      : contact.status === "lead"
                        ? "Novo lead"
                        : "Sem historico recente"}
                  </small>
                </button>
              ))}
            </div>
          ) : (
            <small>Nenhum contato precisa de acao imediata.</small>
          )}
        </section>
        <section className="crm-create-panel">
          <span>Novo</span>
          <strong>Cadastrar contato</strong>
          <small>Lead, aluno interessado ou retorno da recepcao.</small>
          <button type="button" onClick={() => setNewContactOpen(true)} disabled={busy}>
            Novo contato
          </button>
        </section>
      </div>
      <div className="crm-toolbar">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowAll(false);
          }}
          placeholder="Buscar por nome, telefone, interesse ou responsavel"
          aria-label="Buscar contatos do CRM"
        />
        <div className="billing-quick-actions secondary" aria-label="Filtros de contatos">
          {CRM_FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={filter === item.key ? "primary" : ""}
              onClick={() => {
                setFilter(item.key);
                setShowAll(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <PlaceCrmContactForm
        busy={busy}
        defaultOpen={!contacts.length}
        draft={draft}
        open={newContactOpen || !contacts.length}
        ownerListId={ownerListId}
        ownerOptions={ownerOptions}
        onChange={onChangeDraft}
        onOpenChange={setNewContactOpen}
        onSubmit={onCreateContact}
      />
      <WorkspaceMetrics
        items={[
          `${stageCounts.lead} leads`,
          `${followUpsDue} retornos hoje`,
          `${stageCounts.contacted} em contato`,
          `${stageCounts.converted} convertidos`,
        ]}
      />
      <div className="place-booking-list">
        {visibleContacts.map((contact) => {
          const followUpDue = contact.status !== "converted" && contact.nextContactOn && contact.nextContactOn <= todayDate;
          const recentInteractions = interactionsByContact[contact.id] || [];
          return (
            <PlaceCrmContactRow
              key={contact.id}
              busy={busy}
              contact={contact}
              followUpDue={followUpDue}
              interactionCount={recentInteractions.length}
              onOpenHistory={() => onOpenHistory(contact)}
            />
          );
        })}
        {!filteredContacts.length ? (
          <WorkspaceEmptyState
            title={query || filter !== "all" ? "Nenhum contato encontrado" : "Sem contatos no CRM"}
            detail={query || filter !== "all" ? "Limpe a busca ou ajuste o filtro para ver outros contatos." : "Crie o primeiro contato para acompanhar relacionamento."}
            action={
              query || filter !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setFilter("all");
                    setQuery("");
                  }}
                >
                  Limpar filtros
                </button>
              ) : null
            }
          />
        ) : null}
        {hiddenCount > 0 ? (
          <button type="button" className="secondary" onClick={() => setShowAll(true)}>
            Ver {hiddenCount} contato{hiddenCount === 1 ? "" : "s"} restante{hiddenCount === 1 ? "" : "s"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
