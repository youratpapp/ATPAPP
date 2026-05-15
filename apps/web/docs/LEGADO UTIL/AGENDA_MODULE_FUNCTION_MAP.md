# Agenda Module Function Map

Status: levantamento funcional baseado nos prints locais de 2026-05-14 e no codigo atual.
Escopo: `Gestao > Agenda` do local `Arena Pantanal Tennis`, usuario `escalao@gmail.com`.
Objetivo: mapear funcoes, inputs, acoes, logica basica e pontos de evolucao das telas `Hoje`, `Reservas`, `Calendario`, `Nova reserva`, `Espera` e `Quadras`.

## 1. Screenshots capturados

Pasta: `web/docs/screenshots/agenda-2026-05-14`

- `agenda-hoje.png`
- `agenda-reservas.png`
- `agenda-calendario.png`
- `agenda-nova-reserva.png`
- `agenda-espera.png`
- `agenda-quadras.png`

Arquivos auxiliares:
- `agenda-hoje.txt`
- `agenda-reservas.txt`
- `agenda-calendario.txt`
- `agenda-nova-reserva.txt`
- `agenda-espera.txt`
- `agenda-quadras.txt`

Observacao tecnica:
- Durante a captura apareceram erros `500` no console em chamadas Supabase/RPC, mas as telas renderizaram apos carregamento.

## 2. Contexto comum da tela

### Management OS header

Funcao: confirmar que a Agenda esta dentro do contexto operacional do local, separada da pagina publica e da descoberta do jogador.

Elementos:
- Eyebrow: `Management OS`.
- Nome do local.
- Texto contextual: workspace operacional; pagina publica e descoberta ficam fora.
- Acoes:
  - `Voltar para central`
  - `Ver pagina publica`

Inputs:
- Nenhum.

Logica basica:
- Renderiza na rota de gestao.
- Nao deveria conter busca publica de locais ou cards de descoberta.

### Shell do local

Funcao: mostrar local, plano, implantacao, pendencias e modulos liberados.

Elementos:
- `ADMIN | PRO: COMPLETO`.
- Nome e cidade/UF.
- Indicadores:
  - pendencias;
  - implantacao.
- Modulos:
  - `Painel`
  - `Agenda`
  - `Academia`
  - `Clientes`
  - `Financeiro`
  - `Cantina`
  - `Equipe`
  - `Ajustes`

Logica basica:
- Modulos sao controlados por `placeResourceAccess`, plano e papel.
- `canManageBookings` libera confirmacao, cancelamento, bloqueio, regras e lista de espera.
- `canManageFinance` libera precos e pagamentos.

### Resumo do modulo Agenda

Funcao: mostrar saude operacional de reservas antes das subvisoes.

Elementos:
- Modulo ativo: `Agenda`.
- Descricao: reservas, bloqueios, calendario das quadras e lista de espera.
- Indicador: `23 itens para acompanhar`.
- Chips de contexto: `Reservas`, `Academia`, `Socios`, `CRM`, `Financeiro`.
- Status: `Base operacional pronta`.
- KPIs:
  - `Reservas hoje`
  - `Pendentes`
  - `Na espera`
  - `Ocupacao do dia`

Logica basica:
- `Reservas hoje`: reservas do dia atual, exceto canceladas.
- `Pendentes`: reservas com `status === "pending"`.
- `Na espera`: waitlist com `status === "waiting"`.
- `Ocupacao do dia`: minutos reservados / capacidade estimada do dia.

Ponto de atencao:
- Antes da `Central de agenda`, a tela mostra filas operacionais de reservas pendentes e lista de espera. Isso e util no painel, mas pode duplicar as abas `Reservas` e `Espera`.

## 3. Navegacao interna da Central de agenda

Componente: `BookingWorkspaceShell`.

Abas:
- `Hoje` -> `today`
- `Reservas` -> `reservations`
- `Calendario` -> `calendar`
- `Nova reserva` -> `new`
- `Espera` -> `waitlist`
- `Quadras` -> `resources`

Descricoes:
- `Hoje`: agenda do dia, pendencias e proximos horarios.
- `Reservas`: reservas recentes, confirmacao, pagamento e cancelamento.
- `Calendario`: mapa diario por quadra, ocupacao e bloqueios.
- `Nova reserva`: busca de disponibilidade, reserva, bloqueio e lista de espera.
- `Espera`: jogadores esperando horario e acoes de conversao.
- `Quadras`: quadras, precos e configuracoes operacionais.

Logica basica:
- Estado vem de `bookingViewByPlace[p.id]`.
- A troca chama `selectBookingView(p.id, view)` e atualiza a query `visao`.
- Em mobile, `Calendario` nao deve esconder quadras: quando ha mais de uma quadra visivel, a tela usa seletor de quadra e renderiza uma quadra por vez, mantendo slots acionaveis e evitando quatro colunas ilegives.
- Em `Nova reserva`, o resultado de `Buscar` e feedback contextual do formulario. Nao deve acionar banner global persistente para caso normal de indisponibilidade.

## 4. Fila operacional superior da Agenda

Componente: `PlaceBookingOperationalQueues`.

Funcao: mostrar pendencias urgentes independente da aba ativa.

### Reservas aguardando confirmacao

Conteudo:
- Quadra.
- Nome do jogador.
- Data/hora.

Acoes:
- `Confirmar`
  - chama `updateCourtBookingStatus(bookingId, "confirmed")`.
- `Cancelar`
  - chama `updateCourtBookingStatus(bookingId, "cancelled")`.

Logica basica:
- Mostra ate 6 reservas pendentes.
- So aparece para `canManageBookings`.

### Lista de espera

Conteudo:
- Nome do jogador.
- Quadra.
- Data/hora.
- Tempo na espera.
- Status operacional:
  - `horario livre`;
  - `aguardando vaga`.

Acoes:
- `Criar reserva`
  - chama `promoteCourtBookingWaitlist`.
  - fica desabilitado se o horario nao esta livre.
- `Convidar`
  - chama `updateCourtBookingWaitlistStatus(entryId, "invited")`.
- `Remover`
  - chama `updateCourtBookingWaitlistStatus(entryId, "cancelled")`.

Logica basica:
- Mostra ate 6 entradas.
- Usa `waitlistEntryIsPromotable(entry, bookings)` para checar conflito com reservas existentes.

Ponto de evolucao:
- Esta fila duplica parte da aba `Espera`, mas pode ser justificada como fila urgente. Precisa ficar visualmente menor e claramente "atalho de pendencias".

## 5. Aba Hoje

Componente: `PlaceBookingTodayModule`.

Funcao: mostrar a agenda operacional do dia em formato compacto.

Conteudo no print:
- Cards por reserva do dia:
  - horario inicial;
  - quadra;
  - jogador;
  - status;
  - horario final;
  - status de pagamento;
  - serie recorrente, se existir.

Exemplos:
- `03:00 - Quadra 2`, Felipe Barbosa, Confirmada, termina 04:00, sem pagamento.
- `03:30 - Quadra 3`, Camila Uchida, Pendente, termina 04:30, sem pagamento.
- `08:00 - Quadra 2`, Quiteria Silva, Pendente, termina 09:00, sem pagamento.

Inputs:
- Nenhum input direto.

Acoes:
- Nenhuma acao direta nos cards atuais.

Logica basica:
- Recebe `todayBookings`.
- Mostra ate 8 reservas do dia.
- Status:
  - `blocked` -> Bloqueio.
  - `confirmed` -> Confirmada.
  - `pending` -> Pendente.
  - outros -> Cancelada.
- Pagamento:
  - payment `paid` -> Pago.
  - payment `pending` -> Pagamento pendente.
  - sem payment -> Sem pagamento.

Pontos de evolucao:
- Hoje deveria ser operacional: clicar na reserva deveria abrir detalhe, confirmar/cancelar/cobrar.
- Do jeito atual, a aba e mais resumo do que ferramenta de trabalho.

## 6. Aba Reservas

Componente: `PlaceBookingReservationsModule`.

Funcao: listar reservas recentes para confirmacao, cancelamento/liberacao.

Conteudo:
- Ate 10 reservas.
- Cada linha mostra:
  - quadra;
  - jogador;
  - data/hora;
  - status.

Status:
- `blocked` -> Bloqueio.
- `confirmed` -> Confirmada.
- `pending` -> Pendente.
- outros -> Cancelada.

Acoes:
- `Confirmar`
  - aparece para reserva pendente.
  - chama `updateCourtBookingStatus(bookingId, "confirmed")`.
- `Cancelar`
  - aparece para reservas nao canceladas.
  - chama `updateCourtBookingStatus(bookingId, "cancelled")`.
- `Liberar`
  - texto usado quando o item e bloqueio.
  - tambem chama `updateCourtBookingStatus(bookingId, "cancelled")`.

Inputs:
- Nenhum filtro visivel nesta aba.

Pontos de evolucao:
- Falta filtro por status, quadra, data e jogador.
- Pagamento nao aparece aqui de forma completa; parte disso esta no componente legado `PlaceBookingDetailedListModule`, que nao aparece quando o workspace novo esta ativo.

## 7. Aba Calendario

Componente: `PlaceBookingCalendarModule`.

Funcao: mapa diario unificado por quadra, com reservas, bloqueios, turmas fixas e aulas avulsas.

### Inputs e filtros

Inputs:
- Data.
- Tipo:
  - Tudo.
  - Reservas.
  - Bloqueios.
  - Turmas.
  - Aulas avulsas.
- Quadra:
  - Todas as quadras.
  - Quadra especifica.
- Professor:
  - Todos os professores.
  - Professor especifico.
- Turma:
  - Todas as turmas.
  - Turma especifica.
- Aluno ou jogador:
  - busca textual.

### Grade

Estrutura:
- Colunas por quadra.
- Trilho de horarios de 06:00 a 23:00 em intervalos de 30 minutos.
- Cada slot e clicavel/expansivel via `details`.

Estados do slot:
- `Livre`.
- `1 ocupacao` ou mais.

Ao expandir slot ocupado:
- mostra evento com:
  - inicio/fim;
  - titulo;
  - status;
  - detalhe;
  - metadata;
  - participantes.

### Tipos de evento

1. Reserva
   - Origem: `court_bookings`.
   - Tipo visual: `reservation`.
   - Titulo: jogador.
   - Status: Confirmada/Pendente/Cancelada.
   - Meta: quadra, telefone, serie recorrente.

2. Bloqueio
   - Origem: `court_bookings` com status `blocked`.
   - Tipo visual: `block`.
   - Titulo: Bloqueio operacional.

3. Turma fixa
   - Origem: `place_academy_classes`.
   - Filtra por dia da semana da data selecionada.
   - Mostra:
     - turma;
     - professor;
     - nivel;
     - alunos ativos;
     - alunos que desmarcaram.

4. Aula avulsa/reposicao
   - Origem: `place_academy_lesson_requests`.
   - Condicao: `status === "approved"` e data igual ao dia selecionado.
   - Usa a turma para descobrir quadra, horario e professor.
   - Mostra pagamento pendente/pago/cortesia.

### Metricas inferiores

Mostra, para gestor:
- Itens no filtro.
- Reservas no dia.
- Horas reservadas.
- Horas bloqueadas.
- Ocupacao estimada.

Logica basica:
- `agendaItems` combina reservas, turmas e requests.
- Filtros sao aplicados em memoria.
- O slot considera evento ocupando o horario se `startsAt <= slot < endsAt`.
- Capacidade diaria estimada: `activeCourts.length * 14 * 60`.

Pontos de evolucao:
- A grade e poderosa, mas muito densa.
- Falta acao direta no slot livre: criar reserva/bloqueio/turma.
- Falta acao direta no slot ocupado: abrir reserva/turma/aluno.
- Texto de `details` pode ficar pesado em mobile.

## 8. Aba Nova reserva

Componente: `PlaceBookingCreateModule`.

Funcao: buscar disponibilidade real, criar reserva, bloquear horario ou entrar na espera.

### Inputs principais

- Quadra.
- Data.
- Horario.
- Duracao:
  - 30 min.
  - 1h.
  - 1h30.
  - 2h.

Logica dos inputs:
- O usuario escolhe data/hora/duracao.
- O componente monta `startsAt` e `endsAt`.
- Horarios disponiveis sao fixos de 06:00 a 23:00 em intervalos de 30 minutos.
- Duracao e recalculada a partir de `startsAt` e `endsAt`.

### Busca de disponibilidade

Acao:
- `Buscar`
  - chama `searchAvailableCourts`.

Logica:
- Envia:
  - placeId;
  - startsAt;
  - endsAt.
- RPC: `app_search_available_courts`.
- Se houver resultado:
  - salva em `availableCourtsByPlace`;
  - seleciona automaticamente a primeira quadra livre.
- Feedback:
  - sucesso com numero de quadras livres;
  - info quando nao ha quadra livre.

### Resultado de quadras livres

Conteudo:
- Lista de botoes com:
  - nome da quadra;
  - preco efetivo;
  - indicador de mensalista;
  - regra aplicada;
  - aprovar/auto.

Acao:
- Clicar na quadra livre muda `draft.courtId`.

### Criar reserva

Acao:
- `Reservar`
  - fica habilitado so depois da busca se a quadra selecionada esta em `availableCourts`.

Logica:
- Se `repeatWeeks > 1`, chama `createRecurringCourtBookings`.
- Caso contrario, chama `createCourtBooking`.
- Dados enviados:
  - placeId;
  - courtId;
  - startsAt;
  - endsAt;
  - playerName do profile/email;
  - phone do profile;
  - notes.
- Ao concluir:
  - limpa data/hora;
  - preserva quadra e repeticao;
  - atualiza recursos.

### Opcoes avancadas

Inputs:
- Observacao.
- Repetir por semanas:
  - minimo 1;
  - maximo 26.

Acoes:
- `Bloquear horario`
  - aparece para `canManageBookings`.
  - chama `createCourtBlock`.
  - cria uma reserva com status operacional de bloqueio.
- `Entrar na espera`
  - habilita quando ha campos obrigatorios e nao ha quadra livre.
  - chama `joinCourtBookingWaitlist`.

Pontos de evolucao:
- A aba usa busca por uma quadra selecionada, mas retorna todas as quadras livres. Isso e correto, porem o label inicial ainda pode induzir o usuario a achar que esta buscando so uma quadra.
- Deveria destacar mais os boxes das quadras livres e permitir reservar diretamente no card.
- `Bloquear horario` e `Entrar na espera` ficam escondidos em `Opcoes avancadas`.

## 9. Aba Espera

Componente: `PlaceBookingWaitlistModule`.

Funcao: converter lista de espera em reserva ou convite, e remover entradas.

Conteudo:
- Ate 10 entradas.
- Cada linha mostra:
  - jogador;
  - quadra;
  - data/hora;
  - status;
  - promotabilidade;
  - tempo na espera;
  - telefone;
  - observacao.

Status visual:
- `Horario livre para promover`.
- `Aguardando vaga`.

Acoes:
- `Criar reserva`
  - aparece para waiting/invited.
  - so habilita se `isPromotable`.
  - chama `promoteCourtBookingWaitlist`.
- `Convidar`
  - aparece para `waiting`.
  - chama `updateCourtBookingWaitlistStatus(entryId, "invited")`.
- `Remover`
  - aparece se nao esta cancelado/booked.
  - chama `updateCourtBookingWaitlistStatus(entryId, "cancelled")`.

Logica basica:
- Promotavel = nao existe reserva conflitante no mesmo horario/quadra.
- Ao promover, cria uma reserva a partir da entrada de espera via RPC.

Pontos de evolucao:
- Poderia ter filtro por data/quadra/status.
- A acao `Convidar` muda status, mas nao deixa claro se envia mensagem ou apenas marca internamente.

## 10. Aba Quadras

Componente: `PlaceBookingResourcesModule`.

Funcao: cadastrar quadras, editar precos e configurar regras de reserva por perfil/horario.

### Cadastro de quadra

Inputs:
- `Nova quadra`

Acao:
- `Adicionar`
  - chama `createPlaceCourt`.
  - insere em `place_courts`.

Validacao:
- exige nome.

### Lista de quadras e precos

Conteudo:
- Quadra.
- Preco publico.
- Preco mensalista, se definido.
- Valor efetivo do usuario, se ele for socio/mensalista.

Inputs por quadra:
- `Publico R$`.
- `Mensalista R$`.

Acoes:
- `Salvar`
  - chama `updatePlaceCourtPricing`.

Permissao:
- Inputs de preco dependem de `canManageFinance`.

### Regras por perfil e horario

Funcao: definir preco, duracao, janela de horario, antecedencia e aprovacao por tipo de usuario.

Inputs:
- Nome.
- Publico/perfil:
  - Todos.
  - Avulso.
  - Socio.
- Dias da semana:
  - Dom, Seg, Ter, Qua, Qui, Sex, Sab.
- Inicio.
- Fim.
- Avulso R$.
- Socio R$.
- Duracao minima:
  - 30 min.
  - 1h.
  - 1h30.
- Duracao maxima:
  - 1h.
  - 1h30.
  - 2h.
  - 3h.
- Antecedencia:
  - Mesmo dia.
  - 7 dias.
  - 14 dias.
  - 30 dias.
- Exigir aprovacao.

Acao:
- `Criar regra`
  - chama `createPlaceBookingRule`.
  - exige nome e ao menos um dia selecionado.

Logica:
- Dias selecionados sao serializados como string CSV no draft e convertidos para array numerico.
- Se nao houver weekdays, fallback no backend cria todos os dias.
- Precos vazios viram `null`, usando preco padrao da quadra.
- `requiresApproval` define se reserva precisa de confirmacao.

### Lista de regras

Conteudo:
- Nome.
- Perfil.
- Dias.
- Faixa de horario.
- Preco avulso.
- Preco socio.
- Duracao minima/maxima.
- Antecedencia.
- Aprovacao/auto.

Acoes:
- `Pausar`
  - chama `updatePlaceBookingRuleStatus(rule.id, false)`.
- `Ativar`
  - chama `updatePlaceBookingRuleStatus(rule.id, true)`.

Pontos de evolucao:
- A tela ja melhorou ao trocar dias numericos por checkboxes, mas ainda e densa.
- Regras deveriam ter presets claros:
  - horario comercial;
  - horario nobre;
  - fim de semana;
  - socio;
  - avulso.
- Criacao de regra ainda parece formulario tecnico.

## 11. Componente legado de lista detalhada

Componente: `PlaceBookingDetailedListModule`.

Funcao: lista reservas e espera em blocos legados quando o workspace novo nao esta ativo.

Funcoes:
- Confirmar/cancelar reserva.
- Marcar pagamento pendente como pago.
- Cancelar serie.
- Promover lista de espera.
- Convidar/remover espera.

Estado atual:
- Na rota Management OS atual, esse componente nao aparece quando `showBookingWorkspace` esta ativo.
- Continua importante para rotas/publicacoes antigas ou fallback.

Ponto de atencao:
- Parte de pagamento e cancelamento de serie existe melhor no legado do que na aba nova `Reservas`.

## 12. Regras de acesso

### Admin/manager/frontdesk

Pode:
- confirmar/cancelar reservas;
- criar reserva;
- bloquear horario;
- promover/convidar/remover lista de espera;
- cadastrar quadra;
- criar/pausar regras;
- editar precos se tambem tiver permissao financeira.

### Financeiro liberado

Pode:
- editar preco publico/mensalista das quadras;
- marcar pagamento de reserva como pago no componente legado.

### Professor

Tende a ter acesso mais limitado.
Agenda deveria priorizar suas aulas/turmas e quadras do dia, mas no codigo atual o filtro de professor esta mais forte no calendario do que na aba Hoje.

### Jogador/aluno

No Player App/publico:
- busca quadras disponiveis;
- solicita reserva;
- entra na espera.

Na gestao:
- nao deveria ser experiencia principal do jogador comum.

## 13. Principais inconsistencias atuais

1. Duplicacao de filas
   - A fila superior mostra reservas pendentes e espera.
   - As abas `Reservas` e `Espera` mostram o mesmo dominio.
   - Isso pode ser bom como resumo, mas precisa parecer atalho, nao conteudo duplicado.

2. Aba Hoje pouco acionavel
   - Mostra reservas do dia, mas nao permite confirmar, cancelar, cobrar ou abrir detalhe direto.

3. Aba Reservas sem filtros
   - Em uma academia real, 10 reservas recentes sem filtro nao resolve operacao.
   - Falta data, status, quadra, jogador, pagamento.

4. Calendario poderoso, mas pesado
   - Junta reservas, bloqueios, turmas e avulsas corretamente.
   - Ainda falta acao direta em slot livre e slot ocupado.
   - Em mobile, `details` por horario pode ficar cansativo.

5. Nova reserva ainda exige fluxo em duas etapas
   - Busca primeiro, depois seleciona quadra livre e reserva.
   - Esta correto tecnicamente, mas visualmente deveria entregar cards de quadras livres mais diretos.

6. Espera sem clareza de comunicacao
   - `Convidar` parece enviar convite, mas atualmente apenas muda status.
   - Precisa explicitar se notifica ou apenas marca.

7. Quadras/Regras ainda parecem configuracao tecnica
   - Melhor que antes, mas ainda exige entender perfil, regra, preco, janela e aprovacao.
   - Falta setup guiado/presets.

8. Pagamento de reserva nao esta igualmente presente nas abas novas
   - A acao `Marcar pago` existe no componente legado, mas nao na aba nova `Reservas`.

9. Limites silenciosos
   - Hoje: ate 8 reservas.
   - Reservas: ate 10.
   - Espera: ate 10.
   - Sem paginacao ou indicacao clara de que ha mais itens.

10. Erros 500 no console
   - A captura local exibiu varias respostas 500.
   - Precisa investigar RPCs/consultas acionadas pela tela para evitar carregamentos instaveis.

## 14. Direcao recomendada para evolucao

1. Transformar `Hoje` em agenda de trabalho.
   - Cada item deve abrir detalhes.
   - Acoes rapidas: confirmar, cobrar, cancelar, abrir WhatsApp, remarcar.

2. Melhorar `Reservas`.
   - Filtros essenciais: data, status, quadra, jogador, pagamento.
   - Mostrar pagamento e recorrencia.
   - Trazer `Marcar pago` e `Cancelar serie` para a aba nova.

3. Evoluir `Calendario`.
   - Slot livre deve permitir criar reserva/bloqueio.
   - Slot ocupado deve abrir detalhe contextual.
   - Filtros devem ser compactos em mobile.

4. Refinar `Nova reserva`.
   - Depois da busca, quadras livres devem aparecer como escolhas primarias com CTA `Reservar`.
   - Mostrar regra/preco/aprovacao de forma mais amigavel.
   - Manter lista de espera como alternativa clara quando nao ha disponibilidade.

5. Clarificar `Espera`.
   - Separar status `Aguardando`, `Convidado`, `Convertido`, `Cancelado`.
   - `Convidar` deve indicar se envia WhatsApp/notificacao ou so muda status.

6. Reorganizar `Quadras`.
   - Separar em duas areas:
     - quadras e precos;
     - regras de reserva.
   - Usar presets e linguagem operacional em vez de formulario tecnico.

7. Reduzir duplicacao visual.
   - Fila superior deve ser uma faixa compacta de pendencias.
   - Conteudo completo deve morar nas abas.
