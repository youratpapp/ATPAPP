# COMP-OPS-02 Report - Operacao de liga em rodada atual

Data: 2026-05-15

## Objetivo

Transformar a tela interna de liga em uma operacao por rodada atual, sem continuar dependendo de contadores agregados que obrigam o organizador a procurar onde agir.

## Entregue

- Owner ve uma fila operacional de liga em rows logo apos o contexto de temporada/classe.
- Rows cobrem inscricao pendente, pagamento de inscricao, partida a organizar, resultado/WO, confirmacao, disputa/analise administrativa e geracao da proxima rodada.
- Cada row tem contexto, impacto, acao primaria e drawer curto de detalhe.
- O jogador participante ve uma fila `Minha rodada` quando tem partida pendente, sem receber cockpit de organizador.
- A primeira dobra pode mostrar apenas as primeiras tarefas, mas informa isso explicitamente e oferece entrada para lista completa.
- A sala da partida segue como destino central para disponibilidade, resultado, WO, confirmacao e mensagens.

## Impacto de UX

- A liga passa a responder `o que preciso resolver agora?` antes de mostrar ranking, configuracao e historico.
- O organizador deixa de interpretar KPIs soltos e passa a atuar em rows.
- Jogador comum recebe somente tarefas proprias de rodada.
- O comportamento mobile herda o drawer/bottom sheet operacional ja usado em torneios.

## Impacto de produto

- Liga fica alinhada ao padrao Competition OS v2: publico leve, setup guiado, operacao em filas.
- Funcoes existentes foram preservadas e reposicionadas por tarefa.
- Nao houve criacao de backend novo neste sprint.

## Backend e persistencia

Acoes reaproveitadas:

- `setLeagueRegistrationStatus`
- `markStubPaymentPaidForParticipant`
- `generateNextLeagueRound`
- `openMatchRoom` com sala de partida existente
- `submitLeagueMatchResult`
- `confirmLeagueMatchResult`
- `adminResolveLeagueMatchResult`
- `sendMatchMessage`

## Arquivos alterados

- `web/src/pages/LeagueDetailsPage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/COMPETITION_OS_V2_UX_PLAN.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`

## Validacao

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git -C web diff --check`

## Riscos restantes

- Agendamento granular de horario/quadra da partida ainda depende do fluxo atual da sala/lista de partidas.
- Pagamento de inscricao de liga continua manual/stub.
- A fila usa dados carregados da pagina; disponibilidade/submissoes ficam mais precisas depois que a sala da partida e aberta.

