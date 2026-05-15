import { EntityDrawer } from "../EntityDrawer";
import type { PlaceCrmContact, PlaceCrmInteraction } from "../../lib/types";
import type { PlaceCrmInteractionDraft } from "./PlaceCrmContactRow";

type PlaceCrmHistoryDrawerProps = {
  busy: boolean;
  contact: PlaceCrmContact | null;
  followUpDraft: string;
  interactionDraft: PlaceCrmInteractionDraft;
  interactions: PlaceCrmInteraction[];
  ownerDraft: string;
  ownerListId: string;
  ownerOptions: string[];
  onArchiveContact: (contact: PlaceCrmContact) => void;
  onChangeFollowUpDraft: (contact: PlaceCrmContact, value: string) => void;
  onChangeInteractionDraft: (contact: PlaceCrmContact, draft: PlaceCrmInteractionDraft) => void;
  onChangeOwnerDraft: (contact: PlaceCrmContact, value: string) => void;
  onClose: () => void;
  onCreateInteraction: (contact: PlaceCrmContact) => void;
  onMarkContacted: (contact: PlaceCrmContact) => void;
  onMarkConverted: (contact: PlaceCrmContact) => void;
  onSaveFollowUp: (contact: PlaceCrmContact) => void;
  onUpdateOwner: (contact: PlaceCrmContact) => void;
};

const CRM_INTERACTION_LABEL: Record<PlaceCrmInteraction["interactionType"], string> = {
  call: "Ligacao",
  email: "Email",
  follow_up: "Follow-up",
  note: "Nota",
  visit: "Visita",
  whatsapp: "WhatsApp",
};

function crmWhatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function PlaceCrmHistoryDrawer({
  busy,
  contact,
  followUpDraft,
  interactionDraft,
  interactions,
  ownerDraft,
  ownerListId,
  ownerOptions,
  onArchiveContact,
  onChangeFollowUpDraft,
  onChangeInteractionDraft,
  onChangeOwnerDraft,
  onClose,
  onCreateInteraction,
  onMarkContacted,
  onMarkConverted,
  onSaveFollowUp,
  onUpdateOwner,
}: PlaceCrmHistoryDrawerProps) {
  const drawerOwnerListId = `${ownerListId}-drawer`;
  const whatsappHref = contact ? crmWhatsappUrl(contact.phone) : "";

  return (
    <EntityDrawer
      open={Boolean(contact)}
      eyebrow="Contato"
      title={contact?.name || "Contato"}
      subtitle={contact ? [contact.interest, contact.source, contact.status].filter(Boolean).join(" | ") : ""}
      onClose={onClose}
      actions={
        contact ? (
          <>
            {whatsappHref ? (
              <button type="button" className="secondary" onClick={() => window.open(whatsappHref, "_blank", "noopener,noreferrer")} disabled={busy}>
                WhatsApp
              </button>
            ) : null}
            {contact.status === "lead" ? (
              <button type="button" onClick={() => onMarkContacted(contact)} disabled={busy}>
                Marcar contatado
              </button>
            ) : null}
            {contact.status !== "converted" ? (
              <button type="button" className="primary" onClick={() => onMarkConverted(contact)} disabled={busy}>
                Marcar convertido
              </button>
            ) : null}
            {contact.status !== "archived" ? (
              <button type="button" className="danger" onClick={() => onArchiveContact(contact)} disabled={busy}>
                Arquivar
              </button>
            ) : null}
          </>
        ) : null
      }
    >
      {contact ? (
        <>
          <section className="crm-drawer-summary">
            <span>
              <strong>Contato</strong>
              {[contact.phone, contact.email].filter(Boolean).join(" | ") || "Sem telefone/email"}
            </span>
            <span>
              <strong>Interesse</strong>
              {[contact.interest, contact.source].filter(Boolean).join(" | ") || "Sem interesse/origem"}
            </span>
            <span>
              <strong>Observacao</strong>
              {contact.notes || "Sem observacao"}
            </span>
          </section>

          <section className="crm-drawer-form" aria-label={`Rotina de relacionamento de ${contact.name}`}>
            <label>
              Responsavel
              <input
                list={drawerOwnerListId}
                value={ownerDraft}
                onChange={(event) => onChangeOwnerDraft(contact, event.target.value)}
                placeholder="Responsavel"
              />
            </label>
            <button type="button" onClick={() => onUpdateOwner(contact)} disabled={busy}>
              Salvar responsavel
            </button>
            <label>
              Proximo contato
              <input type="date" value={followUpDraft} onChange={(event) => onChangeFollowUpDraft(contact, event.target.value)} />
            </label>
            <button type="button" onClick={() => onSaveFollowUp(contact)} disabled={busy}>
              Salvar retorno
            </button>
          </section>

          <section className="crm-interaction-panel">
            <select
              value={interactionDraft.interactionType}
              onChange={(event) =>
                onChangeInteractionDraft(contact, {
                  ...interactionDraft,
                  interactionType: event.target.value as PlaceCrmInteraction["interactionType"],
                })
              }
              aria-label={`Tipo de interacao com ${contact.name}`}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="call">Ligacao</option>
              <option value="email">Email</option>
              <option value="visit">Visita</option>
              <option value="follow_up">Follow-up</option>
              <option value="note">Nota</option>
            </select>
            <input
              value={interactionDraft.body}
              onChange={(event) => onChangeInteractionDraft(contact, { ...interactionDraft, body: event.target.value })}
              placeholder="Resumo do contato"
            />
            <input
              type="date"
              value={interactionDraft.nextContactOn}
              onChange={(event) => onChangeInteractionDraft(contact, { ...interactionDraft, nextContactOn: event.target.value })}
              aria-label={`Retorno apos contato de ${contact.name}`}
            />
            <button type="button" className="primary" onClick={() => onCreateInteraction(contact)} disabled={busy || !interactionDraft.body.trim()}>
              Registrar
            </button>
          </section>

          <datalist id={drawerOwnerListId}>
            {ownerOptions.map((owner) => (
              <option key={owner} value={owner} />
            ))}
          </datalist>

          <h4>Historico</h4>
          {interactions.map((interaction) => (
            <article key={`crm-drawer-interaction:${interaction.id}`}>
              <strong>{CRM_INTERACTION_LABEL[interaction.interactionType]}</strong>
              <span>{interaction.body}</span>
              <small>
                {[new Date(interaction.createdAt).toLocaleString("pt-BR"), interaction.nextContactOn ? `retorno ${interaction.nextContactOn}` : ""]
                  .filter(Boolean)
                  .join(" | ")}
              </small>
            </article>
          ))}
          {!interactions.length ? <p>Sem historico registrado para este contato.</p> : null}
        </>
      ) : null}
    </EntityDrawer>
  );
}
