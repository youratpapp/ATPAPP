import type { PlaceCrmContact, PlaceCrmInteraction } from "../../lib/types";
import { EntityActionRow } from "./PlaceWorkspaceUi";

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
  const primaryAction =
    contact.status === "lead" ? (
      <button type="button" className="primary" onClick={onMarkContacted} disabled={busy}>
        Marcar contatado
      </button>
    ) : contact.status !== "converted" ? (
      <button type="button" className="primary" onClick={onMarkConverted} disabled={busy}>
        Marcar convertido
      </button>
    ) : (
      <button type="button" onClick={onOpenHistory}>
        Ver historico
      </button>
    );
  const contactDetail = [
    [contact.phone, contact.email].filter(Boolean).join(" | "),
    contact.nextContactOn ? `Proximo contato: ${contact.nextContactOn}` : "Sem proximo contato",
    followUpDue ? "Fazer follow-up" : "",
  ].filter(Boolean).join(" | ");

  return (
    <EntityActionRow
      className={`crm-contact-row ${contact.status}${followUpDue ? " due" : ""}`}
      title={contact.name}
      status={contact.status}
      context={[contact.interest, contact.source, contact.ownerLabel ? `Resp. ${contact.ownerLabel}` : ""].filter(Boolean).join(" | ")}
      detail={contactDetail}
      primaryAction={primaryAction}
      actions={
        <>
          <button type="button" onClick={onOpenHistory}>
            Historico ({interactionCount})
          </button>
          <button type="button" className="danger" onClick={onArchive} disabled={busy}>
            Arquivar
          </button>
        </>
      }
    >
      {contact.notes ? <small>{contact.notes}</small> : null}
      <div className="crm-row-controls" aria-label={`Rotina de ${contact.name}`}>
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
      </div>
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
    </EntityActionRow>
  );
}
