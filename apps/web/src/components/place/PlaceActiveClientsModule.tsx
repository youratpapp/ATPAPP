import { useMemo, useState } from "react";
import type { AcademyClass, AcademyEnrollment, PlaceCrmContact, PlaceMembership, PlaceMembershipPlan } from "../../lib/types";
import { WorkspaceEmptyState } from "./PlaceWorkspaceUi";

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

type ClientRow = {
  category: string;
  detail: string;
  email: string;
  id: string;
  kind: "student" | "member" | "contact";
  name: string;
  owner: string;
  phone: string;
  source: AcademyEnrollment | PlaceMembership | PlaceCrmContact;
  status: string;
  updatedAt: string;
};

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
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
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const activeEnrollmentRows = activeEnrollments.filter((enrollment) => enrollment.status === "active");
  const activeMembershipRows = activeMemberships.filter((membership) => membership.status === "active");

  const rows = useMemo<ClientRow[]>(() => {
    const enrollmentRows = activeEnrollmentRows.map((enrollment) => {
      const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
      return {
        category: "Aluno",
        detail: [academyClass?.title || "Turma", academyClass?.coachName || "Professor a definir"].filter(Boolean).join(" | "),
        email: "",
        id: `student:${enrollment.id}`,
        kind: "student" as const,
        name: enrollment.playerName,
        owner: academyClass?.coachName || "Academia",
        phone: enrollment.phone,
        source: enrollment,
        status: "Ativo",
        updatedAt: enrollment.createdAt || "",
      };
    });
    const membershipRows = activeMembershipRows.map((membership) => {
      const plan = membershipPlans.find((item) => item.id === membership.planId);
      return {
        category: plan?.name || "Socio",
        detail: membership.startsOn ? `Desde ${membership.startsOn}` : "Plano ativo",
        email: "",
        id: `member:${membership.id}`,
        kind: "member" as const,
        name: membership.memberName,
        owner: "Receita",
        phone: membership.phone,
        source: membership,
        status: "Ativo",
        updatedAt: membership.createdAt || "",
      };
    });
    const contactRows = activeContacts.map((contact) => ({
      category: contact.interest || "Cliente",
      detail: contact.notes || contact.source || "Cliente convertido",
      email: contact.email,
      id: `contact:${contact.id}`,
      kind: "contact" as const,
      name: contact.name,
      owner: contact.ownerLabel || "Sem responsavel",
      phone: contact.phone,
      source: contact,
      status: contact.status === "converted" ? "Ativo" : contact.status,
      updatedAt: contact.updatedAt || contact.createdAt || "",
    }));
    return [...enrollmentRows, ...membershipRows, ...contactRows].sort((a, b) => a.name.localeCompare(b.name));
  }, [academyClasses, activeContacts, activeEnrollmentRows, activeMembershipRows, membershipPlans]);

  const filteredRows = rows.filter((row) => {
    const haystack = [row.name, row.category, row.phone, row.email, row.owner, row.detail].join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const selected = filteredRows.find((row) => row.id === selectedId) || filteredRows[0] || null;
  const href = selected ? whatsappLink(selected.phone) : "";

  return (
    <div className="clients-360-workspace">
      <header className="clients-360-head">
        <div>
          <span>Gerenciamento</span>
          <h2>Clientes</h2>
          <p>Leads e clientes ativos ficam separados; o detalhe abre sem tirar a equipe da lista.</p>
        </div>
        <button type="button" className="primary" onClick={onOpenAcademyStudents} disabled={busy}>
          Novo cliente
        </button>
      </header>

      <div className="clients-360-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente, telefone, turma, plano..." />
        <select aria-label="Categoria de cliente" defaultValue="todos">
          <option value="todos">Todos os tipos</option>
          <option value="alunos">Alunos</option>
          <option value="socios">Socios</option>
          <option value="crm">CRM</option>
        </select>
        <select aria-label="Status de cliente" defaultValue="ativos">
          <option value="ativos">Ativos</option>
          <option value="todos">Todos</option>
        </select>
        <strong>{countLabel(filteredRows.length, "cliente ativo", "clientes ativos")}</strong>
      </div>

      {filteredRows.length ? (
        <div className="clients-360-layout">
          <div className="clients-360-table" role="table" aria-label="Clientes ativos">
            <div className="clients-360-table-row head" role="row">
              <span>Nome</span>
              <span>Status</span>
              <span>Categoria</span>
              <span>Contato</span>
              <span>Responsavel</span>
              <span>Acao</span>
            </div>
            {filteredRows.slice(0, 80).map((row) => (
              <button
                key={row.id}
                type="button"
                className={selected?.id === row.id ? "clients-360-table-row selected" : "clients-360-table-row"}
                onClick={() => setSelectedId(row.id)}
                role="row"
              >
                <span className="clients-360-name">
                  <b>{initials(row.name)}</b>
                  <strong>{row.name}</strong>
                </span>
                <span className="clients-360-pill">{row.status}</span>
                <span>{row.category}</span>
                <span>{row.phone || row.email || "Sem contato"}</span>
                <span>{row.owner}</span>
                <em>{row.kind === "contact" ? "Abrir 360" : row.kind === "member" ? "Receita" : "Aulas"}</em>
              </button>
            ))}
          </div>

          <aside className="clients-360-drawer" aria-label="Cliente 360">
            {selected ? (
              <>
                <header>
                  <div className="clients-360-avatar">{initials(selected.name)}</div>
                  <div>
                    <span>Cliente 360</span>
                    <h3>{selected.name}</h3>
                    <p>{selected.category}</p>
                  </div>
                </header>
                <div className="clients-360-badges">
                  <span>{selected.status}</span>
                  <span>{selected.kind === "student" ? "Aluno" : selected.kind === "member" ? "Socio" : "CRM"}</span>
                </div>
                <dl>
                  <dt>Telefone</dt>
                  <dd>{selected.phone || "Sem telefone"}</dd>
                  <dt>Email</dt>
                  <dd>{selected.email || "Sem email"}</dd>
                  <dt>Responsavel</dt>
                  <dd>{selected.owner}</dd>
                  <dt>Resumo</dt>
                  <dd>{selected.detail}</dd>
                </dl>
                <div className="clients-360-actions">
                  {href ? (
                    <button type="button" className="secondary" onClick={() => window.open(href, "_blank", "noopener,noreferrer")} disabled={busy}>
                      WhatsApp
                    </button>
                  ) : null}
                  {selected.kind === "contact" ? (
                    <button type="button" className="primary" onClick={() => onOpenContact(selected.source as PlaceCrmContact)} disabled={busy}>
                      Abrir historico
                    </button>
                  ) : selected.kind === "member" ? (
                    <button type="button" className="primary" onClick={onOpenFinancePlans} disabled={busy}>
                      Abrir receita
                    </button>
                  ) : (
                    <button type="button" className="primary" onClick={onOpenAcademyStudents} disabled={busy}>
                      Abrir aulas
                    </button>
                  )}
                </div>
                <section>
                  <h4>Resumo operacional</h4>
                  <article>
                    <strong>Ultima atividade</strong>
                    <span>{selected.updatedAt ? new Date(selected.updatedAt).toLocaleDateString("pt-BR") : "Sem historico recente"}</span>
                  </article>
                  <article>
                    <strong>Proximo passo</strong>
                    <span>{selected.kind === "contact" ? "Registrar atendimento ou retorno." : "Consultar vinculos, pagamentos e agenda."}</span>
                  </article>
                </section>
              </>
            ) : null}
          </aside>
        </div>
      ) : (
        <WorkspaceEmptyState
          title="Nenhum cliente ativo encontrado"
          detail="Ajuste a busca ou converta um lead, aprove uma matricula ou ative um socio para aparecer nesta lista."
        />
      )}
    </div>
  );
}
