import { useState } from "react";

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
  category: string;
  channel: string;
  id: string;
  nextStep: string;
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
      detail: pendingBookingCount ? "Reservas aguardando acao exigem WhatsApp, remarcacao ou cobranca." : "Agenda sem reserva pendente agora.",
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
      detail: openReceivableCount ? "Recebiveis em aberto pedem lembrete profissional." : "Sem cobranca pendente no filtro atual.",
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
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. Sua reserva esta confirmada para {data}, das {inicio} as {fim}, na {quadra}. Se precisar de apoio, fale com a recepcao.`,
      category: "Reserva",
      channel: "WhatsApp individual",
      id: "booking-confirmed",
      nextStep: "Abrir reserva no detalhe lateral e confirmar se o pagamento ja esta vinculado.",
      title: "Reserva confirmada",
      trigger: "Reserva criada ou pagamento confirmado",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. Confirmamos o pagamento da sua reserva de {data}, das {inicio} as {fim}, na {quadra}. Sua quadra esta garantida. Obrigado e bom jogo!`,
      category: "Reserva",
      channel: "WhatsApp individual",
      id: "booking-paid",
      nextStep: "Enviar apos marcar como pago para evitar nova cobranca manual.",
      title: "Pagamento da reserva confirmado",
      trigger: "Pagamento de reserva marcado como pago",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. Precisamos cancelar sua reserva de {data}, {inicio}-{fim}, na {quadra}. Se desejar, podemos encontrar o proximo horario disponivel.`,
      category: "Reserva",
      channel: "WhatsApp individual",
      id: "booking-cancelled",
      nextStep: "Cancelar no sistema, enviar aviso e registrar alternativa se houver remarcacao.",
      title: "Cancelamento de reserva",
      trigger: "Reserva cancelada pela unidade",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. Para alterar sua reserva, acesse o link seguro abaixo, escolha uma quadra/horario livre e confirme a troca. Pagamento ja vinculado a reserva original: {link_remarcacao}`,
      category: "Reserva",
      channel: "WhatsApp com link",
      id: "booking-change",
      nextStep: "Gerar link de remarcacao e acompanhar a troca pela Agenda.",
      title: "Remarcacao de reserva",
      trigger: "Reserva alterada, cancelada ou reagendada",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. Para remarcar sua reserva ja paga, use este link seguro: {link_remarcacao}. Voce vera a agenda atual, escolhera um horario livre e confirmara a troca.`,
      category: "Reserva",
      channel: "WhatsApp com link",
      id: "booking-change-link",
      nextStep: "Usar quando o cliente deve escolher novo horario sem a recepcao editar manualmente.",
      title: "Link de remarcacao",
      trigger: "Cliente precisa escolher novo horario na agenda",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. O horario solicitado ainda esta ocupado. Encontramos estas opcoes proximas: {opcoes}. Se uma delas funcionar, responda esta mensagem ou acesse {link_agenda}.`,
      category: "Reserva",
      channel: "WhatsApp individual",
      id: "waitlist-alternatives",
      nextStep: "Consultar agenda antes de enviar para nao sugerir horario indisponivel.",
      title: "Lista de espera com alternativas",
      trigger: "Cliente em espera sem horario livre exato",
    },
    {
      body: `Ola, {nome}. Identificamos uma pendencia de pagamento em ${placeName}. Quando puder, acesse o app ou fale com a recepcao para regularizar.`,
      category: "Financeiro",
      channel: "WhatsApp individual",
      id: "payment",
      nextStep: "Abrir Financeiro, conferir origem da cobranca e enviar lembrete pelo cliente correto.",
      title: "Lembrete de pagamento",
      trigger: "Mensalidade, plano, reserva ou inscricao em aberto",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. Sua mensalidade do plano {plano} esta vencida desde {vencimento}, no valor de {valor}. Para regularizar, acesse o app ou fale com a nossa equipe.`,
      category: "Financeiro",
      channel: "WhatsApp individual",
      id: "membership-overdue",
      nextStep: "Usar apenas apos validar que o pagamento ainda nao foi baixado.",
      title: "Mensalidade vencida",
      trigger: "Mensalidade pessoal vencida",
    },
    {
      body: `Ola, {nome}. Sua aula em ${placeName} esta marcada para {data}, {inicio}-{fim}, com {professor}, na {quadra}. Turma: {turma}.`,
      category: "Academia",
      channel: "WhatsApp individual ou turma",
      id: "lesson",
      nextStep: "Enviar para aviso pontual de turma, troca de quadra ou lembrete de aula.",
      title: "Aviso de aula",
      trigger: "Aula do dia, encaixe ou troca de turma",
    },
    {
      body: `Ola, {nome}. Recebemos seu aviso de ausencia em ${placeName}. A reposicao ficara disponivel conforme as regras do seu plano. Acompanhe as opcoes pelo app ou fale com a recepcao.`,
      category: "Academia",
      channel: "WhatsApp individual",
      id: "lesson-makeup",
      nextStep: "Registrar o aviso antes para liberar credito e evitar reposicao indevida.",
      title: "Ausencia e reposicao",
      trigger: "Aluno avisou ausencia antes do prazo",
    },
    {
      body: `Ola, {nome}. Sua inscricao em {competicao} foi registrada em ${placeName}. Proximo passo: acompanhe pagamentos, tabela e comunicados pelo app.`,
      category: "Competicoes",
      channel: "WhatsApp individual",
      id: "competition-registration",
      nextStep: "Enviar depois de aprovar inscricao ou confirmar pagamento.",
      title: "Inscricao em competicao",
      trigger: "Inscricao/pedido aprovado em torneio ou liga",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. Seu resultado em {competicao} esta pendente. Informe o placar pelo app ou responda esta mensagem com o resultado da partida {partida}.`,
      category: "Competicoes",
      channel: "WhatsApp individual",
      id: "competition-result-pending",
      nextStep: "Abrir cockpit da competicao e conferir se o jogo ainda aceita resultado.",
      title: "Resultado pendente",
      trigger: "Partida sem resultado lancado",
    },
    {
      body: `Ola, {nome}. Ha uma atualizacao em {competicao}: {resumo}. Confira jogos, horario, resultado ou classificacao pelo app.`,
      category: "Competicoes",
      channel: "WhatsApp individual ou grupo",
      id: "competition-update",
      nextStep: "Usar apos publicar tabela, rodada, alteracao de horario ou resultado oficial.",
      title: "Comunicado de rodada",
      trigger: "Tabela publicada, rodada gerada ou resultado pendente",
    },
    {
      body: `Ola! A pagina publica de ${placeName} esta atualizada com reservas, aulas, planos e eventos. Acesse: {link_publico}`,
      category: "Publicacao",
      channel: "WhatsApp grupo ou campanha",
      id: "public-page",
      nextStep: "Enviar somente depois de validar dados publicos, horarios e ofertas.",
      title: "Divulgacao da pagina publica",
      trigger: "Pagina pronta para campanha ou envio manual",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. Aviso importante: {mensagem}. Em caso de duvida, fale com a nossa equipe pelo WhatsApp.`,
      category: "Geral",
      channel: "WhatsApp individual ou grupo",
      id: "general-notice",
      nextStep: "Usar para comunicados operacionais que nao pertencem a reserva, aula, financeiro ou competicao.",
      title: "Aviso geral",
      trigger: "Comunicado operacional para clientes, alunos ou participantes",
    },
  ];

  const firstAttention = queue.find((item) => item.tone === "attention") || queue[0];
  const [selectedId, setSelectedId] = useState(firstAttention.id);
  const selected = queue.find((item) => item.id === selectedId) || firstAttention;

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
              <button
                key={item.id}
                type="button"
                className={`communication-console__row ${item.tone || ""} ${selected.id === item.id ? "active" : ""}`.trim()}
                onClick={() => setSelectedId(item.id)}
                role="row"
              >
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
              <strong>Matriz de modelos</strong>
              <span>{templates.length}</span>
            </div>
            <div className="communication-console__templates">
              {templates.map((template) => (
                <article key={template.id}>
                  <em>{template.category}</em>
                  <span>{template.channel}</span>
                  <strong>{template.title}</strong>
                  <span>{template.trigger}</span>
                  <small>{template.body}</small>
                  <small>{template.nextStep}</small>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
