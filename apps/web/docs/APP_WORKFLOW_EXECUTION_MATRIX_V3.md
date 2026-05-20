# APP Workflow Execution Matrix V3

Data: 2026-05-20

Fonte executiva:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `GLOBAL_WORKFLOW_RESTRUCTURE_STUDY_2026_05_20.md`

Status: FLOW-00A, FLOW-00 e FLOW-01 documentados com base no codigo real antes de alteracoes de UI.

## Codigo Auditado

Rotas:

- `src/App.tsx`

Navegacao e modo:

- `src/components/AppShell.tsx`
- `src/components/BottomNav.tsx`
- `src/components/management/ManagementShell.tsx`
- `src/lib/user-mode.tsx`
- `src/lib/user-mode-context.ts`
- `src/lib/role-visibility.ts`
- `src/lib/workspace-access.ts`

Gestao e permissoes:

- `src/lib/place-management.ts`
- `src/lib/place-admin-navigation.ts`
- `src/pages/ManagementHubPage.tsx`

Competition OS:

- `src/pages/EventsHubPage.tsx`
- `src/pages/EventsPage.tsx`
- `src/pages/LeaguesPage.tsx`
- `src/pages/TournamentPage.tsx`
- `src/pages/LeagueDetailsPage.tsx`
- `src/lib/tournaments.ts`
- `src/lib/types.ts`

## FLOW-00A - Route Persona Permission CTA Matrix

| Rota atual | Superficie futura | Persona principal | Permissoes | CTA primario | Estado vazio | Sem permissao | Risco principal | Alias/redirect | Arquivos provaveis | QA |
|---|---|---|---|---|---|---|---|---|---|---|
| `/inicio` | Player App / Inicio | jogador, aluno, socio, competitivo | autenticado | proxima acao pessoal | sem compromissos: sugerir reservar, jogar ou competir | nao aplicavel | misturar trabalho na primeira dobra | manter | `HomePage`, `AppShell`, `BottomNav` | jogador puro, multi-papel mobile/web |
| `/eventos` | Player App / Competir + entrada Competition Work | jogador competitivo, organizador | autenticado; organizer por dados | abrir competicao ou resolver bloqueio | sem eventos: descobrir ou criar se permitido | criar/organizar oculto se nao permitido | misturar descoberta com operacao | manter; `modo=organizing` para trabalho | `EventsHubPage`, nav | jogador e organizador |
| `/eventos/torneios` | Torneios | jogador/organizador | participante/owner/staff | abrir torneio ou criar | nenhum torneio: entrar por codigo/criar se permitido | criar oculto | view errada para trabalho | manter `view=...` | `EventsPage` | participating/organizing |
| `/eventos/ligas` | Ligas | jogador/owner | participante/owner | abrir liga ou criar | nenhuma liga: voltar ao hub/criar | criar oculto | owner sem cockpit | manter `view=...` | `LeaguesPage` | participating/organizing |
| `/eventos/ligas/:leagueId` | Liga jogador/owner | participante ou owner | owner libera configuracao | rodada atual | sem rodada: explicar proxima etapa | config oculta para nao owner | quebrar `configuracao` owner-only | manter tabs/query | `LeagueDetailsPage` | owner e jogador |
| `/eventos/:tournamentId/jogos` | Torneio / Partidas | participante, scorekeeper, owner | `canManageMatches` ou participante | abrir partida/lancar resultado | jogos nao gerados: explicar fase | controles ocultos | link publico quebrado | manter | `TournamentPage` | participant/scorekeeper |
| `/eventos/:tournamentId/classificacao` | Torneio / Classificacao | jogador, publico, staff | conforme torneio | ver chave/ranking | sem classificacao: aguardar jogos | admin oculto | estado vazio parecer bug | manter | `TournamentPage` | fase setup/live |
| `/eventos/:tournamentId/organizacao` | Torneio Operacional | owner/organizer | `canManageTournament` | resolver bloqueio da fase | setup incompleto | redirecionar para aba permitida | pagina longa com acoes raras | manter; futuro alias `/operacao` | `TournamentPage` | owner/organizer |
| `/eventos/:tournamentId/jogadores` | Inscricoes/Jogadores | checkin, owner, organizer | `canManagePlayers` | revisar inscrito | sem inscritos | redirecionar/ocultar | expor inscricao admin | manter | `TournamentPage` | checkin |
| `/eventos/:tournamentId/chat` | Chat/Comunicacao | participante, media, staff | `canManageComms` ou participante | enviar aviso/mensagem | sem mensagens | ocultar admin | media sem entrada clara | manter | `TournamentPage` | media/participant |
| `/inscricao/:tournamentId` | Inscricao publica | jogador | publico/autenticado | inscrever | inscricao indisponivel | login/estado claro | quebrar link externo | manter | `TournamentRegistrationPage` | anon/logado |
| `/join/:tournamentId` | Entrada por link | convidado/jogador | publico/autenticado | entrar | link invalido | login/estado claro | quebrar convite | manter | `JoinFromLinkPage` | link real |
| `/t/:tournamentId` | Link legado | publico | publico | abrir torneio | id invalido: eventos | nao aplicavel | quebrar link antigo | manter redirect | `LegacyRedirectPage` | legado |
| `/minhas-reservas` | Agenda jogador / Reservas | jogador/socio | autenticado | ver/cancelar reserva | nenhuma reserva: reservar quadra | nao aplicavel | sumir reserva dentro de Agenda | manter; futuro `/agenda?tipo=reservas` | `MyReservationsPage` | jogador/socio |
| `/minhas-partidas` | Agenda jogador / Partidas | competitivo | autenticado | abrir partida | sem partidas: competir | nao aplicavel | perder contexto da competicao | manter | `MyMatchesPage` | competitivo |
| `/minhas-aulas` | Agenda jogador / Aulas | aluno | autenticado/matricula | ver aula/reposicao | sem aulas vinculadas | nao aplicavel | confundir com professor workspace | manter | `MyLessonsPage` | aluno |
| `/meus-pagamentos` | Pagamentos pessoais | aluno/socio/jogador | autenticado | pagar/ver conta | nenhum pagamento pessoal | nao aplicavel | misturar financeiro do local | manter | `MyPaymentsPage` | aluno/socio |
| `/locais` | Player App / Jogar | jogador | autenticado | reservar/ver local | sem locais: ajustar busca | admin oculto se player | virar gestao inline | manter; futuro label `Jogar` | `PlacesPage` | jogador/admin |
| `/locais/:placeId` | Local publico | jogador/aluno | publico/autenticado | reservar/entrar aula | local sem oferta | admin CTA so se permitido | misturar admin | manter | `PlacePublicPage` | publico/admin |
| `/locais/:placeId/admin` | Admin legado | gestor/staff | place access | abrir gestao | sem acesso: estado claro | sem acesso | quebrar bookmark | manter wrapper | `PlaceAdminPage` | admin legado |
| `/perfil` | Perfil | todos | autenticado | editar conta | perfil incompleto | nao aplicavel | virar segunda home | manter | `ProfilePage` | todos |
| `/ranking` | Player App / Ranking | competitivo | autenticado | ver ranking | sem ranking | nao aplicavel | sumir do competir | manter | `RankingPage` | competitivo |
| `/gestao` | Management OS / Trabalho Hoje | staff/gestor/organizador | workspace access | resolver pendencia | sem pendencias: abrir workspaces | sem workspace: explicar | lista infinita | manter | `ManagementHubPage` | todos papeis |
| `/gestao/:placeId` | Local Hoje | gestor/staff | place access | abrir rotina | setup/sem dados | sem acesso | excesso de modulos | manter | `PlaceAdminPage` | staff |
| `/gestao/:placeId/:module` | Workspace local | staff por modulo | `placeManagementModules` | acao do modulo | estado orientado | modulo proibido | quebrar subvisoes/bookmarks | manter segmentos/query | `PlaceAdminPage`, hooks | modulo/role |

## FLOW-00 - Page Responsibility Contracts

| Pagina | Usuario primario | Pergunta | Primeira dobra | CTA primario | Nunca aparece | Vai para outra pagina | Mobile | Desktop | Permissoes |
|---|---|---|---|---|---|---|---|---|---|
| Inicio | jogador | O que faco agora? | proxima acao pessoal | CTA contextual | gestao detalhada | trabalho, ajustes | card unico + atalhos | hero + blocos | autenticado |
| Jogar/Locais | jogador | Onde jogo/reservo? | busca e ofertas proximas | reservar/encontrar | financeiro local | detalhe local | filtros em sheet | filtros laterais/cards | autenticado |
| Competir/Eventos | competitivo | Onde compito ou acompanho? | jogando/descobrir | abrir evento | admin por padrao | hub trabalho | intents simples | colunas por estado | participante/staff |
| Agenda jogador | jogador/aluno/socio | O que tenho marcado ou a pagar? | proximos por data | abrir item | recebiveis do local | detalhes por tipo | lista compacta | agenda + resumo | autenticado |
| Perfil | todos | Quem sou no app? | identidade/status | editar | rotina diaria | agenda/trabalho | secoes curtas | cards | autenticado |
| Trabalho Hoje | staff/gestor | O que precisa de acao? | fila por papel | resolver bloqueio | descoberta publica | workspaces | cards priorizados | painel + rows | workspace access |
| Agenda local | recepcao/gestor | O que acontece nas quadras? | reservas/espera hoje | nova reserva | setup raro | ajustes/recursos | hoje primeiro | calendario/tabela | bookings |
| Aulas | professor/gestor | Quais aulas precisam de acao? | aulas hoje | abrir aula/chamada | financeiro geral | financeiro/ajustes | cards aula | lista + detalhe | academy |
| Clientes | recepcao/gestor | Quem precisa de atendimento? | contatos/pendencias | abrir cliente | estoque | financeiro quando cobranca | busca + rows | tabela/cards | clients |
| Financeiro | financeiro/gestor | Quem paga e o que entrou? | vencidos/hoje | cobrar/marcar pago | chamada/cantina | detalhe cliente | lista acionavel | tabela + resumo | finance |
| Cantina | caixa/gestor | Como vender rapido? | PDV | finalizar venda | recebiveis amplos | resumo financeiro | venda first | PDV + estoque | canteen |
| Equipe | gestor | Quem opera? | membros/convites | convidar | rotina diaria | trabalho hoje | lista | tabela | manager/owner |
| Ajustes | gestor | Como configurar? | categorias de setup | abrir categoria | tarefas diarias | workspaces | categorias | grupos | manager/owner |
| Torneio jogador | participante | Qual minha situacao? | status pessoal | abrir jogo/inscrever | admin | operacional | resumo + tabs | tabs + painel | participant/viewer |
| Torneio organizador | staff | Qual bloqueio da fase? | cockpit | resolver bloqueio | conteudo publico como foco | config/publicacao | fila | cockpit + areas | tournament caps |
| Liga jogador | participante | Qual minha rodada? | rodada atual | abrir partida | configuracao | owner | tabs simples | tabs + tabela | participant |
| Liga owner | owner | O que falta na temporada? | pendencias | gerar/validar rodada | descoberta | relatorio/config | fila | cockpit | owner |

## FLOW-01 - Route Alias And Migration Safety

| Area | Decisao | Implementacao segura |
|---|---|---|
| Player nav `Agenda` | usar label novo sem quebrar paginas antigas | nav aponta inicialmente para `/minhas-reservas` e marca tambem `/minhas-aulas`, `/minhas-partidas`, `/meus-pagamentos` como agenda |
| Player nav `Jogar` | label novo para `/locais` | manter rota `/locais` |
| Player nav `Competir` | label novo para `/eventos` | manter `/eventos`, `/eventos/torneios`, `/eventos/ligas` |
| Work competition hub | usar `modo=organizing` no hub | manter `/eventos?modo=organizing` e listas com `view=organizing` |
| Torneio operacional | futuro alias `/operacao` ainda nao implementado | manter `/organizacao` ate cockpit estar pronto |
| Liga owner | preservar `configuracao` owner-only | nao criar alias antes do contrato de liga |
| Admin legado | preservar `/locais/:placeId/admin` | manter wrapper atual |
| Links publicos | preservar `/join`, `/inscricao`, `/t` | nenhum nav deve substituir estes fluxos |

## FLOW-02 - Navigation V3 Scope For This Sprint

Implementacao permitida nesta rodada:

- renomear e reorganizar `BottomNav` sem mexer em backend;
- preservar seletor `Jogador / Trabalho`;
- ampliar `workspace-access` apenas para conhecer papel dominante de trabalho;
- usar rotas existentes e helpers de path;
- nao criar pagina grande nova;
- nao remover grupos de seguranca ja existentes.

Player App:

```text
Inicio | Jogar | Competir | Agenda | Perfil
```

Management OS:

- coach: `Hoje | Aulas | Turmas | Alunos | Perfil`;
- frontdesk: `Hoje | Reservas | Clientes | Aulas | Mais`;
- finance: `Receber | Pagos | Despesas | Resumo | Perfil`;
- cashier: `Vender | Hoje | Estoque | Produtos | Perfil`;
- organizer sem local: `Hoje | Torneios | Ligas | Publicacao | Perfil`;
- gestor/manager: `Hoje | Agenda | Aulas | Financeiro | Mais`.

Fallback seguro:

- se nao houver `primaryPlaceId`, usar `/gestao`;
- se o usuario tiver multiplos papeis conflitantes sem gestor, usar menu generico de trabalho para evitar exibir modulo proibido.

## QA Required After FLOW-02

Viewports:

- mobile 390px;
- mobile 430px;
- desktop 1366px;
- desktop amplo.

Casos:

- jogador puro nao ve gestao no modo jogador;
- usuario profissional ve seletor `Jogador / Trabalho`;
- modo jogador mostra `Inicio`, `Jogar`, `Competir`, `Agenda`, `Perfil`;
- professor em modo trabalho nao recebe `Financeiro`, `Cantina`, `Equipe` ou `Ajustes`;
- financeiro em modo trabalho recebe `Receber`, `Pagos`, `Despesas`, `Resumo`, `Perfil`;
- caixa em modo trabalho recebe `Vender`, `Hoje`, `Estoque`, `Produtos`, `Perfil`;
- organizador sem local recebe entradas de torneios/ligas de organizacao;
- links `/join`, `/inscricao`, `/t`, `/locais/:id/admin` continuam roteando.

## Validation Notes - 2026-05-20

Executado:

- `npm.cmd run build` passou com sucesso apos FLOW-02.
- tentativa de auditoria visual com `scripts/capture-visual-audit.mjs` identificou erro real de React por keys duplicadas no `BottomNav` quando dois itens usavam `/gestao`; corrigido usando chave composta por grupo, label e path.

Bloqueios de ambiente:

- captura completa `workflow-v3-nav-2026-05-20` falhou por `ENOSPC` durante escrita de PNG;
- captura smoke `workflow-v3-nav-smoke-2026-05-20` travou por timeout de login/rede;
- artefatos parciais desta rodada e perfis temporarios `atp-visual-audit-*` foram removidos para recuperar espaco.

Instrucoes para recaptura quando o ambiente estiver estavel:

```powershell
$env:ATP_AUDIT_OUT_DIR='docs/screenshots/workflow-v3-nav-2026-05-20'
$env:ATP_AUDIT_ROUTES_JSON='[{"slug":"home","hash":"#/inicio"},{"slug":"play-places","hash":"#/locais"},{"slug":"compete-hub","hash":"#/eventos"},{"slug":"agenda-reservas","hash":"#/minhas-reservas"},{"slug":"work-home","hash":"#/gestao"},{"slug":"work-competitions","hash":"#/eventos?modo=organizing"},{"slug":"work-tournaments","hash":"#/eventos/torneios?view=organizing"}]'
$env:ATP_AUDIT_VIEWPORTS='desktop,mobile'
$env:ATP_AUDIT_MAX_HEIGHT='2600'
node scripts/capture-visual-audit.mjs
```

Cobertura ainda pendente:

- screenshots reais em 430px, 1366px e desktop amplo;
- QA por persona com contas especificas de professor, recepcao, financeiro, caixa, organizador e jogador puro;
- cliques seguros no bottom nav para confirmar destino por papel.
