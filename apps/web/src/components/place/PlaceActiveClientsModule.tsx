import { useMemo, useState } from "react";
import type {
  AcademyClass,
  AcademyEnrollment,
  AcademyStudentContract,
  AppPayment,
  CourtBooking,
  PlaceCreditPurchase,
  PlaceCrmContact,
  PlaceCrmInteraction,
  PlaceMembership,
  PlaceMembershipPlan,
} from "../../lib/types";
import { WorkspaceEmptyState } from "./PlaceWorkspaceUi";

type PlaceActiveClientsModuleProps = {
  activeContacts: PlaceCrmContact[];
  activeEnrollments: AcademyEnrollment[];
  activeMemberships: PlaceMembership[];
  academyClasses: AcademyClass[];
  academyStudentContracts: AcademyStudentContract[];
  bookings: CourtBooking[];
  busy: boolean;
  countLabel: (count: number, singular: string, plural: string) => string;
  creditPurchases: PlaceCreditPurchase[];
  crmInteractions: PlaceCrmInteraction[];
  membershipPlans: PlaceMembershipPlan[];
  payments: AppPayment[];
  onOpenAcademyStudents: () => void;
  onOpenContact: (contact: PlaceCrmContact) => void;
  onOpenLeadCapture: () => void;
  onOpenFinancePlans: () => void;
  onOpenReservations: () => void;
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

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", { currency: "BRL", style: "currency" }).format((value || 0) / 100);
}

function formatDate(value: string): string {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString("pt-BR");
}

function bookingStatusLabel(status: CourtBooking["status"]): string {
  if (status === "confirmed") return "Confirmada";
  if (status === "pending") return "Pendente";
  if (status === "cancelled") return "Cancelada";
  return "Bloqueio";
}

function paymentStatusLabel(status: AppPayment["status"]): string {
  if (status === "paid") return "Pago";
  if (status === "pending") return "Pendente";
  if (status === "refunded") return "Estornado";
  return "Falhou";
}

function membershipStatusLabel(status: PlaceMembership["status"] | AcademyStudentContract["status"] | AcademyEnrollment["status"]): string {
  if (status === "active") return "Ativo";
  if (status === "pending") return "Pendente";
  return "Cancelado";
}

function shortClassTime(value?: string): string {
  if (!value) return "";
  return value.slice(0, 5);
}

function paymentMethodLabel(payment?: AppPayment): string {
  if (!payment) return "Ainda sem pagamento registrado";
  if (payment.provider === "stub") return payment.status === "paid" ? "Stub interno - pago" : "Stub interno - pendente";
  return payment.provider || "Pagamento registrado";
}

export function PlaceActiveClientsModule({
  activeContacts,
  activeEnrollments,
  activeMemberships,
  academyClasses,
  academyStudentContracts,
  bookings,
  busy,
  countLabel,
  creditPurchases,
  crmInteractions,
  membershipPlans,
  payments,
  onOpenAcademyStudents,
  onOpenContact,
  onOpenLeadCapture,
  onOpenFinancePlans,
  onOpenReservations,
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

  const groupedRows = useMemo<ClientRow[]>(() => {
    const priority: Record<ClientRow["kind"], number> = { student: 0, member: 1, contact: 2 };
    const grouped = new Map<string, ClientRow>();
    rows.forEach((row) => {
      const key = normalizePhone(row.phone) || normalizeText(row.name);
      const current = grouped.get(key);
      if (!current) {
        grouped.set(key, { ...row });
        return;
      }
      const categories = Array.from(new Set([...current.category.split(" + "), row.category].filter(Boolean))).slice(0, 3);
      const merged: ClientRow = {
        ...current,
        category: categories.join(" + "),
        detail: [current.detail, row.detail].filter(Boolean).join(" | "),
        email: current.email || row.email,
        kind: priority[row.kind] < priority[current.kind] ? row.kind : current.kind,
        owner: current.owner !== "Academia" ? current.owner : row.owner,
        phone: current.phone || row.phone,
        source: priority[row.kind] < priority[current.kind] ? row.source : current.source,
        status: current.status === "Ativo" || row.status === "Ativo" ? "Ativo" : current.status,
        updatedAt: new Date(row.updatedAt || 0).getTime() > new Date(current.updatedAt || 0).getTime() ? row.updatedAt : current.updatedAt,
      };
      grouped.set(key, merged);
    });
    return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const filteredRows = groupedRows.filter((row) => {
    const haystack = [row.name, row.category, row.phone, row.email, row.owner, row.detail].join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const selected = filteredRows.find((row) => row.id === selectedId) || filteredRows[0] || null;
  const href = selected ? whatsappLink(selected.phone) : "";
  const selectedBookings = useMemo(() => {
    if (!selected) return [];
    const phone = normalizePhone(selected.phone);
    const name = normalizeText(selected.name);
    return bookings
      .filter((booking) => {
        const bookingPhone = normalizePhone(booking.phone);
        const bookingName = normalizeText(booking.playerName);
        return (phone && bookingPhone && bookingPhone.endsWith(phone.slice(-8))) || (name && bookingName === name);
      })
      .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
      .slice(0, 4);
  }, [bookings, selected]);
  const selectedCreditPurchases = useMemo(() => {
    if (!selected) return [];
    const phone = normalizePhone(selected.phone);
    const name = normalizeText(selected.name);
    return creditPurchases
      .filter((purchase) => {
        const purchasePhone = normalizePhone(purchase.phone);
        return (phone && purchasePhone && purchasePhone.endsWith(phone.slice(-8))) || normalizeText(purchase.buyerName) === name;
      })
      .sort((a, b) => new Date(b.purchasedOn || b.createdAt).getTime() - new Date(a.purchasedOn || a.createdAt).getTime())
      .slice(0, 4);
  }, [creditPurchases, selected]);
  const selectedCrmInteractions = useMemo(() => {
    if (!selected) return [];
    const selectedContactId = selected.kind === "contact" ? (selected.source as PlaceCrmContact).id : "";
    const selectedPhone = normalizePhone(selected.phone);
    const selectedName = normalizeText(selected.name);
    const relatedContactIds = activeContacts
      .filter((contact) => {
        const contactPhone = normalizePhone(contact.phone);
        return contact.id === selectedContactId || (selectedPhone && contactPhone && contactPhone.endsWith(selectedPhone.slice(-8))) || normalizeText(contact.name) === selectedName;
      })
      .map((contact) => contact.id);
    const relatedIds = new Set(relatedContactIds);
    return crmInteractions
      .filter((interaction) => relatedIds.has(interaction.contactId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [activeContacts, crmInteractions, selected]);
  const selectedEnrollments = useMemo(() => {
    if (!selected) return [];
    const phone = normalizePhone(selected.phone);
    const name = normalizeText(selected.name);
    return activeEnrollmentRows.filter((enrollment) => {
      const enrollmentPhone = normalizePhone(enrollment.phone);
      return (phone && enrollmentPhone && enrollmentPhone.endsWith(phone.slice(-8))) || normalizeText(enrollment.playerName) === name;
    });
  }, [activeEnrollmentRows, selected]);
  const selectedMemberships = useMemo(() => {
    if (!selected) return [];
    const phone = normalizePhone(selected.phone);
    const name = normalizeText(selected.name);
    return activeMembershipRows.filter((membership) => {
      const membershipPhone = normalizePhone(membership.phone);
      return (phone && membershipPhone && membershipPhone.endsWith(phone.slice(-8))) || normalizeText(membership.memberName) === name;
    });
  }, [activeMembershipRows, selected]);
  const selectedContracts = useMemo(() => {
    if (!selected) return [];
    const phone = normalizePhone(selected.phone);
    const name = normalizeText(selected.name);
    return academyStudentContracts.filter((contract) => {
      const contractPhone = normalizePhone(contract.phone);
      return contract.status !== "cancelled" && ((phone && contractPhone && contractPhone.endsWith(phone.slice(-8))) || normalizeText(contract.studentName) === name);
    });
  }, [academyStudentContracts, selected]);
  const selectedClassLinks = useMemo(() => {
    return selectedEnrollments.map((enrollment) => ({
      enrollment,
      academyClass: academyClasses.find((item) => item.id === enrollment.classId),
      contract: selectedContracts.find((contract) => contract.id === enrollment.contractId) || null,
    }));
  }, [academyClasses, selectedContracts, selectedEnrollments]);
  const selectedPayments = useMemo(() => {
    if (!selected) return [];
    const sourceId = "id" in selected.source ? String(selected.source.id) : "";
    const relatedTargetIds = new Set(
      [
        sourceId,
        ...selectedBookings.map((booking) => booking.id),
        ...selectedMemberships.map((membership) => membership.id),
        ...selectedEnrollments.map((enrollment) => enrollment.id),
        ...selectedContracts.map((contract) => contract.id),
        ...selectedCreditPurchases.map((purchase) => purchase.id),
      ].filter(Boolean)
    );
    const name = normalizeText(selected.name);
    return payments
      .filter((payment) => {
        const metadata = normalizeText(JSON.stringify(payment.metadata || {}));
        const description = normalizeText(payment.description || "");
        return relatedTargetIds.has(payment.targetId) || (name && (metadata.includes(name) || description.includes(name)));
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 6);
  }, [payments, selected, selectedBookings, selectedContracts, selectedCreditPurchases, selectedEnrollments, selectedMemberships]);
  const primaryPayment = selectedPayments[0];

  return (
    <div className="clients-360-workspace">
      <header className="clients-360-head">
        <div>
          <span>Gerenciamento</span>
          <h2>Clientes</h2>
          <p>Cliente 360 centraliza dados, vinculos, agenda, aulas, planos, pagamentos e relacionamento sem duplicar listas.</p>
        </div>
        <button type="button" className="primary" onClick={onOpenLeadCapture} disabled={busy}>
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
              <span>Proximo passo</span>
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
                    <p>{selected.category} na academia</p>
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
                  <dt>Metodo de pagamento</dt>
                  <dd>{paymentMethodLabel(primaryPayment)}</dd>
                  <dt>Resumo do vinculo</dt>
                  <dd>{selected.detail}</dd>
                </dl>
                <div className="clients-360-actions">
                  <button type="button" className="primary" onClick={onOpenReservations} disabled={busy}>
                    Nova reserva
                  </button>
                  <button type="button" onClick={onOpenFinancePlans} disabled={busy}>
                    Cobrar
                  </button>
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
                    <button type="button" onClick={onOpenFinancePlans} disabled={busy}>
                      Abrir receita
                    </button>
                  ) : (
                    <button type="button" onClick={onOpenAcademyStudents} disabled={busy}>
                      Abrir aulas
                    </button>
                  )}
                </div>
                <section>
                  <h4>Vinculo com a academia</h4>
                  {selectedMemberships.length ? (
                    selectedMemberships.map((membership) => {
                      const plan = membershipPlans.find((item) => item.id === membership.planId);
                      const payment = payments.find((item) => item.targetType === "place_membership" && item.targetId === membership.id);
                      return (
                        <article key={`client-membership:${membership.id}`}>
                          <strong>{plan?.name || "Plano de socio"}</strong>
                          <span>
                            {formatMoneyFromCents(plan?.monthlyFeeCents || 0)} / mes - {membershipStatusLabel(membership.status)}
                          </span>
                          <em>{payment ? paymentStatusLabel(payment.status) : "Pagamento nao registrado"}</em>
                        </article>
                      );
                    })
                  ) : (
                    <article>
                      <strong>Sem plano de socio ativo</strong>
                      <span>Planos e mensalidades vinculados ao cliente aparecem aqui.</span>
                    </article>
                  )}
                  {selectedContracts.length ? (
                    selectedContracts.map((contract) => {
                      const payment = payments.find((item) => item.targetType === "academy_student_contract" && item.targetId === contract.id);
                      return (
                        <article key={`client-contract:${contract.id}`}>
                          <strong>Contrato de aulas</strong>
                          <span>
                            {contract.weeklyLessonsCount}x/semana - {formatMoneyFromCents(contract.monthlyFeeCents)} / mes
                          </span>
                          <em>{payment ? paymentStatusLabel(payment.status) : "Pagamento nao registrado"}</em>
                        </article>
                      );
                    })
                  ) : null}
                </section>
                <section>
                  <h4>Turmas e aulas</h4>
                  {selectedClassLinks.length ? (
                    selectedClassLinks.map(({ enrollment, academyClass, contract }) => (
                      <article key={`client-class:${enrollment.id}`}>
                        <strong>{academyClass?.title || "Turma"}</strong>
                        <span>
                          {[academyClass?.coachName, academyClass?.courtId ? "Quadra vinculada" : "", academyClass?.startsAt && academyClass?.endsAt ? `${shortClassTime(academyClass.startsAt)}-${shortClassTime(academyClass.endsAt)}` : ""].filter(Boolean).join(" | ") || "Dados da turma"}
                        </span>
                        <em>{contract ? `${contract.weeklyLessonsCount} horario(s)/semana` : membershipStatusLabel(enrollment.status)}</em>
                      </article>
                    ))
                  ) : (
                    <article>
                      <strong>Sem turma ativa</strong>
                      <span>Matriculas e turmas do aluno aparecem neste bloco.</span>
                    </article>
                  )}
                </section>
                <section>
                  <h4>Resumo operacional</h4>
                  <article>
                    <strong>Agenda</strong>
                    <span>{selectedBookings.length ? `${selectedBookings.length} reserva(s) recente(s) vinculada(s).` : "Sem reserva vinculada neste local."}</span>
                  </article>
                  <article>
                    <strong>Receita</strong>
                    <span>{selectedPayments.length ? `${selectedPayments.length} pagamento(s) encontrado(s).` : "Sem pagamento pessoal localizado."}</span>
                  </article>
                  <article>
                    <strong>Pacotes e creditos</strong>
                    <span>{selectedCreditPurchases.length ? `${selectedCreditPurchases.length} pacote(s) ativo(s) ou recente(s).` : "Sem pacote ou credito vinculado."}</span>
                  </article>
                  <article>
                    <strong>Ultima atividade</strong>
                    <span>{selected.updatedAt ? new Date(selected.updatedAt).toLocaleDateString("pt-BR") : "Sem historico recente"}</span>
                  </article>
                  <article>
                    <strong>Proximo passo</strong>
                    <span>{selected.kind === "contact" ? "Registrar atendimento ou retorno." : "Acompanhar vinculos, pagamentos e proximos compromissos."}</span>
                  </article>
                </section>
                <section className="clients-360-history-section">
                  <div className="clients-360-section-title">
                    <h4>Reservas recentes</h4>
                    <button type="button" onClick={onOpenReservations} disabled={busy}>
                      Abrir agenda
                    </button>
                  </div>
                  {selectedBookings.length ? (
                    selectedBookings.map((booking) => (
                      <article key={booking.id} className="clients-360-history-item">
                        <strong>{booking.courtName || "Quadra"}</strong>
                        <span>
                          {formatDate(booking.startsAt)} · {new Date(booking.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <em className={`clients-360-status clients-360-status--${booking.status}`}>{bookingStatusLabel(booking.status)}</em>
                      </article>
                    ))
                  ) : (
                    <article className="clients-360-history-empty">
                      <strong>Sem reservas neste local</strong>
                      <span>Crie uma reserva pela agenda mantendo o cliente selecionado como referencia operacional.</span>
                    </article>
                  )}
                </section>
                <section className="clients-360-history-section">
                  <div className="clients-360-section-title">
                    <h4>Pagamentos</h4>
                    <button type="button" onClick={onOpenFinancePlans} disabled={busy}>
                      Abrir receita
                    </button>
                  </div>
                  {selectedPayments.length ? (
                    selectedPayments.map((payment) => (
                      <article key={payment.id} className="clients-360-history-item">
                        <strong>{formatMoneyFromCents(payment.amountCents)}</strong>
                        <span>{payment.description || payment.targetType}</span>
                        <em className={`clients-360-status clients-360-status--${payment.status}`}>{paymentStatusLabel(payment.status)}</em>
                      </article>
                    ))
                  ) : (
                    <article className="clients-360-history-empty">
                      <strong>Sem pagamentos vinculados</strong>
                      <span>Quando houver mensalidade, pacote ou reserva paga, o historico aparece aqui.</span>
                    </article>
                  )}
                </section>
                <section className="clients-360-history-section">
                  <div className="clients-360-section-title">
                    <h4>Pacotes e creditos</h4>
                    <button type="button" onClick={onOpenFinancePlans} disabled={busy}>
                      Abrir produtos
                    </button>
                  </div>
                  {selectedCreditPurchases.length ? (
                    selectedCreditPurchases.map((purchase) => (
                      <article key={purchase.id} className="clients-360-history-item">
                        <strong>{purchase.packageName}</strong>
                        <span>
                          {formatMoneyFromCents(purchase.amountCents)} - {purchase.remainingQuantity}/{purchase.initialQuantity} restante(s)
                        </span>
                        <em className={`clients-360-status clients-360-status--${purchase.status}`}>{membershipStatusLabel(purchase.status === "active" ? "active" : purchase.status === "cancelled" ? "cancelled" : "pending")}</em>
                      </article>
                    ))
                  ) : (
                    <article className="clients-360-history-empty">
                      <strong>Sem pacote comprado</strong>
                      <span>Pacotes de credito, aula avulsa ou day pass aparecem aqui quando vinculados ao cliente.</span>
                    </article>
                  )}
                </section>
                <section className="clients-360-history-section">
                  <div className="clients-360-section-title">
                    <h4>Historico de relacionamento</h4>
                    {selected.kind === "contact" ? (
                      <button type="button" onClick={() => onOpenContact(selected.source as PlaceCrmContact)} disabled={busy}>
                        Abrir atendimento
                      </button>
                    ) : null}
                  </div>
                  {selectedCrmInteractions.length ? (
                    selectedCrmInteractions.map((interaction) => (
                      <article key={interaction.id} className="clients-360-history-item">
                        <strong>{interaction.interactionType}</strong>
                        <span>{interaction.body || "Registro sem descricao"}</span>
                        <em>{formatDate(interaction.createdAt)}</em>
                      </article>
                    ))
                  ) : (
                    <article className="clients-360-history-empty">
                      <strong>Sem interacao registrada</strong>
                      <span>Atendimentos, WhatsApp, ligacoes e observacoes ficam concentrados neste historico.</span>
                    </article>
                  )}
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
