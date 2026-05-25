import type { PlaceCrmContact, PlaceCrmInteraction } from "../../lib/types";

export type PlaceCrmInteractionDraft = {
  body: string;
  interactionType: PlaceCrmInteraction["interactionType"];
  nextContactOn: string;
};

type PlaceCrmContactRowProps = {
  busy: boolean;
  contact: PlaceCrmContact;
  followUpDue: boolean | "";
  interactionCount: number;
  onOpenHistory: () => void;
};

const CRM_STATUS_LABEL: Record<PlaceCrmContact["status"], string> = {
  archived: "Arquivado",
  contacted: "Em contato",
  converted: "Convertido",
  lead: "Novo lead",
};

export function PlaceCrmContactRow({
  busy,
  contact,
  followUpDue,
  interactionCount,
  onOpenHistory,
}: PlaceCrmContactRowProps) {
  const contactDetail = [
    contact.phone,
    contact.email,
    contact.nextContactOn ? `Proximo contato ${contact.nextContactOn}` : "Sem proximo contato",
    followUpDue ? "Follow-up pendente" : "",
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <button
      type="button"
      className={`academy-workspace-row crm-contact-row crm-contact-row-button ${contact.status}${followUpDue ? " due" : ""}`}
      onClick={onOpenHistory}
      disabled={busy}
    >
      <div>
        <strong>
          {contact.name}
          <em>{CRM_STATUS_LABEL[contact.status]}</em>
        </strong>
        <span>{[contact.interest, contact.source, contact.ownerLabel ? `Resp. ${contact.ownerLabel}` : ""].filter(Boolean).join(" | ")}</span>
        <span>{contactDetail}</span>
        {contact.notes ? <small>{contact.notes}</small> : null}
        {interactionCount ? <small>{interactionCount} registro(s) no historico</small> : null}
      </div>
      <b>{followUpDue ? "Resolver agora" : "Abrir relacionamento"}</b>
    </button>
  );
}
