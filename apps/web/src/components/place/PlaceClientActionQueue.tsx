import type { AcademyEnrollment, PlaceCrmContact, PlaceMembership } from "../../lib/types";
import { OperationalQueue } from "./PlaceWorkspaceUi";

type PlaceClientActionQueueProps = {
  academyEnrollments: AcademyEnrollment[];
  busy: boolean;
  compact?: boolean;
  contacts: PlaceCrmContact[];
  memberships: PlaceMembership[];
  onActivateEnrollment: (enrollment: AcademyEnrollment) => void;
  onCancelMembership: (membership: PlaceMembership) => void;
  onMarkContactContacted: (contact: PlaceCrmContact) => void;
  onMarkContactConverted: (contact: PlaceCrmContact) => void;
  onActivateMembership: (membership: PlaceMembership) => void;
};

export function PlaceClientActionQueue({
  academyEnrollments,
  busy,
  compact = false,
  contacts,
  memberships,
  onActivateEnrollment,
  onActivateMembership,
  onCancelMembership,
  onMarkContactContacted,
  onMarkContactConverted,
}: PlaceClientActionQueueProps) {
  const pendingMemberships = memberships.filter((membership) => membership.status === "pending").slice(0, 3);
  const leadContacts = contacts.filter((contact) => contact.status === "lead").slice(0, 3);
  const pendingEnrollments = academyEnrollments.filter((enrollment) => enrollment.status === "pending").slice(0, 3);
  const hasItems = pendingMemberships.length || leadContacts.length || pendingEnrollments.length;

  return (
    <OperationalQueue title="Atendimento e relacionamento" compact={compact} emptyLabel="Sem pendencias de clientes no momento.">
      {hasItems ? (
        <>
          {pendingMemberships.map((membership) => (
            <span key={`client-membership:${membership.id}`}>
              <strong>{membership.memberName}</strong>
              Solicitacao de socio aguardando aprovacao
              <button type="button" onClick={() => onActivateMembership(membership)} disabled={busy}>
                Ativar
              </button>
              <button type="button" className="danger" onClick={() => onCancelMembership(membership)} disabled={busy}>
                Cancelar
              </button>
            </span>
          ))}
          {leadContacts.map((contact) => (
            <span key={`client-lead:${contact.id}`}>
              <strong>{contact.name}</strong>
              {[contact.interest, contact.source].filter(Boolean).join(" | ") || "Lead sem origem definida"}
              <button type="button" onClick={() => onMarkContactContacted(contact)} disabled={busy}>
                Contatado
              </button>
              <button type="button" onClick={() => onMarkContactConverted(contact)} disabled={busy}>
                Convertido
              </button>
            </span>
          ))}
          {pendingEnrollments.map((enrollment) => (
            <span key={`client-enrollment:${enrollment.id}`}>
              <strong>{enrollment.playerName}</strong>
              Interesse em turma aguardando aprovacao
              <button type="button" onClick={() => onActivateEnrollment(enrollment)} disabled={busy}>
                Ativar
              </button>
            </span>
          ))}
        </>
      ) : null}
    </OperationalQueue>
  );
}
