type CommunicationQueueItem = {
  action: string;
  detail: string;
  id: string;
  label: string;
  status: string;
  tone?: "attention" | "ready";
};

type CommunicationTemplate = {
  body: string;
  id: string;
  title: string;
  trigger: string;
};

type PlaceCommunicationPanelProps = {
  activeClassCount: number;
  activeMembershipPlanCount: number;
  activeCourtCount: number;
  lessonRequestCount: number;
  openReceivableCount: number;
  pendingBookingCount: number;
  placeName: string;
  publicPageReady: boolean;
  waitlistCount: number;
  onOpenAgenda: () => void;
  onOpenClients: () => void;
  onOpenFinance: () => void;
  onOpenPublicData: () => void;
  onOpenPublicPage: () => void;
};

export function PlaceCommunicationPanel({
  activeClassCount,
  activeCourtCount,
  activeMembershipPlanCount,
  lessonRequestCount,
  openReceivableCount,
  pendingBookingCount,
  placeName,
  publicPageReady,
  waitlistCount,
  onOpenAgenda,
  onOpenClients,
  onOpenFinance,
  onOpenPublicData,
  onOpenPublicPage,
}: PlaceCommunicationPanelProps) {
  const queue: CommunicationQueueItem[] = [
    {
      action: pendingBookingCount ? "Abrir agenda" : "Revisar agenda",
      detail: pendingBookingCount ? "Reservas aguardando acao podem exigir confirmacao, troca ou mensagem." : "Agenda sem reserva pendente agora.",
      id: "booking",
      label: "Reservas",
      status: pendingBookingCount ? `${pendingBookingCount} pendente(s)` : "Em dia",
      tone: pendingBookingCount ? "attention" : "ready",
    },
    {
      action: waitlistCount ? "Avisar espera" : "Sem fila",
      detail: waitlistCount ? "Clientes em espera precisam de retorno quando liberar horario." : "Lista de espera sem acao imediata.",
      id: "waitlist",
      label: "Lista de espera",
      status: waitlistCount ? `${waitlistCount} pessoa(s)` : "Em dia",
      tone: waitlistCount ? "attention" : "ready",
    },
    {
      action: lessonRequestCount ? "Abrir clientes" : "Sem encaixe",
      detail: lessonRequestCount ? "Pedidos de aula e reposicao precisam de resposta clara." : "Sem pedidos de aula pendentes.",
      id: "lessons",
      label: "Aulas",
      status: lessonRequestCount ? `${lessonRequestCount} pedido(s)` : "Em dia",
      tone: lessonRequestCount ? "attention" : "ready",
    },
    {
      action: openReceivableCount ? "Cobrar" : "Sem cobranca",
      detail: openReceivableCount ? "Recebiveis em aberto devem gerar lembrete profissional." : "Sem cobranca pendente no filtro atual.",
      id: "finance",
      label: "Financeiro",
      status: openReceivableCount ? `${openReceivableCount} em aberto` : "Em dia",
      tone: openReceivableCount ? "attention" : "ready",
    },
    {
      action: publicPageReady ? "Ver pagina" : "Completar dados",
      detail: publicPageReady ? "Pagina publica pronta para compartilhar." : "Preencha descricao, quadras e ofertas antes de divulgar.",
      id: "publication",
      label: "Publicacao",
      status: publicPageReady ? "Pronta" : "Revisar",
      tone: publicPageReady ? "ready" : "attention",
    },
  ];

  const templates: CommunicationTemplate[] = [
    {
      body: `Olá, {nome}. Aqui é {remetente}, da ${placeName}. Sua reserva foi atualizada. Confira data, horário e quadra antes de ir ao clube.`,
      id: "booking-change",
      title: "Remarcacao de reserva",
      trigger: "Reserva alterada, cancelada ou reagendada",
    },
    {
      body: `Olá, {nome}. Identificamos uma pendência de pagamento em ${placeName}. Quando puder, acesse o app ou fale com a recepção para regularizar.`,
      id: "payment",
      title: "Lembrete de pagamento",
      trigger: "Mensalidade, plano, reserva ou inscrição em aberto",
    },
    {
      body: `Olá, {nome}. Temos uma atualização sobre sua aula em ${placeName}. Veja a turma, professor, horário e observações no app.`,
      id: "lesson",
      title: "Aviso de aula",
      trigger: "Reposição, encaixe, aviso prévio ou troca de turma",
    },
  ];

  const selected = queue.find((item) => item.tone === "attention") || queue[0];

  const actionFor = (item: CommunicationQueueItem) => {
    if (item.id === "booking" || item.id === "waitlist") return onOpenAgenda;
    if (item.id === "lessons") return onOpenClients;
    if (item.id === "finance") return onOpenFinance;
    if (item.id === "publication") return publicPageReady ? onOpenPublicPage : onOpenPublicData;
    return onOpenPublicData;
  };

  return (
    <section className="communication-console" aria-label="Comunicacao operacional">
      <header className="communication-console__header">
        <div>
          <span>Comunicacao</span>
          <h2>Central de mensagens</h2>
          <p>WhatsApp, publicacao e avisos conectados aos pontos reais da operacao.</p>
        </div>
        <div className="communication-console__actions">
          <button type="button" onClick={onOpenPublicData}>Editar dados publicos</button>
          <button type="button" className="primary" onClick={onOpenPublicPage}>Ver pagina publica</button>
        </div>
      </header>

      <div className="communication-console__metrics">
        <article>
          <span>Quadras</span>
          <strong>{activeCourtCount}</strong>
          <small>Uso publico e agenda</small>
        </article>
        <article>
          <span>Aulas</span>
          <strong>{activeClassCount}</strong>
          <small>Turmas visiveis</small>
        </article>
        <article>
          <span>Planos</span>
          <strong>{activeMembershipPlanCount}</strong>
          <small>Ofertas recorrentes</small>
        </article>
        <article className={publicPageReady ? "" : "attention"}>
          <span>Pagina publica</span>
          <strong>{publicPageReady ? "OK" : "Revisar"}</strong>
          <small>{publicPageReady ? "Pronta para divulgar" : "Faltam dados de publicacao"}</small>
        </article>
      </div>

      <div className="communication-console__body">
        <div className="communication-console__table" role="table" aria-label="Fila de comunicacao">
          <div className="communication-console__table-head" role="row">
            <span>Ponto</span>
            <span>Status</span>
            <span>Mensagem</span>
            <span>Acao</span>
          </div>
          <div>
            {queue.map((item) => (
              <button key={item.id} type="button" className={`communication-console__row ${item.tone || ""}`.trim()} onClick={actionFor(item)} role="row">
                <strong>{item.label}</strong>
                <em>{item.status}</em>
                <span>{item.detail}</span>
                <small>{item.action}</small>
              </button>
            ))}
          </div>
        </div>

        <aside className="communication-console__drawer" aria-label="Detalhe de comunicacao">
          <header>
            <span>Proxima acao</span>
            <h3>{selected.label}</h3>
            <p>{selected.detail}</p>
          </header>
          <button type="button" className="primary" onClick={actionFor(selected)}>{selected.action}</button>
          <section>
            <div className="communication-console__section-title">
              <strong>Modelos padrao</strong>
              <span>{templates.length}</span>
            </div>
            <div className="communication-console__templates">
              {templates.map((template) => (
                <article key={template.id}>
                  <span>{template.trigger}</span>
                  <strong>{template.title}</strong>
                  <small>{template.body}</small>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
