import { EntityDrawer } from "../EntityDrawer";
import type { PlaceCrmContact, PlaceCrmInteraction } from "../../lib/types";

type PlaceCrmHistoryDrawerProps = {
  busy: boolean;
  contact: PlaceCrmContact | null;
  interactions: PlaceCrmInteraction[];
  onClose: () => void;
  onMarkConverted: (contact: PlaceCrmContact) => void;
  onSaveFollowUp: (contact: PlaceCrmContact) => void;
};

export function PlaceCrmHistoryDrawer({
  busy,
  contact,
  interactions,
  onClose,
  onMarkConverted,
  onSaveFollowUp,
}: PlaceCrmHistoryDrawerProps) {
  return (
    <EntityDrawer
      open={Boolean(contact)}
      eyebrow="Historico CRM"
      title={contact?.name || "Contato"}
      subtitle={contact ? [contact.interest, contact.source, contact.status].filter(Boolean).join(" | ") : ""}
      onClose={onClose}
      actions={
        contact ? (
          <>
            <button type="button" onClick={() => onSaveFollowUp(contact)} disabled={busy}>
              Salvar proximo contato
            </button>
            {contact.status !== "converted" ? (
              <button type="button" className="primary" onClick={() => onMarkConverted(contact)} disabled={busy}>
                Marcar convertido
              </button>
            ) : null}
          </>
        ) : null
      }
    >
      {contact ? (
        <>
          <p>{[contact.phone, contact.email, contact.notes].filter(Boolean).join(" | ") || "Sem dados adicionais."}</p>
          {interactions.map((interaction) => (
            <article key={`crm-drawer-interaction:${interaction.id}`}>
              <strong>{interaction.interactionType}</strong>
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
