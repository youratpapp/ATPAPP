import type { AcademyClass, AcademyEnrollment, PlaceCrmContact, PlaceMembership, PlaceMembershipPlan } from "../../lib/types";
import { EntityActionRow, WorkspaceEmptyState, WorkspaceMetrics } from "./PlaceWorkspaceUi";

type PlaceActiveClientsModuleProps = {
  activeContacts: PlaceCrmContact[];
  activeEnrollments: AcademyEnrollment[];
  activeMemberships: PlaceMembership[];
  academyClasses: AcademyClass[];
  busy: boolean;
  countLabel: (count: number, singular: string, plural: string) => string;
  membershipPlans: PlaceMembershipPlan[];
  onOpenAcademyStudents: () => void;
  onOpenContact: (contact: PlaceCrmContact) => void;
  onOpenFinancePlans: () => void;
};

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
}

export function PlaceActiveClientsModule({
  activeContacts,
  activeEnrollments,
  activeMemberships,
  academyClasses,
  busy,
  countLabel,
  membershipPlans,
  onOpenAcademyStudents,
  onOpenContact,
  onOpenFinancePlans,
}: PlaceActiveClientsModuleProps) {
  const activeEnrollmentRows = activeEnrollments.filter((enrollment) => enrollment.status === "active");
  const activeMembershipRows = activeMemberships.filter((membership) => membership.status === "active");
  const totalActive = activeEnrollmentRows.length + activeMembershipRows.length + activeContacts.length;

  return (
    <div className="active-clients-workspace">
      <div className="place-booking-head">
        <strong>Clientes ativos</strong>
        <span>Alunos, socios e contatos convertidos separados dos leads.</span>
      </div>
      <WorkspaceMetrics
        items={[
          `${activeEnrollmentRows.length} ${activeEnrollmentRows.length === 1 ? "aluno ativo" : "alunos ativos"}`,
          `${activeMembershipRows.length} ${activeMembershipRows.length === 1 ? "socio ativo" : "socios ativos"}`,
          `${activeContacts.length} ${activeContacts.length === 1 ? "convertido" : "convertidos"}`,
        ]}
      />
      <div className="place-booking-list">
        {activeEnrollmentRows.slice(0, 12).map((enrollment) => {
          const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
          const href = whatsappLink(enrollment.phone);
          return (
            <EntityActionRow
              key={`active-client-enrollment:${enrollment.id}`}
              className="active-client-row academy"
              title={enrollment.playerName}
              context="Aluno ativo"
              detail={[academyClass?.title || "Turma", academyClass?.coachName || "Professor a definir", enrollment.phone].filter(Boolean).join(" | ")}
              status="Aulas"
              primaryAction={
                <button type="button" className="primary" onClick={onOpenAcademyStudents} disabled={busy}>
                  Abrir alunos
                </button>
              }
              actions={
                href ? (
                  <button type="button" className="secondary" onClick={() => window.open(href, "_blank", "noopener,noreferrer")} disabled={busy}>
                    WhatsApp
                  </button>
                ) : null
              }
            />
          );
        })}

        {activeMembershipRows.slice(0, 12).map((membership) => {
          const plan = membershipPlans.find((item) => item.id === membership.planId);
          const href = whatsappLink(membership.phone);
          return (
            <EntityActionRow
              key={`active-client-membership:${membership.id}`}
              className="active-client-row membership"
              title={membership.memberName}
              context="Socio ativo"
              detail={[plan?.name || "Plano", membership.startsOn ? `Desde ${membership.startsOn}` : "", membership.phone].filter(Boolean).join(" | ")}
              status="Plano"
              primaryAction={
                <button type="button" className="primary" onClick={onOpenFinancePlans} disabled={busy}>
                  Abrir Receita
                </button>
              }
              actions={
                href ? (
                  <button type="button" className="secondary" onClick={() => window.open(href, "_blank", "noopener,noreferrer")} disabled={busy}>
                    WhatsApp
                  </button>
                ) : null
              }
            />
          );
        })}

        {activeContacts.slice(0, 12).map((contact) => {
          const href = whatsappLink(contact.phone);
          return (
            <EntityActionRow
              key={`active-client-contact:${contact.id}`}
              className="active-client-row converted"
              title={contact.name}
              context="Cliente convertido"
              detail={[contact.interest || "Interesse registrado", contact.ownerLabel || "sem responsavel", contact.phone || contact.email].filter(Boolean).join(" | ")}
              status="CRM"
              primaryAction={
                <button type="button" className="primary" onClick={() => onOpenContact(contact)} disabled={busy}>
                  Abrir contato
                </button>
              }
              actions={
                href ? (
                  <button type="button" className="secondary" onClick={() => window.open(href, "_blank", "noopener,noreferrer")} disabled={busy}>
                    WhatsApp
                  </button>
                ) : null
              }
            />
          );
        })}

        {!totalActive ? (
          <WorkspaceEmptyState
            title="Nenhum cliente ativo ainda"
            detail="Quando um lead for convertido, uma matricula for ativada ou um socio estiver ativo, ele aparece aqui."
          />
        ) : null}

        {totalActive > 36 ? <span className="subtle">Mostrando 36 de {countLabel(totalActive, "cliente ativo", "clientes ativos")}.</span> : null}
      </div>
    </div>
  );
}
