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

- coach: `Hoje | Agenda | Turmas | Alunos | Perfil`;
- frontdesk: `Hoje | Reservas | Clientes | Aulas | Mais`;
- finance: `Receber | Pagos | Despesas | Resumo | Perfil`;
- cashier: `Vender | Hoje | Estoque | Produtos | Perfil`;
- organizer sem local: `Hoje | Torneios | Ligas | Publicacao | Perfil`;
- gestor/manager: `Hoje | Agenda | Aulas | Financeiro | Mais`.

Desktop Trabalho:

- grupo `Trabalho`: `Hoje`;
- grupo `Locais`: `Agenda`, `Aulas`, `Clientes`, `Financeiro`, `Cantina`, conforme `primaryPlaceModules`;
- grupo `Competicoes`: `Torneios`, `Ligas`, quando `hasCompetitionManagement`;
- grupo `Administracao`: `Equipe`, `Ajustes`, conforme `primaryPlaceModules`;
- `Relatorios` segue pendente porque nao existe rota/modulo seguro no roteador atual; nao foi exposto para evitar item sem destino real.

Fallback seguro:

- se nao houver `primaryPlaceId`, usar `/gestao`;
- se o usuario tiver multiplos papeis conflitantes sem gestor, usar menu generico de trabalho para evitar exibir modulo proibido.
- nao renderizar grupos vazios apos aplicar filtro de viewport e permissao.

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

- `BottomNav` agora separa itens mobile por papel dominante e itens desktop por grupos (`Trabalho`, `Locais`, `Competicoes`, `Administracao`) sem duplicar loaders ou mexer em backend.
- mobile de professor foi alinhado para `Hoje | Agenda | Turmas | Alunos | Perfil`.
- mobile deixou de usar grade fixa de 6 colunas; o grid se ajusta ao numero real de botoes.
- `Perfil` no modo Trabalho usa `/perfil?mode=work` para manter o seletor em Trabalho sem criar rota nova.
- itens de desktop so aparecem quando o modulo existe em `primaryPlaceModules`; grupos vazios nao sao renderizados.
- `Relatorios` nao foi exposto no desktop porque o codigo atual nao tem modulo/rota de relatorios equivalente.
- `npm.cmd run build` passou com sucesso apos FLOW-02.
- tentativa de auditoria visual com `scripts/capture-visual-audit.mjs` identificou erro real de React por keys duplicadas no `BottomNav` quando dois itens usavam `/gestao`; corrigido usando chave composta por grupo, label e path.

Bloqueios de ambiente:

- captura completa `workflow-v3-nav-2026-05-20` falhou por `ENOSPC` durante escrita de PNG;
- captura smoke `workflow-v3-nav-smoke-2026-05-20` travou por timeout de login/rede;
- artefatos parciais desta rodada e perfis temporarios `atp-visual-audit-*` foram removidos para recuperar espaco.

Validacao visual curta concluida depois da liberacao de espaco:

- `docs/screenshots/workflow-v3-nav-flow02-2026-05-20/`
  - `desktop-player-home.png`
  - `mobile-player-home.png`
  - `desktop-work-home.png`
  - `mobile-work-home.png`
  - `desktop-work-competitions.png`
  - `mobile-work-competitions.png`
  - `desktop-work-profile.png`
  - `mobile-work-profile.png`
- `docs/screenshots/workflow-v3-nav-flow02-viewports-2026-05-20/`
  - mobile 390px: `mobile390-player-home.png`, `mobile390-work-home.png`
  - mobile 430px: `mobile430-player-home.png`, `mobile430-work-home.png`
  - desktop 1366px: `desktop1366-player-home.png`, `desktop1366-work-home.png`
  - desktop amplo 1728px: `desktopwide-player-home.png`, `desktopwide-work-home.png`
- diagnostics sem eventos de console/rede nas rotas capturadas.

Instrucoes para recaptura ampliada:

```powershell
$env:ATP_AUDIT_OUT_DIR='docs/screenshots/workflow-v3-nav-2026-05-20'
$env:ATP_AUDIT_ROUTES_JSON='[{"slug":"home","hash":"#/inicio"},{"slug":"play-places","hash":"#/locais"},{"slug":"compete-hub","hash":"#/eventos"},{"slug":"agenda-reservas","hash":"#/minhas-reservas"},{"slug":"work-home","hash":"#/gestao"},{"slug":"work-competitions","hash":"#/eventos?modo=organizing"},{"slug":"work-tournaments","hash":"#/eventos/torneios?view=organizing"}]'
$env:ATP_AUDIT_VIEWPORTS='desktop,mobile'
$env:ATP_AUDIT_MAX_HEIGHT='2600'
node scripts/capture-visual-audit.mjs
```

Cobertura ainda pendente:

- QA por persona com contas especificas de professor, recepcao, financeiro, caixa, organizador e jogador puro;
- cliques seguros no bottom nav para confirmar destino por papel.
- screenshots de `/gestao` mobile mostram overflow horizontal no conteudo da pagina, fora do escopo direto do `BottomNav`; registrar para proximo sprint de layout do Management Hub.

## FLOW-03 - Trabalho Hoje Scope For This Sprint

Objetivo: transformar `/gestao` na superficie `Trabalho Hoje`, uma fila operacional por papel que responde "o que precisa ser resolvido agora?" antes de mostrar workspaces, locais ou modulos.

Implementacao permitida nesta rodada:

- reorganizar a primeira dobra de `ManagementHubPage`;
- usar apenas dados ja carregados por `fetchPlacesWorkspaceData`, `listOrganizingTournamentsForUser` e `listOrganizingLeaguesForUser`;
- derivar cards por papel dominante ja calculado no workspace profissional;
- manter rotas existentes por `buildPlaceAdminPath`, `/eventos?modo=organizing`, `/eventos/torneios?view=organizing` e `/eventos/ligas?view=organizing`;
- ocultar cards cujo modulo nao existe para o papel/local atual;
- explicar estados vazios dentro do proprio card quando a tarefa e permitida mas nao ha dados;
- manter convites, workspaces e rows de locais abaixo da fila do dia.

O que nao alterar:

- backend;
- loaders de dominio;
- policies/permissoes;
- regras de negocio;
- rotas publicas ou legadas;
- detalhes internos de cada modulo de local.

Comportamento por papel:

| Papel | Primeira dobra | CTAs principais | Modulos proibidos/fora da rotina |
|---|---|---|---|
| Professor | aulas de hoje, proxima chamada, reposicoes, turmas/alunos | Abrir aulas, Fazer chamada, Ver reposicoes, Abrir alunos | financeiro, cantina, equipe, ajustes |
| Recepcao | reservas de hoje, check-ins, lista de espera, atendimento, aulas pendentes | Abrir reservas, Ver check-ins, Chamar espera, Atender clientes, Ver aulas | ajustes estruturais, equipe, financeiro amplo |
| Financeiro | vencidos, recebiveis de hoje, pagamentos pendentes, despesas | Cobrar/marcar pago, Ver recebiveis, Revisar pagamentos, Ver despesas | chamada, cantina/PDV, agenda operacional como foco |
| Caixa | venda rapida, vendas do dia, estoque baixo, produtos | Vender agora, Ver hoje, Repor estoque, Produtos | recebiveis amplos, clientes, ajustes |
| Organizador | torneios/ligas, inscricoes, jogos sem resultado, publicacao | Resolver bloqueios, Revisar inscricoes, Abrir jogos, Publicar | gestao de local quando nao ha local |
| Gestor | pendencias criticas, reservas, aulas, financeiro, clientes, estoque, equipe | Resolver agora, Abrir agenda, Abrir aulas, Cobrar, Atender, Repor, Abrir equipe | setup raro como card primario |

Estados vazios definidos:

- professor sem aulas hoje: informar que aulas vinculadas aparecem com horario, turma e alunos;
- professor sem turma vinculada: orientar vinculo pelo gestor;
- recepcao sem reservas/check-ins/espera: indicar agenda livre/lista limpa;
- financeiro sem pendencias: informar cobrancas em dia, sem misturar financeiro pessoal;
- caixa sem produtos: orientar criacao de produtos antes de operar o caixa;
- organizador sem competicoes: explicar que torneios e ligas organizados aparecerao ali;
- gestor sem pendencias: manter acesso a workspaces sem criar dashboard numerico vazio.

Estados sem permissao:

- cards dependentes de modulo usam `placeManagementModules` antes de renderizar destino;
- quando o modulo nao existe para o papel, o card e ocultado na maior parte dos papeis;
- professor pode ver card orientativo desabilitado quando nao ha vinculo operacional suficiente;
- usuario sem workspace profissional continua recebendo estado neutro de acesso profissional indisponivel.

## QA Required After FLOW-03

Viewports:

- mobile 390px;
- mobile 430px;
- desktop 1366px;
- desktop amplo.

Casos por persona:

- professor: `/gestao` deve abrir `Trabalho Hoje` com aulas/chamada/reposicoes/turmas e sem financeiro/cantina/equipe/ajustes;
- recepcao: deve ver reservas/check-ins/espera/clientes/aulas e nao setup estrutural;
- financeiro: deve ver cobrancas/recebiveis/pagamentos/despesas e nao aula/cantina como tarefa principal;
- caixa: deve ver PDV/vendas/estoque/produtos e nao recebiveis amplos;
- organizador sem local: deve ver competicoes, inscricoes, jogos e publicacao por rotas de Competition OS;
- gestor: deve ver pendencias consolidadas por area e cards com CTA claro;
- jogador puro: ao acessar `/gestao` manualmente deve cair no estado sem area profissional, sem vazamento de ferramentas administrativas.

## Validation Notes - FLOW-03 - 2026-05-20

Executado:

- `ManagementHubPage` agora calcula `workTodayPersona` para professor, recepcao, financeiro, caixa, organizador e gestor.
- a primeira dobra de `/gestao` foi renomeada para `Trabalho Hoje` e deixou de ser uma lista generica de modulos.
- a antiga fila agregada de pendencias foi substituida por cards acionaveis por papel, com CTA, valor, texto orientativo e destino real.
- os cards usam apenas dados ja carregados; nenhum loader novo foi criado.
- os destinos preservam rotas existentes via `buildPlaceAdminPath` e rotas atuais de competicoes em modo organizacao.
- CSS criou `management-today-panel`, `management-today-grid` e `management-today-card` seguindo premium dark.
- mobile recebeu grade de uma coluna para a fila do dia e correcao de overflow horizontal no hub de gestao.
- `npm.cmd run build` passou com sucesso apos a implementacao.
- screenshots de `/gestao` foram capturados em `docs/screenshots/workflow-v3-flow03-work-today-2026-05-20/`:
  - `mobile390-work-today.png`;
  - `mobile430-work-today.png`;
  - `desktop1366-work-today.png`;
  - `desktopwide-work-today.png`.
- `diagnostics-summary.json` ficou sem eventos de console/rede nos quatro viewports capturados.

Cobertura ainda pendente:

- QA com contas reais isoladas de professor, recepcao, financeiro, caixa, organizador sem local, gestor e jogador puro;
- validacao de clique em cada CTA com massa real variada.

## FLOW-06 - Agenda Do Jogador Scope For This Sprint

Objetivo: consolidar a experiencia pessoal do jogador/aluno/socio/competitivo em uma superficie `Agenda`, sem quebrar as rotas antigas nem misturar financeiro pessoal com financeiro do local.

Implementacao permitida nesta rodada:

- criar `/agenda` como destino principal de agenda pessoal;
- preservar `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas` e `/meus-pagamentos` como entradas filtradas da agenda;
- reutilizar loaders existentes de reservas, lista de espera, aulas, pagamentos, torneios e ligas;
- abrir detalhes dentro da agenda: sheet no mobile e painel lateral no desktop;
- manter CTAs para o detalhe original quando existir rota antiga ou sala de partida;
- atualizar navegacao de jogador e atalhos da Home para apontarem para `/agenda`;
- manter as paginas antigas no repositorio, sem remove-las.

O que nao alterar:

- backend;
- RLS/policies/permissoes;
- tabelas ou RPCs;
- logica de gestao financeira de local;
- rotas publicas de torneio/liga;
- paginas antigas alem do roteamento como entrada filtrada.

Estrutura alvo:

| Superficie | Rota | Conteudo | Estado principal |
|---|---|---|---|
| Agenda completa | `/agenda` | reservas, partidas, aulas, pagamentos pessoais e historico | proximos compromissos primeiro |
| Reservas | `/minhas-reservas` | alias filtrado para reservas/lista de espera | sem reservas ativas |
| Partidas | `/minhas-partidas` | alias filtrado para torneios/ligas pessoais | partida pendente de resultado |
| Aulas | `/minhas-aulas` | alias filtrado para turmas/aulas pessoais | sem aulas vinculadas |
| Pagamentos | `/meus-pagamentos` | alias filtrado para pagamentos pessoais | sem pagamentos pessoais / pagamento vencido |

Estados obrigatorios definidos:

- sem compromissos futuros: orienta reservar quadra, entrar em aula ou competir;
- sem aulas vinculadas: explica que turmas aprovadas aparecem com professor, horario e quadra;
- sem reservas ativas: orienta reservar quadra ou entrar em lista de espera;
- sem pagamentos pessoais: explica que mensalidades, pacotes, reservas e inscricoes vinculadas aparecerao ali;
- pagamento vencido: pagamento pessoal pendente/failed recebe destaque danger;
- reserva passada: entra em Historico com label `Reserva passada`;
- partida pendente de resultado: torneio/liga sem resultado aparece com destaque danger.

Rotas preservadas:

- `/agenda` nova rota principal;
- `/minhas-reservas` preservada como agenda filtrada por reservas;
- `/minhas-partidas` preservada como agenda filtrada por partidas;
- `/minhas-aulas` preservada como agenda filtrada por aulas;
- `/meus-pagamentos` preservada como agenda filtrada por pagamentos.

## QA Required After FLOW-06

Viewports:

- mobile 390px;
- mobile 430px;
- desktop 1366px;
- desktop amplo.

Casos por persona:

- jogador puro: `/agenda` abre sem gestao e mostra estado vazio orientado se nao houver compromissos;
- aluno: `/agenda?tipo=aulas` mostra turma, professor, horario e quadra quando vinculados;
- socio/reservas: `/agenda?tipo=reservas` mostra reservas futuras e historico de reservas passadas;
- competitivo: `/agenda?tipo=partidas` mostra torneios/ligas, adversario quando disponivel, status e resultado;
- usuario com pendencia financeira pessoal: `/agenda?tipo=pagamentos` destaca vencidos sem mostrar recebiveis do local.

## Validation Notes - FLOW-06 - 2026-05-20

Executado:

- criada `PersonalAgendaPage` como composicao frontend de agenda pessoal;
- adicionada rota `/agenda`;
- `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas` e `/meus-pagamentos` agora renderizam a agenda com filtro inicial correspondente;
- `BottomNav` de jogador agora aponta `Agenda` para `/agenda` e mantem rotas antigas como active paths;
- Home passou a apontar cards/atalhos pessoais para `/agenda` e filtros;
- reservas futuras, lista de espera, aulas, partidas, pagamentos e historico sao reunidos na mesma linha do tempo;
- detalhes abrem em sheet no mobile e painel lateral no desktop;
- cancelamento de reserva pessoal foi preservado dentro do detalhe da agenda;
- reservas internas com status `blocked` nao entram na agenda pessoal, evitando expor bloqueios operacionais/tecnicos como compromisso do jogador;
- `npm.cmd run build` passou apos a implementacao.
- screenshots capturados em `docs/screenshots/workflow-v3-flow06-player-agenda-2026-05-20/` para:
  - `/agenda`;
  - `/minhas-reservas`;
  - `/minhas-partidas`;
  - `/minhas-aulas`;
  - `/meus-pagamentos`;
  - viewports `mobile390`, `mobile430`, `desktop1366` e `desktopwide`.
- `diagnostics-summary.json` ficou sem eventos de console/rede nas rotas capturadas.

Cobertura ainda pendente:

- QA com contas reais separadas de jogador puro, aluno, socio/reservas e competitivo;
- validar massa real com partida de torneio e liga que possua adversario, agenda e resultado.
