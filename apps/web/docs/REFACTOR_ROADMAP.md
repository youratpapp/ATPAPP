# Refactor Roadmap

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Objetivo

Reduzir acoplamento, padronizar operacao e transformar paginas grandes em workspaces modulares.

## Recalibracao 2026-05-13

Documento de referencia: `ARCHITECTURE_RECALIBRATION.md`.

Documento de direcao frontend/UX: `FRONTEND_UX_REARCHITECTURE.md`.

Documento de linguagem visual/premium: `PREMIUM_UX_VISUAL_LANGUAGE.md`.

Documentos de execucao visual: `VISUAL_REFERENCE_SYSTEM.md`, `COMPONENT_GRAMMAR.md` e `DESIGN_TOKENS.md`.

Estado operacional atual: `CURRENT_PRODUCT_STATE.md`.

Fila continua de execucao: `EXECUTION_QUEUE.md`.

Correcao de rumo:

- modularizacao continua importante, mas nao deve virar fim em si mesma;
- proximas entregas devem fechar fluxos completos com ganho operacional claro;
- terminar o minimo restante de Academia antes de abrir novas microextracoes em Places;
- iniciar `CompetitionShell` antes de esgotar toda a `PlacesPage`;
- wizards passam a ser prioridade logo apos a base de competicoes.

Sequencia ajustada:

1. consolidar `ManagementShell` e separar de vez a experiencia de gestao da vitrine de locais;
2. extrair `PlaceAdminShell` para reduzir dependencia conceitual de `PlacesPage`;
3. criar `PermissionGate`/menus por papel e plano;
4. iniciar `CompetitionShell` com separacao clara entre jogando e organizando;
5. revisar Home do jogador para ficar centrada em proxima acao;
6. aplicar visual system premium em rows, cards, botoes, badges e estados.
7. reduzir KPIs/cards zerados e trocar dashboards informativos por filas de decisao.

## Fase 0 - Memoria arquitetural

Status: iniciado.

Entregas:

- auditoria arquitetural;
- documentos vivos;
- criterios para novas decisoes;
- log curto nos roadmaps.

Impacto: evita evolucao por impulso e reduz regressao conceitual.

## Fase 1 - Gramatica operacional comum

Prioridade: alta.
Status: iniciado.

Entregas:

- `OperationalQueue`;
- `EntityActionRow`;
- `EntityDrawer`;
- `ActionBar`;
- `MetricStrip`;
- `PublishingKit`;
- padrao de empty/loading/error states.

Evoluido em 2026-05-13:

- criado `OperationalQueue` como componente comum para filas operacionais;
- criado `OperationalQueueItems` para linhas simples de fila com acao, detalhe e status;
- criado `EntityActionRow` como base para padronizar linhas de entidade com status e acao primaria;
- dashboard, relatorios e filas principais de locais passaram a usar a mesma base visual.
- criado `PublishingKit` para padronizar publicacao/exportacao em torneio, pagina publica de local e ranking.
- criado `MetricStrip` para padronizar faixas curtas de indicadores e aplicado no dashboard/relatorios do local.
- criado `ActionBar` para padronizar grupos de CTAs em home, competicoes, torneio, liga e pagina publica de local.
- criado `ScreenState` para padronizar estados de loading/erro/vazio, aplicado em Ranking e hubs de Torneios/Ligas.
- criado `EntityDrawer` e aplicado no historico do CRM do local para tirar detalhe/historico da linha principal.

Impacto operacional:

- menos varredura visual;
- menos botoes desalinhados;
- usuario entende status e proxima acao mais rapido.

Risco:

- padronizar demais e perder especificidade. Mitigacao: componente deve aceitar contexto e acao primaria customizada.

## Fase 2 - Modularizar Places

Prioridade: critica.
Status: iniciado.

Entregas:

- `PlaceAdminShell`;
- `PlaceBookingsModule`;
- `PlaceAcademyModule`;
- `PlaceClientsModule`;
- `PlaceFinanceModule`;
- `PlaceCanteenModule`;
- `PlaceTeamModule`;
- `PlaceSettingsModule`;
- hooks por dominio.

Impacto operacional:

- gestores trabalham por contexto;
- codigo fica mais seguro;
- mobile pode ter navegacao mais focada.

Risco:

- regressao por extracao grande. Mitigacao: extrair mantendo comportamento antes de redesenhar.

Evoluido em 2026-05-13:

- extraido `PlaceCrmHistoryDrawer` para tirar detalhe/historico de CRM da `PlacesPage` e iniciar a modularizacao por dominio sem alterar o fluxo.
- extraido `PlaceCrmContactRow` para concentrar a linha operacional do CRM fora da `PlacesPage`, preparando a futura `PlaceClientsModule`.
- extraido `PlaceCrmContactForm` para separar captura de lead do corpo da `PlacesPage` e manter o CRM caminhando para modulo proprio.
- criado `PlaceCrmModule` para agrupar captura, lista operacional, historico e acoes de CRM em uma unidade de dominio chamada pela `PlacesPage`.
- criado `PlaceMembershipModule` para separar planos, solicitacao de socio, status do jogador e gestao de mensalidades da `PlacesPage`.
- criado `PlaceClientActionQueue` para isolar a fila diaria de atendimento/relacionamento de clientes e reduzir logica inline da `PlacesPage`.
- reutilizado `PlaceClientActionQueue` tambem na subvisao de solicitacoes, removendo duplicidade de fila entre cockpit e requests.
- criado `PlaceClientRelationshipModule` para separar follow-ups, leads parados, inadimplencia e lembretes segmentados da `PlacesPage`.
- criado `PlaceFinanceReceivablesModule` para iniciar a modularizacao do financeiro pela subvisao de recebiveis e reaproveitar o contrato `PlaceClientReceivable`.
- criado `PlaceFinanceOverviewModule` para separar KPIs financeiros do corpo inline da `PlacesPage`.
- criado `PlaceFinanceExpensesModule` para unificar lista/cadastro de despesas entre workspace e fallback legado.
- criado `PlaceFinancePackagesModule` para separar planos, turmas, aulas avulsas, creditos, vendas de credito e saude dos saldos da `PlacesPage`.
- criado `PlaceCanteenStockModule` para iniciar a modularizacao da Cantina pela subvisao de estoque e remover duplicidade entre workspace/fallback.
- criado `PlaceCanteenProductsModule` para separar catalogo de produtos da Cantina da orquestracao da `PlacesPage`.
- criados `PlaceCanteenProductForm` e `PlaceCanteenSaleForm` para separar cadastro de produto e venda rapida da `PlacesPage`.
- criado `PlaceCanteenSummaryModule` para unificar resumo do dia e vendas recentes entre workspace/fallback.
- criados `PlaceBookingOperationalQueues` e `PlaceBookingTodayModule` para iniciar a modularizacao de Agenda/Reservas pela operacao diaria, separando filas de hoje/confirmacao/espera da orquestracao da `PlacesPage`.
- criados `PlaceBookingReservationsModule` e `PlaceBookingWaitlistModule` para retirar as subvisoes de reservas recentes e lista de espera do corpo da `PlacesPage`.
- criado `PlaceBookingResourcesModule` para separar configuracao de quadras, precos e regras de reserva da orquestracao da `PlacesPage`.
- criado `PlaceBookingCreateModule` para retirar busca de disponibilidade, reserva, bloqueio e entrada em lista de espera do corpo inline da `PlacesPage`.
- criado `PlaceBookingCalendarModule` para separar calendario/ocupacao de quadras da orquestracao da `PlacesPage`.
- criado `PlaceBookingDetailedListModule` para consolidar o historico operacional de reservas/lista de espera com pagamento e cancelamento de serie fora da `PlacesPage`.
- criados `PlaceAcademyOperationalQueues` e `PlaceAcademyTodayModule` para iniciar a modularizacao de Academia pela operacao diaria de aulas, pendencias, presenca, faltas e reposicoes.
- criados `PlaceAcademyClassesModule` e `PlaceAcademyStudentsModule` para separar grade de turmas, filtros de alunos, pagamento, chamada e lembretes da `PlacesPage`.
- criados `PlaceAcademyRequestsModule` e `PlaceAcademyCoachesModule` para separar pendencias de matricula/aula/reposicao e gestao operacional de professores da `PlacesPage`.
- criado `PlaceAcademyResourcesModule` para separar cadastro de professor, disponibilidade de professores/quadras, comissao, vinculo de login e uso de horarios abertos da `PlacesPage`.
- criado `PlaceAcademyClassSetupModule` para tirar criacao de turma/horario aberto do corpo inline e concentrar setup de turma em um fluxo unico.
- criado `PlaceAcademyFitModule` para separar busca de encaixes, aula avulsa, reposicao e aprovacao de pedidos em uma fila propria.
- criado `WorkspaceEmptyState` e aplicado em Academia para transformar telas vazias em proxima acao clara.
- App passou a carregar paginas por rota com `React.lazy`/`Suspense`, reduzindo o bundle inicial e preparando separacao real por dominios.
- criada rota `/locais/:placeId/admin` com subrota por modulo para iniciar a separacao real entre descoberta publica e operacao administrativa.
- troca de modulo no admin do local passou a sincronizar a URL com slugs operacionais em portugues.
- rota admin do local passou a normalizar modulo solicitado para o primeiro modulo permitido pelo plano/acesso quando necessario.
- subvisoes dos modulos administrativos de local passaram a sincronizar `?visao=` com slugs em portugues, cobrindo Agenda, Academia, Clientes, Financeiro, Cantina, Equipe e Ajustes.
- subvisoes administrativas passaram a normalizar query param invalido/tecnico para visao padrao ou slug canonico.
- extraida a gramatica de navegacao do admin de locais para `place-admin-navigation`, retirando slugs, parsers e builders da `PlacesPage`.
- centralizada a resolucao de `?visao=` em `resolvePlaceAdminView`, substituindo sete efeitos duplicados na `PlacesPage` por uma rotina unica de sincronizacao.
- criado `usePlaceAdminRouteSync` para retirar efeitos/callbacks de URL do corpo da `PlacesPage` e preparar um futuro `PlaceAdminShell`.
- criado `place-admin-data` para concentrar carregamento de recursos administrativos do local, pagamentos e dados do workspace, removendo duplicidade entre refresh geral e refresh pontual.
- criado `usePlaceAdminResourceState` para concentrar mapas de dados administrativos por local e aplicar refresh completo/pontual fora do corpo da `PlacesPage`.
- criado `PlaceCreateWizard` e aplicado na criacao de local, separando identidade, localizacao/rede e pagina inicial em etapas curtas.
- removido bloco legado duplicado de cockpit administrativo de locais, mantendo uma unica fonte visual via `PlaceManagementCockpit`.
- criado `ManagementHubPage` em `/gestao` como porta operacional propria para donos/equipe, com pendencias por local e atalhos para Agenda, Academia, Clientes, Financeiro e Cantina.
- rotas canonicas do admin de local passaram a ser `/gestao/:placeId/:module`, deixando `/locais/:placeId/admin` como compatibilidade e reduzindo a sensacao de ferramenta empilhada dentro de Locais.
- criado `ManagementShell` e aplicado em `/gestao` e no admin de local, iniciando a separacao visual real entre Management OS e areas publicas/player.
- cabecalho de gestao ficou mais compacto e operacional, substituindo hero grande por contexto, acoes e indicadores de rotina.
- iniciado `PlaceAdminShell` como casca propria do admin do local, concentrando papel, plano, localidade, features, implantacao e navegacao de modulos fora do cockpit generico.
- criado `PREMIUM_UX_VISUAL_LANGUAGE.md` para guiar densidade, hierarchy, estados e interacao premium antes de novos refinamentos visuais.
- `/gestao` passou a ocultar cards de pendencias zeradas e exibir estado de operacao em dia, deixando a fila do dia focada no que realmente exige acao.
- criados `VISUAL_REFERENCE_SYSTEM.md`, `COMPONENT_GRAMMAR.md` e `DESIGN_TOKENS.md` como camada pratica para evoluir o frontend por referencia visual, componente e token.
- `/gestao` foi refinada para usar rows operacionais de local em vez de grid de cards, reduzindo verticalidade, botoes equivalentes e sensacao de admin template.
- criados `CURRENT_PRODUCT_STATE.md` e `EXECUTION_QUEUE.md` para sair da fase de replanejamento e entrar em execucao continua por prioridade.
- `/gestao` recebeu refinamento mobile-first: header compacto, stats em trilho horizontal, rows tocaveis e atalhos de modulos sem empilhar verticalmente.
- `/gestao/:placeId/:module` recebeu refinamento inicial de workspace: `PlaceAdminShell` compacto, modulo ativo com hierarquia clara, setup secundario e dashboard com fila antes de metricas.
- navegacao desktop passou a agrupar entradas em Jogar, Operar e Conta, com contexto visual para Management OS sem transformar mobile em sidebar comprimida.

## Fase 3 - CompetitionShell

Prioridade: alta.
Status: iniciado.

Entregas:

- shell comum para torneio e liga;
- fila de competicao;
- seletor de classe/rodada consistente;
- publicacao comum;
- tabs padronizadas.

Impacto:

- reduz reaprendizado;
- melhora mobile de torneios e ligas;
- facilita novos formatos futuros.

Evoluido em 2026-05-13:

- criado `CompetitionWorkspace` com `CompetitionScopeSelector`, `CompetitionOperationalQueue` e `CompetitionPublishingPanel` como primeira base comum para torneio/liga.
- torneio passou a usar `CompetitionScopeSelector` para classe ativa antes do resumo, reforcando que os indicadores abaixo respondem ao recorte escolhido.
- liga passou a usar `CompetitionScopeSelector` para temporada/classe e `CompetitionOperationalQueue` para pendencias de rodada, reduzindo divergencia com torneios.
- publicacao de torneio e liga passou pelo mesmo `CompetitionPublishingPanel`, preparando um futuro `CompetitionShell` completo.
- criado `CompetitionTabs` e aplicado em torneio/liga para padronizar subvisoes, scroll mobile e badges de pendencia.
- criado `CompetitionHeader` e aplicado em torneio/liga para padronizar titulo, contexto, status e acao de voltar.
- torneio passou a usar `CompetitionOperationalQueue` no centro de pendencias, alinhando fila de inscricoes, resultados, disponibilidade e jogos com a liga.
- Competition OS recebeu refinamento visual: liga coloca temporada/classe antes de tabs e KPIs, torneio usa overview da mesma familia, filas viraram rows e publicacao ficou secundaria.

## Fase 4 - Wizards de criacao

Prioridade: media-alta.
Status: iniciado.

Entregas:

- wizard de local;
- wizard de torneio;
- wizard de liga;
- wizard de pacote/regra de reserva;
- revisao de validacoes por etapa.

Impacto:

- menos erro;
- mais conclusao de setup;
- fluxo mais comercial e profissional.

Evoluido em 2026-05-13:

- criado `SetupWizard` como base reutilizavel para criacao guiada por etapas.
- criacao de torneio passou de modal simples para wizard com identidade/acesso e local.
- criacao de liga passou de modal simples para wizard com identidade/formato e recorte/acesso.
- criacao de turma da Academia passou a usar `SetupWizard` dentro de `PlaceAcademyClassSetupModule`, separando identidade, agenda e perfil/preco.

## Fase 4.5 - Performance estrutural

Prioridade: alta.
Status: iniciado.

Entregas:

- code splitting por rota;
- separar dominios pesados em chunks proprios;
- manter feedback de carregamento consistente;
- revisar importacoes compartilhadas que puxam dominios grandes.

Evoluido em 2026-05-13:

- `App.tsx` passou a carregar paginas por `React.lazy`/`Suspense`, removendo o alerta de chunk principal acima de 500 kB no build.
- rotas administrativas de local passaram a existir como contrato navegavel, preparando code splitting e subworkspaces por modulo.
- subrotas administrativas de local passaram a ser enderecaveis por modulo, reduzindo estado escondido no cockpit.
- subvisoes internas dos workspaces administrativos passaram a ser enderecaveis por query param, preparando futura quebra por subrotas/componentes menores.

Impacto:

- entrada inicial mais leve;
- base tecnica mais coerente com a separacao entre jogador, competicoes, locais e perfil;
- reduz custo futuro para transformar rotas administrativas em workspaces independentes.

## Fase 5 - Motor de tarefas

Prioridade: estrutural.

Entregas:

- modelo de tarefa operacional;
- prioridade, prazo, entidade e acao primaria;
- filas por modulo e fila consolidada;
- registro de resolucao.

Impacto:

- app passa a operar por pendencias reais;
- cockpit fica mais inteligente;
- base para automacoes futuras.

## Fase 6 - Observabilidade de UX

Prioridade: futura.

Entregas:

- eventos de funil;
- tempo ate resolver tarefa;
- abandono de wizard;
- acoes mais usadas por persona;
- pontos de retorno/erro.

Impacto:

- evolucao baseada em comportamento real.
