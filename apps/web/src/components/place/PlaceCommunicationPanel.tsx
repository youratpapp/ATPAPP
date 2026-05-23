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
      id: "booking-confirmed",
      title: "Reserva confirmada",
      trigger: "Reserva criada ou pagamento confirmado",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. Precisamos cancelar sua reserva de {data}, {inicio}-{fim}, na {quadra}. Se desejar, podemos encontrar o proximo horario disponivel.`,
      category: "Reserva",
      id: "booking-cancelled",
      title: "Cancelamento de reserva",
      trigger: "Reserva cancelada pela unidade",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. Para alterar sua reserva, acesse o link seguro abaixo, escolha uma quadra/horario livre e confirme a troca. Pagamento ja vinculado a reserva original: {link_remarcacao}`,
      category: "Reserva",
      id: "booking-change",
      title: "Remarcacao de reserva",
      trigger: "Reserva alterada, cancelada ou reagendada",
    },
    {
      body: `Ola, {nome}. Aqui e {remetente}, da ${placeName}. O horario solicitado ainda esta ocupado. Encontramos estas opcoes proximas: {opcoes}. Se uma delas funcionar, responda esta mensagem ou acesse {link_agenda}.`,
      category: "Reserva",
      id: "waitlist-alternatives",
      title: "Lista de espera com alternativas",
      trigger: "Cliente em espera sem horario livre exato",
    },
    {
      body: `Ola, {nome}. Identificamos uma pendencia de pagamento em ${placeName}. Quando puder, acesse o app ou fale com a recepcao para regularizar.`,
      category: "Financeiro",
      id: "payment",
      title: "Lembrete de pagamento",
      trigger: "Mensalidade, plano, reserva ou inscricao em aberto",
    },
    {
      body: `Ola, {nome}. Sua aula em ${placeName} esta marcada para {data}, {inicio}-{fim}, com {professor}, na {quadra}. Turma: {turma}.`,
      category: "Academia",
      id: "lesson",
      title: "Aviso de aula",
      trigger: "Aula do dia, encaixe ou troca de turma",
    },
    {
      body: `Ola, {nome}. Recebemos seu aviso de ausencia em ${placeName}. A reposicao ficara disponivel conforme as regras do seu plano. Acompanhe as opcoes pelo app ou fale com a recepcao.`,
      category: "Academia",
      id: "lesson-makeup",
      title: "Ausencia e reposicao",
      trigger: "Aluno avisou ausencia antes do prazo",
    },
    {
      body: `Ola, {nome}. Sua inscricao em {competicao} foi registrada em ${placeName}. Proximo passo: acompanhe pagamentos, tabela e comunicados pelo app.`,
      category: "Competicoes",
      id: "competition-registration",
      title: "Inscricao em competicao",
      trigger: "Inscricao/pedido aprovado em torneio ou liga",
    },
    {
      body: `Ola, {nome}. Ha uma atualizacao em {competicao}: {resumo}. Confira jogos, horario, resultado ou classificacao pelo app.`,
      category: "Competicoes",
      id: "competition-update",
      title: "Comunicado de rodada",
      trigger: "Tabela publicada, rodada gerada ou resultado pendente",
    },
    {
      body: `Ola! A pagina publica de ${placeName} esta atualizada com reservas, aulas, planos e eventos. Acesse: {link_publico}`,
      category: "Publicacao",
      id: "public-page",
      title: "Divulgacao da pagina publica",
      trigger: "Pagina pronta para campanha ou envio manual",
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
