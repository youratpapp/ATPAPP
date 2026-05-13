import type { PlaceCrmContact, PlaceCrmInteraction } from "../../lib/types";

export type PlaceCrmInteractionDraft = {
  body: string;
  interactionType: PlaceCrmInteraction["interactionType"];
  nextContactOn: string;
};

type PlaceCrmContactRowProps = {
  busy: boolean;
  contact: PlaceCrmContact;
  followUpDraft: string;
  followUpDue: boolean | "";
  interactionCount: number;
  interactionDraft: PlaceCrmInteractionDraft;
  ownerDraft: string;
  ownerListId: string;
  onArchive: () => void;
  onCreateInteraction: () => void;
  onFollowUpDraftChange: (value: string) => void;
  onInteractionDraftChange: (draft: PlaceCrmInteractionDraft) => void;
  onMarkContacted: () => void;
  onMarkConverted: () => void;
  onOpenHistory: () => void;
  onOwnerDraftChange: (value: string) => void;
  onUpdateFollowUp: () => void;
  onUpdateOwner: () => void;
};

export function PlaceCrmContactRow({
  busy,
  contact,
  followUpDraft,
  followUpDue,
  interactionCount,
  interactionDraft,
  ownerDraft,
  ownerListId,
  onArchive,
  onCreateInteraction,
  onFollowUpDraftChange,
  onInteractionDraftChange,
  onMarkContacted,
  onMarkConverted,
  onOpenHistory,
  onOwnerDraftChange,
  onUpdateFollowUp,
  onUpdateOwner,
}: PlaceCrmContactRowProps) {
  return (
    <div className={`place-booking-row ${contact.status}`}>
      <div>
        <strong>{contact.name}</strong>
        <span>{[contact.interest, contact.source, contact.status, contact.ownerLabel ? `Resp. ${contact.ownerLabel}` : ""].filter(Boolean).join(" | ")}</span>
        <small>
          {[contact.phone, contact.email, contact.notes].filter(Boolean).join(" | ")}
          {contact.nextContactOn ? ` | Proximo contato: ${contact.nextContactOn}` : " | Sem proximo contato"}
          {followUpDue ? " | Fazer follow-up" : ""}
        </small>
        <button className="link" type="button" onClick={onOpenHistory}>
          Ver historico ({interactionCount})
        </button>
      </div>
      <span>
        <input
          list={ownerListId}
          value={ownerDraft}
          onChange={(event) => onOwnerDraftChange(event.target.value)}
          aria-label={`Responsavel por ${contact.name}`}
          placeholder="Responsavel"
        />
        <button type="button" onClick={onUpdateOwner} disabled={busy}>
          Responsavel
        </button>
        <input type="date" value={followUpDraft} onChange={(event) => onFollowUpDraftChange(event.target.value)} aria-label={`Proximo contato de ${contact.name}`} />
        <button type="button" onClick={onUpdateFollowUp} disabled={busy}>
          Agendar contato
        </button>
        {contact.status === "lead" ? (
          <button type="button" onClick={onMarkContacted} disabled={busy}>
            Contatado
          </button>
        ) : null}
        {contact.status !== "converted" ? (
          <button type="button" onClick={onMarkConverted} disabled={busy}>
            Convertido
          </button>
        ) : null}
        <button type="button" className="danger" onClick={onArchive} disabled={busy}>
          Arquivar
        </button>
      </span>
      <div className="crm-interaction-panel">
        <select
          value={interactionDraft.interactionType}
          onChange={(event) =>
            onInteractionDraftChange({
              ...interactionDraft,
              interactionType: event.target.value as PlaceCrmInteraction["interactionType"],
            })
          }
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="call">Ligacao</option>
          <option value="email">Email</option>
          <option value="visit">Visita</option>
          <option value="follow_up">Follow-up</option>
          <option value="note">Nota</option>
        </select>
        <input value={interactionDraft.body} onChange={(event) => onInteractionDraftChange({ ...interactionDraft, body: event.target.value })} placeholder="Resumo do contato" />
        <input
          type="date"
          value={interactionDraft.nextContactOn}
          onChange={(event) => onInteractionDraftChange({ ...interactionDraft, nextContactOn: event.target.value })}
          aria-label={`Retorno apos contato de ${contact.name}`}
        />
        <button type="button" onClick={onCreateInteraction} disabled={busy || !interactionDraft.body.trim()}>
          Registrar interacao
        </button>
      </div>
    </div>
  );
}
