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

function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function PlaceCrmContactRow({
  busy,
  contact,
  followUpDue,
  interactionCount,
  onOpenHistory,
}: PlaceCrmContactRowProps) {
  const whatsappHref = whatsappUrl(contact.phone);
  const primaryAction =
    contact.status === "converted" || contact.status === "archived" ? (
      <button type="button" onClick={onOpenHistory} disabled={busy}>
        Ver historico
      </button>
    ) : (
      <button type="button" className="primary" onClick={onOpenHistory} disabled={busy}>
        {followUpDue ? "Registrar retorno" : contact.status === "lead" ? "Registrar contato" : "Abrir contato"}
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
      status={CRM_STATUS_LABEL[contact.status]}
      context={[contact.interest, contact.source, contact.ownerLabel ? `Resp. ${contact.ownerLabel}` : ""].filter(Boolean).join(" | ")}
      detail={contactDetail}
      primaryAction={primaryAction}
      actions={
        <>
          {whatsappHref ? (
            <button type="button" className="secondary" onClick={() => window.open(whatsappHref, "_blank", "noopener,noreferrer")} disabled={busy}>
              WhatsApp
            </button>
          ) : null}
          <button type="button" className="secondary" onClick={onOpenHistory} disabled={busy}>
            Historico ({interactionCount})
          </button>
        </>
      }
    >
      {contact.notes ? <small>{contact.notes}</small> : null}
    </EntityActionRow>
  );
}
